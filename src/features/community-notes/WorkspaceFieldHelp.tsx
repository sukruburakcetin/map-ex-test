/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { useWidgetLocale } from "../../i18n/WidgetLocale";
import { workspaceFieldStyle } from "../../styles/communityWorkspace";

/** Keep the help button separate from the field label so it never toggles the field. */
export function WorkspaceFieldHelp({ label, help, children }: {
  label: string;
  help: string;
  children: React.ReactNode;
}) {
  const { owned } = useWidgetLocale();
  const [open, setOpen] = React.useState(false);
  const id = React.useId();
  return <div className="mly-workspace-field-help">
    <label style={workspaceFieldStyle}>
      <span className="mly-workspace-field-label">{label}</span>
      {children}
    </label>
    <button type="button" className="mly-text-action mly-workspace-help-toggle"
      aria-label={owned("Help for {value0}", { value0: label })} aria-controls={id} aria-expanded={open}
      onClick={() => setOpen(value => !value)}><span aria-hidden="true">?</span></button>
    <div id={id} className="mly-workspace-help-body" hidden={!open}>{help}</div>
  </div>;
}
