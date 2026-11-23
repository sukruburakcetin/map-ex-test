interface PointCloudKeyboardHost {
  ready(): boolean;
  calibration: {
    keyDown(key: string, shift: boolean): boolean;
    keyUp(key: string): void;
  };
  toggleGround(): void;
  toggleColor(): void;
  showOffset(): void;
}

/** Routes shortcuts while leaving calibration math and rendering with their owners. */
export class PointCloudKeyboard {
  constructor(private readonly host: PointCloudKeyboardHost) {}

  private accepts(event: KeyboardEvent): boolean {
    return this.host.ready() &&
      !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement);
  }

  keyDown(event: KeyboardEvent): void {
    if (!this.accepts(event)) return;

    const handled = this.host.calibration.keyDown(event.key, event.shiftKey);
    switch (event.key.toLowerCase()) {
      case "x":
        this.host.toggleGround();
        event.preventDefault();
        return;
      case "c":
        this.host.toggleColor();
        event.preventDefault();
        return;
    }
    if (handled) {
      event.preventDefault();
      this.host.showOffset();
    }
  }

  keyUp(event: KeyboardEvent): void {
    if (this.accepts(event)) this.host.calibration.keyUp(event.key);
  }
}
