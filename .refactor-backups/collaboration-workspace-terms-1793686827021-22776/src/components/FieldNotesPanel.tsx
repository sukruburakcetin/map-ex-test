/** @jsx jsx */
import { OwnedMessage } from '../i18n/WidgetLocale';
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import { noteMapMessageStyle, noteMapRefreshStyle } from '../styles/fieldNotes';
import { LocalNotesList } from '../features/field-notes/LocalNotesList';
import { NoteAttachments } from '../features/field-notes/NoteAttachments';
import { NoteEditor } from '../features/field-notes/NoteEditor';
import { NoteDraftForm } from '../features/field-notes/NoteDraftForm';
import { EnterpriseNotesList } from '../features/field-notes/EnterpriseNotesList';
import { WorkspaceBoundary } from '../features/community-notes/WorkspaceBoundary';
import type { EnterpriseNotesLoader } from '../features/field-notes/enterpriseList';
import { notesTabsStyle, getNotesTabStyle, notesSheetStyle } from '../styles/enterpriseNotes';
import { FieldNote, FieldNoteEditor, FieldNoteAttachments, FIELD_NOTE_CATEGORIES } from "./types";

interface Props {
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
    pendingNote: { lon: number; lat: number; imageId: string | null } | null;
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

// No workspace service or credentials are initialized until its tab is opened.
const CommunityWorkspacePanel = React.lazy(() => import('../features/community-notes/CommunityWorkspacePanel').then(module => ({ default: module.CommunityWorkspacePanel })));

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
    const [isConfirmingClear, setIsConfirmingClear] = React.useState(false);
    const [noteSource, setNoteSource] = React.useState<"local" | "enterprise" | "workspace">("local");
    const enterpriseAvailable = !!props.enterpriseEnabled && !!props.onLoadEnterpriseNotes;
    const activeSource = noteSource === "enterprise" && !enterpriseAvailable ? "local" : noteSource;
    const [workspaceVisited, setWorkspaceVisited] = React.useState(false);
    React.useEffect(() => { if (listOpen && activeSource === 'workspace') setWorkspaceVisited(true); }, [listOpen, activeSource]);
    const sources: Array<"local" | "enterprise" | "workspace"> = enterpriseAvailable ? ["local", "enterprise", "workspace"] : ["local", "workspace"];

    React.useEffect(() => {
        if (pendingNote) {
            setCategory(categories[0] || "Other");
            setNoteText(""); setShare(false);
        }
    }, [pendingNote, categories]);

    return (
        <React.Fragment>
            {props.attachments && <NoteAttachments attachments={props.attachments} currentImageAvailable={props.currentImageAvailable} onUploadAttachment={props.onUploadAttachment} onDownloadAttachment={props.onDownloadAttachment} onCloseAttachments={props.onCloseAttachments} />}
            {props.editor && props.onSaveEdit && props.onCancelEdit && <NoteEditor key={props.editor.key} editor={props.editor} categories={categories} translateDefaultCategories={!propCategories?.length} onSave={props.onSaveEdit} onCancel={props.onCancelEdit} />}
            {/* Note entry form: centered modal, avoids all fixed chrome */}
            {pendingNote && (
                <NoteDraftForm categories={categories} translateDefaultCategories={!propCategories?.length} category={category} noteText={noteText} share={share} sharingEnabled={props.sharingEnabled} setCategory={setCategory} setNoteText={setNoteText} setShare={setShare} onSubmitNote={onSubmitNote} onCancelPending={onCancelPending} />
            )}

            {/* Notes list: bottom-sheet with fixed header and scrollable notes */}
            {(listOpen || workspaceVisited) && (
                <div hidden={!listOpen} style={{ ...notesSheetStyle, display: listOpen ? 'flex' : 'none' }}>
                    {props.sharedMessage && <div role="status" style={noteMapMessageStyle}>{<OwnedMessage source={String(props.sharedMessage ?? "")}/>} <button type="button" onClick={props.onRetrySharedDisplay} style={noteMapRefreshStyle}> {t('uiRefresh')} </button></div>}
                    <div role="tablist" aria-label={t('uiNoteSource')} style={{ ...notesTabsStyle, flexWrap: 'wrap' }} onKeyDown={event => {
                      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                      event.preventDefault();
                      const index = sources.indexOf(activeSource);
                      const step = (event.key === "ArrowRight" ? 1 : -1) * (locale === 'ar' ? -1 : 1);
                      const nextSource = event.key === "Home" ? sources[0] : event.key === "End" ? sources[sources.length - 1] : sources[(index + step + sources.length) % sources.length];
                      setNoteSource(nextSource); setIsConfirmingClear(false);
                      (event.currentTarget.querySelector('[data-source="' + nextSource + '"]') as HTMLButtonElement | null)?.focus();
                    }}>
                      {sources.map(source => <button key={source} type="button" role="tab" data-source={source} aria-selected={activeSource === source}
                        tabIndex={activeSource === source ? 0 : -1} style={getNotesTabStyle(activeSource === source)}
                        onClick={() => { setNoteSource(source); setIsConfirmingClear(false); }}>
                        {source === 'local' ? `${t('uiLocal').trim()}${notes.length})` : source === 'enterprise' ? t('uiEnterprise') : owned('Workspace')}
                      </button>)}
                    </div>
                    {/* Keep the explicit connection in memory while placing local drafts.
                        Local/Enterprise lists still unmount on close/source changes. */}
                    {(workspaceVisited || activeSource === 'workspace') && <div hidden={activeSource !== 'workspace'}
                      style={{ display: activeSource === 'workspace' ? 'flex' : 'none', flexDirection: 'column', minHeight: 0, flex: '1 1 0' }}>
                      <WorkspaceBoundary fallback={<div role="alert">{owned('Workspace controls could not load. Local notes remain available; reload the page to retry.')}</div>}>
                        <React.Suspense fallback={<div role="status">{owned('Loading workspace controls…')}</div>}>
                          <CommunityWorkspacePanel notes={notes} onFocus={onFocusNote} onClose={onCloseList} />
                        </React.Suspense>
                      </WorkspaceBoundary>
                    </div>}
                    {listOpen && activeSource !== 'workspace' && (activeSource === "enterprise" && props.onLoadEnterpriseNotes ? <EnterpriseNotesList loadPage={props.onLoadEnterpriseNotes} context={props.enterpriseContext} layerUrl={props.enterpriseLayerUrl} onFocus={onFocusNote} onEdit={props.sharingEnabled ? props.onEditSharedNote : undefined} onAttachments={props.onAttachments} editorBusy={!!props.editor?.saving} attachmentsBusy={!!props.attachments?.busy} onClose={onCloseList} /> : <LocalNotesList notes={notes} fileInputRef={fileInputRef} isConfirmingClear={isConfirmingClear} setIsConfirmingClear={setIsConfirmingClear}
                      sharingEnabled={props.sharingEnabled} editorBusy={props.editor?.saving} attachmentsBusy={props.attachments?.busy}
                      onShareNote={props.onShareNote} onEditNote={props.onEditNote} onEditSharedNote={props.onEditSharedNote} onAttachments={props.onAttachments}
                      onDeleteNote={onDeleteNote} onClearAll={onClearAll} onExport={onExport} onImportFile={onImportFile} onFocusNote={onFocusNote} onCloseList={onCloseList} />)}
                </div>
            )}
        </React.Fragment>
    );
};

export default FieldNotesPanel;
