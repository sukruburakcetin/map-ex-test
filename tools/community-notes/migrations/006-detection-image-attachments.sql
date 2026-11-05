-- Apply after migration 005. Small, immutable JPEG crops use existing authenticated
-- PostgREST transport; no public bucket or signed image URL is persisted.
begin;
create table if not exists public.mly_workspace_note_images (
 note_id uuid primary key references public.mly_workspace_notes(id) on delete cascade,
 workspace_id uuid not null references public.mly_workspaces(id) on delete cascade,
 attachment_id uuid not null,
 uploaded_by uuid not null references auth.users(id),
 image_data text not null check (length(image_data) between 24 and 150000 and image_data ~ '^data:image/jpeg;base64,[A-Za-z0-9+/]+={0,2}$'),
 created_at timestamptz not null default now()
);
alter table public.mly_workspace_note_images enable row level security;
revoke all on public.mly_workspace_note_images from anon,authenticated;
grant select,insert on public.mly_workspace_note_images to authenticated;
drop policy if exists mly_note_images_read on public.mly_workspace_note_images;
create policy mly_note_images_read on public.mly_workspace_note_images for select to authenticated using (
 public.mly_workspace_member(workspace_id) and exists(select 1 from public.mly_workspace_notes n where n.id=note_id and n.workspace_id=mly_workspace_note_images.workspace_id)
);
drop policy if exists mly_note_images_insert on public.mly_workspace_note_images;
create policy mly_note_images_insert on public.mly_workspace_note_images for insert to authenticated with check (
 uploaded_by=auth.uid() and public.mly_workspace_writer(workspace_id) and exists(
 select 1 from public.mly_workspace_notes n where n.id=note_id and n.workspace_id=mly_workspace_note_images.workspace_id and (n.author_id=auth.uid() or public.mly_workspace_owner(n.workspace_id)))
);
notify pgrst, 'reload schema';
commit;
