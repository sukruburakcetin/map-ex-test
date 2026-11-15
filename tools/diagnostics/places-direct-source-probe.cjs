/** Bounded development probe, not a Places provider or an operational Explorer integration.
 * Node 18+: node tools/diagnostics/places-direct-source-probe.cjs
 * Browser: paste this file in the widget frame, then await mlyPlacesSourceProbe.run().
 * Only catalog JSON and the 127-byte PMTiles header are read. No map is changed.
 */
(function () {
  'use strict';
  const ROOT = 'https://stac.overturemaps.org/catalog.json';
  const HOSTS = new Set(['stac.overturemaps.org', 'overturemaps-extras-us-west-2.s3.us-west-2.amazonaws.com', 'overturemaps-extras-us-west-2.s3.amazonaws.com']);
  function address(value, base) {
    const url = new URL(value, base);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !HOSTS.has(url.hostname) || url.port) throw Error('Unexpected catalog/data URL');
    return url.href;
  }
  async function run({ release, fetcher = globalThis.fetch, timeoutMs = 8000 } = {}) {
    if (release !== undefined && !/^\d{4}-\d{2}-\d{2}\.\d+$/.test(release)) throw Error('Use a pinned release identifier');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(15000, Math.max(1, timeoutMs)));
    let requests = 0, bytes = 0;
    async function read(url, range) {
      if (++requests > 4) throw Error('Probe request budget exceeded');
      const response = await fetcher(address(url), { signal: controller.signal, credentials: 'omit', mode: 'cors', ...(range ? { headers: { Range: 'bytes=0-126' } } : {}) });
      const cap = range ? 127 : 256 * 1024;
      if (!response.ok || range && response.status !== 206 || Number(response.headers.get('content-length')) > cap) {
        await response.body?.cancel();
        throw Error(range ? 'Range request was not a bounded HTTP 206 response' : 'Catalog request failed or exceeded budget');
      }
      const reader = response.body?.getReader();
      if (!reader) throw Error('Streaming response unavailable');
      const chunks = []; let length = 0;
      try {
        while (true) {
          const part = await reader.read(); if (part.done) break;
          length += part.value.length; bytes += part.value.length;
          if (length > cap || bytes > 800 * 1024) throw Error('Probe response exceeded its byte budget');
          chunks.push(part.value);
        }
      } catch (error) { await reader.cancel(); throw error; }
      finally { reader.releaseLock(); }
      const result = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
      return { data: result, headers: response.headers };
    }
    async function catalog(url) { return JSON.parse(new TextDecoder().decode((await read(url)).data)); }
    try {
      const root = await catalog(ROOT);
      const children = (root.links || []).filter(link => link.rel === 'child');
      const selected = release ? children.find(link => new URL(link.href, ROOT).pathname.split('/').includes(release)) : children.find(link => link.latest === true);
      if (!selected) throw Error('Requested/latest release was not found in the catalog');
      const releaseUrl = address(selected.href, ROOT), version = await catalog(releaseUrl);
      const theme = (version.links || []).find(link => link.rel === 'child' && (/(^|\W)places(\W|$)/i.test(link.title || '') || /(?:^|[/=])places(?:[/=.]|$)/.test(new URL(link.href, releaseUrl).pathname)));
      if (!theme) throw Error('Places theme was not found');
      const themeUrl = address(theme.href, releaseUrl), places = await catalog(themeUrl);
      const archive = (places.links || []).find(link => link.rel === 'pmtiles');
      if (!archive) throw Error('Places PMTiles link was not advertised');
      const result = await read(address(archive.href, themeUrl), true), header = result.data;
      if (header.length !== 127 || new TextDecoder().decode(header.slice(0, 7)) !== 'PMTiles' || header[7] !== 3) throw Error('Expected a complete PMTiles v3 header');
      return {
        release: version.id || release || root.latest,
        environment: typeof window === 'undefined' ? 'node' : 'browser',
        browserCorsVerified: typeof window !== 'undefined' && fetcher === globalThis.fetch,
        rangeSupported: true, archiveVersion: header[7], tileType: header[99] === 1 ? 'MVT' : 'other', minZoom: header[100], maxZoom: header[101],
        contentRangeExposed: result.headers.get('content-range') !== null,
        etagExposed: result.headers.get('etag') !== null,
        requests, bytesRead: bytes,
        operationalProviderApproved: false,
        rendererIntegrationVerified: false,
        completeSearchAndFiltersVerified: false,
        note: 'Inspection evidence only. Explorer terms exclude operational use of its endpoints. No widget source was activated.'
      };
    } finally { clearTimeout(timer); controller.abort(); }
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { run };
    if (require.main === module) run().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error('Places source probe: ' + error.message); process.exitCode = 1; });
  } else globalThis.mlyPlacesSourceProbe = { run };
})();
