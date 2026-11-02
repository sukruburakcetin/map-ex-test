/** @jsx jsx */
import { React, jsx } from 'jimu-core';

/** Isolate optional chunk/render failures so Local/Enterprise notes remain usable.
 * Request/auth errors belong to the workspace panel; this boundary has no service
 * access or error reporting endpoint. Reloading the widget resets the boundary.
 */
export class WorkspaceBoundary extends React.Component<{ children?: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } { return { failed: true }; }
  render(): React.ReactNode { return this.state.failed ? this.props.fallback : this.props.children; }
}
