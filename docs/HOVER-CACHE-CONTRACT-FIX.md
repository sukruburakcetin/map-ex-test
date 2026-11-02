# Hover metadata cache contract fix

The v6.120 warm-preview check called `TurboMetadataCache.has`, but the production cache implements `get`, `set`, `size` and `clear`. A truthy preview image ID therefore triggered a synchronous TypeError before preview scheduling, including cold individual-point hovers. The pointer callback caught that error and removed the new hover feedback. A user trace at 2D zoom 16.2 contains ten successful point picks followed by ten updateTurboHover TypeErrors, with no metadata entries or visible preview.

Use the existing TTL-aware `get` contract to check availability. This also rejects expired entries instead of bypassing cache expiry. Accurate nearby-image bearings, cold dwell, cancellation, image IDs, click behavior, selected sequence overview and rendering remain unchanged.

The runtime test now instantiates the production cache class instead of Map. With those realistic fixtures the previous implementation fails 12 of 16 cases with `this._turboMetadataCache.has is not a function`; the fix passes all 16. Tests include 2D and 3D zooms 16.2/19.9, cold points, immediate warm revisits, partial cards, expired entries, regional bearings, stale-response cancellation and active-route hints.

Apply from the widget root: `node apply-hover-cache-contract-fix.cjs`. Rebuild and reload Experience Builder. The installer does not run tests or a build. `--dry-run` checks targets without source writes; `--uninstall` reverses only unchanged installed blocks. A standalone uninstaller is also provided. This narrowly fixes the reproduced crash; it does not claim to eliminate all cold network latency or validate live SDK terrain projection.
