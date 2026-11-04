#!/usr/bin/env node
'use strict';
/**
 * Workspace row readability confirmation. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/styles/communityWorkspace.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace row readability 1",
              "before": "import type { React } from 'jimu-core';\n/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */\nexport const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:8,flex:'1 1 0',minHeight:0,minWidth:0,boxSizing:'border-box',paddingInlineEnd:4,paddingBottom:'max(20px, env(safe-area-inset-bottom, 0px))',scrollPaddingBottom:48,overscrollBehavior:'contain',overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};\nexport const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:10,background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};\nexport const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};\nexport const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};\n",
              "after": "import type { React } from 'jimu-core';\n/** Workspace controls scroll within the existing notes sheet at controller/mobile widths. */\nexport const workspacePanelStyle: React.CSSProperties = {display:'flex',flexDirection:'column',gap:10,flex:'1 1 0',minHeight:0,minWidth:0,boxSizing:'border-box',paddingInline:8,paddingBottom:'max(20px, env(safe-area-inset-bottom, 0px))',scrollPaddingBottom:48,overscrollBehavior:'contain',overflowY:'auto',overflowX:'hidden',fontSize:12,lineHeight:1.5,color:'#d3e2d9'};\nexport const workspaceCardStyle: React.CSSProperties = {display:'grid',gap:8,padding:10,background:'#101e18',border:'1px solid #3f5b4c',borderRadius:6,minWidth:0,overflowWrap:'anywhere'};\nexport const workspaceRowStyle: React.CSSProperties = {display:'flex',flexWrap:'wrap',gap:6,alignItems:'center',minWidth:0};\nexport const workspaceFieldStyle: React.CSSProperties = {display:'grid',gap:3,minWidth:0};\n"
            },
            {
              "label": "Workspace row readability 2",
              "before": "export const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:32,justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};\n\n/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */\nexport const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'#13251e',borderColor:'#49695a'};\nexport const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};\nexport const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};\nexport const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};\n",
              "after": "export const workspaceButtonStyle: React.CSSProperties = {font:'inherit',padding:'6px 10px',minHeight:32,justifySelf:'start',maxWidth:'100%',background:'#214233',color:'#e4f2ea',border:'1px solid #526e60',borderRadius:4,cursor:'pointer'};\n\n/** Visual hierarchy: control sections, contribution cards, and compact actions differ. */\nexport const workspaceSectionStyle: React.CSSProperties = {...workspaceCardStyle,background:'var(--mly-workspace-surface, #13251e)',borderColor:'#49695a'};\nexport const workspaceSummaryStyle: React.CSSProperties = {padding:'5px 0',fontSize:12,fontWeight:700,color:'#eef6f0',cursor:'pointer'};\nexport const workspaceSecondaryButtonStyle: React.CSSProperties = {...workspaceButtonStyle,background:'transparent',borderColor:'#718d7d'};\nexport const workspaceDangerButtonStyle: React.CSSProperties = {...workspaceSecondaryButtonStyle,color:'#ffcfbf',borderColor:'#986c5d'};\n"
            },
            {
              "label": "Workspace row readability 3",
              "before": "export const workspaceEditorActionsStyle: React.CSSProperties = {...workspaceRowStyle,position:'sticky',bottom:0,zIndex:2,\n  gap:8,padding:'8px 0',background:'#13251e',borderTop:'1px solid #567363'};\nexport const workspacePickerResultsStyle: React.CSSProperties = {display:'grid',gap:6,maxHeight:220,minHeight:0,overflowY:'auto',overflowX:'hidden',padding:4,border:'1px solid #496052',borderRadius:5};\n",
              "after": "export const workspaceEditorActionsStyle: React.CSSProperties = {...workspaceRowStyle,position:'sticky',bottom:0,zIndex:2,\n  gap:8,padding:'8px 0',background:'#13251e',borderTop:'1px solid #567363'};\nexport const workspacePickerResultsStyle: React.CSSProperties = {display:'grid',gap:6,maxHeight:220,minHeight:0,overflowY:'auto',overflowX:'hidden',padding:4,border:'1px solid #496052',borderRadius:5};\n\n/** Neutral bands help scanning without competing with semantic category colors. */\nexport const workspaceReadabilityCss = `\n.mly-workspace-scroll > .mly-workspace-section:nth-child(even) { --mly-workspace-surface: #172b23; }\n.mly-workspace-scroll > .mly-workspace-section:nth-child(odd) { --mly-workspace-surface: #102019; }\n.mly-workspace-scroll .mly-workspace-section { flex-shrink: 0; }\n.mly-workspace-scroll details.mly-workspace-section > summary { padding: 8px 2px; }\n.mly-workspace-scroll details.mly-workspace-section[open] > summary { border-bottom: 1px solid #647e6f55; margin-bottom: 10px; }\n.mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 10px; }\n.mly-workspace-scroll .mly-workspace-category-row:nth-child(even) { background: #ffffff08; }\n.mly-workspace-scroll .mly-workspace-category-row:nth-child(odd) { background: #00000014; }\n.mly-workspace-scroll .mly-workspace-category-row:focus-within { outline: 2px solid #a5c9b6; outline-offset: 1px; }\n.mly-workspace-scroll .mly-workspace-category-row:hover { border-color: #86a694; }\n@media (max-width: 480px) {\n .mly-workspace-scroll details.mly-workspace-section > div { margin-inline-start: 4px; }\n}\n`;\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/CommunityWorkspacePanel.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace row readability 1",
              "before": "import { useWorkspaceContributions } from './useWorkspaceContributions';\nimport { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation, formatWorkspaceContributor } from './communityWorkspace';\nimport type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';\nimport { workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceHeadingStyle as headingStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';\n\ninterface Props { onPickLocation?:WorkspaceLocationRequest;currentImageId?:string|null;notes: readonly FieldNote[]; onFocus(note: FieldNote): void; onClose(): void;\n  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }\n",
              "after": "import { useWorkspaceContributions } from './useWorkspaceContributions';\nimport { CommunityWorkspaceClient, communityNoteTarget, parseWorkspaceInvitation, formatWorkspaceContributor } from './communityWorkspace';\nimport type { CommunityWorkspace, CommunityRecord, WorkspaceMember, WorkspaceInvite, WorkspaceCategory } from './communityWorkspace';\nimport { workspaceReadabilityCss, workspacePanelStyle as panel, workspaceCardStyle as card, workspaceRowStyle as row, workspaceFieldStyle as field, workspaceInputStyle as input, workspaceButtonStyle as button, workspaceSectionStyle as sectionStyle, workspaceSummaryStyle as summaryStyle, workspaceHeadingStyle as headingStyle, workspaceSecondaryButtonStyle as secondary } from '../../styles/communityWorkspace';\n\ninterface Props { onPickLocation?:WorkspaceLocationRequest;currentImageId?:string|null;notes: readonly FieldNote[]; onFocus(note: FieldNote): void; onClose(): void;\n  onMapNotes?(notes: FieldNote[],categories: readonly WorkspaceCategory[],workspaceName: string): void }\n"
            },
            {
              "label": "Workspace row readability 2",
              "before": "\n      </WorkspaceContributionCard>):[],[records,categories,busy,owner,canWrite,editing,editError,onFocus,active,workspace,run,contributions.refresh,text]);\n  return <section className=\"mly-notes-scroll mly-workspace-scroll\" role=\"tabpanel\" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>\n    <div style={row}><strong>{text('Collaboration workspace')}</strong>{action('Close',onClose,false)}{connected&&action('Disconnect',disconnect,false)}</div>\n    <details open={connectionOpen} onToggle={event=>setConnectionOpen(event.currentTarget.open)} style={sectionStyle}><summary style={summaryStyle}>{text('Connection and workspace settings')}</summary>\n    {!connected?<div style={card}>\n      <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>\n      <details><summary>{text('Have an invitation?')}</summary><label style={field}>{text('Invitation details')}<textarea aria-label={text('Invitation details')} style={input} value={invitation} onChange={event=>setInvitation(event.target.value)} /></label>{action('Use invitation details',importInvitation)}</details>\n",
              "after": "\n      </WorkspaceContributionCard>):[],[records,categories,busy,owner,canWrite,editing,editError,onFocus,active,workspace,run,contributions.refresh,text]);\n  return <section className=\"mly-notes-scroll mly-workspace-scroll\" role=\"tabpanel\" aria-label={text('Workspace notes')} style={panel} onClick={event=>event.stopPropagation()} onPointerDown={event=>event.stopPropagation()} onKeyDown={event=>event.stopPropagation()}>\n    <style>{workspaceReadabilityCss}</style>\n    <div style={row}><strong>{text('Collaboration workspace')}</strong>{action('Close',onClose,false)}{connected&&action('Disconnect',disconnect,false)}</div>\n    <details open={connectionOpen} onToggle={event=>setConnectionOpen(event.currentTarget.open)} className=\"mly-workspace-section\" style={sectionStyle}><summary style={summaryStyle}>{text('Connection and workspace settings')}</summary>\n    {!connected?<div style={card}>\n      <p>{text('Connect to a workspace service operated by your team, community, or organization. This widget does not host shared notes.')}</p>\n      <details><summary>{text('Have an invitation?')}</summary><label style={field}>{text('Invitation details')}<textarea aria-label={text('Invitation details')} style={input} value={invitation} onChange={event=>setInvitation(event.target.value)} /></label>{action('Use invitation details',importInvitation)}</details>\n"
            },
            {
              "label": "Workspace row readability 3",
              "before": "    </div>}\n    </details>\n    {signedIn&&workspace&&<React.Fragment>\n      <div style={sectionStyle}><div style={{...row,justifyContent:'space-between'}}><h3 style={headingStyle}>{workspace.name}</h3><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span></div>\n        <small>{text('Operator contact')}: {workspace.operator_contact}</small>\n        <nav aria-label={text('Workspace actions')} style={row}>\n          <button type=\"button\" style={button} onClick={()=>goToSection(resultsRef)}>{text('Read contributions')}</button>\n",
              "after": "    </div>}\n    </details>\n    {signedIn&&workspace&&<React.Fragment>\n      <div className=\"mly-workspace-section\" style={sectionStyle}><div style={{...row,justifyContent:'space-between'}}><h3 style={headingStyle}>{workspace.name}</h3><span>{text('Your role')}: {text(owner?'Owner':canWrite?'Contributor':'Reader')}</span></div>\n        <small>{text('Operator contact')}: {workspace.operator_contact}</small>\n        <nav aria-label={text('Workspace actions')} style={row}>\n          <button type=\"button\" style={button} onClick={()=>goToSection(resultsRef)}>{text('Read contributions')}</button>\n"
            },
            {
              "label": "Workspace row readability 4",
              "before": "      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}\n      {canWrite&&<WorkspaceContributionDraft key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}\n        onPublish={(values,onSaved)=>{const api=client.current!;setCreateError('');void run(()=>api.createContribution(active,values),created=>{contributions.clearSearch();contributions.refresh();setMessage(text(created?'Contribution published.':'This draft was already published; no duplicate was created.'));onSaved();goToSection(resultsRef);},setCreateError);}} />}\n      {canWrite&&<details ref={publishRef} style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Publish a local note')}</summary>\n        <div style={{display:'grid',gap:12,minWidth:0,paddingTop:8}}>\n        <p style={{margin:0}}>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>\n        <LocalNotePicker notes={notes} value={localId} onSelect={id=>{setLocalId(id);setPublishTitle(notes.find(note=>note.id===id)?.title||'');}} onPreview={onFocus} />\n",
              "after": "      {contributions.page&&!activeCategories.length&&!contributions.busy&&<p>{text(owner?'Add a workspace category to enable publishing.':'The owner must add an active workspace category before new contributions can be published.')}</p>}\n      {canWrite&&<WorkspaceContributionDraft key={'draft:'+active} sectionRef={createRef} categories={categories} busy={busy} error={createError} onPickLocation={onPickLocation} currentImageId={currentImageId}\n        onPublish={(values,onSaved)=>{const api=client.current!;setCreateError('');void run(()=>api.createContribution(active,values),created=>{contributions.clearSearch();contributions.refresh();setMessage(text(created?'Contribution published.':'This draft was already published; no duplicate was created.'));onSaved();goToSection(resultsRef);},setCreateError);}} />}\n      {canWrite&&<details ref={publishRef} className=\"mly-workspace-section\" style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Publish a local note')}</summary>\n        <div style={{display:'grid',gap:12,minWidth:0,paddingTop:8}}>\n        <p style={{margin:0}}>{text('Only the selected note will be sent. Its local copy stays in this browser.')}</p>\n        <LocalNotePicker notes={notes} value={localId} onSelect={id=>{setLocalId(id);setPublishTitle(notes.find(note=>note.id===id)?.title||'');}} onPreview={onFocus} />\n"
            },
            {
              "label": "Workspace row readability 5",
              "before": "        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,title:publishTitle.trim(),category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!publishTitle.trim()||!chosenCategory||!notes.some(note=>note.id===localId))}\n        </div>\n      </details>}\n      {owner&&<details style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>\n        {/* Give disclosure content an explicit inner layout and logical indentation. */}\n        <div style={{display:'grid',gap:16,minWidth:0,paddingTop:10,paddingInlineStart:8,borderInlineStart:'2px solid #496052'}}>\n          <div style={{...card,gap:12}}>\n",
              "after": "        {action('Publish selected note',()=>{const note=notes.find(item=>item.id===localId),api=client.current;if(!note||!api||!chosenCategory)return;void run(()=>api.publish(active,{...note,title:publishTitle.trim(),category:chosenCategory},null),created=>{contributions.refresh();setMessage(text(created?'Note published.':'This local note was already published; no duplicate was created.'));});},busy||!publishTitle.trim()||!chosenCategory||!notes.some(note=>note.id===localId))}\n        </div>\n      </details>}\n      {owner&&<details className=\"mly-workspace-section\" style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage invitations and members')}</summary>\n        {/* Give disclosure content an explicit inner layout and logical indentation. */}\n        <div style={{display:'grid',gap:16,minWidth:0,paddingTop:10,paddingInlineStart:8,borderInlineStart:'2px solid #496052'}}>\n          <div style={{...card,gap:12}}>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceCategoryEditor.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace row readability 1",
              "before": "  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(false);\n  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');\n  return <details ref={sectionRef} style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>\n    {/* Details content needs its own layout container; grid on details itself is inconsistent across browsers. */}\n    <div style={body}>\n    <p style={{margin:0}}>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>\n",
              "after": "  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(false);\n  const [name,setName]=React.useState(''),[color,setColor]=React.useState('#f5a623');\n  return <details ref={sectionRef} className=\"mly-workspace-section\" style={{...sectionStyle,display:'block'}}><summary style={summaryStyle}>{text('Manage workspace categories')}</summary>\n    {/* Details content needs its own layout container; grid on details itself is inconsistent across browsers. */}\n    <div style={body}>\n    <p style={{margin:0}}>{text('Choose categories and colors for this workspace. Retired categories remain on existing contributions. Use an existing name to change its color.')}</p>\n"
            },
            {
              "label": "Workspace row readability 2",
              "before": "    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type=\"color\" style={colorInput} value={color} onChange={event=>setColor(event.target.value)} /></label>\n    <button type=\"button\" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>\n    <div style={{display:'grid',gap:8,minWidth:0}}>\n    {categories.map(category=><div key={category.name} style={categoryRow}>\n      <div style={{...row,flex:'1 1 140px'}}>\n      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}\n      </div>\n",
              "after": "    <label style={field}>{text('Category color')}<input aria-label={text('Category color')} type=\"color\" style={colorInput} value={color} onChange={event=>setColor(event.target.value)} /></label>\n    <button type=\"button\" style={button} disabled={busy||!name.trim()} onClick={()=>onSave(name,color,categories.find(category=>category.name===name.trim())?.archived||false)}>{text('Save category')}</button>\n    <div style={{display:'grid',gap:8,minWidth:0}}>\n    {categories.map(category=><div key={category.name} className=\"mly-workspace-category-row\" style={categoryRow}>\n      <div style={{...row,flex:'1 1 140px'}}>\n      <WorkspaceCategoryBadge name={category.name} color={category.color}/>{category.archived&&<span>{text('Retired')}</span>}\n      </div>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceContributionDraft.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace row readability 1",
              "before": " const active=categories.filter(item=>!item.archived),validCategory=active.some(item=>item.name===category);\n function reset(){cancel.current?.();cancel.current=null;source.current='';setTitle('');setDescription('');setPoint(null);setPicking(false);setAttach(null);}\n function chooseLocation(){if(!onPickLocation)return;cancel.current?.();setPicking(true);cancel.current=onPickLocation(location=>{cancel.current=null;setPoint(location);setPicking(false);},()=>{cancel.current=null;setPicking(false);});}\n return <details ref={sectionRef} style={{...section,display:'block'}}><summary style={summary}>{text('Create contribution')}</summary>\n  <form aria-label={text('Create contribution')} style={{display:'grid',gap:10,minWidth:0,paddingTop:8}} onSubmit={event=>{event.preventDefault();if(busy||!point||!validCategory||!title.trim())return;if(!source.current)source.current='community:'+crypto.randomUUID();onPublish({sourceId:source.current,title:title.trim(),description,category,lon:point.lon,lat:point.lat,imageId:attach},reset);}}>\n   <p style={{margin:0}}>{text('Choose a map location and use this workspace\u2019s categories. No local draft or Builder access is required.')}</p>\n   <button type=\"button\" style={secondary} disabled={busy||!onPickLocation} onClick={chooseLocation}>{text(point?'Choose another map location':'Choose location on map')}</button>\n",
              "after": " const active=categories.filter(item=>!item.archived),validCategory=active.some(item=>item.name===category);\n function reset(){cancel.current?.();cancel.current=null;source.current='';setTitle('');setDescription('');setPoint(null);setPicking(false);setAttach(null);}\n function chooseLocation(){if(!onPickLocation)return;cancel.current?.();setPicking(true);cancel.current=onPickLocation(location=>{cancel.current=null;setPoint(location);setPicking(false);},()=>{cancel.current=null;setPicking(false);});}\n return <details ref={sectionRef} className=\"mly-workspace-section\" style={{...section,display:'block'}}><summary style={summary}>{text('Create contribution')}</summary>\n  <form aria-label={text('Create contribution')} style={{display:'grid',gap:10,minWidth:0,paddingTop:8}} onSubmit={event=>{event.preventDefault();if(busy||!point||!validCategory||!title.trim())return;if(!source.current)source.current='community:'+crypto.randomUUID();onPublish({sourceId:source.current,title:title.trim(),description,category,lon:point.lon,lat:point.lat,imageId:attach},reset);}}>\n   <p style={{margin:0}}>{text('Choose a map location and use this workspace\u2019s categories. No local draft or Builder access is required.')}</p>\n   <button type=\"button\" style={secondary} disabled={busy||!onPickLocation} onClick={chooseLocation}>{text(point?'Choose another map location':'Choose location on map')}</button>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceContributionTools.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace row readability 1",
              "before": " */\nexport function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,waiting,onComposition,onSubmit,onClear,onQuery,onMine}:{statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;waiting:boolean;onComposition(value:boolean):void;onSubmit():void;onClear():void;onQuery(value:string):void;onMine(value:boolean):void}) {\n  const {owned:text}=useWidgetLocale();\n  return <div style={sectionStyle}>\n    <h3 style={headingStyle}>{text('Find contributions')}</h3>\n    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>\n      <span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Total contributions')}: {statistics.total}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('My contributions')}: {statistics.mine}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Contributors')}: {statistics.contributors}</span>\n",
              "after": " */\nexport function WorkspaceContributionTools({statistics,categories,loaded,query,mine,busy,waiting,onComposition,onSubmit,onClear,onQuery,onMine}:{statistics:ContributionStatistics|null;categories:readonly WorkspaceCategory[];loaded:number;query:string;mine:boolean;busy:boolean;waiting:boolean;onComposition(value:boolean):void;onSubmit():void;onClear():void;onQuery(value:string):void;onMine(value:boolean):void}) {\n  const {owned:text}=useWidgetLocale();\n  return <div className=\"mly-workspace-section\" style={sectionStyle}>\n    <h3 style={headingStyle}>{text('Find contributions')}</h3>\n    {statistics&&<React.Fragment><div style={row} aria-label={text('Contribution statistics')}>\n      <span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Total contributions')}: {statistics.total}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('My contributions')}: {statistics.mine}</span><span style={{padding:6,background:'#263c31',borderRadius:5}}>{text('Contributors')}: {statistics.contributors}</span>\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/community-notes/WorkspaceDisplayNameEditor.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Workspace row readability 1",
              "before": "  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(!value),[draft,setDraft]=React.useState(value||''),[validation,setValidation]=React.useState('');\n  React.useEffect(()=>setDraft(value||''),[value]);\n  return <div style={section}>\n    <div style={{...row,justifyContent:'space-between'}}><strong>{text('Your workspace display name')}</strong><bdi style={{overflowWrap:'anywhere'}}>{formatWorkspaceContributor(userId,value,text('Not set'))}</bdi>\n      {!editing&&<button type=\"button\" style={secondary} onClick={()=>{setDraft(value||'');setValidation('');setEditing(true);}}>{text('Edit display name')}</button>}\n    </div>\n",
              "after": "  const {owned:text}=useWidgetLocale();\n  const [editing,setEditing]=React.useState(!value),[draft,setDraft]=React.useState(value||''),[validation,setValidation]=React.useState('');\n  React.useEffect(()=>setDraft(value||''),[value]);\n  return <div className=\"mly-workspace-section\" style={section}>\n    <div style={{...row,justifyContent:'space-between'}}><strong>{text('Your workspace display name')}</strong><bdi style={{overflowWrap:'anywhere'}}>{formatWorkspaceContributor(userId,value,text('Not set'))}</bdi>\n      {!editing&&<button type=\"button\" style={secondary} onClick={()=>{setDraft(value||'');setValidation('');setEditing(true);}}>{text('Edit display name')}</button>}\n    </div>\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'workspace-row-readability-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'workspace-row-readability' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-workspace-row-readability.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Workspace row readability confirmation is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'workspace-row-readability', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Workspace row readability confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
