# Point-cloud keyboard routing

`PointCloudKeyboard` checks cloud readiness and typing targets before routing key presses. Movement goes through `PointCloudCalibration`, which still accumulates offsets on keydown and schedules the existing debounce on keyup. The widget supplies the map and viewer effects for ground and color modes, plus localized feedback. Keyboard listeners remain with the widget lifecycle.

From the stage 111 widget root, run `node apply-point-cloud-keyboard-refactor.cjs --dry-run` and then `node apply-point-cloud-keyboard-refactor.cjs`. Run the same installer with `--uninstall` for exact rollback. Keep the backup directory. In Experience Builder, verify movement and key release, ground and color toggles, and typing into a text field with a cloud visible.
