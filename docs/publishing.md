# Review and publish Mapillary Explorer

A publisher is the person authorized to deploy the build and publish the Experience Builder app. Developers prepare source, reviewers verify it, and maintainers approve the version and release notes. One person may cover multiple roles. Follow your organization's approval process and the host's supported deployment workflow.

## 1. Prepare a candidate

Review a specific commit and record its widget, host, Node.js and package-manager versions. Coordinate with the maintainer on the manifest version, release notes, supported host versions and licensing. Include the full build output and runtime assets. Reviewers need build evidence, installation instructions and the pending or completed acceptance items. [Changelog](../CHANGELOG.md)

## 2. Validate before approving

1. Install and build in the target Developer Edition environment. Follow the [host guide](installation.md) and record the actual build result.
2. Run the [live acceptance matrix](development/exb-1.21-validation.md) against the candidate. Check 2D, 3D, narrow layouts, keyboard access and the services intended for the deployment.
3. Verify that browser-loaded assets and services are reachable via HTTPS. Test with ordinary viewer accounts. Keep server credentials out of widget configuration, artifacts and public reports.
4. Hold approval if the build fails, required flows are unverified, or a license, permission or data-handling question remains open. Record the reason and the check required for review again.

## 3. Deploy and smoke-test

Use Developer Edition's supported build and publication process. Deploy the complete widget assets alongside the app or at the configured widget asset location. Use the published URL to open imagery and check sprites, notes and Places where configured. Record the artifact and app version so a later report can identify what ran. [Sprite deployment checks](development/sprites.md)

## 4. Update or retire a deployment

Save the previous artifact and app configuration before switching versions. Test in a copy of the experience and follow the [5.0 migration guide](releases/5.0-migration.md). Retain the last working artifact until the published smoke test passes. If retiring a widget, tell affected users, remove the instance from the app, republish and verify navigation. Treat note retention, workspace migrations and server rollback as separate operator decisions.
