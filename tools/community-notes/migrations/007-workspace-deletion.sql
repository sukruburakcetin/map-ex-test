-- Owner-only deletion. Existing workspace foreign keys remove dependent shared records.
begin;

create or replace function public.mly_delete_workspace(p_workspace uuid, p_name text)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  deleted_id uuid;
begin
  delete from public.mly_workspaces
  where id = p_workspace and owner_id = auth.uid() and name = p_name
  returning id into deleted_id;

  if deleted_id is null then
    raise exception 'Workspace unavailable, name changed, or owner access required.' using errcode = '42501';
  end if;
  return deleted_id;
end;
$$;

revoke all on function public.mly_delete_workspace(uuid,text) from public, anon;
grant execute on function public.mly_delete_workspace(uuid,text) to authenticated;

commit;
