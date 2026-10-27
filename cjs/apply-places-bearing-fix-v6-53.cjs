#!/usr/bin/env node
'use strict';
/**
 * Places bearing fix v6.53. Compatible current v6 sources.
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
      "file": "src/features/places/nearbyPlaceImagery.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 1",
              "before": "import { calculateBearing } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; capturedAt?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n",
              "after": "import { panoramaPlaceCenter } from './panoramaPlaceCenter';\nimport { calculateBearing, distanceMeters } from '../../utils/geoUtils';\nimport { Place } from './placesModel';\nexport const PLACE_IMAGERY_RADII = [75, 250] as const;\nexport interface PlaceImagery { id: string; sequence: string; lon: number; lat: number; distance: number; radius: number; direction?: 'facing' | 'panorama' | 'unknown' | 'sideways' | 'away'; angle?: number; placeLon?: number; placeLat?: number; capturedAt?: number; }\nconst coordinates = (geometry: any): [number, number] | null => {\n"
            },
            {
              "label": "src/features/places/nearbyPlaceImagery.ts block 2",
              "before": "\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360\u00b0 panorama \u00b7 can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';\n}\n/** One local viewer read; never rotate a flat image or a newer user selection. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (image.direction !== 'panorama' || !Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n  const opened = await viewer.getImage();\n  if (!current() || String(opened?.id) !== image.id || opened?.isPano !== true || typeof opened.compassAngle !== 'number' || !Number.isFinite(opened.compassAngle)) return null;\n  const origin = opened.originalLngLat ?? opened.lngLat;\n  if (!origin || !Number.isFinite(origin.lng) || !Number.isFinite(origin.lat)) return null;\n  const bearing = calculateBearing(origin.lat, origin.lng, image.placeLat!, image.placeLon!);\n  const x = ((.5 + (bearing - opened.compassAngle) / 360) % 1 + 1) % 1;\n  if (!current()) return null;\n  await viewer.setCenter([x, .5]);\n  return current() ? bearing : null;\n}\n",
              "after": "\nexport function placeImageryDirectionLabel(image: PlaceImagery): string {\n  return image.direction === 'facing' ? 'Facing toward this place' : image.direction === 'panorama' ? '360\u00b0 panorama \u00b7 can look toward this place' : image.direction === 'sideways' ? 'Camera points to the side of this place' : image.direction === 'away' ? 'Camera faces away from this place' : 'Direction unknown';\n}\n/** One local viewer read; the loaded SDK cameraType is authoritative, not Graph's is_pano flag. */\nexport async function facePlaceInPanorama(viewer: any, image: PlaceImagery, current: () => boolean): Promise<number | null> {\n  if (!Number.isFinite(image.placeLon) || !Number.isFinite(image.placeLat) || !current()) return null;\n  const opened = await viewer.getImage();\n  if (!current() || String(opened?.id) !== image.id || opened?.cameraType !== 'spherical') return null;\n  // SDK lngLat prefers computedLngLat, matching the reconstruction used by the viewer.\n  const valid = (point: any) => point && Number.isFinite(point.lng) && Number.isFinite(point.lat) && Math.abs(point.lng) <= 180 && Math.abs(point.lat) <= 90;\n  const origin = valid(opened.lngLat) ? opened.lngLat : valid(opened.computedLngLat) ? opened.computedLngLat : opened.originalLngLat;\n  if (!valid(origin)) return null;\n  const bearing = calculateBearing(origin.lat, origin.lng, image.placeLat!, image.placeLon!);\n  // A coincident POI has no reliable horizontal direction.\n  if (distanceMeters(origin.lat, origin.lng, image.placeLat!, image.placeLon!) < 3) return null;\n  let targetBearing = bearing;\n  let center = panoramaPlaceCenter(opened, bearing);\n  if (!center) {\n    // Heading-only fallback uses a matching original pair when reconstruction is unavailable.\n    const headingValid = (heading: unknown): heading is number => typeof heading === 'number' && Number.isFinite(heading);\n    const computedPair = valid(opened.computedLngLat) && headingValid(opened.computedCompassAngle);\n    const originalPair = valid(opened.originalLngLat) && headingValid(opened.originalCompassAngle);\n    if (!computedPair && !originalPair) return null;\n    const point = computedPair ? opened.computedLngLat : opened.originalLngLat;\n    const heading = computedPair ? opened.computedCompassAngle : opened.originalCompassAngle;\n    if (distanceMeters(point.lat, point.lng, image.placeLat!, image.placeLon!) < 3) return null;\n    targetBearing = calculateBearing(point.lat, point.lng, image.placeLat!, image.placeLon!);\n    center = [((.5 + (targetBearing - heading) / 360) % 1 + 1) % 1, .5];\n  }\n  if (!current()) return null;\n  await viewer.setCenter(center);\n  return current() ? targetBearing : null;\n}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/runtime/widget.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "src/runtime/widget.tsx block 1",
              "before": "      const current = () => this._selectionRequestId === request && this.state.jimuMapView?.view === view && !view.destroyed && this.mapillaryViewer === viewer && String(this.state.imageId) === image.id;\n      if (viewer && current()) {\n        // Optional local orientation must never turn a successful image open into an error.\n        try {\n          const bearing = await facePlaceInPanorama(viewer, image, current);\n          if (bearing != null && current()) { this._lastBearing = bearing; this.updateUrlWithCurrentImage(image.id); }\n        } catch { /* Keep the opened panorama usable when orientation is unavailable. */ }\n      }\n    }\n    catch { this.showToast('Nearby imagery could not open. Choose another image point or try again.', 4000); }\n  }\n",
              "after": "      const current = () => this._selectionRequestId === request && this.state.jimuMapView?.view === view && !view.destroyed && this.mapillaryViewer === viewer && String(this.state.imageId) === image.id;\n      if (viewer && current()) {\n        // Optional local orientation must never turn a successful image open into an error.\n        try {\n          const targetBearing = await facePlaceInPanorama(viewer, image, current);\n          // Existing viewer bearing events own the actual bearing/cone/URL updates.\n          if (targetBearing == null && image.direction === 'panorama' && current()) this.showToast('Image opened. Its viewing direction could not be adjusted.', 3500);\n        } catch (error) {\n          this.log('[Mapillary places] Panorama orientation unavailable:', error);\n          if (current()) this.showToast('Image opened. Its viewing direction could not be adjusted.', 3500);\n        }\n      }\n    }\n    catch { this.showToast('Nearby imagery could not open. Choose another image point or try again.', 4000); }\n  }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/overturePlaces.test.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "tests/overturePlaces.test.cjs block 1",
              "before": " const closer={...base,id:'close',compass_angle:10,geometry:{coordinates:[0,-.0002]}};const farther={...base,id:'far',compass_angle:5};assert.equal(nearby.choosePlaceImagery(place,[farther,closer],75,distance).id,'close');\n assert.match(nearby.placeImageryDirectionLabel({direction:'facing'}),/Facing toward/);assert.match(nearby.placeImageryDirectionLabel({}),/unknown/);\n});\ntest('panorama orientation uses the opened camera position and never rotates stale or flat imagery',async()=>{\n let centered=null,reads=0;const image={id:'pano',direction:'panorama',placeLon:1,placeLat:0};const viewer={getImage:async()=>{reads++;return{id:'pano',isPano:true,compassAngle:0,originalLngLat:{lng:0,lat:0}};},setCenter:p=>centered=p};\n const bearing=await nearby.facePlaceInPanorama(viewer,image,()=>true);assert.equal(bearing,90);assert.deepEqual(centered,[.75,.5]);centered=null;\n await nearby.facePlaceInPanorama(viewer,{...image,direction:'facing'},()=>true);assert.equal(reads,1);assert.equal(centered,null);\n await nearby.facePlaceInPanorama(viewer,image,()=>false);assert.equal(reads,1);\n let resolve;viewer.getImage=()=>new Promise(r=>resolve=r);let current=true;const pending=nearby.facePlaceInPanorama(viewer,image,()=>current);current=false;resolve({id:'pano',isPano:true,compassAngle:0,originalLngLat:{lng:0,lat:0}});assert.equal(await pending,null);assert.equal(centered,null);\n viewer.getImage=async()=>({id:'different',isPano:true,compassAngle:0});assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);\n});\ntest('persistent selection reuses its ring/link and survives base viewport refresh without network work',()=>{\n const {SelectedPlace}=load('SelectedPlace');const layers=[],changes=[];let created=0;\n class Layer{constructor(p){Object.assign(this,p);this.items=[];}addMany(g){this.items.push(...g);}destroy(){this.destroyed=true;}}\n",
              "after": " const closer={...base,id:'close',compass_angle:10,geometry:{coordinates:[0,-.0002]}};const farther={...base,id:'far',compass_angle:5};assert.equal(nearby.choosePlaceImagery(place,[farther,closer],75,distance).id,'close');\n assert.match(nearby.placeImageryDirectionLabel({direction:'facing'}),/Facing toward/);assert.match(nearby.placeImageryDirectionLabel({}),/unknown/);\n});\ntest('panorama orientation uses the opened camera position and never rotates stale or flat imagery',async()=>{\n let centered=null,reads=0;const image={id:'pano',direction:'panorama',placeLon:1,placeLat:0};const viewer={getImage:async()=>{reads++;return{id:'pano',cameraType:'spherical',originalCompassAngle:0,compassAngle:0,originalLngLat:{lng:0,lat:0}};},setCenter:p=>centered=p};\n const bearing=await nearby.facePlaceInPanorama(viewer,image,()=>true);assert.equal(bearing,90);assert.deepEqual(centered,[.75,.5]);centered=null;\n const getSpherical=viewer.getImage;viewer.getImage=async()=>{reads++;return{id:'pano',cameraType:'perspective',compassAngle:0,originalLngLat:{lng:0,lat:0}};};\n await nearby.facePlaceInPanorama(viewer,{...image,direction:'facing'},()=>true);assert.equal(reads,2);assert.equal(centered,null);viewer.getImage=getSpherical;\n await nearby.facePlaceInPanorama(viewer,image,()=>false);assert.equal(reads,2);\n let resolve;viewer.getImage=()=>new Promise(r=>resolve=r);let current=true;const pending=nearby.facePlaceInPanorama(viewer,image,()=>current);current=false;resolve({id:'pano',cameraType:'spherical',originalCompassAngle:0,compassAngle:0,originalLngLat:{lng:0,lat:0}});assert.equal(await pending,null);assert.equal(centered,null);\n viewer.getImage=async()=>({id:'different',cameraType:'spherical',compassAngle:0});assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);\n});\ntest('persistent selection reuses its ring/link and survives base viewport refresh without network work',()=>{\n const {SelectedPlace}=load('SelectedPlace');const layers=[],changes=[];let created=0;\n class Layer{constructor(p){Object.assign(this,p);this.items=[];}addMany(g){this.items.push(...g);}destroy(){this.destroyed=true;}}\n"
            },
            {
              "label": "tests/overturePlaces.test.cjs block 2",
              "before": "});\ntest('covered-area button handler navigates only on explicit action using existing Point constructors',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToPlacesArea').getText(sf);const Runtime=new Function('paddedPlacesExtent',compile('class Runtime{'+member+'}\\nreturn Runtime;'))(extentUtils.paddedPlacesExtent);const w=new Runtime(),view={ready:true,destroyed:false};let calls=0;w.state={jimuMapView:{view}};w._places={coverageExtent:[10,20,11,21]};w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p);}}};w.navigateMapView=(actual,target,options)=>{calls++;assert.equal(actual,view);assert.equal(target.target.length,2);assert(target.target[0].longitude<10&&target.target[1].longitude>11);assert.equal(options.animate,false);};assert.equal(calls,0);w.goToPlacesArea();assert.equal(calls,1);view.destroyed=true;w.goToPlacesArea();assert.equal(calls,1);\n});\n",
              "after": "});\ntest('covered-area button handler navigates only on explicit action using existing Point constructors',()=>{\n const member=widget.members.find(m=>m.name?.getText(sf)==='goToPlacesArea').getText(sf);const Runtime=new Function('paddedPlacesExtent',compile('class Runtime{'+member+'}\\nreturn Runtime;'))(extentUtils.paddedPlacesExtent);const w=new Runtime(),view={ready:true,destroyed:false};let calls=0;w.state={jimuMapView:{view}};w._places={coverageExtent:[10,20,11,21]};w.ArcGISModules={Point:class{constructor(p){Object.assign(this,p);}}};w.navigateMapView=(actual,target,options)=>{calls++;assert.equal(actual,view);assert.equal(target.target.length,2);assert(target.target[0].longitude<10&&target.target[1].longitude>11);assert.equal(options.animate,false);};assert.equal(calls,0);w.goToPlacesArea();assert.equal(calls,1);view.destroyed=true;w.goToPlacesArea();assert.equal(calls,1);\n});\ntest('panorama target projection matches actual Mapillary 4.1.2 Transform fixtures for tilt, roll, EXIF and north wrap',()=>{\n const {panoramaPlaceCenter}=load('panoramaPlaceCenter'),fixture=JSON.parse(fs.readFileSync(path.join(root,'tests/fixtures/mapillary-spherical-centres.json'),'utf8'));assert.equal(fixture.sdk,'mapillary-js@4.1.2');assert.equal(fixture.cases.length,36);for(const item of fixture.cases){const actual=panoramaPlaceCenter(item,item.bearing);assert(actual);for(let i=0;i<2;i++)assert(Math.abs(actual[i]-item.expected[i])<1e-9,JSON.stringify({item,actual}));}assert.equal(panoramaPlaceCenter({rotation:[NaN,0,0],width:100,height:50},0),null);\n});\ntest('real SDK camera shape rotates without isPano and uses reconstructed position rather than original GPS',async()=>{\n let center;const opened={id:'image',cameraType:'spherical',lngLat:{lng:0,lat:0},computedLngLat:{lng:0,lat:0},originalLngLat:{lng:2,lat:0},compassAngle:0,rotation:[Math.PI/2,0,0],width:4096,height:2048,exifOrientation:1};const viewer={getImage:async()=>opened,setCenter:p=>center=p};const result=await nearby.facePlaceInPanorama(viewer,{id:'image',direction:'panorama',placeLon:1,placeLat:0},()=>true);assert.equal(result,90);assert(Math.abs(center[0]-.75)<1e-9);assert(Math.abs(center[1]-.5)<1e-9);assert.equal('isPano' in opened,false);opened.cameraType='perspective';center=null;assert.equal(await nearby.facePlaceInPanorama(viewer,{id:'image',placeLon:1,placeLat:0},()=>true),null);assert.equal(center,null);\n});\ntest('heading-only fallback uses explicit matching coordinate/heading pairs and never mixes computed GPS with EXIF heading',async()=>{\n let center;const opened={id:'pair',cameraType:'spherical',lngLat:{lng:0,lat:0},computedLngLat:{lng:0,lat:0},originalLngLat:{lng:2,lat:0},originalCompassAngle:270,compassAngle:270};const viewer={getImage:async()=>opened,setCenter:p=>center=p},image={id:'pair',placeLon:1,placeLat:0};assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),270);assert.equal(center[0],.5,'original camera west toward POI with original west heading');opened.computedCompassAngle=0;assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),90);assert.equal(center[0],.75);delete opened.originalCompassAngle;delete opened.computedCompassAngle;center=null;assert.equal(await nearby.facePlaceInPanorama(viewer,image,()=>true),null);assert.equal(center,null);\n});\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/OVERTURE-PLACES.md",
      "variants": [
        {
          "blocks": [
            {
              "label": "docs/OVERTURE-PLACES.md block 1",
              "before": "\nThe button fits padded extent corners through the existing guarded map navigation path and never navigates automatically. A large extent may fit below zoom 15; the existing zoom-closer instruction then applies. Normal POI markers/list are hidden outside, while a selected place may persist. Returning inside resumes the existing cache/query flow. Metadata errors retain normal error handling; missing, unsupported or invalid extents do not invent an outside classification. Geographic and Web Mercator metadata are supported.\n\n`fullExtent` is the layer's bounding envelope, not the export AOI polygon or guaranteed complete coverage. Partial overlap, touching edges, holes between points and category-empty areas remain normal queries/zero results. Metadata can be stale after republishing; reload the app after updating the hosted dataset. No per-pan extent query or secondary feature-count query is introduced.\n",
              "after": "\nThe button fits padded extent corners through the existing guarded map navigation path and never navigates automatically. A large extent may fit below zoom 15; the existing zoom-closer instruction then applies. Normal POI markers/list are hidden outside, while a selected place may persist. Returning inside resumes the existing cache/query flow. Metadata errors retain normal error handling; missing, unsupported or invalid extents do not invent an outside classification. Geographic and Web Mercator metadata are supported.\n\n`fullExtent` is the layer's bounding envelope, not the export AOI polygon or guaranteed complete coverage. Partial overlap, touching edges, holes between points and category-empty areas remain normal queries/zero results. Metadata can be stale after republishing; reload the app after updating the hosted dataset. No per-pan extent query or secondary feature-count query is introduced.\n\n\n## Panorama bearing correction (v6.53)\n\nThe earlier POI helper incorrectly checked `Image.isPano`; Mapillary JS 4.1.2 exposes `cameraType === \"spherical\"`. Its `compassAngle` may be computed while the helper preferred original GPS, mixing coordinate sources. Tests previously mocked a non-SDK `isPano` property and missed this mismatch.\n\nThe helper now uses the loaded camera type, prefers the viewer's computed position (`lngLat`), and projects a horizontal ENU direction through the loaded Rodrigues camera rotation, spherical mapping and EXIF orientation. This accounts for pitch/roll and texture orientation rather than assuming an upright panorama. Without complete rotation metadata, it uses an explicit matching computed position/heading pair, otherwise an original position/heading pair. It skips orientation when neither pair is usable or the POI is within 3 m, where direction is unstable. Flat images and obsolete selections are never rotated.\n\nExisting viewer bearing events own observed bearing, cone and URL state. The helper no longer writes an intended angle as if the viewer actually reached it. Exceptions are debug-logged and a current failed panorama adjustment shows a short message while leaving the image usable. No request, timer, animation loop or private viewer API is added. Public Image fields are used; the local math was checked against the installed SDK's Transform, not imported from SDK internals at runtime.\n\nThe SDK-derived fixture covers 36 combinations of tilt/roll, EXIF 1/3/6/8 and compass wraparound. This aims at a horizontal direction only: POI elevation, camera/POI positional error, occlusion and entrance location remain unknown. Live scene verification is still necessary. Other non-POI bearing helpers are outside this change.\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/features/places/panoramaPlaceCenter.ts",
      "content": "/** Mapillary spherical projection of a horizontal ENU direction, including camera tilt/roll.\n * Matches the installed SDK's Rodrigues world-to-camera rotation and basic-coordinate mapping.\n * Does not estimate POI altitude, visibility or a building entrance.\n */\nexport function panoramaPlaceCenter(image: any, bearing: number): [number, number] | null {\n  const rotation = image.rotation, width = image.width, height = image.height, orientation = image.exifOrientation ?? 1;\n  if (!Array.isArray(rotation) || rotation.length !== 3 || !rotation.every((n: unknown) => typeof n === 'number' && Number.isFinite(n)) || !Number.isFinite(bearing) || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || ![1, 3, 6, 8].includes(orientation)) return null;\n  const theta = Math.hypot(...rotation), radians = bearing * Math.PI / 180;\n  const v = [Math.sin(radians), Math.cos(radians), 0];\n  let camera = v;\n  if (theta > 0) {\n    const [x, y, z] = rotation.map((n: number) => n / theta), [vx, vy, vz] = v;\n    const cosine = Math.cos(theta), sine = Math.sin(theta), dot = x * vx + y * vy + z * vz;\n    camera = [vx * cosine + (y * vz - z * vy) * sine + x * dot * (1 - cosine),\n      vy * cosine + (z * vx - x * vz) * sine + y * dot * (1 - cosine),\n      vz * cosine + (x * vy - y * vx) * sine + z * dot * (1 - cosine)];\n  }\n  const sfmX = Math.atan2(camera[0], camera[2]) / (2 * Math.PI);\n  const sfmY = Math.atan2(camera[1], Math.hypot(camera[0], camera[2])) / (2 * Math.PI);\n  const span = Math.max(width, height), x = .5 + sfmX * span / width, y = .5 + sfmY * span / height;\n  const basic = orientation === 3 ? [1 - x, 1 - y] : orientation === 6 ? [1 - y, x] : orientation === 8 ? [y, 1 - x] : [x, y];\n  return basic.every(Number.isFinite) ? [Math.min(1, Math.max(0, basic[0])), Math.min(1, Math.max(0, basic[1]))] : null;\n}\n"
    },
    {
      "file": "tests/fixtures/mapillary-spherical-centres.json",
      "content": "{\n  \"sdk\": \"mapillary-js@4.1.2\",\n  \"method\": \"Actual SDK Transform.projectBasic of horizontal ENU direction, followed by public setCenter clamping\",\n  \"cases\": [\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.5,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.75,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.49722222222222207,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.5,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.25,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.502777777777778,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.5,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.5,\n        0.75\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.5,\n        0.49722222222222207\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.5,\n        0.5\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.5,\n        0.25\n      ]\n    },\n    {\n      \"rotation\": [\n        1.5707963267948966,\n        0,\n        0\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.5,\n        0.502777777777778\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.5548763688039579,\n        0.5761822195214772\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.8007561808848418,\n        0.46635899426864447\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.5520326957598298,\n        0.5767737424732229\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.44512363119604215,\n        0.4238177804785228\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.1992438191151582,\n        0.5336410057313555\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.44796730424017017,\n        0.4232262575267771\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.4238177804785228,\n        0.5548763688039579\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.5336410057313555,\n        0.8007561808848418\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.4232262575267771,\n        0.5520326957598298\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.5761822195214772,\n        0.44512363119604215\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.46635899426864447,\n        0.1992438191151582\n      ]\n    },\n    {\n      \"rotation\": [\n        1.3,\n        0.2,\n        -0.3\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.5767737424732229,\n        0.44796730424017017\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.3728947369710246,\n        0.693525912778811\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.6263343425172825,\n        0.5098811760564013\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 1,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.3695146583791129,\n        0.6932821740454331\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.6271052630289754,\n        0.30647408722118896\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.3736656574827175,\n        0.49011882394359874\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 3,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.6304853416208871,\n        0.30671782595456687\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.30647408722118896,\n        0.3728947369710246\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.49011882394359874,\n        0.6263343425172825\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 6,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.30671782595456687,\n        0.3695146583791129\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 0,\n      \"expected\": [\n        0.693525912778811,\n        0.6271052630289754\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 90,\n      \"expected\": [\n        0.5098811760564013,\n        0.3736656574827175\n      ]\n    },\n    {\n      \"rotation\": [\n        0.9,\n        -0.7,\n        0.4\n      ],\n      \"exifOrientation\": 8,\n      \"width\": 4096,\n      \"height\": 2048,\n      \"bearing\": 359,\n      \"expected\": [\n        0.6932821740454331,\n        0.6304853416208871\n      ]\n    }\n  ]\n}\n"
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-bearing-fix-v6-53-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.53 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-bearing-fix-v6-53' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.53 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.53 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.53 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-bearing-fix-v6-53.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places bearing fix v6.53 is already installed. No files changed.');
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
  const manifest = { installer: 'places-bearing-fix-v6-53', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places bearing fix v6.53 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
