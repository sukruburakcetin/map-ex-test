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
