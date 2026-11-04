/** Note graphic descriptors only; FieldNoteMap owns layer coordination; runtime supplies SDK factories. */
import type { FieldNote } from '../../components/types';

/**
 * Build a source/category-colored diamond, WGS84 point and structured note popup.
 * Preserve altitude on the descriptor; hasZ is enabled only for 3D views with altitude.
 * This helper does not allocate SDK objects, access layers or decide whether a shared copy is visible.
 */
export function buildLocalNoteGraphic(note: FieldNote, is3D: boolean): __esri.GraphicProperties {
  const color = note.workspace?.color || (note.source === "manual" ? [245, 166, 35, 1] : [53, 175, 109, 1]);

  const symbol = {
    type: "simple-marker",
    style: "diamond",
    color,
    size: 13,
    outline: { color: "white", width: 1.5 },
  };

  return {
    geometry: {
      type: "point",
      longitude: note.lon,
      latitude: note.lat,
      z: note.alt,
      hasZ: is3D && note.alt !== undefined,
      spatialReference: { wkid: 4326 },
    },
    symbol: symbol as any,
    attributes: {
      id:note.id, category:note.category, note:note.note,
      status:({open:'Open',in_progress:'In progress',completed:'Completed',dismissed:'Dismissed'} as Record<string,string>)[note.status||'open']||note.status,
      resolution:note.resolutionNote||'', workspace:note.workspace?.name||'',
      author:note.workspace?.authorId||'', updated:note.workspace?.updatedAt||'',
      legacy_assessment:note.workspace?.legacyRisk||''
    },
    // Structured fields avoid placing user-authored descriptions in HTML strings.
    popupTemplate: {
      title: '{category}',
      content: [{type:'fields',fieldInfos:[
        {fieldName:'category',label:'Category'}, {fieldName:'status',label:'Status'},
        {fieldName:'note',label:'Description'}, {fieldName:'resolution',label:'Resolution'},
        ...(note.workspace?[
          {fieldName:'workspace',label:'Workspace'}, {fieldName:'author',label:'Contributor ID'},
          {fieldName:'updated',label:'Last updated'},
          ...(note.workspace.legacyRisk?[{fieldName:'legacy_assessment',label:'Legacy risk assessment'}]:[])
        ]:[])
      ]}]
    }
  };
}
