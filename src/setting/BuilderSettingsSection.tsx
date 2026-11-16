/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { Switch } from 'jimu-ui';
interface Props {
  title: string; defaultOpen?: boolean; children?: React.ReactNode;
  toggleLabel?: string; enabled?: boolean; onToggle?(enabled: boolean): void;
  onExpandedChange?(expanded: boolean): void;
}
/** Builder-only disclosure: keep mounted fields/drafts intact, and never write
 * configuration merely because an author opens or closes a section.
 * The optional switch is a sibling of the disclosure button, not nested in it.
 */
export const BuilderSettingsSection: React.FC<Props> = ({ title, defaultOpen = false, children, toggleLabel, enabled, onToggle, onExpandedChange }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  const bodyId = React.useId();
  return <section className="mly-settings-section">
    <div className="mly-settings-section-header">
      <h3><button type="button" className="mly-settings-section-toggle mly-text-action" aria-expanded={open} aria-controls={bodyId} onClick={() => { const next = !open; setOpen(next); onExpandedChange?.(next); }}>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" style={{flexShrink:0,transform:open?'rotate(90deg)':undefined}}><path d="m4 2 4 4-4 4"/></svg>
        <span>{title}</span>
      </button></h3>
      {onToggle && toggleLabel && <div className="mly-settings-section-enable"><span>{toggleLabel}</span><Switch aria-label={toggleLabel} checked={enabled === true} onChange={event => { const next = event.target.checked; if (next) { setOpen(true); onExpandedChange?.(true); } onToggle(next); }}/></div>}
    </div>
    <div id={bodyId} className="mly-settings-section-body" hidden={!open}>{children}</div>
  </section>;
};
export const builderSettingsSectionsCss = `
.mly-settings-section { border-top:1px solid #ffffff24; min-width:0; box-sizing:border-box; }
.mly-settings-section-header { display:flex; flex-wrap:wrap; align-items:center; gap:6px 8px; padding:8px; min-width:0; box-sizing:border-box; }
.mly-settings-section-header h3 { flex:1 1 140px; min-width:0; margin:0; font:inherit; }
.mly-settings-section-toggle.mly-text-action { display:flex; align-items:center; gap:7px; width:100%; border:0; border-radius:4px; padding:4px 2px; color:inherit; background:transparent; text-align:start; font:inherit; font-size:14px; font-weight:600; cursor:pointer; }
.mly-settings-section-toggle:focus-visible { outline:2px solid currentColor; outline-offset:1px; }
.mly-settings-section-enable { display:flex; flex:1 1 calc(100% - 16px); justify-content:space-between; align-items:center; gap:12px; min-width:0; max-width:100%; margin:0 8px; font-size:11px; box-sizing:border-box; }
.mly-settings-section-enable > span { overflow-wrap:anywhere; }
.mly-settings-section-enable > :last-child { flex-shrink:0; }
.mly-settings-section-body { padding:0 16px 14px; min-width:0; box-sizing:border-box; overflow-wrap:anywhere; }
.mly-settings-section-body :is(input,select,textarea) { max-inline-size:100%; box-sizing:border-box; }
.mly-settings-section-body[hidden] { display:none !important; }
`;
