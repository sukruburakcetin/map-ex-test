/** Frozen prior SQL + real PostgreSQL verifies an operator upgrade, not a fresh reset. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const {PGlite}=require(process.env.MAPILLARY_PGLITE||'@electric-sql/pglite');
const ids=[1,2,3,4].map(n=>'10000000-0000-4000-8000-'+String(n).padStart(12,'0'));
test('collaboration capability migration preserves data and trusted permission decisions',async t=>{
 const db=new PGlite();try{
  await db.exec(`create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_app_meta_data jsonb not null default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
  await db.query('insert into auth.users(id,raw_app_meta_data) values($1,$2),($3,$4),($5,$6),($7,$8)',[ids[0],{workspace_teacher:true,other_setting:'kept'},ids[1],{workspace_teacher:true,workspace_creator:false},ids[2],{},ids[3],{workspace_teacher:false,workspace_creator:true}]);
  await db.exec(fs.readFileSync(path.join(__dirname,'fixtures/communityWorkspaceLegacy.sql'),'utf8'));
  async function as(id,work){await db.exec(`reset role;select set_config('request.jwt.claim.sub','${id}',false);set role authenticated;`);try{return await work();}finally{await db.exec('reset role');}}
  const workspace=(await as(ids[0],()=>db.query("select public.mly_create_workspace('Community survey','Operator contact') as id"))).rows[0].id;
  const token=(await as(ids[0],()=>db.query('select public.mly_create_workspace_invite($1) as token',[workspace]))).rows[0].token;
  await as(ids[2],()=>db.query('select public.mly_join_workspace($1)',[token]));
  await as(ids[2],()=>db.query("insert into public.mly_workspace_notes(workspace_id,author_id,source_id,category,note_text,lon,lat,status,risk_label) values($1,$2,'original','Asset','Existing observation',1,2,'completed','high')",[workspace,ids[2]]));
  const tables=['mly_workspaces','mly_workspace_members','mly_workspace_notes','mly_workspace_invites'];const before={};for(const table of tables)before[table]=(await db.query('select * from public.'+table)).rows;
  const migration=fs.readFileSync(path.join(__dirname,'../tools/community-notes/migrations/002-collaboration-creator.sql'),'utf8');await db.exec(migration);
  await t.test('all existing workspace, member, note and invite rows remain byte-equivalent values',async()=>{for(const table of tables)assert.deepEqual((await db.query('select * from public.'+table)).rows,before[table],table);});
  await t.test('legacy trusted permission migrates while unrelated app metadata stays intact',async()=>{const metadata=(await db.query('select raw_app_meta_data from auth.users where id=$1',[ids[0]])).rows[0].raw_app_meta_data;assert.deepEqual(metadata,{workspace_creator:true,other_setting:'kept'});});
  await t.test('an explicit new denial is never converted into a grant',async()=>{assert.deepEqual((await db.query('select raw_app_meta_data from auth.users where id=$1',[ids[1]])).rows[0].raw_app_meta_data,{workspace_creator:false});await assert.rejects(as(ids[1],()=>db.query("select public.mly_create_workspace('Denied','Contact')")),/creation permission required/);});
  await t.test('membership alone does not grant workspace creation',async()=>{await assert.rejects(as(ids[2],()=>db.query("select public.mly_create_workspace('Denied','Contact')")),/creation permission required/);});
  await t.test('canonical grants continue to authorize creation independently of the old flag',async()=>{assert((await as(ids[3],()=>db.query("select public.mly_create_workspace('New project','Operator contact') as id"))).rows[0].id);});
  await t.test('repeating the migration is safe and does not change stored data or permissions',async()=>{const metadata=(await db.query('select * from auth.users order by id')).rows;await db.exec(migration);assert.deepEqual((await db.query('select * from auth.users order by id')).rows,metadata);assert.deepEqual((await db.query('select * from public.mly_workspace_notes')).rows,before.mly_workspace_notes);});
 }finally{await db.close();}
});
