-- Operator action, after migration 003. Additive and safe to rerun.
-- Aliases are unverified display labels. IDs/roles remain the authorization identity.
begin;
create or replace function public.mly_valid_workspace_display_name(value text)
returns boolean language sql immutable set search_path=pg_catalog as $$
 select value is not null and length(value) between 1 and 60 and value=btrim(value)
   and value ~ '[^[:space:]]' and value !~ '[[:cntrl:]]'
   and value !~ U&'[\202A-\202E\2066-\2069]'
$$;
create table if not exists public.mly_workspace_profiles (
 workspace_id uuid not null references public.mly_workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id),
 display_name text not null check(public.mly_valid_workspace_display_name(display_name)),
 primary key(workspace_id,user_id)
);
alter table public.mly_workspace_profiles enable row level security;
drop policy if exists profile_read on public.mly_workspace_profiles;
create policy profile_read on public.mly_workspace_profiles for select to authenticated using(public.mly_workspace_member(workspace_id));
revoke all on public.mly_workspace_profiles from public,anon,authenticated;
grant select on public.mly_workspace_profiles to authenticated;
-- There are no client table-write grants. The setter derives identity from auth.uid().
create or replace function public.mly_set_workspace_display_name(p_workspace uuid,p_display_name text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null or not public.mly_workspace_member(p_workspace) then raise exception 'Workspace membership required'; end if;
 if not public.mly_valid_workspace_display_name(p_display_name) then raise exception 'Use a display name of 1-60 characters without control characters'; end if;
 -- Lock the membership authority while saving so concurrent revocation wins in order.
 perform 1 from public.mly_workspaces where id=p_workspace for share;
 if not public.mly_workspace_owner(p_workspace) then
   perform 1 from public.mly_workspace_members where workspace_id=p_workspace and user_id=auth.uid() for share;
   if not found then raise exception 'Workspace membership required'; end if;
 end if;
 insert into public.mly_workspace_profiles(workspace_id,user_id,display_name) values(p_workspace,auth.uid(),p_display_name)
 on conflict(workspace_id,user_id) do update set display_name=excluded.display_name;
end $$;

-- New explicit wrappers keep older client RPCs compatible. Join+name save is one
-- transaction: an invalid alias never consumes an invitation or creates membership.
create or replace function public.mly_join_workspace_named(p_token text,p_display_name text)
returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare workspace uuid;
begin
 if not public.mly_valid_workspace_display_name(p_display_name) then raise exception 'Use a display name of 1-60 characters without control characters'; end if;
 workspace:=public.mly_join_workspace(p_token);
 perform public.mly_set_workspace_display_name(workspace,p_display_name);
 return workspace;
end $$;
create or replace function public.mly_create_workspace_named(p_name text,p_contact text,p_display_name text)
returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare workspace uuid;
begin
 if not public.mly_valid_workspace_display_name(p_display_name) then raise exception 'Use a display name of 1-60 characters without control characters'; end if;
 workspace:=public.mly_create_workspace(p_name,p_contact);
 perform public.mly_set_workspace_display_name(workspace,p_display_name);
 return workspace;
end $$;

-- Membership RLS still limits owners to their roster and participants to themselves.
create or replace function public.mly_workspace_members_named(p_workspace uuid)
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
begin
 if not public.mly_workspace_member(p_workspace) then raise exception 'Workspace membership required'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('user_id',m.user_id,'role',m.role,'display_name',p.display_name) order by m.user_id)
   from (select * from public.mly_workspace_members where workspace_id=p_workspace order by user_id limit 100) m
   left join public.mly_workspace_profiles p on p.workspace_id=m.workspace_id and p.user_id=m.user_id),'[]'::jsonb);
end $$;

-- Resolve only the loaded page authors; no per-card or per-hover name requests.
create or replace function public.mly_workspace_contributions(p_workspace uuid,p_search text default '',p_mine boolean default false,p_offset integer default 0)
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare result jsonb;
begin
 if not public.mly_workspace_member(p_workspace) then raise exception 'Workspace membership required'; end if;
 if p_search is null or length(p_search)>200 or p_mine is null or p_offset is null or p_offset<0 then raise exception 'Invalid contribution query'; end if;
 with all_notes as materialized (select * from public.mly_workspace_notes where workspace_id=p_workspace),
 matching as (select * from all_notes where (not p_mine or author_id=auth.uid()) and
   (trim(p_search)='' or position(lower(trim(p_search)) in lower(concat_ws(' ',category,note_text,resolution_note,status,replace(status,'_',' '))))>0)),
 page as (select * from matching order by created_at desc,id desc limit 50 offset p_offset),
 category_counts as (select category,count(*) as n from all_notes group by category),
 status_counts as (select status,count(*) as n from all_notes group by status)
 select jsonb_build_object(
   'notes',coalesce((select jsonb_agg(to_jsonb(p)||jsonb_build_object('author_display_name',profile.display_name) order by p.created_at desc,p.id desc) from page p
     left join public.mly_workspace_profiles profile on profile.workspace_id=p.workspace_id and profile.user_id=p.author_id),'[]'::jsonb),
   'my_display_name',(select display_name from public.mly_workspace_profiles where workspace_id=p_workspace and user_id=auth.uid()),
   'categories',coalesce((select jsonb_agg(to_jsonb(c) order by c.name) from public.mly_workspace_categories c where c.workspace_id=p_workspace),'[]'::jsonb),
   'statistics',jsonb_build_object('total',(select count(*) from all_notes),'mine',(select count(*) from all_notes where author_id=auth.uid()),
      'contributors',(select count(distinct author_id) from all_notes),'matching',(select count(*) from matching),
      'by_category',coalesce((select jsonb_object_agg(category,n) from category_counts),'{}'::jsonb),
      'by_status',coalesce((select jsonb_object_agg(status,n) from status_counts),'{}'::jsonb))) into result;
 return result;
end $$;
revoke all on function public.mly_valid_workspace_display_name(text),public.mly_set_workspace_display_name(uuid,text),public.mly_join_workspace_named(text,text),public.mly_create_workspace_named(text,text,text),public.mly_workspace_members_named(uuid) from public,anon;
grant execute on function public.mly_valid_workspace_display_name(text),public.mly_set_workspace_display_name(uuid,text),public.mly_join_workspace_named(text,text),public.mly_create_workspace_named(text,text,text),public.mly_workspace_members_named(uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
