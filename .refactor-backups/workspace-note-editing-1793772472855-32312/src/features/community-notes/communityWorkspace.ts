/** Operator-managed collaboration transport. No developer endpoint, ambient SDK credentials,
 * automatic connections, local-note uploads, polling or persistent auth storage. */
import type { FieldNote } from '../../components/types';

export interface WorkspaceConnection { endpoint: string; publicKey: string }
export interface CommunityWorkspace { id: string; owner_id: string; name: string; operator_contact: string }
export interface CommunityRecord { id: string; workspace_id: string; author_id: string; source_id: string; category: string; note_text: string; resolution_note: string; lon: number; lat: number; image_id: string | null; status: string; risk_label: string | null; updated_at?: string; created_at: string }
export interface WorkspaceCategory { workspace_id: string; name: string; color: string; archived: boolean }
export interface ContributionStatistics { total: number; mine: number; contributors: number; matching: number; by_category: Record<string,number>; by_status: Record<string,number> }
export interface ContributionPage { notes: CommunityRecord[]; categories: WorkspaceCategory[]; statistics: ContributionStatistics }
export interface WorkspaceMember { user_id: string; role: 'reader' | 'contributor' }
export interface WorkspaceInvite { id: string; role: string; uses: number; max_uses: number; expires_at: string }
export interface WorkspaceInvitation extends WorkspaceConnection { kind: 'mapillary-explorer-workspace'; version: 1; invitation: string }
const uuid = (value: string) => { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error('Invalid workspace record ID.'); return value; };
const statuses = new Set(['open','in_progress','completed','dismissed']);
const risks = new Set(['high','low','no_obvious_hazards']);

/** Accept a public browser key only; privileged credentials never belong in a demo. */
export function validateWorkspaceConnection(input: WorkspaceConnection): WorkspaceConnection {
  if (!input || typeof input.endpoint !== 'string' || typeof input.publicKey !== 'string') throw new Error('Provide a project URL and a public key.');
  const url = new URL(input.endpoint.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.pathname !== '/' && url.pathname !== '')) throw new Error('Use the HTTPS project origin, without a path or credentials.');
  const key = input.publicKey.trim();
  let publicKey = /^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(key);
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) {
    try { const part=key.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'); publicKey=JSON.parse(atob(part)).role === 'anon'; } catch { publicKey=false; }
  }
  if (!publicKey || key.length > 4096) throw new Error('Use the operator’s publishable/anon key, never a secret or service-role key.');
  return { endpoint: url.origin, publicKey: key };
}

/** Invitations contain public connection details and an expiring join code, never a session. */
export function parseWorkspaceInvitation(text: string): WorkspaceInvitation {
  if (text.length > 12000) throw new Error('Invitation is too large.');
  const value = JSON.parse(text);
  if (!value || value.kind !== 'mapillary-explorer-workspace' || value.version !== 1 || typeof value.invitation !== 'string' || !/^[a-f0-9-]{32,200}$/i.test(value.invitation)) throw new Error('Invalid workspace invitation.');
  return { ...validateWorkspaceConnection(value), kind: value.kind, version: 1, invitation: value.invitation };
}

/** One explicitly connected session. Teardown aborts in-flight work and forgets
 * credentials. RLS/RPC permissions on the operator's service remain authoritative. */
export class CommunityWorkspaceClient {
  readonly connection: WorkspaceConnection;
  private lifetime = new AbortController();
  private session: { token: string; userId: string; expires: number; creator: boolean } | null = null;
  constructor(connection: WorkspaceConnection, private readonly transport: typeof fetch = (input,init) => fetch(input,init), private readonly now = Date.now) {
    this.connection = validateWorkspaceConnection(connection);
  }
  get userId(): string | null { return this.session?.userId || null; }
  get canCreateWorkspace(): boolean { return this.session?.creator === true; }
  dispose(): void { this.lifetime.abort(); this.session = null; }

  /** A request cannot follow redirects or reuse unrelated cookies/Esri credentials. */
  private async request(path: string, method = 'GET', body?: unknown, authenticated = true, externalSignal?: AbortSignal): Promise<any> {
    if (this.lifetime.signal.aborted) throw new DOMException('Workspace disconnected','AbortError');
    if (authenticated && (!this.session || this.session.expires <= this.now())) throw new Error('Session expired. Sign in again.');
    const controller=externalSignal?new AbortController():null;
    const abort=()=>controller?.abort();
    externalSignal?.addEventListener('abort',abort,{once:true});
    if(controller)this.lifetime.signal.addEventListener('abort',abort,{once:true});
    if(externalSignal?.aborted)abort();
    try {
    const response = await this.transport(this.connection.endpoint + path, {
      method, credentials: 'omit', redirect: 'error', cache: 'no-store', signal: controller?.signal||this.lifetime.signal,
      headers: { apikey: this.connection.publicKey, 'Content-Type': 'application/json', ...(authenticated ? { Authorization: `Bearer ${this.session!.token}` } : {}), ...(method === 'POST' && path.startsWith('/rest/v1/mly_workspace_notes') ? { Prefer: 'resolution=ignore-duplicates,return=representation' } : (method === 'PATCH' || method === 'DELETE') ? { Prefer: 'return=representation' } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw new Error(response.status === 401 ? 'Session expired. Sign in again.' : response.status === 403 ? 'The workspace operator has not granted this action.' : `Workspace request failed (HTTP ${response.status}). Refresh before retrying a submission.`);
    if (response.status === 204) return null;
    const result = await response.json();
    if (this.lifetime.signal.aborted || controller?.signal.aborted) throw new DOMException('Workspace disconnected','AbortError');
    return result;
    } finally {
      externalSignal?.removeEventListener('abort',abort);
      if(controller)this.lifetime.signal.removeEventListener('abort',abort);
    }
  }
  async signIn(email: string, password: string): Promise<void> {
    const result = await this.request('/auth/v1/token?grant_type=password','POST',{email:email.trim(),password},false);
    if (!result?.access_token || typeof result.access_token !== 'string' || !result.user?.id || !Number.isFinite(result.expires_in)) throw new Error('The operator service returned an invalid session.');
    this.session = { token: result.access_token, userId: uuid(result.user.id), expires: this.now() + Math.max(0,result.expires_in)*1000, creator: Object.prototype.hasOwnProperty.call(result.user.app_metadata || {}, 'workspace_creator')
      ? result.user.app_metadata.workspace_creator === true
      : result.user.app_metadata?.workspace_teacher === true };
    // Legacy trusted metadata is accepted only when the canonical capability is absent.
    // Refresh tokens are intentionally not retained. Accounts remain operator-managed.
  }
  private async change(path: string, method: 'PATCH'|'DELETE', body?: unknown): Promise<void> {
    const changed=await this.request(path,method,body);
    if(!Array.isArray(changed)||changed.length!==1)throw new Error('The record changed or access was removed. Refresh to check the current state.');
  }
  async signOut(): Promise<void> { try { if(this.session) await this.request('/auth/v1/logout','POST'); } finally { this.dispose(); } }
  private async list<T>(path: string): Promise<T[]> { const result=await this.request(path); if(!Array.isArray(result)||result.length>100)throw new Error('Invalid workspace response.');return result; }
  workspaces(): Promise<CommunityWorkspace[]> { return this.list('/rest/v1/mly_workspaces?select=id,owner_id,name,operator_contact&order=created_at.desc&limit=50'); }
  async create(name: string, contact: string): Promise<string> { if(!name.trim()||name.trim().length>120||contact.trim().length<3||contact.trim().length>300)throw new Error('Provide a workspace name and an operator contact of at least three characters.'); return uuid(await this.request('/rest/v1/rpc/mly_create_workspace','POST',{p_name:name.trim(),p_contact:contact.trim()})); }
  async join(invitation: string): Promise<string> { if(!/^[a-f0-9-]{32,200}$/i.test(invitation))throw new Error('Invalid invitation code.');return uuid(await this.request('/rest/v1/rpc/mly_join_workspace','POST',{p_token:invitation})); }
  async invite(workspace: string, role: 'reader'|'contributor', uses: number): Promise<WorkspaceInvitation> {
    if(!['reader','contributor'].includes(role)||!Number.isInteger(uses)||uses<1||uses>1000)throw new Error('Use a valid role and 1–1000 invitation joins.');
    const token=await this.request('/rest/v1/rpc/mly_create_workspace_invite','POST',{p_workspace:uuid(workspace),p_role:role,p_max_uses:uses});
    if(typeof token!=='string'||!/^[a-f0-9-]{32,200}$/i.test(token))throw new Error('Invalid invitation response.');
    return {...this.connection,kind:'mapillary-explorer-workspace',version:1,invitation:token};
  }
  members(workspace: string): Promise<WorkspaceMember[]> { return this.list(`/rest/v1/mly_workspace_members?workspace_id=eq.${uuid(workspace)}&select=user_id,role&limit=100`); }
  invites(workspace: string): Promise<WorkspaceInvite[]> { return this.list(`/rest/v1/mly_workspace_invites?workspace_id=eq.${uuid(workspace)}&select=id,role,uses,max_uses,expires_at&order=created_at.desc&limit=100`); }
  async revokeInvite(workspace: string, id: string): Promise<void> { await this.change(`/rest/v1/mly_workspace_invites?workspace_id=eq.${uuid(workspace)}&id=eq.${uuid(id)}`,'DELETE'); }
  async removeMember(workspace: string, user: string): Promise<void> { await this.change(`/rest/v1/mly_workspace_members?workspace_id=eq.${uuid(workspace)}&user_id=eq.${uuid(user)}`,'DELETE'); }
  async setMemberRole(workspace: string, user: string, role: 'reader'|'contributor'): Promise<void> { await this.change(`/rest/v1/mly_workspace_members?workspace_id=eq.${uuid(workspace)}&user_id=eq.${uuid(user)}`,'PATCH',{role}); }
  async notes(workspace: string, offset=0): Promise<CommunityRecord[]> {
    if(!Number.isInteger(offset)||offset<0)throw new Error('Invalid page.');
    const rows=await this.list<CommunityRecord>(`/rest/v1/mly_workspace_notes?workspace_id=eq.${uuid(workspace)}&select=*&order=created_at.desc,id.desc&limit=50&offset=${offset}`);
    for(const row of rows){uuid(row.id);if(row.workspace_id!==workspace||!Number.isFinite(row.lon)||!Number.isFinite(row.lat)||Math.abs(row.lon)>180||Math.abs(row.lat)>90||typeof row.category!=='string'||typeof row.note_text!=='string'||typeof row.resolution_note!=='string'||!Number.isFinite(new Date(row.created_at).getTime()))throw new Error('Invalid shared note.');}
    return rows;
  }
  /** Search/paginate on the service; totals cover every authorized contribution. */
  async contributions(workspace: string, search = '', mine = false, offset = 0, signal?: AbortSignal): Promise<ContributionPage> {
    if (search.length > 200 || !Number.isInteger(offset) || offset < 0) throw new Error('Invalid contribution query.');
    const result = await this.request('/rest/v1/rpc/mly_workspace_contributions','POST',{p_workspace:uuid(workspace),p_search:search,p_mine:mine,p_offset:offset},true,signal);
    if (!result || !Array.isArray(result.notes) || result.notes.length > 50 || !Array.isArray(result.categories)
      || !result.statistics || !['total','mine','contributors','matching'].every(key=>Number.isSafeInteger(result.statistics[key])&&result.statistics[key]>=0)) throw new Error('Invalid contribution response.');
    for (const row of result.notes) {
      uuid(row.id); uuid(row.author_id);
      if(row.workspace_id!==workspace||!Number.isFinite(row.lon)||!Number.isFinite(row.lat)||Math.abs(row.lon)>180||Math.abs(row.lat)>90||typeof row.category!=='string'||typeof row.note_text!=='string'||typeof row.resolution_note!=='string'||!statuses.has(row.status)||!Number.isFinite(new Date(row.created_at).getTime())) throw new Error('Invalid shared note.');
    }
    for (const category of result.categories) if(category.workspace_id!==workspace||typeof category.name!=='string'||!/^#[a-f0-9]{6}$/i.test(category.color)||typeof category.archived!=='boolean') throw new Error('Invalid workspace category.');
    for (const field of ['by_category','by_status']) if(!result.statistics[field]||typeof result.statistics[field]!=='object'||Array.isArray(result.statistics[field])||!Object.values(result.statistics[field]).every(value=>Number.isSafeInteger(value)&&(value as number)>=0)) throw new Error('Invalid contribution statistics.');
    return result;
  }
  /** Category names are stable assignments; owners change colors or retire names. */
  async setCategory(workspace: string, name: string, color: string, archived = false): Promise<void> {
    if(!name.trim()||name.trim().length>120||!/^#[a-f0-9]{6}$/i.test(color)) throw new Error('Provide a category name and a six-digit color.');
    await this.request('/rest/v1/rpc/mly_set_workspace_category','POST',{p_workspace:uuid(workspace),p_name:name.trim(),p_color:color,p_archived:archived});
  }
  async publish(workspace: string, note: FieldNote, risk: string|null): Promise<boolean> {
    if(!note.id||!note.category||!Number.isFinite(note.lon)||!Number.isFinite(note.lat)||Math.abs(note.lon)>180||Math.abs(note.lat)>90||!statuses.has(note.status||'open')||(risk!==null&&!risks.has(risk)))throw new Error('Invalid local note or assessment.');
    const result=await this.request('/rest/v1/mly_workspace_notes?on_conflict=workspace_id,author_id,source_id','POST',{
      workspace_id:uuid(workspace),author_id:this.userId,source_id:note.id,category:note.category,note_text:note.note||'',resolution_note:note.resolutionNote||'',lon:note.lon,lat:note.lat,image_id:note.imageId||null,status:note.status||'open',risk_label:risk,
    });
    if(!Array.isArray(result))throw new Error('Unconfirmed submission. Refresh before retrying.');return result.length>0;
  }
  async review(workspace: string, id: string, status: string, risk: string|null, category?: string): Promise<void> {
    if(!statuses.has(status)||(risk!==null&&!risks.has(risk)))throw new Error('Invalid assessment.');
    await this.change(`/rest/v1/mly_workspace_notes?workspace_id=eq.${uuid(workspace)}&id=eq.${uuid(id)}`,'PATCH',{status,risk_label:risk,...(category===undefined?{}:{category})});
  }
  async removeNote(workspace: string,id: string): Promise<void> { await this.change(`/rest/v1/mly_workspace_notes?workspace_id=eq.${uuid(workspace)}&id=eq.${uuid(id)}`,'DELETE'); }
}

/** Adapt a shared record only for existing map/image navigation; never persist it locally. */
export function communityNoteTarget(note: CommunityRecord, categories: readonly WorkspaceCategory[] = [], workspaceName = ''): FieldNote {
  return {id:`workspace:${note.id}`,source:'manual',category:note.category,note:note.note_text,resolutionNote:note.resolution_note,lon:note.lon,lat:note.lat,imageId:note.image_id,createdAt:new Date(note.created_at).getTime(),status:statuses.has(note.status)?note.status as FieldNote['status']:'open', workspace:{id:note.workspace_id,name:workspaceName,authorId:note.author_id,color:categories.find(category=>category.name===note.category)?.color||'#f5a623',updatedAt:note.updated_at||note.created_at,legacyRisk:note.risk_label}};
}
