/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { FieldNotesPanel } from '../../components/FieldNotesPanel';
import type { IMConfig } from '../../config';
import type { WidgetState } from '../../runtime/widgetState';
import { DetectionNoteAction } from '../detections/DetectionNoteAction';

type NotesState = Pick<WidgetState,
  'detectionsActive' | 'viewerDetectionNote' | 'nearbyStripOpen' | 'detectionNoteCapturing' |
  'detectionNotePicking' | 'detectionWorkspaceDraft' | 'isAnnotationMode' | 'pendingFieldNote' |
  'fieldNotes' | 'jimuMapView' | 'sharedNotesMessage' | 'fieldNoteAttachments' | 'imageId' |
  'fieldNoteEditor' | 'fieldNotesListOpen'>;
type NotesSettings = Pick<IMConfig,
  'sharedFieldNotesEnabled' | 'sharedFieldNotesReadUrl' | 'sharedFieldNotesUrl' | 'fieldNoteCategories'>;
type PanelProps = React.ComponentProps<typeof FieldNotesPanel>;
type PanelActions = Pick<PanelProps, Extract<keyof PanelProps, `on${string}` | 'loadEnterpriseIdentityManager'>>;
type DetectionActions = Pick<React.ComponentProps<typeof DetectionNoteAction>, 'onChoose' | 'onCancel' | 'onClose'>;

interface FieldNotesOverlayProps {
  state: NotesState;
  settings: NotesSettings;
  panelActions: PanelActions;
  detectionActions: DetectionActions;
}

/** Compose the active detection prompt and the persistent notes panel. */
export function FieldNotesOverlay({ state, settings, panelActions, detectionActions }: FieldNotesOverlayProps) {
  const detection = state.viewerDetectionNote;
  const enterpriseEnabled = !!settings.sharedFieldNotesEnabled;
  const sharingEnabled = enterpriseEnabled && !!settings.sharedFieldNotesUrl;
  return (
    <React.Fragment>
      {state.detectionsActive && detection && (
        <DetectionNoteAction
          {...detectionActions}
          key={detection.imageId + ':' + detection.detectionId}
          selection={detection}
          enterpriseEnabled={sharingEnabled}
          hasTray={state.nearbyStripOpen}
          busy={state.detectionNoteCapturing}
          picking={state.detectionNotePicking}
          onLoadPreview={panelActions.onLoadDetectionPreview}
        />
      )}
      <FieldNotesPanel
        {...panelActions}
        detectionWorkspaceDraft={state.detectionWorkspaceDraft}
        isAnnotationMode={state.isAnnotationMode}
        pendingNote={state.pendingFieldNote}
        notes={state.fieldNotes}
        enterpriseEnabled={enterpriseEnabled}
        enterpriseContext={state.jimuMapView?.view}
        enterpriseLayerUrl={String(settings.sharedFieldNotesReadUrl || settings.sharedFieldNotesUrl || '')}
        enterpriseWriteUrl={String(settings.sharedFieldNotesUrl || '')}
        sharingEnabled={sharingEnabled}
        sharedMessage={enterpriseEnabled ? state.sharedNotesMessage : undefined}
        attachments={state.fieldNoteAttachments}
        currentImageAvailable={!!state.imageId}
        editor={state.fieldNoteEditor}
        listOpen={state.fieldNotesListOpen}
        categories={settings.fieldNoteCategories ? Array.from(settings.fieldNoteCategories) : undefined}
        currentImageId={state.imageId}
      />
    </React.Fragment>
  );
}
