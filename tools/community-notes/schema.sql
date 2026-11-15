-- Operator-managed collaboration Supabase project. Run once as the project administrator.
-- No anonymous data access; all application requests run as authenticated members.
begin;

create table public.mly_workspaces (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id),
 name text not null check (length(trim(name)) between 1 and 120),
 operator_contact text not null check (length(trim(operator_contact)) between 3 and 300),
 created_at timestamptz not null default now()
);
create table public.mly_workspace_members (
 workspace_id uuid not null references public.mly_workspaces(id) on delete cascade,
 user_id uuid not null references auth.users(id),
 role text not null default 'contributor' check (role in ('reader','contributor')),
 primary key(workspace_id,user_id)
);
create table public.mly_workspace_invites (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mly_workspaces(id) on delete cascade,
 token_hash text not null unique,
 role text not null check(role in ('reader','contributor')),
 expires_at timestamptz not null,
 max_uses integer not null check(max_uses between 1 and 1000),
 uses integer not null default 0 check(uses >= 0),
 created_at timestamptz not null default now()
);
create table public.mly_workspace_notes (
 id uuid primary key default gen_random_uuid(),
 workspace_id uuid not null references public.mly_workspaces(id) on delete cascade,
 author_id uuid not null references auth.users(id),
 source_id text not null check(length(source_id) between 1 and 200),
 category text not null check(length(category) between 1 and 120),
 note_text text not null check(length(note_text) <= 8000),
 resolution_note text not null default '' check(length(resolution_note) <= 8000),
 lon double precision not null check(lon between -180 and 180),
 lat double precision not null check(lat between -90 and 90),
 image_id text check(length(image_id) <= 128),
 status text not null default 'open' check(status in ('open','in_progress','completed','dismissed')),
 risk_label text check(risk_label in ('high','low','no_obvious_hazards')),
 updated_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(workspace_id,author_id,source_id)
);
-- The service records revision time; clients cannot assign it through column grants.
create function public.mly_note_updated_at() returns trigger language plpgsql set search_path=pg_catalog as $$
begin new.updated_at=now();return new;end $$;
create trigger mly_note_updated_at before update on public.mly_workspace_notes for each row execute function public.mly_note_updated_at();
revoke all on function public.mly_note_updated_at() from public,anon,authenticated;

create index mly_notes_workspace_order on public.mly_workspace_notes(workspace_id,created_at desc,id desc);

-- SECURITY DEFINER avoids recursive membership RLS. Fixed search path and explicit
-- auth.uid() checks prevent callers from asserting another user's membership.
create function public.mly_workspace_owner(w uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select exists(select 1 from public.mly_workspaces where id=w and owner_id=auth.uid())
$$;
create function public.mly_workspace_member(w uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select public.mly_workspace_owner(w) or exists(select 1 from public.mly_workspace_members where workspace_id=w and user_id=auth.uid())
$$;
create function public.mly_workspace_writer(w uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select public.mly_workspace_owner(w) or exists(select 1 from public.mly_workspace_members where workspace_id=w and user_id=auth.uid() and role='contributor')
$$;

alter table public.mly_workspaces enable row level security;
alter table public.mly_workspace_members enable row level security;
alter table public.mly_workspace_invites enable row level security;
alter table public.mly_workspace_notes enable row level security;

create policy workspace_read on public.mly_workspaces for select to authenticated using(public.mly_workspace_member(id));
create policy workspace_update on public.mly_workspaces for update to authenticated using(public.mly_workspace_owner(id)) with check(owner_id=auth.uid());
create policy member_read on public.mly_workspace_members for select to authenticated using(public.mly_workspace_owner(workspace_id) or user_id=auth.uid());
create policy member_update on public.mly_workspace_members for update to authenticated using(public.mly_workspace_owner(workspace_id)) with check(public.mly_workspace_owner(workspace_id));
create policy member_delete on public.mly_workspace_members for delete to authenticated using(public.mly_workspace_owner(workspace_id));
create policy invite_read on public.mly_workspace_invites for select to authenticated using(public.mly_workspace_owner(workspace_id));
create policy invite_delete on public.mly_workspace_invites for delete to authenticated using(public.mly_workspace_owner(workspace_id));
create policy note_read on public.mly_workspace_notes for select to authenticated using(public.mly_workspace_member(workspace_id));
create policy note_insert on public.mly_workspace_notes for insert to authenticated with check(author_id=auth.uid() and public.mly_workspace_writer(workspace_id));
create policy note_update on public.mly_workspace_notes for update to authenticated using(public.mly_workspace_owner(workspace_id) or (author_id=auth.uid() and public.mly_workspace_writer(workspace_id))) with check(public.mly_workspace_owner(workspace_id) or (author_id=auth.uid() and public.mly_workspace_writer(workspace_id)));
create policy note_delete on public.mly_workspace_notes for delete to authenticated using(public.mly_workspace_owner(workspace_id) or (author_id=auth.uid() and public.mly_workspace_writer(workspace_id)));

-- Creation and invitation acceptance are atomic RPCs; clients cannot insert
-- members directly or grant themselves a role by altering request JSON.
create function public.mly_create_workspace(p_name text,p_contact text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare w uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 -- Trusted operator-managed app metadata, never user-editable profile metadata.
 if not exists(select 1 from auth.users where id=auth.uid() and raw_app_meta_data @> '{"workspace_creator":true}'::jsonb) then raise exception 'Workspace creation permission required'; end if;
 insert into public.mly_workspaces(owner_id,name,operator_contact) values(auth.uid(),trim(p_name),trim(p_contact)) returning id into w;
 return w;
end $$;
create function public.mly_create_workspace_invite(p_workspace uuid,p_role text default 'contributor',p_max_uses integer default 30) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare token text;
begin
 if not public.mly_workspace_owner(p_workspace) then raise exception 'Workspace owner required'; end if;
 token:=gen_random_uuid()::text||gen_random_uuid()::text;
 insert into public.mly_workspace_invites(workspace_id,token_hash,role,expires_at,max_uses)
 values(p_workspace,encode(sha256(convert_to(token,'UTF8')),'hex'),p_role,now()+interval '7 days',p_max_uses);
 return token;
end $$;
create function public.mly_join_workspace(p_token text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare invitation public.mly_workspace_invites%rowtype;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 if p_token is null or length(p_token)>200 then raise exception 'Invalid invitation'; end if;
 select * into invitation from public.mly_workspace_invites where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') for update;
 if not found or invitation.expires_at<=now() or invitation.uses>=invitation.max_uses then raise exception 'Invitation unavailable'; end if;
 if public.mly_workspace_member(invitation.workspace_id) then return invitation.workspace_id; end if;
 insert into public.mly_workspace_members(workspace_id,user_id,role) values(invitation.workspace_id,auth.uid(),invitation.role);
 update public.mly_workspace_invites set uses=uses+1 where id=invitation.id;
 return invitation.workspace_id;
end $$;

revoke all on public.mly_workspaces,public.mly_workspace_members,public.mly_workspace_invites,public.mly_workspace_notes from public,anon,authenticated;
grant select on public.mly_workspaces,public.mly_workspace_members,public.mly_workspace_invites,public.mly_workspace_notes to authenticated;
grant update(name,operator_contact) on public.mly_workspaces to authenticated;
grant update(role),delete on public.mly_workspace_members to authenticated;
grant delete on public.mly_workspace_invites to authenticated;
grant insert(workspace_id,author_id,source_id,category,note_text,lon,lat,image_id,status,risk_label,resolution_note) on public.mly_workspace_notes to authenticated;
grant update(category,note_text,status,risk_label,resolution_note),delete on public.mly_workspace_notes to authenticated;
revoke all on function public.mly_workspace_owner(uuid),public.mly_workspace_member(uuid),public.mly_workspace_writer(uuid),public.mly_create_workspace(text,text),public.mly_create_workspace_invite(uuid,text,integer),public.mly_join_workspace(text) from public,anon;
grant execute on function public.mly_workspace_owner(uuid),public.mly_workspace_member(uuid),public.mly_workspace_writer(uuid),public.mly_create_workspace(text,text),public.mly_create_workspace_invite(uuid,text,integer),public.mly_join_workspace(text) to authenticated;
commit;
-- Existing operator project: run after 002. Additive; preserves notes/risk labels.
-- No widget or installer executes this migration. Safe to rerun.
begin;
create table if not exists public.mly_workspace_categories (
 workspace_id uuid not null references public.mly_workspaces(id) on delete cascade,
 name text not null check(length(name) between 1 and 120),
 color text not null check(color ~ '^#[0-9a-fA-F]{6}$'),
 archived boolean not null default false,
 primary key(workspace_id,name)
);
alter table public.mly_workspace_categories enable row level security;
drop policy if exists category_read on public.mly_workspace_categories;
create policy category_read on public.mly_workspace_categories for select to authenticated using(public.mly_workspace_member(workspace_id));
revoke all on public.mly_workspace_categories from public,anon,authenticated;
grant select on public.mly_workspace_categories to authenticated;
-- Existing category assignments survive unchanged; no predefined risk taxonomy.
insert into public.mly_workspace_categories(workspace_id,name,color)
 select distinct workspace_id,category,'#f5a623' from public.mly_workspace_notes
 on conflict do nothing;

create or replace function public.mly_set_workspace_category(p_workspace uuid,p_name text,p_color text,p_archived boolean default false)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.mly_workspace_owner(p_workspace) then raise exception 'Workspace owner required'; end if;
 -- Serialize owner changes to enforce the category limit even across sessions.
 perform 1 from public.mly_workspaces where id=p_workspace for update;
 if p_name is null or length(trim(p_name)) not between 1 and 120 or p_color is null or p_color !~ '^#[0-9a-fA-F]{6}$' or p_archived is null then raise exception 'Invalid category'; end if;
 if not exists(select 1 from public.mly_workspace_categories where workspace_id=p_workspace and name=trim(p_name))
    and (select count(*) from public.mly_workspace_categories where workspace_id=p_workspace)>=50 then raise exception 'Category limit reached'; end if;
 insert into public.mly_workspace_categories(workspace_id,name,color,archived) values(p_workspace,trim(p_name),lower(p_color),p_archived)
 on conflict(workspace_id,name) do update set color=excluded.color,archived=excluded.archived;
end $$;

create or replace function public.mly_validate_note_category() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if TG_OP='UPDATE' then if new.category=old.category then return new; end if; end if;
 if not exists(select 1 from public.mly_workspace_categories where workspace_id=new.workspace_id and name=new.category and not archived)
 then raise exception 'Choose an active workspace category'; end if;
 return new;
end $$;
drop trigger if exists mly_validate_note_category on public.mly_workspace_notes;
create trigger mly_validate_note_category before insert or update of category on public.mly_workspace_notes for each row execute function public.mly_validate_note_category();

-- SECURITY INVOKER: all aggregates and pages remain subject to existing note RLS.
-- Literal, case-insensitive substring search; no SQL or PostgREST filter interpolation.
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
   'notes',coalesce((select jsonb_agg(to_jsonb(p) order by p.created_at desc,p.id desc) from page p),'[]'::jsonb),
   'categories',coalesce((select jsonb_agg(to_jsonb(c) order by c.name) from public.mly_workspace_categories c where c.workspace_id=p_workspace),'[]'::jsonb),
   'statistics',jsonb_build_object('total',(select count(*) from all_notes),'mine',(select count(*) from all_notes where author_id=auth.uid()),
      'contributors',(select count(distinct author_id) from all_notes),'matching',(select count(*) from matching),
      'by_category',coalesce((select jsonb_object_agg(category,n) from category_counts),'{}'::jsonb),
      'by_status',coalesce((select jsonb_object_agg(status,n) from status_counts),'{}'::jsonb))) into result;
 return result;
end $$;
revoke all on function public.mly_set_workspace_category(uuid,text,text,boolean),public.mly_workspace_contributions(uuid,text,boolean,integer) from public,anon;
grant execute on function public.mly_set_workspace_category(uuid,text,text,boolean),public.mly_workspace_contributions(uuid,text,boolean,integer) to authenticated;
revoke all on function public.mly_validate_note_category() from public,anon,authenticated;
notify pgrst, 'reload schema';
commit;

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

-- Operator action after migration 004. Additive; old notes retain blank titles.
begin;
alter table public.mly_workspace_notes add column if not exists title text not null default '' check(length(title)<=160);
grant insert(title),update(title) on public.mly_workspace_notes to authenticated;
-- Existing insert/update RLS, active-category validation and edit-version trigger remain authoritative.
create or replace function public.mly_workspace_contributions(p_workspace uuid,p_search text default '',p_mine boolean default false,p_offset integer default 0)
returns jsonb language plpgsql stable security invoker set search_path=public,pg_temp as $$
declare result jsonb;
begin
 if not public.mly_workspace_member(p_workspace) then raise exception 'Workspace membership required'; end if;
 if p_search is null or length(p_search)>200 or p_mine is null or p_offset is null or p_offset<0 then raise exception 'Invalid contribution query'; end if;
 with all_notes as materialized (select * from public.mly_workspace_notes where workspace_id=p_workspace),
 matching as (select * from all_notes where (not p_mine or author_id=auth.uid()) and
   (trim(p_search)='' or position(lower(trim(p_search)) in lower(concat_ws(' ',title,category,note_text,resolution_note,status,replace(status,'_',' '))))>0)),
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
notify pgrst, 'reload schema';
commit;
