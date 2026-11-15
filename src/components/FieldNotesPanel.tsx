/** @jsx jsx */
import type { DetectionPreviewLoader } from '../features/detections/detectionPreview';
import type { PendingFieldNote } from '../features/field-notes/FieldNoteDraft';
import type { ExternalContributionSeed } from '../features/places/placeNote';
import { attachmentMetadata, withAttachmentMetadata, withPlaceAttachmentMetadata } from '../features/detections/detectionImageAttachment';
import { detectionNoteDescription } from '../features/detections/detectionNote';
import { OwnedMessage } from '../i18n/WidgetLocale';
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import { notesScrollCss } from '../styles/notesScroll';
import { noteMapMessageStyle, noteMapRefreshStyle } from '../styles/fieldNotes';
import { LocalNotesList } from '../features/field-notes/LocalNotesList';
import { NoteAttachments } from '../features/field-notes/NoteAttachments';
import { NoteEditor } from '../features/field-notes/NoteEditor';
import { NoteDraftForm } from '../features/field-notes/NoteDraftForm';
import { EnterpriseNotesList } from '../features/field-notes/EnterpriseNotesList';
import type { WorkspaceLocationRequest } from '../features/community-notes/WorkspaceLocationPicker';
import { WorkspaceBoundary } from '../features/community-notes/WorkspaceBoundary';
import type { EnterpriseNotesLoader } from '../features/field-notes/enterpriseList';
import { notesTabsStyle, getNotesTabStyle, notesSheetStyle, notesSheetHandleStyle, notesSheetGripStyle, notesSheetHeaderStyle, notesSheetCloseStyle } from '../styles/enterpriseNotes';
import { FieldNote, FieldNoteEditor, FieldNoteAttachments, FIELD_NOTE_CATEGORIES } from "./types";

interface Props {
    onDetectionDraftLocation?:(requestId:string,point:{lon:number;lat:number})=>void;
    onDetectionDraftFinished?:(requestId:string)=>void;
    onLoadDetectionAttachment?:(note:FieldNote,id:string,signal:AbortSignal)=>Promise<string>;
    onLoadDetectionPreview?:DetectionPreviewLoader;
    detectionWorkspaceDraft?:ExternalContributionSeed|null;
    onClearDetectionWorkspaceDraft?:(applied?:boolean)=>void;
    onWorkspacePickLocation?: WorkspaceLocationRequest;
    currentImageId?: string | null;
    onWorkspaceMapChange?: (notes: FieldNote[], categories: readonly {name:string;color:string}[], workspaceName:string) => void;
    enterpriseEnabled?: boolean;
    onLoadEnterpriseNotes?: EnterpriseNotesLoader;
    enterpriseContext?: unknown;
    enterpriseLayerUrl?: string;
    attachments?: FieldNoteAttachments | null;
    currentImageAvailable?: boolean;
    onAttachments?: (note: FieldNote) => void;
    onUploadAttachment?: (file?: File, currentImage?: boolean) => void;
    onDownloadAttachment?: (id: number) => void;
    onCloseAttachments?: () => void;
    editor?: FieldNoteEditor | null;
    onEditNote?: (id: string) => void;
    onEditSharedNote?: (note: FieldNote) => void;
    onSaveEdit?: (values: { category: string; note: string; status: string; resolutionNote: string }) => void;
    onCancelEdit?: () => void;
    isAnnotationMode: boolean;
    pendingNote: PendingFieldNote | null;
    notes: FieldNote[];
    listOpen: boolean;
    categories?: string[];
    sharingEnabled?: boolean;
    sharedMessage?: string;
    onShareNote?: (id: string) => void;
    onRetrySharedDisplay?: () => void;
    onSubmitNote: (category: string, note: string, share?: boolean) => void;
    onCancelPending: () => void;
    onDeleteNote: (id: string) => void;
    onClearAll: () => void;
    onExport: () => void;
    onImportFile: (file: File) => void;
    onFocusNote: (note: FieldNote) => void;
    onCloseList: () => void;
}

let workspaceControlsPromise: Promise<{ default: typeof import('../features/community-notes/CommunityWorkspacePanel').CommunityWorkspacePanel }> | undefined;

/** Share the code download between Notes preloading and the workspace tab.
 * Importing does not mount controls, create a client, or contact the service.
 * A failed preload is discarded so opening the tab can attempt a fresh load.
 */
function loadWorkspaceControls() {
    if (!workspaceControlsPromise) {
        workspaceControlsPromise = import('../features/community-notes/CommunityWorkspacePanel')
            .then(module => ({ default: module.CommunityWorkspacePanel }))
            .catch(error => { workspaceControlsPromise = undefined; throw error; });
    }
    return workspaceControlsPromise;
}
const CommunityWorkspacePanel = React.lazy(loadWorkspaceControls);
const workspaceFeedbackStyle: React.CSSProperties = {
    color: '#d3e2d9', background: '#14251d', padding: 12,
    fontSize: 13, lineHeight: 1.5, overflowWrap: 'anywhere'
};

// NoteEditor is feature-owned; this panel composes it with lists and attachments.

// Shared note actions are styled in styles/fieldNotes.ts.

export const FieldNotesPanel: React.FC<Props> = (props) => {
 const { t, locale, owned } = useWidgetLocale();

    const {
        pendingNote, notes, listOpen, categories: propCategories,
        onSubmitNote, onCancelPending,
        onDeleteNote, onClearAll, onExport, onImportFile, onFocusNote, onCloseList
    } = props;
    
    // Use customized categories from config, or fallback to default categories
    const categories = React.useMemo(() => {
        return propCategories && propCategories.length > 0
            ? propCategories
            : Array.from(FIELD_NOTE_CATEGORIES);
    }, [propCategories]);

    const [category, setCategory] = React.useState<string>(categories[0] || "Other");
    const [noteText, setNoteText] = React.useState("");
    const [share, setShare] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [workspacePicking,setWorkspacePicking]=React.useState(false);
    const cancelWorkspacePick=React.useRef<(()=>void)|null>(null);
    /** Temporarily expose the map while retaining the mounted workspace/draft. */
    const requestWorkspacePick=React.useCallback<WorkspaceLocationRequest>((picked,cancelled)=>{
      cancelWorkspacePick.current?.();
      if(!props.onWorkspacePickLocation){cancelled();return()=>{};}
      let finished=false;setWorkspacePicking(true);
      const done=()=>{finished=true;cancelWorkspacePick.current=null;setWorkspacePicking(false);};
      const cancel=props.onWorkspacePickLocation(point=>{if(!finished){done();picked(point);}},()=>{if(!finished){done();cancelled();}});
      const stop=()=>{if(finished)return;cancel();if(!finished){done();cancelled();}};
      if(!finished)cancelWorkspacePick.current=stop;
      return stop;
    },[props.onWorkspacePickLocation]);
    React.useEffect(()=>()=>cancelWorkspacePick.current?.(),[]);
    React.useEffect(()=>{if(!workspacePicking)return;const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancelWorkspacePick.current?.();}};window.addEventListener('keydown',escape,true);return()=>window.removeEventListener('keydown',escape,true);},[workspacePicking]);
    const [notesExpanded, setNotesExpanded] = React.useState(false);
    const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);
    const [noteSource, setNoteSource] = React.useState<"local" | "enterprise" | "workspace">("local");
    const enterpriseAvailable = !!props.enterpriseEnabled && !!props.onLoadEnterpriseNotes;
    const activeSource = noteSource === "enterprise" && !enterpriseAvailable ? "local" : noteSource;
    // Warm only the interface code while the user reads Local/Enterprise notes.
    React.useEffect(() => { if (listOpen) void loadWorkspaceControls().catch(() => {}); }, [listOpen]);
    const [workspaceVisited, setWorkspaceVisited] = React.useState(false);
    React.useEffect(()=>{if(props.detectionWorkspaceDraft){setNoteSource('workspace');setWorkspaceVisited(true);}},[props.detectionWorkspaceDraft]);
    React.useEffect(() => { if (listOpen && activeSource === 'workspace') setWorkspaceVisited(true); }, [listOpen, activeSource]);
    React.useEffect(()=>{if(!listOpen||activeSource!=='workspace')cancelWorkspacePick.current?.();},[listOpen,activeSource]);
    const sources: Array<"local" | "enterprise" | "workspace"> = enterpriseAvailable ? ["local", "enterprise", "workspace"] : ["local", "workspace"];

    React.useEffect(() => {
        if (pendingNote) {
            setCategory(categories[0] || "Other");
            setNoteText(pendingNote.detectionId ? attachmentMetadata(detectionNoteDescription({...pendingNote,imageId:pendingNote.imageId||'',detectionId:pendingNote.detectionId,title:pendingNote.title||'Detected object'})).text : pendingNote.initialDescription||'');
            setShare(pendingNote.destination==='enterprise');
        }
    }, [pendingNote, categories]);

    return (
        <React.Fragment>
            <style>{notesScrollCss}</style>
            {props.attachments && <NoteAttachments attachments={props.attachments} currentImageAvailable={props.currentImageAvailable} onUploadAttachment={props.onUploadAttachment} onDownloadAttachment={props.onDownloadAttachment} onCloseAttachments={props.onCloseAttachments} />}
            {props.editor && props.onSaveEdit && props.onCancelEdit && <NoteEditor key={props.editor.key} editor={props.editor} categories={categories} translateDefaultCategories={!propCategories?.length} onSave={props.onSaveEdit} onCancel={props.onCancelEdit} />}
            {/* Note entry form: centered modal, avoids all fixed chrome */}
            {pendingNote && (
                <NoteDraftForm sourceLabel={pendingNote.placeId?owned('Overture place note'):undefined} detectionTitle={pendingNote.title} detectionDestination={pendingNote.destination} categories={categories} translateDefaultCategories={!propCategories?.length} category={category} noteText={noteText} share={share} sharingEnabled={props.sharingEnabled} setCategory={setCategory} setNoteText={setNoteText} setShare={setShare} onSubmitNote={(category,text,share)=>onSubmitNote(category,pendingNote.detectionId?withAttachmentMetadata(text,{...pendingNote,imageId:pendingNote.imageId||'',detectionId:pendingNote.detectionId}):pendingNote.placeId?withPlaceAttachmentMetadata(text,{...pendingNote,placeId:pendingNote.placeId}):text,share)} onCancelPending={onCancelPending} />
            )}

            {workspacePicking&&<div role="status" onPointerDown={event=>event.stopPropagation()} onClick={event=>event.stopPropagation()} style={{position:'absolute',bottom:12,left:12,right:12,zIndex:999999994,padding:12,background:'#13251ef2',color:'#eef6f0',border:'1px solid #7fae94',borderRadius:6,display:'flex',flexWrap:'wrap',alignItems:'center',gap:10}}>
              <span>{owned('Click the map to choose a contribution location. Press Escape to cancel.')}</span>
              <button className="mly-text-action" type="button" style={{...noteMapRefreshStyle,padding:'6px 10px',minHeight:32}} onClick={()=>cancelWorkspacePick.current?.()}>{owned('Cancel location picking')}</button>
            </div>}
            {/* Notes list: bottom-sheet with fixed header and scrollable notes */}
            {(listOpen || workspaceVisited) && (
                <div className="mly-notes-sheet" hidden={!listOpen||workspacePicking} style={{ ...notesSheetStyle, display: listOpen&&!workspacePicking ? 'flex' : 'none', ...(notesExpanded ? { height: '92%' } : {}) }}>
                    <div style={notesSheetHeaderStyle}>
                    {/* Native button supports touch, Enter and Space without stealing list scrolling. */}
                    <button type="button" aria-expanded={notesExpanded} aria-label={owned(notesExpanded ? 'Collapse notes panel' : 'Expand notes panel')}
                      title={owned(notesExpanded ? 'Collapse notes panel' : 'Expand notes panel')} style={notesSheetHandleStyle}
                      onClick={event => { event.stopPropagation(); setNotesExpanded(value => !value); }}
                      onPointerDown={event => event.stopPropagation()}>
                      <span aria-hidden="true" style={notesSheetGripStyle} />
                    </button>
                    <button type="button" aria-label={t('uiCloseNotesList')} title={t('uiCloseNotesList')} style={notesSheetCloseStyle}
                      onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); onCloseList(); }}>
                      <svg aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                    </div>
                    {props.sharedMessage && activeSource !== 'workspace' && <div role="status" style={noteMapMessageStyle}>{<OwnedMessage source={String(props.sharedMessage ?? "")}/>} <button className="mly-text-action" type="button" onClick={props.onRetrySharedDisplay} style={noteMapRefreshStyle}> {t('uiRefresh')} </button></div>}
                    <div role="tablist" aria-label={t('uiNoteSource')} style={{ ...notesTabsStyle, flexWrap: 'wrap' }} onKeyDown={event => {
                      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                      event.preventDefault();
                      const index = sources.indexOf(activeSource);
                      const step = (event.key === "ArrowRight" ? 1 : -1) * (locale === 'ar' ? -1 : 1);
                      const nextSource = event.key === "Home" ? sources[0] : event.key === "End" ? sources[sources.length - 1] : sources[(index + step + sources.length) % sources.length];
                      setNoteSource(nextSource); setIsConfirmingClear(false);
                      (event.currentTarget.querySelector('[data-source="' + nextSource + '"]') as HTMLButtonElement | null)?.focus();
                    }}>
                      {sources.map(source => <button className="mly-text-action" key={source} type="button" role="tab" data-source={source} aria-selected={activeSource === source}
                        tabIndex={activeSource === source ? 0 : -1} style={getNotesTabStyle(activeSource === source)}
                        onClick={() => { setNoteSource(source); setIsConfirmingClear(false); }}>
                        {source === 'local' ? `${t('uiLocal').trim()}${notes.length})` : source === 'enterprise' ? t('uiEnterprise') : owned('Workspaces')}
                      </button>)}
                    </div>
                    {/* Keep the explicit connection in memory while placing local drafts.
                        Local/Enterprise lists still unmount on close/source changes. */}
                    {(workspaceVisited || activeSource === 'workspace') && <div hidden={activeSource !== 'workspace'}
                      style={{ display: activeSource === 'workspace' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, flex: '1 1 0' }}>
                      <WorkspaceBoundary fallback={<div role="alert" style={workspaceFeedbackStyle}>{owned('Workspace controls could not load. Local notes remain available; reload the page to retry.')}</div>}>
                        <React.Suspense fallback={<div role="status" style={workspaceFeedbackStyle}>{owned('Loading workspace controls…')}</div>}>
                          <CommunityWorkspacePanel onDetectionDraftLocation={props.onDetectionDraftLocation} onDetectionDraftFinished={props.onDetectionDraftFinished} onLoadDetectionPreview={props.onLoadDetectionPreview} detectionDraft={props.detectionWorkspaceDraft} onClearDetectionDraft={props.onClearDetectionWorkspaceDraft} notes={notes} onFocus={onFocusNote} onMapNotes={props.onWorkspaceMapChange} onPickLocation={props.onWorkspacePickLocation?requestWorkspacePick:undefined} currentImageId={props.currentImageId} />
                        </React.Suspense>
                      </WorkspaceBoundary>
                    </div>}
                    {listOpen && activeSource !== 'workspace' && (activeSource === "enterprise" && props.onLoadEnterpriseNotes ? <EnterpriseNotesList onLoadDetectionAttachment={props.onLoadDetectionAttachment} onLoadDetectionPreview={props.onLoadDetectionPreview} loadPage={props.onLoadEnterpriseNotes} context={props.enterpriseContext} layerUrl={props.enterpriseLayerUrl} onFocus={onFocusNote} onEdit={props.sharingEnabled ? props.onEditSharedNote : undefined} onAttachments={props.onAttachments} editorBusy={!!props.editor?.saving} attachmentsBusy={!!props.attachments?.busy} /> : <LocalNotesList onLoadDetectionAttachment={props.onLoadDetectionAttachment} onLoadDetectionPreview={props.onLoadDetectionPreview} notes={notes} fileInputRef={fileInputRef} isConfirmingClear={isConfirmingClear} setIsConfirmingClear={setIsConfirmingClear}
                      sharingEnabled={props.sharingEnabled} editorBusy={props.editor?.saving} attachmentsBusy={props.attachments?.busy}
                      onShareNote={props.onShareNote} onEditNote={props.onEditNote} onEditSharedNote={props.onEditSharedNote} onAttachments={props.onAttachments}
                      onDeleteNote={onDeleteNote} onClearAll={onClearAll} onExport={onExport} onImportFile={onImportFile} onFocusNote={onFocusNote} />)}
                </div>
            )}
        </React.Fragment>
    );
};

export default FieldNotesPanel;
