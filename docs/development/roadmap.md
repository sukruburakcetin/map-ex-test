# Development roadmap

## Places service: persistent storage implemented

The regional service now imports a snapshot atomically into a versioned SQLite database, opens it read-only, inspects persisted metadata, serves HTTPS from one JSON config and exposes health. Restart does not rebuild the spatial index. Updates/rollback select dated database files through a deliberate stop/config-change/restart. The widget API and UI stay unchanged; no PostGIS is required.

Next: validate process-supervisor/reverse-proxy deployment on the actual target host and measure representative regional workloads before changing the 100,000-record import scope or claiming broader capacity. Keep the administrator guide and release inventory current. Zero-downtime publication, private authentication and national-scale delivery are separate projects.

## Verification and delivery

Maintain a reproducible Experience Builder 1.20 build/smoke environment. Run focused portable tests and localization checks, then exercise view replacement, rapid interaction, 2D/3D and mobile with actual service/Mapillary access. Document the tested host/dependency matrix before adding standalone CI assumptions.

## Ownership refactoring

Continue extracting runtime orchestration in small, behavior-preserving changes. Preserve image-first opening, request generations, foreground priority, selection identity, cache bounds and explicit field-note publication. Current owners are in [architecture](architecture.md). Earlier completed extraction notes remain in [history](../history/implementation-notes.md) as evidence, not a current task list.
