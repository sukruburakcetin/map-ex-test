#!/usr/bin/env node
'use strict';
/**
 * Coverage analysis reliability v6.21. Compatible current v6 sources.
 * --dry-run checks all targets; --uninstall restores exact previous bytes.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/runtime/widget.tsx block 1",
              "before": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { FullscreenControls } from \"../components/FullscreenControls\";\nimport { React, AllWidgetProps, jsx, SessionManager } from \"jimu-core\";\nimport { JimuMapViewComponent, JimuMapView, loadArcGISJSAPIModules, MapViewManager } from \"jimu-arcgis\";\nimport ReactDOM from \"react-dom\";\n",
              "after": "/** @jsx jsx */\n/** @jsxFrag React.Fragment */\nimport { fetchCoverageRoads } from \"../features/coverage/fetchCoverageRoads\";\nimport { FullscreenControls } from \"../components/FullscreenControls\";\nimport { React, AllWidgetProps, jsx, SessionManager } from \"jimu-core\";\nimport { JimuMapViewComponent, JimuMapView, loadArcGISJSAPIModules, MapViewManager } from \"jimu-arcgis\";\nimport ReactDOM from \"react-dom\";\n"
            },
            {
              "label": "src/runtime/widget.tsx block 2",
              "before": "  private _coverageRenderAbort: AbortController | null = null;\n  private _coverageRoadRetryAt = 0;\n  private _coverageAnalysisAbort: AbortController | null = null;\n  private _coverageAnalysisRevision = 0;\n  private cancelCoverageAnalysis = () => {\n    ++this._coverageAnalysisRevision;\n    this._coverageAnalysisAbort?.abort();\n    this._coverageAnalysisAbort = null;\n    this.setState({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });\n  };\n",
              "after": "  private _coverageRenderAbort: AbortController | null = null;\n  private _coverageRoadRetryAt = 0;\n  private _coverageAnalysisAbort: AbortController | null = null;\n  private _coverageAnalysisRevision = 0;\n  private _coverageAnalysisCurrent: (() => boolean) | null = null;\n  private cancelCoverageAnalysis = () => {\n    ++this._coverageAnalysisRevision;\n    this._coverageAnalysisCurrent = null;\n    this._coverageAnalysisAbort?.abort();\n    this._coverageAnalysisAbort = null;\n    this.setState({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });\n  };\n"
            },
            {
              "label": "src/runtime/widget.tsx block 3",
              "before": "\n  /** Fetches the OSM road network and analyzes coverage by snapping Turbo points to segments. */\n  private runCoverageAnalysis = async () => {\n    const { jimuMapView } = this.state;\n    if (!jimuMapView || !this.turboCoverageLayer) return;\n    if (Date.now() < this._coverageRoadRetryAt) {\n      this.showToast(`Road server is rate-limited. Try again in ${Math.ceil((this._coverageRoadRetryAt - Date.now()) / 1000)} seconds.`, 5000);\n      return;\n    }\n",
              "after": "\n  /** Fetches the OSM road network and analyzes coverage by snapping Turbo points to segments. */\n  private runCoverageAnalysis = async () => {\n    const { jimuMapView } = this.state;\n    if (this.state.coverageAnalysisLoading || this._coverageAnalysisAbort) return;\n    if (!jimuMapView || !this.turboCoverageLayer || this.state.turboLoading) {\n      this.showToast(\"Coverage is still loading. Try again when it is ready.\", 4000);\n      return;\n    }\n    if (Date.now() < this._coverageRoadRetryAt) {\n      this.showToast(`Road server is rate-limited. Try again in ${Math.ceil((this._coverageRoadRetryAt - Date.now()) / 1000)} seconds.`, 5000);\n      return;\n    }\n"
            },
            {
              "label": "src/runtime/widget.tsx block 4",
              "before": "    const revision = this._coverageAnalysisRevision;\n    const controller = new AbortController();\n    this._coverageAnalysisAbort = controller;\n    const signal = controller.signal;\n    const turboRevision = this._turboRequestCount;\n    const turboSignal = this._turboAbortController?.signal;\n    const abortFromCoverage = () => controller.abort();\n    turboSignal?.addEventListener(\"abort\", abortFromCoverage, { once: true });\n    const current = () => !signal.aborted && revision === this._coverageAnalysisRevision && turboRevision === this._turboRequestCount && this.state.jimuMapView?.view === jimuMapView.view;\n    const progress = (message: string) => { if (current()) this.setState({ coverageAnalysisProgress: message }); };\n    this.setState({ coverageAnalysisLoading: true, coverageAnalysisProgress: \"Fetching streets\u2026\" });\n    let stage: \"roads\" | \"imagery\" | \"classification\" = \"roads\";\n\n",
              "after": "    const revision = this._coverageAnalysisRevision;\n    const controller = new AbortController();\n    this._coverageAnalysisAbort = controller;\n    const signal = controller.signal;\n    const view = jimuMapView.view;\n    const filters = this.getTurboFilters();\n    const inputKey = () => JSON.stringify({ filters: this.getTurboFilters(), username: this.state.turboFilterUsername,\n      configuredUsername: this.props.config.turboCreator, token: this.accessToken });\n    const key = inputKey();\n    const extentKey = () => view.extent ? [view.extent.xmin, view.extent.ymin, view.extent.xmax, view.extent.ymax].join('/') : '';\n    const area = extentKey();\n    const current = () => !signal.aborted && revision === this._coverageAnalysisRevision && !view.destroyed &&\n      this.state.jimuMapView?.view === view && this.state.turboModeActive && key === inputKey() && area === extentKey();\n    this._coverageAnalysisCurrent = current;\n    const areaWatch = view.watch(\"extent\", () => {\n      if (!signal.aborted && !current()) {\n        this.cancelCoverageAnalysis();\n        this.showToast(\"Analysis stopped because the map area changed. Run it again for this area.\", 5000);\n      }\n    });\n    const progress = (message: string) => { if (current()) this.setState({ coverageAnalysisProgress: message }); };\n    this.setState({ coverageAnalysisLoading: true, coverageAnalysisProgress: \"Fetching streets\u2026\" });\n    let stage: \"roads\" | \"imagery\" | \"classification\" = \"roads\";\n\n"
            },
            {
              "label": "src/runtime/widget.tsx block 5",
              "before": "      const { xmin: west, ymin: south, xmax: east, ymax: north } = geo;\n\n      // 2. Fetch OSM Road Network (with Overpass retry mechanism)\n      const query = OVERPASS_ROAD_QUERY(south, west, north, east);\n      const fetchOverpass = async (): Promise<{ ok: boolean; status: number; data: any }> => {\n        const request = new AbortController();\n        const abort = () => request.abort();\n        signal.addEventListener(\"abort\", abort, { once: true });\n        const timer = setTimeout(() => request.abort(), 35000);\n        try {\n          if (signal.aborted) request.abort();\n          const response = await fetch(\"https://overpass-api.de/api/interpreter\", { method: \"POST\", body: query, signal: request.signal });\n          if (response.status === 429) {\n            const header = response.headers?.get(\"Retry-After\");\n            let delay = 60000;\n            if (header && /^\\d+$/.test(header.trim()) && Number.isFinite(Number(header))) delay = Math.max(1000, Number(header) * 1000);\n            else if (header && Number.isFinite(Date.parse(header)) && Date.parse(header) > Date.now()) delay = Date.parse(header) - Date.now();\n            this._coverageRoadRetryAt = Date.now() + delay;\n          }\n          return { ok: response.ok, status: response.status, data: response.ok ? await response.json() : null };\n        } finally { clearTimeout(timer); signal.removeEventListener(\"abort\", abort); }\n      };\n\n      let resp = await fetchOverpass();\n      if (!resp.ok && resp.status === 504) {\n        this.showToast(\"Road server timed out; retrying once in 3s\u2026\", 3000);\n        progress(\"Street server busy; retrying\u2026\");\n        await coverageAnalysisDelay(3000, signal);\n        progress(\"Fetching streets\u2026\");\n        resp = await fetchOverpass();\n      }\n\n      if (!resp.ok) {\n        if (resp.status === 504) throw new Error(\"Road network server is busy (504). Please try again in a moment.\");\n        if (resp.status === 429) throw new Error(`Road server is rate-limited (429). Try again in ${Math.ceil((this._coverageRoadRetryAt - Date.now()) / 1000)} seconds.`);\n        throw new Error(`Overpass API error: ${resp.status}`);\n      }\n\n      if (!current()) return;\n      const osmData = resp.data;\n      if (!osmData || osmData.remark || !Array.isArray(osmData.elements)) throw new Error(\"Road server returned incomplete data. Please retry later; previous results are preserved.\");\n      const segments = parseOverpassRoads(osmData);\n      if (!segments.length) {\n        this.showToast(\"No road network found in this area.\");\n",
              "after": "      const { xmin: west, ymin: south, xmax: east, ymax: north } = geo;\n\n      // 2. Fetch OSM Road Network (with Overpass retry mechanism)\n      const query = OVERPASS_ROAD_QUERY(south, west, north, east);\n      const osmData = await fetchCoverageRoads(query, signal, {\n        fetch: (url, options) => fetch(url, options), delay: coverageAnalysisDelay,\n        onRetry: () => progress(\"Road server busy; trying again\"),\n        onRateLimit: retryAt => { this._coverageRoadRetryAt = retryAt; },\n      });\n      if (!current()) return;\n      if (!osmData || osmData.remark || !Array.isArray(osmData.elements)) throw new Error(\"Road server returned incomplete data. Please retry later; previous results are preserved.\");\n      const segments = parseOverpassRoads(osmData);\n      if (!segments.length) {\n        this.showToast(\"No road network found in this area.\");\n"
            },
            {
              "label": "src/runtime/widget.tsx block 6",
              "before": "\n      // 5. Visit the original filtered tile points, not a sampled display layer.\n      let points: [number, number][] = [];\n      let pointTimestamps: (number | null)[] = [];\n      if (!turboSignal || turboSignal.aborted) throw new Error(\"Turbo coverage is not active.\");\n      await this.visitTurboCoverage([west, south, east, north], this.getTurboFilters(), signal, (point: TurboPoint) => {\n        points.push([point.lon, point.lat]);\n        pointTimestamps.push(point.capturedAt);\n        if (points.length % 25000 === 0) progress(`Loading imagery: ${points.length.toLocaleString()} points\u2026`);\n      });\n",
              "after": "\n      // 5. Visit the original filtered tile points, not a sampled display layer.\n      let points: [number, number][] = [];\n      let pointTimestamps: (number | null)[] = [];\n      await this.visitTurboCoverage([west, south, east, north], filters, signal, (point: TurboPoint) => {\n        points.push([point.lon, point.lat]);\n        pointTimestamps.push(point.capturedAt);\n        if (points.length % 25000 === 0) progress(`Loading imagery: ${points.length.toLocaleString()} points\u2026`);\n      });\n"
            },
            {
              "label": "src/runtime/widget.tsx block 7",
              "before": "            : \"Background analysis could not finish. Please retry.\"\n          : err instanceof Error ? err.message : \"Coverage analysis failed. Please retry.\";\n      this.showToast(message, 5000);\n    } finally {\n      turboSignal?.removeEventListener(\"abort\", abortFromCoverage);\n      if (revision === this._coverageAnalysisRevision) {\n        this._coverageAnalysisAbort = null;\n        this.setState({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });\n      }\n    }\n  };\n",
              "after": "            : \"Background analysis could not finish. Please retry.\"\n          : err instanceof Error ? err.message : \"Coverage analysis failed. Please retry.\";\n      this.showToast(message, 5000);\n    } finally {\n      areaWatch.remove();\n      if (revision === this._coverageAnalysisRevision) {\n        this._coverageAnalysisAbort = null;\n        this._coverageAnalysisCurrent = null;\n        this.setState({ coverageAnalysisLoading: false, coverageAnalysisProgress: undefined });\n      }\n    }\n  };\n"
            },
            {
              "label": "src/runtime/widget.tsx block 8",
              "before": "    this._nativeSequenceSelection.select(this.state.selectedSequenceId || this.state.sequenceId || null);\n  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (prevState.isLoading !== this.state.isLoading) this._backgroundRequests?.setPaused(!!this.state.isLoading || this._imageryOpeningRequest != null);\n    if (prevProps.config.debugMode !== this.props.config.debugMode || prevProps.state !== this.props.state) this.syncSequenceDiagnostics();\n    if (prevState.selectedSequenceId !== this.state.selectedSequenceId || prevState.sequenceId !== this.state.sequenceId ||\n        prevState.turboModeActive !== this.state.turboModeActive || prevState.isLoading !== this.state.isLoading) this.updateNativeSequenceSelection();\n",
              "after": "    this._nativeSequenceSelection.select(this.state.selectedSequenceId || this.state.sequenceId || null);\n  }\n\n  componentDidUpdate(prevProps: AllWidgetProps<any>, prevState: State) {\n    if (this._coverageAnalysisCurrent && !this._coverageAnalysisCurrent()) {\n      this.cancelCoverageAnalysis();\n      this.showToast(\"Analysis stopped because its map area or filters changed. Run it again to update the results.\", 5000);\n    }\n    if (prevState.isLoading !== this.state.isLoading) this._backgroundRequests?.setPaused(!!this.state.isLoading || this._imageryOpeningRequest != null);\n    if (prevProps.config.debugMode !== this.props.config.debugMode || prevProps.state !== this.props.state) this.syncSequenceDiagnostics();\n    if (prevState.selectedSequenceId !== this.state.selectedSequenceId || prevState.sequenceId !== this.state.sequenceId ||\n        prevState.turboModeActive !== this.state.turboModeActive || prevState.isLoading !== this.state.isLoading) this.updateNativeSequenceSelection();\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/CoverageAnalysisTrigger.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/coverage/CoverageAnalysisTrigger.tsx block 1",
              "before": "      <div\n        style={coverageAnalysisTriggerRowStyle}\n      >\n        <button\n          onClick={canRun ? onRunCoverageAnalysis : undefined}\n          title={tooltip}\n          style={getCoverageAnalysisTriggerButtonStyle(canRun, btnBg)}\n          onMouseEnter={(e) => {\n            if (canRun) e.currentTarget.style.background = coverageAnalysisTriggerHoverBackground;\n",
              "after": "      <div\n        style={coverageAnalysisTriggerRowStyle}\n      >\n        <button\n          type=\"button\" disabled={!canRun} aria-disabled={!canRun}\n          onClick={onRunCoverageAnalysis}\n          title={tooltip}\n          style={getCoverageAnalysisTriggerButtonStyle(canRun, btnBg)}\n          onMouseEnter={(e) => {\n            if (canRun) e.currentTarget.style.background = coverageAnalysisTriggerHoverBackground;\n"
            },
            {
              "label": "src/features/coverage/CoverageAnalysisTrigger.tsx block 2",
              "before": "              />\n              Analysing\u2026\n            </React.Fragment>\n          ) : (\n            <span>{belowZoom ? \"Zoom in to analyse\" : noPoints ? \"Analyse Not Ready\" : coverageResult ? \"Run New Analysis\" : \"Analyse Coverage\"}</span>\n          )}\n        </button>\n      </div>\n    </React.Fragment>\n  );\n};\n",
              "after": "              />\n              Analysing\u2026\n            </React.Fragment>\n          ) : (\n            <span>{belowZoom ? \"Zoom in to analyse\" : noPoints ? \"Waiting for coverage\" : coverageResult ? \"Run New Analysis\" : \"Analyse Coverage\"}</span>\n          )}\n        </button>\n      </div>\n      {!canRun && !coverageAnalysisLoading && <div role=\"status\" style={{ fontSize: 8, lineHeight: 1.35, color: \"#b5ccbf\", padding: \"3px 0\" }}>\n        {belowZoom ? \"Move closer to analyse these streets.\" : \"Waiting for coverage to finish loading.\"}\n      </div>}\n    </React.Fragment>\n  );\n};\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/coverage/fetchCoverageRoads.ts",
      "content": "/** Bounded road-server retries; callers own analysis cancellation and rate-limit state. */\nexport async function fetchCoverageRoads(query: string, signal: AbortSignal, options: {\n  fetch: typeof fetch;\n  delay: (ms: number, signal: AbortSignal) => Promise<void>;\n  onRetry: () => void;\n  onRateLimit: (retryAt: number) => void;\n}): Promise<any> {\n  for (let attempt = 0; attempt < 2; attempt++) {\n    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n    const request = new AbortController();\n    const abort = () => request.abort();\n    signal.addEventListener('abort', abort, { once: true });\n    const timer = setTimeout(abort, 35000);\n    let retry = false;\n    try {\n      const response = await options.fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query, signal: request.signal });\n      if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');\n      if (response.ok) return await response.json();\n      if (response.status === 429) {\n        const header = response.headers.get('Retry-After')?.trim();\n        let delay = 60000;\n        if (header && /^\\d+$/.test(header) && Number.isFinite(Number(header))) delay = Math.max(1000, Number(header) * 1000);\n        else if (header && Number.isFinite(Date.parse(header)) && Date.parse(header) > Date.now()) delay = Date.parse(header) - Date.now();\n        options.onRateLimit(Date.now() + delay);\n        throw new Error(`Road server is rate-limited (429). Try again in ${Math.ceil(delay / 1000)} seconds.`);\n      }\n      retry = attempt === 0 && [502, 503, 504].includes(response.status);\n      if (!retry) throw new Error([502, 503, 504].includes(response.status)\n        ? `Road server is temporarily unavailable (${response.status}). Please try again shortly.`\n        : `Road request failed (${response.status}). Please try again later.`);\n    } finally {\n      clearTimeout(timer);\n      signal.removeEventListener('abort', abort);\n    }\n    if (retry) {\n      options.onRetry();\n      await options.delay(3000, signal);\n    }\n  }\n  throw new Error('Road request could not finish.');\n}\n"
    },
    {
      "file": "tests/coverageAnalysisReliability.test.cjs",
      "content": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;const moduleRoads={exports:{}};new Function('module','exports',compile(fs.readFileSync(path.join(__dirname,'../src/features/coverage/fetchCoverageRoads.ts'),'utf8')))(moduleRoads,moduleRoads.exports);const{fetchCoverageRoads}=moduleRoads.exports;\nconst response=(status,data={elements:[]},retry)=>({status,ok:status===200,headers:{get:()=>retry},json:async()=>data});\nfunction options(statuses){const o={calls:[],waits:[],retries:0,limits:[],async fetch(url,request){o.calls.push(request);return statuses.shift();},async delay(ms,signal){assert(!signal.aborted);o.waits.push(ms);},onRetry(){o.retries++;},onRateLimit(at){o.limits.push(at);}};return o;}\nfor(const status of [502,503,504])test(`${status} gets one delayed retry and recovers`,async()=>{const o=options([response(status),response(200)]);assert.deepEqual(await fetchCoverageRoads('roads',new AbortController().signal,o),{elements:[]});assert.equal(o.calls.length,2);assert.deepEqual(o.waits,[3000]);assert.equal(o.retries,1);});\nfor(const status of [502,503,504])test(`${status} retry remains bounded on repeated failure`,async()=>{const o=options([response(status),response(status)]);await assert.rejects(fetchCoverageRoads('roads',new AbortController().signal,o),new RegExp(String(status)));assert.equal(o.calls.length,2);});\ntest('429 respects Retry-After and never automatically retries',async()=>{const now=Date.now(),o=options([response(429,null,'7')]);await assert.rejects(fetchCoverageRoads('q',new AbortController().signal,o),/429/);assert.equal(o.calls.length,1);assert.equal(o.limits.length,1);assert(o.limits[0]>=now+7000);assert.deepEqual(o.waits,[]);});\ntest('nontransient HTTP errors do not retry',async()=>{const o=options([response(400)]);await assert.rejects(fetchCoverageRoads('q',new AbortController().signal,o),/400/);assert.equal(o.calls.length,1);});\ntest('cancellation during retry delay prevents the second HTTP request',async()=>{const c=new AbortController(),o=options([response(502),response(200)]);o.delay=async()=>{c.abort();};await assert.rejects(fetchCoverageRoads('q',c.signal,o),{name:'AbortError'});assert.equal(o.calls.length,1);});\ntest('cancellation aborts the active HTTP request',async()=>{const c=new AbortController(),o=options([]);o.fetch=async(url,request)=>new Promise((resolve,reject)=>{request.signal.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')));c.abort();});await assert.rejects(fetchCoverageRoads('q',c.signal,o),{name:'AbortError'});});\ntest('pre-aborted sessions make no HTTP requests',async()=>{const c=new AbortController();c.abort();const o=options([]);await assert.rejects(fetchCoverageRoads('q',c.signal,o),{name:'AbortError'});assert.equal(o.calls.length,0);});\nconst src=fs.readFileSync(path.join(__dirname,'../src/runtime/widget.tsx'),'utf8'),sf=ts.createSourceFile('widget.tsx',src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),widget=sf.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text==='Widget');const member=name=>widget.members.find(m=>m.name?.getText(sf)===name);const methods=['runCoverageAnalysis','cancelCoverageAnalysis'].map(name=>member(name).getText(sf)).join('\\n')+'\\ncheckInputs(){'+member('componentDidUpdate').body.statements[0].getText(sf)+'}';\nfunction deferred(){let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};}\nfunction fixture(){const gate=deferred();let roadCalls=0;const Runtime=new Function('fetchCoverageRoads','coverageAnalysisDelay','webMercatorUtils','OVERPASS_ROAD_QUERY','parseOverpassRoads','insetBbox','segmentMidpointInBbox','STREET_COVERAGE_CONFIG','classifyCoverageAsync',compile('class Runtime{'+methods+'}\\nreturn Runtime;'))(async()=>{roadCalls++;return gate.promise;},async()=>{}, {webMercatorToGeographic:e=>e},()=> 'query',()=>[{id:1}],b=>b,()=>true,{},async()=>({segmentTiers:['fresh']}));const w=new Runtime(),watchers=[];const view={ready:true,destroyed:false,extent:{xmin:0,ymin:0,xmax:1,ymax:1},watch(property,callback){const watch={callback,removed:false,remove(){this.removed=true;}};watchers.push(watch);return watch;}};Object.assign(w,{state:{jimuMapView:{view},turboModeActive:true,turboFilterUsername:'',coverageAnalysisLoading:false},props:{config:{}},turboCoverageLayer:{},_coverageRoadRetryAt:0,_coverageAnalysisRevision:0,_turboRequestCount:1,_turboAbortController:new AbortController(),accessToken:'test',filters:{},toasts:[],visits:0,setState(o){Object.assign(this.state,o);},showToast(s){this.toasts.push(s);},getTurboFilters(){return this.filters;},log(){},stopCoverageRendering(){},drawCoverageZone(){},async visitTurboCoverage(box,filters,signal,visit){assert(!signal.aborted);this.visits++;visit({lon:0,lat:0,capturedAt:null});}});return{w,view,gate,watchers,get roadCalls(){return roadCalls;}};}\ntest('ordinary coverage reloads do not cancel a pending road analysis',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis();f.w._turboAbortController.abort();f.w._turboRequestCount++;f.w.checkInputs();assert.equal(f.w._coverageAnalysisAbort.signal.aborted,false);f.gate.resolve({elements:[]});await task;assert.equal(f.w.visits,1);assert.equal(f.w.state.coverageResult.segmentTiers[0],'fresh');assert(f.watchers[0].removed);});\ntest('area changes cancel obsolete analysis and explain why',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis(),signal=f.w._coverageAnalysisAbort.signal;f.view.extent={...f.view.extent,xmin:0.1};f.watchers[0].callback();assert(signal.aborted);assert(f.w.toasts.some(s=>s.includes('map area changed')));f.gate.resolve({elements:[]});await task;assert.equal(f.w.visits,0);assert(f.watchers[0].removed);});\ntest('filter changes cancel the input snapshot and preserve previous results',async()=>{const f=fixture();f.w.state.coverageResult={old:true};const task=f.w.runCoverageAnalysis(),signal=f.w._coverageAnalysisAbort.signal;f.w.filters={isPano:true};f.w.checkInputs();assert(signal.aborted);f.gate.resolve({elements:[]});await task;assert.deepEqual(f.w.state.coverageResult,{old:true});assert.equal(f.w.visits,0);});\ntest('explicit cancellation cannot commit results',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis();f.w.cancelCoverageAnalysis();f.gate.resolve({elements:[]});await task;assert.equal(f.w.visits,0);assert.equal(f.w.state.coverageAnalysisLoading,false);});\ntest('unready coverage gives actionable feedback without starting analysis',async()=>{const f=fixture();f.w.state.turboLoading=true;await f.w.runCoverageAnalysis();assert.equal(f.roadCalls,0);assert(f.w.toasts[0].includes('still loading'));});\ntest('rapid repeated activation does not restart an active analysis',async()=>{const f=fixture(),task=f.w.runCoverageAnalysis();await f.w.runCoverageAnalysis();assert.equal(f.roadCalls,1);f.gate.resolve({elements:[]});await task;});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'coverage-analysis-reliability-v6-21-';

function conflict(label) {
  throw new Error('Conflict in ' + label + '. No source files changed. Preserve local edits.');
}

/** Resolve a payload path and reject symbolic links, including parent folders. */
function targetFor(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes(':') || relative.includes('\0')) throw new Error('Invalid patch path.');
  const parts = relative.split('/');
  if (parts.some(part => !part || part === '.' || part === '..')) throw new Error('Invalid patch path.');
  const target = path.resolve(root, ...parts);
  const relation = path.relative(root, target);
  if (!relation || relation.startsWith('..' + path.sep) || path.isAbsolute(relation)) throw new Error('Patch path escapes the widget folder.');
  let parent = root;
  for (let index = 0; index < parts.length; index++) {
    parent = path.join(parent, parts[index]);
    let stat;
    try { stat = fs.lstatSync(parent); } catch (error) { if (error.code === 'ENOENT') break; throw error; }
    if (stat.isSymbolicLink()) throw new Error('Symbolic links are not supported: ' + relative + '. No source files changed.');
    if (index < parts.length - 1 && !stat.isDirectory()) throw new Error('Parent path is not a folder: ' + relative);
    if (index === parts.length - 1 && !stat.isFile() && !stat.isDirectory()) throw new Error('Unsupported target type: ' + relative);
  }
  return target;
}

function readTarget(relative, required = false) {
  const file = targetFor(relative);
  let descriptor;
  try {
    descriptor = fs.openSync(file, fs.constants.O_RDONLY | noFollow);
    const stat = fs.fstatSync(descriptor);
    if (!stat.isFile()) throw new Error('Target is not a regular file: ' + relative);
    const bytes = fs.readFileSync(descriptor);
    return { file, bytes, mode: stat.mode, dev: stat.dev, ino: stat.ino };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    if (required) throw new Error('Required file missing: ' + relative + '. No source files changed.');
    return { file, bytes: null };
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function formatLike(text, original) {
  const raw = original.toString('utf8');
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  return Buffer.from(bom + (raw.includes('\r\n') ? text.replace(/\n/g, '\r\n') : text));
}

/** Apply or reverse one exact insertion, preserving all text outside its anchors. */
function transformBlock(text, block, reverse) {
  const before = normalize(block.before), after = normalize(block.after);
  if (!before || !after || before === after) throw new Error('Invalid block: ' + block.label);
  const expected = reverse ? after : before;
  const replacement = reverse ? before : after;
  if (block.wholeFile) {
    if (text === replacement) return text;
    if (text !== expected) conflict(block.label);
    return replacement;
  }
  // Prefer the longest state when an insertion contains its original anchor.
  if (reverse) {
    const installedCount = count(text, after);
    if (installedCount === 1) return text.replace(after, () => before);
    if (installedCount > 1) conflict(block.label);
    if (count(text, before) === 1) {
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited patch)');
      return text;
    }
    conflict(block.label);
  }
  const installedCount = count(text, after);
  if (installedCount === 1) return text;
  if (installedCount > 1) conflict(block.label);
  if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (existing declaration)');
  if (count(text, before) !== 1) conflict(block.label);
  return text.replace(before, () => after);
}

function ensureParents(relative) {
  const segments = relative.split('/');
  segments.pop();
  let current = '';
  for (const segment of segments) {
    current = current ? current + '/' + segment : segment;
    const directory = targetFor(current);
    try { fs.mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
    const stat = fs.lstatSync(directory);
    if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe parent directory: ' + current);
  }
}

function assertUnchanged(item) {
  const latest = readTarget(item.relative);
  if (item.original === null ? latest.bytes !== null : latest.bytes === null || !latest.bytes.equals(item.original)) {
    throw new Error('File changed during validation: ' + item.relative + '. No source files changed.');
  }
}

function writeExact(descriptor, bytes) {
  let offset = 0;
  while (offset < bytes.length) {
    const written = fs.writeSync(descriptor, bytes, offset, bytes.length - offset, offset);
    if (!written) throw new Error('File write made no progress.');
    offset += written;
  }
}

/** Existing files are opened without truncation, then checked through that handle. */
function overwriteOriginal(item, bytes) {
  targetFor(item.relative);
  const descriptor = fs.openSync(item.file, fs.constants.O_RDWR | noFollow);
  try {
    const stat = fs.fstatSync(descriptor);
    const linked = fs.lstatSync(item.file);
    if (!stat.isFile() || linked.isSymbolicLink() || stat.dev !== linked.dev || stat.ino !== linked.ino || !fs.readFileSync(descriptor).equals(item.original)) throw new Error('File changed before write: ' + item.relative);
    item.started = true;
    fs.ftruncateSync(descriptor, 0);
    writeExact(descriptor, bytes);
    fs.fsyncSync(descriptor);
  } finally { fs.closeSync(descriptor); }
}

function rollback(items) {
  const errors = [];
  for (const item of [...items].reverse()) {
    if (!item.started) continue;
    try {
      targetFor(item.relative);
      if (item.original === null) {
        // Remove only the exclusively-created file owned by this installer.
        const stat = fs.lstatSync(item.file);
        if (stat.dev !== item.createdDev || stat.ino !== item.createdIno) throw new Error('Created file replaced by another process.');
        fs.unlinkSync(item.file);
      } else if (item.content === null) {
        const descriptor = fs.openSync(item.file, 'wx', item.mode & 0o777);
        try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      } else {
        const descriptor = fs.openSync(item.file, fs.constants.O_WRONLY | noFollow);
        try { fs.ftruncateSync(descriptor, 0); writeExact(descriptor, item.original); } finally { fs.closeSync(descriptor); }
      }
    } catch (error) { errors.push(item.relative + ': ' + error.message); }
  }
  return errors;
}


function transformEntry(text, entry) {
  const results = new Set();
  for (const variant of entry.variants) {
    try {
      let next = text;
      for (const block of variant.blocks) next = transformBlock(next, block, false);
      results.add(next);
    } catch (error) {
      if (!error.message.startsWith('Conflict in ')) throw error;
    }
  }
  if (results.size !== 1) conflict(entry.file + (results.size ? ' (ambiguous baseline)' : ' (unsupported or edited source)'));
  return [...results][0];
}

function uninstallWrites() {
  const backupRoot = targetFor('.refactor-backups');
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.21 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'coverage-analysis-reliability-v6-21' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.21 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.21 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.21 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-coverage-analysis-reliability-v6-21.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      const current = readTarget(entry.file, entry.content === undefined);
      if (entry.content !== undefined) {
        if (current.bytes === null) {
          writes.push({ ...current, relative: entry.file, original: null, content: Buffer.from(entry.content) });
        } else {
          const text = normalize(current.bytes.toString('utf8'));
          if (text !== normalize(entry.content)) {
            if (!entry.variants) conflict(entry.file + ' (existing helper/test differs)');
            const next = transformEntry(text, entry);
            if (next !== normalize(entry.content)) conflict(entry.file + ' (unexpected helper result)');
            writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
          }
        }
        continue;
      }
      const text = normalize(current.bytes.toString('utf8')), next = transformEntry(text, entry);
      if (next !== text) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(next, current.bytes) });
    }
  }
  if (!writes.length) {
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Coverage analysis reliability v6.21 is already installed. No files changed.');
    process.exit(0);
  }
  for (const item of writes) assertUnchanged(item);
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'restore' : 'update') + ':\n' + writes.map(item => '  ' + item.relative).join('\n'));
    process.exit(0);
  }
  const backupRelative = '.refactor-backups/' + prefix + (uninstall ? 'uninstall-' : '') + Date.now() + '-' + process.pid;
  ensureParents(backupRelative + '/changes.json');
  const backup = targetFor(backupRelative);
  for (const item of writes) {
    if (item.original === null) continue;
    const relative = backupRelative + '/' + item.relative;
    ensureParents(relative);
    const descriptor = fs.openSync(targetFor(relative), 'wx');
    try { fs.writeFileSync(descriptor, item.original); } finally { fs.closeSync(descriptor); }
  }
  const manifest = { installer: 'coverage-analysis-reliability-v6-21', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
  const manifestPath = targetFor(backupRelative + '/changes.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative); fs.unlinkSync(item.file); item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
    manifest.completed = true;
    // Write completion through the existing guarded regular file, not a followed link.
    const metadata = readTarget(backupRelative + '/changes.json', true);
    overwriteOriginal({ ...metadata, relative: backupRelative + '/changes.json', original: metadata.bytes }, Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention. Backup: ' + backupRelative + '\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original files restored. Backup: ' + backupRelative);
  }
  console.log('Coverage analysis reliability v6.21 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
