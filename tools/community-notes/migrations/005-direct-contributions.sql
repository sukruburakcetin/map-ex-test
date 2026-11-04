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
