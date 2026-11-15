/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { getWorkspaceCategoryBadgeStyle } from '../../styles/communityWorkspace';

/** A category remains recognizable by its label as well as its assigned color. */
export function WorkspaceCategoryBadge({name,color}:{name:string;color:string}) {
  return <span style={getWorkspaceCategoryBadgeStyle(color)}><span aria-hidden="true" style={{width:9,height:9,background:color,border:'1px solid #d8e8df',borderRadius:2,flexShrink:0}} />{name}</span>;
}
