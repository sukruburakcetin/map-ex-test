-- Upgrade an existing operator-owned project. No note/workspace tables are dropped.
-- Apply the compatible widget update first, then run this migration as project admin.
begin;
do $$ begin
 if to_regclass('public.mly_workspaces') is null then raise exception 'Install the fresh collaboration schema first'; end if;
end $$;
-- Backfill the trusted legacy capability only when no explicit new decision exists.
update auth.users
set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||'{"workspace_creator":true}'::jsonb
where raw_app_meta_data @> '{"workspace_teacher":true}'::jsonb
  and not (raw_app_meta_data ? 'workspace_creator');
-- Preserve an explicit workspace_creator=false and remove the old vocabulary.
update auth.users set raw_app_meta_data=raw_app_meta_data-'workspace_teacher'
where raw_app_meta_data ? 'workspace_teacher';

create or replace function public.mly_create_workspace(p_name text,p_contact text) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare w uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 -- Trusted operator-managed app metadata, never user-editable profile metadata.
 if not exists(select 1 from auth.users where id=auth.uid() and raw_app_meta_data @> '{"workspace_creator":true}'::jsonb) then raise exception 'Workspace creation permission required'; end if;
 insert into public.mly_workspaces(owner_id,name,operator_contact) values(auth.uid(),trim(p_name),trim(p_contact)) returning id into w;
 return w;
end $$;
revoke all on function public.mly_create_workspace(text,text) from public,anon;
grant execute on function public.mly_create_workspace(text,text) to authenticated;
commit;
