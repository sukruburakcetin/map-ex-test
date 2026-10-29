/** Diagnostic removal regression; historical filename retained for patch compatibility. */
const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/features/map-graphics/SelectionPulse.ts'),'utf8'),runtime=fs.readFileSync(path.join(root,'src/runtime/widget.tsx'),'utf8');
test('production pulse has no diagnostic globals, visibility locks or comparison loop',()=>{for(const token of ['PulseVisibilityProbe','__mapillaryPulseProbe','reactiveWatch','tickComparison','diagnosticBlocks','symbolFrames'])assert(!source.includes(token),token)});
test('coverage completion, stationary callback and cone have no diagnostic pause guards',()=>{assert(!runtime.includes('diagnosticBlocks'));assert(runtime.includes('this.refreshActivePulseAnchor(view)'));assert(runtime.includes('await this.enableTurboCoverageLayer()'))});
