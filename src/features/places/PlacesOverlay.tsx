/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { PlacesPanel } from '../../components/PlacesPanel';
import { SelectedPlaceCard, type SelectedPlaceProps } from '../../components/SelectedPlaceCard';
import type { PlaceListOrigin } from './placeListUtils';
import type { PlacesVectorLayer } from './PlacesVectorLayer';

interface PlacesOverlayProps {
  panelOpen: boolean;
  selection?: SelectedPlaceProps;
  panel: Omit<React.ComponentProps<typeof PlacesPanel>, 'origin' | 'selection' | 'tileQuality' | 'tileFamily'>;
  tileLayer: Pick<PlacesVectorLayer, 'quality' | 'supportsFamilyFilter'> | null;
  tileFamily: string;
  getLocalOrigin(): PlaceListOrigin | null;
}

/** Choose the full Places panel or the compact card and bind source-specific controls. */
export function PlacesOverlay({ panelOpen, selection, panel, tileLayer, tileFamily, getLocalOrigin }: PlacesOverlayProps) {
  if (!panelOpen) return selection ? <SelectedPlaceCard {...selection} /> : null;

  const supportsFilters = tileLayer?.supportsFamilyFilter;
  return (
    <PlacesPanel
      {...panel}
      selection={selection}
      origin={tileLayer ? panel.status.resultOrigin || null : getLocalOrigin()}
      onAreaSearch={tileLayer ? panel.onAreaSearch : undefined}
      tileQuality={tileLayer?.quality}
      onTileQuality={supportsFilters ? panel.onTileQuality : undefined}
      tileFamily={supportsFilters ? tileFamily : 'all'}
      onTileFamily={supportsFilters ? panel.onTileFamily : undefined}
    />
  );
}
