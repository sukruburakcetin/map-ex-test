/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import * as Icons from '../../components/Icons';
import { navigationFeedbackStyle } from '../../styles/navigationFeedback';

export type HeadingSyncMessageKey = 'appMapRotationSyncedToCamera' | 'appMapRotationUnlocked';

/** Build the existing center-map feedback; translate after creating the icon, as before. */
export function mapCenteredFeedback(message: () => string): React.ReactNode {
  return <span style={navigationFeedbackStyle()}>
          <Icons.Crosshair size={14} />  {message()} </span>;
}

/** Build the existing heading-lock feedback with the original icon/translation branch. */
export function headingSyncFeedback(synced: boolean, translate: (key: HeadingSyncMessageKey) => string): React.ReactNode {
  return <span style={navigationFeedbackStyle()}>
        {synced ? (
          <>
            <Icons.CompassLocked size={14} />  {translate('appMapRotationSyncedToCamera')} </>
        ) : (
          <>
            <Icons.CompassUnlocked size={14} />  {translate('appMapRotationUnlocked')} </>
        )}
      </span>;
}
