#!/usr/bin/env node
'use strict';
/** Closed mesh cone installer. Plain source payload.
 * Validates all targets before writes. Preserves existing source bytes in local
 * backups, rejects links/conflicts, and rolls back its writes on failure.
 * --skip-tests is accepted for compatibility. Regression files are included; no tests run here.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const skipTests = args.includes('--skip-tests') || args.includes('--skip-test');
const uninstall = args.includes('--uninstall');
const payload = {
  "entries": [
    {
      "file": "src/runtime/widget.tsx",
      "blocks": [
        {
          "label": "src/runtime/widget.tsx closed mesh 1",
          "before": "    if (this.ArcGISModules?.VectorTileLayer) return;\n    if (!this._arcGISModulesReady) {\n      this._arcGISModulesReady = (async () => {\n      const [Graphic, Point, SimpleMarkerSymbol, VectorTileLayer, FeatureLayer, GraphicsLayer, route, networkService, RouteParameters, FeatureSet, Multipoint, PointSymbol3D] = await loadArcGISJSAPIModules([\n        \"esri/Graphic\",\n        \"esri/geometry/Point\",\n        \"esri/symbols/SimpleMarkerSymbol\",\n",
          "after": "    if (this.ArcGISModules?.VectorTileLayer) return;\n    if (!this._arcGISModulesReady) {\n      this._arcGISModulesReady = (async () => {\n      const [Graphic, Point, SimpleMarkerSymbol, VectorTileLayer, FeatureLayer, GraphicsLayer, route, networkService, RouteParameters, FeatureSet, Multipoint, PointSymbol3D, Mesh] = await loadArcGISJSAPIModules([\n        \"esri/Graphic\",\n        \"esri/geometry/Point\",\n        \"esri/symbols/SimpleMarkerSymbol\",\n"
        },
        {
          "label": "src/runtime/widget.tsx closed mesh 2",
          "before": "        \"esri/rest/support/FeatureSet\",\n        \"esri/geometry/Multipoint\",\n        \"esri/symbols/PointSymbol3D\",\n      ]);\n      this.ArcGISModules = {\n        Graphic,\n",
          "after": "        \"esri/rest/support/FeatureSet\",\n        \"esri/geometry/Multipoint\",\n        \"esri/symbols/PointSymbol3D\",\n        \"esri/geometry/Mesh\",\n      ]);\n      this.ArcGISModules = {\n        Graphic,\n"
        },
        {
          "label": "src/runtime/widget.tsx closed mesh 3",
          "before": "        FeatureSet,\n        Multipoint,\n        PointSymbol3D,\n      };\n      this.log(\"ArcGIS API modules loaded\");\n      })();\n",
          "after": "        FeatureSet,\n        Multipoint,\n        PointSymbol3D,\n        Mesh,\n      };\n      this.log(\"ArcGIS API modules loaded\");\n      })();\n"
        },
        {
          "label": "src/runtime/widget.tsx closed mesh 4",
          "before": "    const layer = this.ensureConeLayer();\n    if (!layer) return null;\n    const graphic = this.ensureCameraConeOwner().render(view, layer, center, anchor.lat,\n      heading, displayRadius, spreadDeg, view.type === \"3d\", properties => new this.ArcGISModules.Graphic(properties));\n\n    // Keep selection above the cone without removing/readding animated graphics.\n    if (this._selectionPulse?.layer && this._selectionPulse?.view === view) view.map.reorder(this._selectionPulse?.layer, view.map.layers.length - 1);\n",
          "after": "    const layer = this.ensureConeLayer();\n    if (!layer) return null;\n    const graphic = this.ensureCameraConeOwner().render(view, layer, center, anchor.lat,\n      heading, displayRadius, spreadDeg, view.type === \"3d\", properties => new this.ArcGISModules.Graphic(properties),\n      properties => new this.ArcGISModules.Mesh(properties));\n\n    // Keep selection above the cone without removing/readding animated graphics.\n    if (this._selectionPulse?.layer && this._selectionPulse?.view === view) view.map.reorder(this._selectionPulse?.layer, view.map.layers.length - 1);\n"
        }
      ],
      "absentAfterUninstall": [
        "\"esri/geometry/Mesh\""
      ],
      "requiredOccurrences": [
        {
          "text": "\"esri/geometry/Mesh\"",
          "count": 1
        }
      ]
    },
    {
      "file": "src/features/map-graphics/CameraConeGraphics.ts",
      "blocks": [
        {
          "label": "src/features/map-graphics/CameraConeGraphics.ts closed mesh 1",
          "before": "/** Camera-cone layer, terrain-relative geometry, symbols and reusable graphic membership. */\nexport interface ConeGraphic { geometry: any; }\nexport interface ConeLayer<G> {\n",
          "after": "import { coneMeshGeometry } from \"./coneMeshGeometry\";\n\n/** Camera-cone layer, terrain-relative geometry, symbols and reusable graphic membership. */\nexport interface ConeGraphic { geometry: any; }\nexport interface ConeLayer<G> {\n"
        },
        {
          "label": "src/features/map-graphics/CameraConeGraphics.ts closed mesh 2",
          "before": "   */\n  render(view: V, layer: L, center: { x: number; y: number }, latitude: number,\n    heading: number, radiusMeters: number, spreadDeg: number, scene: boolean,\n    createGraphic: (properties: any) => G): G {\n    // One clockwise sector in projected coordinates avoids overlapping ground/top surfaces.\n    const radius = radiusMeters / Math.max(0.01, Math.cos(latitude * Math.PI / 180));\n    const z = scene ? 0.08 : 0;\n",
          "after": "   */\n  render(view: V, layer: L, center: { x: number; y: number }, latitude: number,\n    heading: number, radiusMeters: number, spreadDeg: number, scene: boolean,\n    createGraphic: (properties: any) => G, createMesh: (properties: any) => any = properties => properties): G {\n    // One clockwise sector in projected coordinates avoids overlapping ground/top surfaces.\n    const radius = radiusMeters / Math.max(0.01, Math.cos(latitude * Math.PI / 180));\n    const z = scene ? 0.08 : 0;\n"
        },
        {
          "label": "src/features/map-graphics/CameraConeGraphics.ts closed mesh 3",
          "before": "      ring.push([center.x + radius * Math.sin(angle), center.y + radius * Math.cos(angle), z + height]);\n    }\n    ring.push([...ring[0]]);\n    const geometry = { type: \"polygon\", rings: [ring], hasZ: true, spatialReference: { wkid: 3857 } } as any;\n    let graphic = this.graphic;\n    if (graphic && layer.graphics.includes(graphic)) graphic.geometry = geometry;\n",
          "after": "      ring.push([center.x + radius * Math.sin(angle), center.y + radius * Math.cos(angle), z + height]);\n    }\n    ring.push([...ring[0]]);\n    if (scene) return this.renderMesh(view, layer, center, heading, radiusMeters, spreadDeg, ring, createGraphic, createMesh);\n    const geometry = { type: \"polygon\", rings: [ring], hasZ: true, spatialReference: { wkid: 3857 } } as any;\n    let graphic = this.graphic;\n    if (graphic && layer.graphics.includes(graphic)) graphic.geometry = geometry;\n"
        },
        {
          "label": "src/features/map-graphics/CameraConeGraphics.ts closed mesh 4",
          "before": "      } : { type: \"simple-fill\", color: [255, 165, 0, 0.28], outline: { color: [255, 140, 0, 0.95], width: 1.5 } } });\n      (graphic as any).__isCone = true; layer.add(graphic!); this.graphic = graphic;\n    }\n    if (scene) {\n      const tip = ring[0], left = ring[1], right = ring[ring.length - 2];\n      const leftGround = [left[0], left[1], z], rightGround = [right[0], right[1], z];\n      const sides = [[tip, leftGround, left, tip], [tip, right, rightGround, tip]];\n      // Close the curved end with a translucent skirt. Only the top face has\n      // an outline: side joins and the lower perimeter have no edge strokes.\n      const arc = ring.slice(1, -1);\n      const skirt = [...arc, ...arc.slice().reverse().map(p => [p[0], p[1], z]), [...arc[0]]];\n      const geometries = [...sides, skirt].map(side => ({ type: \"polygon\", rings: [side], hasZ: true, spatialReference: { wkid: 3857 } }));\n      for (let i = 0; i < geometries.length; i++) {\n        if (this.parts[i]) this.parts[i].geometry = geometries[i] as any;\n        else {\n          const part = createGraphic({ geometry: geometries[i], symbol: {\n            type: \"polygon-3d\", symbolLayers: [{ type: \"fill\", castShadows: false,\n              material: { color: [220, 120, 0, 0.2] } }],\n          } });\n          (part as any).__isCone = true; layer.add(part); this.parts.push(part);\n        }\n      }\n    }\n    return graphic!;\n  }\n\n  /** Clear cone membership and tagged legacy view graphics without destroying the reusable layer. */\n",
          "after": "      } : { type: \"simple-fill\", color: [255, 165, 0, 0.28], outline: { color: [255, 140, 0, 0.95], width: 1.5 } } });\n      (graphic as any).__isCone = true; layer.add(graphic!); this.graphic = graphic;\n    }\n    return graphic!;\n  }\n\n  /** One closed mesh owns all shared vertices; a separate line draws only the top perimeter.\n   * SDK Mesh construction is injected by the runtime. Reassign geometry on retained\n   * graphics so rendering observes heading/radius updates without allocating layers.\n   */\n  private renderMesh(view: V, layer: L, center: { x: number; y: number }, heading: number,\n    radius: number, spread: number, ring: number[][], createGraphic: (properties: any) => G,\n    createMesh: (properties: any) => any): G {\n    const geometry = createMesh(coneMeshGeometry(center, heading, radius, spread));\n    let graphic = this.graphic;\n    if (graphic && layer.graphics.includes(graphic) && graphic.geometry?.type === \"mesh\") graphic.geometry = geometry;\n    else {\n      this.clear(view);\n      graphic = createGraphic({ geometry, symbol: { type: \"mesh-3d\",\n        symbolLayers: [{ type: \"fill\", castShadows: false }] } });\n      (graphic as any).__isCone = true; layer.add(graphic); this.graphic = graphic;\n    }\n    const outline = { type: \"polyline\", paths: [ring], hasZ: true, spatialReference: { wkid: 3857 } };\n    if (this.parts[0]) this.parts[0].geometry = outline;\n    else {\n      const part = createGraphic({ geometry: outline, symbol: { type: \"line-3d\",\n        symbolLayers: [{ type: \"line\", size: 1.5, material: { color: [255, 140, 0, 0.95] } }] } });\n      (part as any).__isCone = true; layer.add(part); this.parts.push(part);\n    }\n    return graphic;\n  }\n\n  /** Clear cone membership and tagged legacy view graphics without destroying the reusable layer. */\n"
        }
      ],
      "absentAfterUninstall": [
        "private renderMesh("
      ],
      "requiredOccurrences": [
        {
          "text": "private renderMesh(",
          "count": 1
        }
      ]
    },
    {
      "file": "docs/REFACTORING-ROADMAP.md",
      "blocks": [
        {
          "label": "docs/REFACTORING-ROADMAP.md closed mesh 1",
          "before": "## Shallow solid cone experiment\n\nBased on the restored multi-face cone, keep the translucent sloped top and its orange silhouette. Side faces and a curved end skirt use a subtly darker fill without outlines; omit the lower perimeter line. The curved skirt closes the end while top/side graphics are reused during playback. Grounded pulse, current projected size, height and 2D appearance are unchanged. A standalone uninstaller restores the previous outlined sides and lower perimeter.\n",
          "after": "## Shallow solid cone experiment\n\nBased on the restored multi-face cone, keep the translucent sloped top and its orange silhouette. Side faces and a curved end skirt use a subtly darker fill without outlines; omit the lower perimeter line. The curved skirt closes the end while top/side graphics are reused during playback. Grounded pulse, current projected size, height and 2D appearance are unchanged. A standalone uninstaller restores the previous outlined sides and lower perimeter.\n\n## Closed mesh cone\n\nReplace separately triangulated 3D polygons with one explicitly indexed, closed mesh: shared apex/upper arc/lower arc, outward-wound top, walls and bottom. Use local metre vertex space anchored to the existing relative-to-ground layer. A retained line graphic draws only the top perimeter. Mesh component materials preserve translucent top/darker sides; transparency blending can still show overlaps and needs host validation. The runtime loads the SDK Mesh constructor with its existing module bundle. 2D geometry, projected sizing, grounded pulse and follow policies are unchanged. Standalone uninstaller restores the previous polygon-face implementation.\n"
        }
      ],
      "absentAfterUninstall": [
        "## Closed mesh cone"
      ],
      "requiredOccurrences": [
        {
          "text": "## Closed mesh cone",
          "count": 1
        }
      ]
    },
    {
      "file": "tests/shallowSolidCone.test.cjs",
      "blocks": [
        {
          "label": "tests/shallowSolidCone.test.cjs closed mesh 1",
          "before": "const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),m={exports:{}};new Function('module','exports',ts.transpileModule(fs.readFileSync(path.join(__dirname,'../src/features/map-graphics/CameraConeGraphics.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports);\nfunction setup(){const items=[],layers=[],legacy=[],view={map:{findLayerById:()=>null,layers:{includes:l=>layers.includes(l)},add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},graphics:{forEach:f=>legacy.slice().forEach(f),remove:g=>legacy.splice(legacy.indexOf(g),1)}};let allocations=0;const owner=new m.exports.CameraConeGraphics(p=>({...p,graphics:{includes:g=>items.includes(g)},add:g=>items.push(g),removeAll:()=>items.splice(0),destroy(){this.destroyed=true}}));const layer=owner.ensure(view);return{items,owner,view,layer,legacy,draw:(scene=true,h=0)=>owner.render(view,layer,{x:100,y:200},0,h,60,60,scene,p=>(allocations++,{...p})),allocations:()=>allocations}}\ntest('solid wedge has one outlined top and three softly filled walls without lower lines',()=>{const x=setup(),top=x.draw();assert.equal(x.items.length,4);assert.equal(x.owner.parts.length,3);assert(top.symbol.symbolLayers[0].outline);for(const g of x.owner.parts){assert.equal(g.geometry.type,'polygon');assert.equal(g.symbol.type,'polygon-3d');assert.equal(g.symbol.symbolLayers[0].outline,undefined);assert.deepEqual(g.symbol.symbolLayers[0].material.color,[220,120,0,.2])}});\ntest('curved end skirt is closed and spans its ground and upper arc',()=>{const x=setup();x.draw();const ring=x.owner.parts[2].geometry.rings[0];assert.deepEqual(ring[0],ring.at(-1));assert(ring.some(p=>p[2]===.08));assert(ring.some(p=>p[2]>.08))});\ntest('heading changes reuse all four graphics without accumulating faces',()=>{const x=setup(),top=x.draw(),parts=x.owner.parts.slice();for(let h=1;h<180;h++)assert.equal(x.draw(true,h),top);assert.deepEqual(x.owner.parts,parts);assert.equal(x.allocations(),4);assert.equal(x.items.length,4)});\ntest('apex remains grounded and all surfaces retain the shallow rise',()=>{const x=setup(),top=x.draw();assert.deepEqual(top.geometry.rings[0][0],[100,200,0]);for(const g of x.items)assert(g.geometry.rings[0].every(p=>p[2]>=0&&p[2]<=1.58))});\ntest('2D remains a single flat sector with its original fill and outline',()=>{const x=setup(),g=x.draw(false);assert.equal(x.items.length,1);assert.equal(x.owner.parts.length,0);assert.equal(g.symbol.type,'simple-fill');assert.equal(g.symbol.outline.width,1.5);assert(g.geometry.rings[0].every(p=>p[2]===0))});\ntest('clear releases all walls and removes legacy cone graphics',()=>{const x=setup();x.draw();const keep={};x.legacy.push({__isCone:true},keep);x.owner.clear(x.view);assert.equal(x.items.length,0);assert.deepEqual(x.owner.parts,[]);assert.equal(x.owner.graphic,null);assert.deepEqual(x.legacy,[keep]);x.draw();assert.equal(x.items.length,4);x.owner.dispose(x.view);assert.equal(x.layer.destroyed,true)});\n",
          "after": "/** The closed mesh supersedes the separate shallow polygon faces; retain this entry point. */\nrequire('./closedMeshCone.test.cjs');\n"
        }
      ],
      "absentAfterUninstall": [
        "require('./closedMeshCone.test.cjs')"
      ],
      "requiredOccurrences": [
        {
          "text": "require('./closedMeshCone.test.cjs')",
          "count": 1
        }
      ]
    }
  ],
  "modules": [
    {
      "file": "src/features/map-graphics/coneMeshGeometry.ts",
      "content": "/** Closed, outward-wound wedge in local east/north/up metres. The shared apex,\n * upper arc and lower arc give each mesh edge exactly two incident triangles.\n * Local vertex space anchors the whole solid to the layer's ground placement;\n * faces cannot drift apart through independent polygon triangulation/draping.\n */\nexport function coneMeshGeometry(center: { x: number; y: number }, heading: number, radius: number, spread: number) {\n const segments = Math.max(8, Math.ceil(spread / 2));\n const position: number[] = [0, 0, 0];\n const rise = Math.min(radius * 0.15, 1.5);\n for (let i = 0; i <= segments; i++) {\n  const degrees = heading - spread / 2 + spread * i / segments;\n  const angle = degrees * Math.PI / 180;\n  position.push(radius * Math.sin(angle), radius * Math.cos(angle), 0.08 + rise * Math.cos((degrees - heading) * Math.PI / 180));\n }\n for (let i = 0; i <= segments; i++) position.push(position[3 * (i + 1)], position[3 * (i + 1) + 1], 0);\n const upper = (i: number) => i + 1;\n const lower = (i: number) => segments + 2 + i;\n const top: number[] = [], walls: number[] = [], bottom: number[] = [];\n for (let i = 0; i < segments; i++) {\n  const a = upper(i), b = upper(i + 1), c = lower(i), d = lower(i + 1);\n  top.push(0, b, a);\n  bottom.push(0, c, d);\n  walls.push(a, b, c, b, d, c);\n }\n walls.push(0, upper(0), lower(0), 0, lower(segments), upper(segments));\n const material = (color: number[]) => ({ color, alphaMode: 'blend' as const, doubleSided: false });\n return { type: 'mesh' as const, spatialReference: { wkid: 3857 },\n  vertexSpace: { type: 'local' as const, origin: [center.x, center.y, 0] },\n  vertexAttributes: { position }, components: [\n   { faces: top, shading: 'flat' as const, material: material([255, 165, 0, 0.25]) },\n   { faces: walls, shading: 'flat' as const, material: material([220, 120, 0, 0.2]) },\n   { faces: bottom, shading: 'flat' as const, material: material([220, 120, 0, 0.2]) },\n  ] };\n}\n"
    },
    {
      "file": "tests/closedMeshCone.test.cjs",
      "content": "/** Topology, runtime ownership and cardinal-direction regression checks for the actual builders. */\nconst fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict'),ts=require(process.env.MAPILLARY_TYPESCRIPT||'typescript'),root=path.resolve(__dirname,'..');\nconst compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;\nfunction moduleAt(rel){const m={exports:{}};new Function('require','module','exports',compile(fs.readFileSync(path.join(root,rel),'utf8')))(id=>moduleAt(path.posix.join(path.posix.dirname(rel),id+'.ts')),m,m.exports);return m.exports}\nconst {coneMeshGeometry:build}=moduleAt('src/features/map-graphics/coneMeshGeometry.ts'),{CameraConeGraphics}=moduleAt('src/features/map-graphics/CameraConeGraphics.ts');\nfor(const heading of [0,90,180,270,359])test('closed, outward-wound nondegenerate triangles at heading '+heading,()=>{const m=build({x:10,y:20},heading,60,60),p=m.vertexAttributes.position,edges=new Map();let volume=0;const point=i=>p.slice(i*3,i*3+3);for(const component of m.components){const f=component.faces;for(let i=0;i<f.length;i+=3){const ids=f.slice(i,i+3);assert(ids.every(n=>Number.isInteger(n)&&n>=0&&n<p.length/3));const [a,b,c]=ids.map(point),u=b.map((v,j)=>v-a[j]),v=c.map((v,j)=>v-a[j]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];assert(Math.hypot(...n)>1e-8);volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;for(let j=0;j<3;j++){const a=ids[j],b=ids[(j+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');const e=edges.get(key)||[];e.push([a,b]);edges.set(key,e)}}}for(const uses of edges.values()){assert.equal(uses.length,2);assert.deepEqual(uses[0],uses[1].slice().reverse())}assert(volume>0);assert.equal(m.vertexSpace.type,'local');assert.deepEqual(m.vertexSpace.origin,[10,20,0]);assert.deepEqual(p.slice(0,3),[0,0,0])});\nfunction setup(){const items=[],view={map:{findLayerById:()=>null,layers:{includes:()=>true},add(){},remove(){}},graphics:{forEach(){},remove(){}}};let graphics=0,meshes=0;const owner=new CameraConeGraphics(p=>({...p,graphics:{includes:g=>items.includes(g)},add:g=>items.push(g),removeAll:()=>items.splice(0),destroy(){}}));const layer=owner.ensure(view);return{owner,items,view,draw:(scene=true,h=0)=>owner.render(view,layer,{x:100,y:200},0,h,60,60,scene,p=>(graphics++,p),p=>(meshes++,p)),counts:()=>({graphics,meshes})}}\ntest('3D retains one closed mesh and one top-only outline while turning',()=>{const x=setup(),g=x.draw(),line=x.owner.parts[0];assert.equal(g.symbol.type,'mesh-3d');assert.equal(g.geometry.type,'mesh');assert.equal(line.geometry.type,'polyline');for(let h=1;h<=90;h++)assert.equal(x.draw(true,h),g);assert.equal(x.owner.parts[0],line);assert.equal(x.items.length,2);assert.equal(x.counts().graphics,2);assert.equal(x.owner.parts.length,1)});\ntest('2D remains one flat sector and does not create a mesh',()=>{const x=setup(),g=x.draw(false);assert.equal(g.symbol.type,'simple-fill');assert.equal(g.geometry.type,'polygon');assert(g.geometry.rings[0].every(p=>p[2]===0));assert.equal(x.counts().meshes,0);assert.equal(x.items.length,1)});\ntest('cleanup removes both retained graphics',()=>{const x=setup();x.draw();x.owner.clear(x.view);assert.equal(x.items.length,0);assert.equal(x.owner.graphic,null);assert.deepEqual(x.owner.parts,[])});\ntest('materials preserve translucent depth without internal edge strokes',()=>{const m=build({x:0,y:0},0,60,60);assert.equal(m.components.length,3);assert.deepEqual(m.components[0].material.color,[255,165,0,.25]);assert.deepEqual(m.components[1].material.color,[220,120,0,.2]);assert(m.components.every(c=>c.material.doubleSided===false&&c.material.alphaMode==='blend'))});\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'closed-mesh-cone-';

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
      if (block.declarations && block.declarations.some(name => text.includes(name))) conflict(block.label + ' (partially edited organization filter)');
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

try {
  const allowed = ['--dry-run', '--skip-tests', '--skip-test', '--uninstall'];
  if (args.some(arg => !allowed.includes(arg))) throw new Error('Usage: node apply-closed-mesh-cone.cjs [--dry-run] [--skip-tests] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  const writes = [], seen = new Set();
  for (const entry of payload.entries) {
    if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
    seen.add(entry.file);
    if (skipTests && entry.test) continue;
    const current = readTarget(entry.file, true);
    let text = normalize(current.bytes.toString('utf8'));
    const blocks = uninstall ? [...entry.blocks].reverse() : entry.blocks;
    for (const block of blocks) text = transformBlock(text, block, uninstall);
    if (uninstall && entry.absentAfterUninstall && entry.absentAfterUninstall.some(marker => text.includes(marker))) {
      conflict(entry.file + ' (edited native selection references remain)');
    }
    if (!uninstall && entry.requiredOccurrences && entry.requiredOccurrences.some(rule => count(text, rule.text) !== rule.count)) {
      conflict(entry.file + ' (organization filter references differ)');
    }
    if (text !== normalize(current.bytes.toString('utf8'))) writes.push({ ...current, relative: entry.file, original: current.bytes, content: formatLike(text, current.bytes) });
  }
  for (const module of payload.modules) {
    if (seen.has(module.file)) throw new Error('Duplicate patch path: ' + module.file);
    seen.add(module.file);
    if (skipTests && module.test) continue;
    const current = readTarget(module.file);
    if (current.bytes !== null) {
      if (normalize(current.bytes.toString('utf8')) !== normalize(module.content)) conflict(module.file + ' (existing module)');
      if (uninstall) writes.push({ ...current, relative: module.file, original: current.bytes, content: null });
    } else if (!uninstall) {
      writes.push({ ...current, relative: module.file, original: null, content: Buffer.from(module.content) });
    }
  }
  console.log('Existing tests are preserved. This installer does not run tests.');
  if (!writes.length) {
    console.log(uninstall ? 'Closed mesh cone is already uninstalled. No files changed.' : 'Closed mesh cone is already installed. No files changed.');
    process.exit(0);
  }
  if (dry) {
    console.log('Dry run passed. Would ' + (uninstall ? 'uninstall' : 'install') + ':\n' + writes.map(item => '  ' + (item.content === null ? 'remove ' : item.original === null ? 'create ' : 'update ') + item.relative).join('\n'));
    process.exit(0);
  }
  // Complete every source guard before creating a backup or changing source files.
  for (const item of writes) assertUnchanged(item);
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
  const manifest = writes.map(item => ({ file: item.relative, operation: item.content === null ? 'remove' : item.original === null ? 'create' : 'update', originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) }));
  fs.writeFileSync(path.join(backup, 'changes.json'), JSON.stringify({ installer: 'closed-mesh-cone', uninstall, changes: manifest }, null, 2) + '\n', { flag: 'wx' });
  for (const item of writes) assertUnchanged(item);
  try {
    for (const item of writes) {
      assertUnchanged(item);
      if (item.content === null) {
        targetFor(item.relative);
        fs.unlinkSync(item.file);
        item.started = true;
      } else if (item.original === null) {
        ensureParents(item.relative);
        const descriptor = fs.openSync(targetFor(item.relative), 'wx');
        const stat = fs.fstatSync(descriptor);
        item.createdDev = stat.dev; item.createdIno = stat.ino; item.started = true;
        try { fs.writeFileSync(descriptor, item.content); } finally { fs.closeSync(descriptor); }
      } else overwriteOriginal(item, item.content);
    }
  } catch (error) {
    const errors = rollback(writes);
    if (errors.length) throw new Error(error.message + '\nRollback needs attention; original bytes are in ' + backupRelative + ':\n' + errors.join('\n'));
    throw new Error(error.message + '\nInstaller writes rolled back. Original source files restored. Backup: ' + backupRelative);
  }
  console.log('Closed mesh cone ' + (uninstall ? 'uninstalled' : 'installed') + '.');
  console.log('Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. The 3D wedge now uses a closed mesh with shared edges and a top-only outline. Use uninstall-closed-mesh-cone.cjs to restore polygon faces.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
