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
