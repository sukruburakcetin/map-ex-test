# Global Places exploration: source investigation

Status: development investigation, reviewed 2026-11-10. No new provider is activated in the widget. The existing regional service remains functional.

## Findings verified from official source

Overture publishes public GeoParquet datasets **and PMTiles archives**. The official Explorer reads PMTiles directly from S3 in the browser through MapLibre's PMTiles protocol. Its STAC catalog provides release/theme links. This confirms that viewport-only global map browsing can work without a viewer running Python or downloading a whole country.

The Explorer also has a separate browser GeoParquet path: a spatial file manifest identifies intersecting files, and GeoArrow WASM reads a requested bbox. This powers its download tool. It is evidence of direct-browser bbox access, not proof that our widget's full search/picking/rendering is already implemented that way.

An important difference: Explorer's visible Search modes are locality, country and GERS ID. They are not equivalent to our full-area POI text search with closest-first batches.

### Endpoint availability is not production approval

Explorer's source states:

> Explorer is not a mapping service and is not intended for navigation, routing, or operational use of any kind.

It also explicitly describes the tile endpoints as unstable production infrastructure intended for inspection of the dataset. Therefore, do not silently configure those demonstration endpoints as the default provider for users' regional operational work.

This does not make the underlying Overture source data unusable. Its published datasets and applicable attribution/licenses must be evaluated separately from the Explorer website/endpoints. A permitted production tile provider or an organization-owned static copy is a different deployment.

## Compatibility with the current widget

| Current capability | Direct hosted tiles alone |
|---|---|
| Stream map data for any viewport | Technically demonstrated by Explorer; requires an appropriate source for operational use. |
| Native ArcGIS vector rendering | Not proved. Explorer uses MapLibre; ArcGIS VectorTileLayer does not accept a `pmtiles://` protocol registration as a drop-in URL. |
| Hover and picking | Possible with retained IDs/attributes and a supported renderer/query bridge; requires implementation and host testing. |
| Place details, imagery and notes | Existing UI can be reused after normalization; source fields/release identity must be verified. |
| Confidence/category filters | Can use tile properties when present, but tile/search/pick predicates must remain consistent. |
| Hide permanently closed | Not established. Explorer's checked tile-field metadata does not advertise operating_status; absence of metadata is not proof of actual payload absence. Inspect a pinned archive/source before claiming support. |
| Complete bbox text search and closest-first paging | Not supplied by merely querying visible/rendered symbols. Needs complete records for the working area. |
| Filtered counts / no silent omissions | Not established. Lower-zoom generalization, collision visibility and source completeness must be distinguished. |

Explorer's checked schema advertises source layer `place`, ID `id`, nested/stringified names/categories/addresses/websites and confidence, with Places max zoom 15. Our current API uses normalized attributes and different tile names/scale semantics. Field mapping, overscaling and actual dense-area completeness need explicit tests; changing the URL alone cannot preserve all capabilities.

## Recommended next implementation checkpoint

The user's requested experience is **go anywhere, zoom in, load a manageable working bbox, and interact**. That does not require downloading a whole country into the browser or asking each viewer to operate a backend.

Investigate these paths in order, keeping the existing feature requirements:

1. **Browser-only bbox prototype against public source data.** Use a Web Worker and a spatially pruned GeoParquet reader (the Explorer uses GeoArrow WASM; DuckDB-Wasm is another candidate). Load a limited working area at a suitable zoom. Prove download bytes, cancellation, memory, completeness and all required fields on a phone. Public hosting of Overture's raw data still exists, but this path need not require our own query server.
2. **Prove the native rendering bridge independently.** Generate/read MVT in the browser and determine whether a supported ArcGIS source/request extension can deliver those bytes to native VectorTileLayer in the target SDK. Test 2D and 3D. Do not substitute per-POI Graphics or introduce an unsynchronized second map renderer to claim success. If a supported bridge is unavailable, a small XYZ tile gateway/provider remains necessary for native rendering.
3. **Wire one complete working-area model to existing interactions.** GERS identity, release, hover, overlap choices, confidence/closed/category filters, text search, ranking, paging, imagery and notes must use the same complete record set. A budget failure should ask for a smaller area, not silently claim complete results.
4. **Evaluate a production hosted provider or static archive deployment where it reduces complexity.** Keep operational permission, CORS/range support, update policy, source completeness, cost and availability separate. Fused and Wherobots are official documented data-access partners, but the reviewed documentation does not establish a ready-made anonymous tile/search API meeting our widget contract.

A user should never see DuckDB/SQLite/file-partition settings. Administrator setup, if a provider or gateway is required, remains separate. Do not add multiple public source modes until the first complete path is demonstrated.

## Development probe

`tools/diagnostics/places-direct-source-probe.cjs` inspects official catalog links and a **127-byte PMTiles header**, with four requests maximum, per-response and total byte caps, credential-free HTTPS and cancellation. It does not download an archive, change the map, install a provider, read bbox records or prove production suitability.

Node 18+:

```sh
node tools/diagnostics/places-direct-source-probe.cjs
```

For a browser-origin check, paste the script into the running widget frame's DevTools console, then run:

```js
await mlyPlacesSourceProbe.run()
// Optional pinned release:
await mlyPlacesSourceProbe.run({release: '2026-10-21.0'})
```

This is a developer inspection step, not viewer setup. Node results explicitly do not claim browser CORS verification. The probe never marks renderer integration, complete search/filters or operational provider approval as verified. A failed network probe is not evidence that the source has no data.

The execution environment can read the public GitHub sources but cannot currently verify the official web/S3 endpoints through its network proxy. Actual archive responses, latency and application-origin CORS remain unverified here. Fixture tests establish the probe's byte/request limits and refusal of ignored Range responses, not live service behavior.

## Source references

- [Official catalog/data-access documentation](https://github.com/OvertureMaps/docs/blob/efe0eac5f88db92ffdfd1b21768c46185f92e3be/docs/getting-data/cloud-sources.mdx)
- [Official PMTiles distribution documentation](https://github.com/OvertureMaps/docs/blob/efe0eac5f88db92ffdfd1b21768c46185f92e3be/docs/examples/overture-tiles.mdx)
- [Explorer architecture and search documentation](https://github.com/OvertureMaps/docs/blob/efe0eac5f88db92ffdfd1b21768c46185f92e3be/docs/getting-data/explore.mdx)
- [Explorer terms](https://github.com/OvertureMaps/explore-site/blob/7a21aec4f18dcd1944151d6085688abbb92c27f9/components/nav/TermsOfUse.jsx)
- [Explorer STAC resolution](https://github.com/OvertureMaps/explore-site/blob/7a21aec4f18dcd1944151d6085688abbb92c27f9/lib/stacService.js)
- [Explorer browser bbox reader](https://github.com/OvertureMaps/explore-site/blob/7a21aec4f18dcd1944151d6085688abbb92c27f9/components/nav/DownloadButton.jsx)
- [Explorer download file selection](https://github.com/OvertureMaps/explore-site/blob/7a21aec4f18dcd1944151d6085688abbb92c27f9/lib/DownloadCatalog.js)

Official sources were read at the pinned commits above. No production provider, deployment, payment or service migration was performed.
