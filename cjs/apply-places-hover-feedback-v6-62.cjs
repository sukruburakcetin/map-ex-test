#!/usr/bin/env node
'use strict';
/**
 * Places hover feedback v6.62. Compatible current v6 sources.
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
      "file": "src/features/places/ArcGISPlaces.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "hover feedback 1",
              "before": "  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n  private listVisible = true;\n  private groupingKey = '';\n  private groups = new Map<string, PlaceGroupMarker>();\n  private memberGroups = new Map<string, string>();\n  private countSymbols = new Map<number, any>();\n",
              "after": "  private ownerView: any = null;\n  private records = new Map<string, Place>();\n  private listedPlaces: readonly Place[] = [];\n  private listVisible = true;\n  private hovered: { id: string; graphic: any; symbol: any } | null = null;\n  private groupingKey = '';\n  private groups = new Map<string, PlaceGroupMarker>();\n  private memberGroups = new Map<string, string>();\n  private countSymbols = new Map<number, any>();\n"
            },
            {
              "label": "hover feedback 2",
              "before": "        }\n      },\n      display: (places, view) => this.display(places, view),\n      visible: visible => {\n        if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible;\n        if (this.listVisible !== visible) { this.listVisible = visible; this.host.list?.(visible ? this.listedPlaces : []); }\n      },\n      clear: () => this.clear(), status: host.status,\n      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),\n      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work, { timeout: 1500 }) } : { idle: false, id: setTimeout(work, 0) },\n      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),\n    });\n",
              "after": "        }\n      },\n      display: (places, view) => this.display(places, view),\n      visible: visible => {\n        if (!visible) this.setHover(null);\n        if (this.graphics) this.graphics.visible = visible; if (this.attribution) this.attribution.hidden = !visible;\n        if (this.listVisible !== visible) { this.listVisible = visible; this.host.list?.(visible ? this.listedPlaces : []); }\n      },\n      clear: () => this.clear(), status: state => { if (state.kind !== 'ready') this.setHover(null); host.status(state); },\n      timer: (work, ms) => setTimeout(work, ms), cancelTimer: handle => clearTimeout(handle),\n      idle: work => typeof window.requestIdleCallback === 'function' ? { idle: true, id: window.requestIdleCallback(work, { timeout: 1500 }) } : { idle: false, id: setTimeout(work, 0) },\n      cancelIdle: handle => { if (handle.idle) window.cancelIdleCallback(handle.id); else clearTimeout(handle.id); }, now: () => Date.now(),\n    });\n"
            },
            {
              "label": "hover feedback 3",
              "before": "      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';\n      const link = document.createElement('a'); link.textContent = 'Places · Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';\n      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');\n    }\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.listedPlaces = places;\n    this.regroup();\n    if (this.listVisible) this.host.list?.(places);\n",
              "after": "      this.attribution.className = 'esri-widget'; this.attribution.style.cssText = 'box-sizing:border-box;margin-right:clamp(34px,3vw,42px);max-width:min(180px,40vw);padding:3px 6px;font-size:10px;line-height:1.3;white-space:normal;overflow-wrap:break-word;text-align:right;border-radius:3px;background:#182b23dd;color:#e4e9de';\n      const link = document.createElement('a'); link.textContent = 'Places · Overture Maps'; link.href = 'https://docs.overturemaps.org/attribution/'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.style.color = 'inherit';\n      this.attribution.appendChild(link); view.ui.add(this.attribution, 'bottom-right');\n    }\n    this.setHover(null);\n    this.records = new Map(places.map(p => [p.id, p]));\n    this.listedPlaces = places;\n    this.regroup();\n    if (this.listVisible) this.host.list?.(places);\n"
            },
            {
              "label": "hover feedback 4",
              "before": "      const graphic = new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol: cached || (count > 1 ? placeCountSymbol(count) : placeCategorySymbol(p.group)), attributes: { place_id: count > 1 ? group.id : p.id } });\n      if (!cached) { if (count > 1) { if (this.countSymbols.size >= 32) this.countSymbols.delete(this.countSymbols.keys().next().value!); this.countSymbols.set(count, graphic.symbol); } else this.iconSymbols.set(p.group, graphic.symbol); }\n      return graphic;\n    });\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  private groupPlace(group: PlaceGroupMarker): Place { return { ...group.anchor, id: group.id, name: `${group.members.length} places here` }; }\n\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) { const group = this.groups.get(this.memberGroups.get(selected.id) || ''); return group ? this.groupPlace(group) : selected; }\n    // Opening already-loaded details is local work and remains available while imagery loads.\n",
              "after": "      const graphic = new this.host.modules.Graphic({ geometry: new this.host.modules.Point({ longitude: p.lon, latitude: p.lat, spatialReference: { wkid: 4326 } }), symbol: cached || (count > 1 ? placeCountSymbol(count) : placeCategorySymbol(p.group)), attributes: { place_id: count > 1 ? group.id : p.id } });\n      if (!cached) { if (count > 1) { if (this.countSymbols.size >= 32) this.countSymbols.delete(this.countSymbols.keys().next().value!); this.countSymbols.set(count, graphic.symbol); } else this.iconSymbols.set(p.group, graphic.symbol); }\n      return graphic;\n    });\n    this.setHover(null);\n    this.graphics.removeAll(); this.graphics.addMany(graphics);\n  }\n  private groupPlace(group: PlaceGroupMarker): Place { return { ...group.anchor, id: group.id, name: `${group.members.length} places here` }; }\n\n  /** Reuse the existing marker; never mutate shared/cached symbols or selection. */\n  setHover(id: string | null): void {\n    if (this.hovered?.id === id) return;\n    if (this.hovered) { this.hovered.graphic.symbol = this.hovered.symbol; this.hovered = null; }\n    if (!id || this.disposed || this.host.busy() || !this.graphics?.visible || this.ownerView !== this.host.view() || this.ownerView?.destroyed || id === this.selection.place?.id) return;\n    const graphic = this.graphics.graphics?.toArray?.().find((g: any) => g.attributes?.place_id === id);\n    if (!graphic?.symbol || !Number.isFinite(graphic.symbol.width) || !Number.isFinite(graphic.symbol.height)) return;\n    const original = graphic.symbol, symbol = original.clone ? original.clone() : { ...original };\n    symbol.width += 3; symbol.height += 3;\n    this.hovered = { id, graphic, symbol: original }; graphic.symbol = symbol;\n  }\n  hoverLabel(place: Place): string {\n    const group = this.groups.get(place.id);\n    return group ? `${group.members.length} places here · Click to choose` : `${place.name} · ${place.category.replace(/_/g, ' ')}`;\n  }\n  get hoverLayer(): any { return !this.host.busy() && this.graphics?.visible && this.records.size ? this.graphics : null; }\n  hit(results: any[]): Place | null {\n    const selected = this.selection.hit(results); if (selected) { const group = this.groups.get(this.memberGroups.get(selected.id) || ''); return group ? this.groupPlace(group) : selected; }\n    // Opening already-loaded details is local work and remains available while imagery loads.\n"
            },
            {
              "label": "hover feedback 5",
              "before": "    const group = valid ? this.groups.get(targetId || this.hit(results)?.id || '') : null;\n    if (group) return this.openGroup(group);\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    this.selection.select(place);\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const name = document.createElement('strong'); name.className = 'mly-place-name'; name.textContent = place.name; content.appendChild(name);\n    for (const [index, text] of [place.category.replace(/_/g, ' '), place.address].entries()) if (text) { const line = document.createElement('p'); line.className = index === 0 ? 'mly-place-category' : 'mly-place-address'; line.textContent = text; content.appendChild(line); }\n",
              "after": "    const group = valid ? this.groups.get(targetId || this.hit(results)?.id || '') : null;\n    if (group) return this.openGroup(group);\n    const place = (valid && targetId ? this.records.get(targetId) : null) || (this.selection.place?.id === targetId ? this.selection.place : null) || this.hit(results);\n    if (this.disposed || !place || !view || view.destroyed) return false;\n    this.setHover(null);\n    this.selection.select(place);\n    const content = document.createElement('div'); content.className = 'mly-place-popup';\n    const name = document.createElement('strong'); name.className = 'mly-place-name'; name.textContent = place.name; content.appendChild(name);\n    for (const [index, text] of [place.category.replace(/_/g, ' '), place.address].entries()) if (text) { const line = document.createElement('p'); line.className = index === 0 ? 'mly-place-category' : 'mly-place-address'; line.textContent = text; content.appendChild(line); }\n"
            },
            {
              "label": "hover feedback 6",
              "before": "    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n    this.popupContent = null; this.popupView = null;\n  }\n  private clear(): void {\n    this.closeDetails();\n    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n",
              "after": "    if (!this.popupView?.destroyed && this.popupContent && this.popupView?.popup?.content === this.popupContent) this.popupView.closePopup();\n    this.popupContent = null; this.popupView = null;\n  }\n  private clear(): void {\n    this.setHover(null);\n    this.closeDetails();\n    if (!this.controller?.stats.enabled) this.selection.clear(!this.disposed);\n    if (this.attribution) { if (!this.ownerView?.destroyed) this.ownerView?.ui?.remove(this.attribution); this.attribution.remove(); this.attribution = null; }\n    if (this.graphics) { if (!this.ownerView?.destroyed) this.ownerView?.map?.remove(this.graphics); if (!this.graphics.destroyed) this.graphics.destroy(); this.graphics = null; }\n"
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
              "label": "hover feedback 1",
              "before": "    this._turboMapLeaveCleanup = null;\n    const mapContainer = view.container as HTMLElement;\n    if (mapContainer) {\n      const onMapLeave = () => {\n        this._turboHoverPickAbort?.abort();\n        this.clearTurboHoverDetails();\n        if (hoverHitTestTimeout) {\n          clearTimeout(hoverHitTestTimeout);\n",
              "after": "    this._turboMapLeaveCleanup = null;\n    const mapContainer = view.container as HTMLElement;\n    if (mapContainer) {\n      const onMapLeave = () => {\n        this._places?.setHover(null);\n        this._turboHoverPickAbort?.abort();\n        this.clearTurboHoverDetails();\n        if (hoverHitTestTimeout) {\n          clearTimeout(hoverHitTestTimeout);\n"
            },
            {
              "label": "hover feedback 2",
              "before": "              ? this.pickTurboRepresentative(screenPoint, view, hoverController.signal, true)\n              : this.pickTurboGraphic(screenPoint, view, hoverController.signal, TURBO_LIMITS.hoverRadiusPx))\n            : Promise.resolve(null);\n          let featureOwnsHover = false;\n          let coverageOwnsHover = false;\n          const coverageFeedback = coverage.then(picked => {\n            if (hoverController.signal.aborted || featureOwnsHover || this.state.jimuMapView?.view !== view) return;\n            coverageOwnsHover = !!picked;\n            if (picked) this.updateTurboHover(picked, globalX, globalY);\n            else this.clearTurboHoverDetails();\n          }).catch(() => { if (!hoverController.signal.aborted && !featureOwnsHover) this.clearTurboHoverDetails(); });\n          const hit = await this.hitTestHoverLayers(view, screenPoint);\n          if (hoverController.signal.aborted) return;\n\n          // 1. POINT CLOUD HOVER SYNC (Dual-Hover Feature)\n          const pcHit = hit.results.find((r: any) => {\n            const l = r.layer || (r.graphic && r.graphic.layer);\n",
              "after": "              ? this.pickTurboRepresentative(screenPoint, view, hoverController.signal, true)\n              : this.pickTurboGraphic(screenPoint, view, hoverController.signal, TURBO_LIMITS.hoverRadiusPx))\n            : Promise.resolve(null);\n          let featureOwnsHover = false;\n          const coverageFeedback = coverage.then(picked => {\n            if (hoverController.signal.aborted || featureOwnsHover || this.state.jimuMapView?.view !== view) return;\n            if (picked) this.updateTurboHover(picked, globalX, globalY);\n            else this.clearTurboHoverDetails();\n          }).catch(() => { if (!hoverController.signal.aborted && !featureOwnsHover) this.clearTurboHoverDetails(); });\n          const hit = await this.hitTestHoverLayers(view, screenPoint);\n          if (hoverController.signal.aborted || this.state.jimuMapView?.view !== view) return;\n\n          // 1. POINT CLOUD HOVER SYNC (Dual-Hover Feature)\n          const pcHit = hit.results.find((r: any) => {\n            const l = r.layer || (r.graphic && r.graphic.layer);\n"
            },
            {
              "label": "hover feedback 3",
              "before": "            return l && (l.id === LAYER_IDS.OBJECTS_FL || l.id === LAYER_IDS.TRAFFIC_SIGNS_FL);\n          });\n\n          const mapFeature = obj || await this.pickMapFeature(screenPoint, view, hoverController.signal);\n          if (hoverController.signal.aborted) return;\n          if (mapFeature && (mapFeature as any).graphic) {\n            featureOwnsHover = true;\n            this.clearTurboHoverDetails();\n            const attrs = (mapFeature as any).graphic.attributes || {};\n            if (this.tooltipDiv) {\n",
              "after": "            return l && (l.id === LAYER_IDS.OBJECTS_FL || l.id === LAYER_IDS.TRAFFIC_SIGNS_FL);\n          });\n\n          const mapFeature = obj || await this.pickMapFeature(screenPoint, view, hoverController.signal);\n          if (hoverController.signal.aborted || this.state.jimuMapView?.view !== view) return;\n          if (mapFeature && (mapFeature as any).graphic) {\n            this._places?.setHover(null);\n            featureOwnsHover = true;\n            this.clearTurboHoverDetails();\n            const attrs = (mapFeature as any).graphic.attributes || {};\n            if (this.tooltipDiv) {\n"
            },
            {
              "label": "hover feedback 4",
              "before": "            }\n            return; // Stop here, don't trigger Turbo hover\n          }\n\n          await coverageFeedback;\n          const place = !coverageOwnsHover ? this._places?.hit(hit.results) : null;\n          if (place && !hoverController.signal.aborted && this.tooltipDiv) {\n            const bounds = view.container?.getBoundingClientRect() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };\n            renderMapFeatureHoverLabel(this.tooltipDiv, place.name, bounds, globalX, globalY);\n          }\n        } catch (err) {\n          if (!hoverController.signal.aborted) {\n            this.clearTurboHoverDetails();\n            if (this.state.turboModeActive && this.state.jimuMapView?.view === view) this.updateTurboPickWarning(\"Image lookup could not load. Check your connection and choose Retry.\", \"retry\");\n          }\n        }\n",
              "after": "            }\n            return; // Stop here, don't trigger Turbo hover\n          }\n\n          const place = this._places?.hit(hit.results);\n          if (place && !hoverController.signal.aborted) {\n            featureOwnsHover = true;\n            this.clearTurboHoverDetails();\n            this._places?.setHover(place.id);\n            if (this.tooltipDiv) {\n              const bounds = view.container?.getBoundingClientRect() || { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };\n              renderMapFeatureHoverLabel(this.tooltipDiv, this._places?.hoverLabel(place) || place.name, bounds, globalX, globalY);\n            }\n            return;\n          }\n          this._places?.setHover(null);\n          await coverageFeedback;\n        } catch (err) {\n          if (!hoverController.signal.aborted) {\n            this._places?.setHover(null);\n            this.clearTurboHoverDetails();\n            if (this.state.turboModeActive && this.state.jimuMapView?.view === view) this.updateTurboPickWarning(\"Image lookup could not load. Check your connection and choose Retry.\", \"retry\");\n          }\n        }\n"
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
              "label": "hover feedback 1",
              "before": " const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Suggested view · Direction unknown');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open view'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);assert.equal(options[0].textContent,'Open view · Panorama');assert.equal(view.popup.content.children.filter(x=>x.className==='mly-place-choice-note'&&!x.hidden).length,1);assert.match(view.popup.content.children.find(x=>x.className==='mly-place-meta mly-place-choice-meta').textContent,/Capture date unknown · About 32 m away/);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\n",
              "after": " const view={toScreen:()=>({x:10,y:10}),ready:true,zoom:16,stationary:true,extent:{xmin:0,ymin:0,xmax:1,ymax:1,spatialReference:{isGeographic:true}},map:{add(x,index){if(!x.id?.startsWith('overture-selection-'))assert.equal(index,0);layers.push(x);},remove(x){layers.splice(layers.indexOf(x),1);}},ui:{add(x){ui.push(x);},remove(x){ui.splice(ui.indexOf(x),1);}},watch(){return{remove(){removed++;}};},openPopup(x){this.popup=x;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'test',url:'https://host/FeatureServer/0',modules:{FeatureLayer,GraphicsLayer,SimpleMarkerSymbol:Value,Graphic:Value,Point:Value},view:()=>view,geographic:x=>x,busy:()=>busy,status(){},list:p=>listed=p,explore:async(p,radius)=>{explored=p;return [{id:\"img-1\",sequence:\"seq-1\",lon:.5,lat:.5,distance:32,radius},{id:\"img-2\",sequence:\"seq-2\",distance:40,radius,direction:\"panorama\",capturedAt:1704067200000},{id:\"img-3\",sequence:\"seq-3\",distance:60,radius,direction:\"unknown\"}];},openImagery:image=>openedImage=image});\n try{\n assert.equal(serviceCount,0);assert.equal(layers.length,0);owner.controller.setEnabled(true);await new Promise(r=>setTimeout(r,710));\n assert.equal(serviceCount,1);assert.equal(layers.length,1);assert(layers[0] instanceof GraphicsLayer);assert.equal(query.num,200);assert.equal(query.where,'confidence >= 0.95');assert.equal(query.outSpatialReference.wkid,4326);assert.equal(layers[0].items.length,1);assert.equal(layers[0].items[0].symbol.type,'picture-marker');assert.equal(layers[0].items[0].symbol.width,12);assert.equal(listed.length,1);assert.equal(owner.hoverLabel(listed[0]),'<img onerror=evil()> · school');const originalSymbol=layers[0].items[0].symbol;owner.setHover('gers-1');assert.notEqual(layers[0].items[0].symbol,originalSymbol);owner.controller.host.visible(false);assert.equal(layers[0].items[0].symbol,originalSymbol);owner.controller.host.visible(false);assert.equal(listed.length,0);owner.controller.host.visible(true);assert.equal(listed.length,1);assert.equal(serviceCount,1);\n const hits=[{layer:layers[0],graphic:layers[0].items[0]}];assert.equal(owner.screenTarget({x:10,y:10}),'gers-1');assert.equal(owner.screenTarget({x:25,y:10}),null);assert(owner.open([],owner.screenTarget({x:10,y:10})));busy=true;assert.equal(owner.hoverLayer,null);assert(owner.open(hits));assert.equal(serviceCount,1);busy=false;assert.equal(view.popup.content.children[0].textContent,'<img onerror=evil()>');assert(!view.popup.content.children.some(x=>x.href==='javascript:evil()'));assert.equal(explored,null);const searchButton=view.popup.content.children.find(x=>x.textContent==='Find imagery within 75 m');await searchButton.onclick();assert.equal(explored.id,'gers-1');assert.equal(openedImage,null);assert.equal(searchButton.textContent,'Suggested view · Direction unknown');await searchButton.onclick();assert.equal(openedImage.id,'img-1');const options=view.popup.content.children.find(x=>x.children?.some(y=>y.textContent?.startsWith('Open view'))).children.filter(x=>x.type==='button');assert.equal(options.length,2);assert.equal(options[0].textContent,'Open view · Panorama');assert.equal(view.popup.content.children.filter(x=>x.className==='mly-place-choice-note'&&!x.hidden).length,1);assert.match(view.popup.content.children.find(x=>x.className==='mly-place-meta mly-place-choice-meta').textContent,/Capture date unknown · About 32 m away/);options[1].onclick();assert.equal(openedImage.id,'img-3');\n assert.equal(owner.hit([{layer:{},graphic:layers[0].items[0]}]),null);const retained=owner.selection.place;owner.clear();assert.equal(listed.length,0);openedImage=null;options[0].onclick();assert.equal(openedImage,null,'closed-popup alternatives cannot open imagery');assert.equal(owner.selection.place,retained);assert(owner.open([],retained.id),'selected place details reopen after the viewport records clear');owner.clearSelection();assert.equal(owner.selection.place,null);assert.equal(view.popup,null);owner.controller.setEnabled(false);assert.equal(layers.length,0);assert.equal(ui.length,0);assert.equal(view.popup,null);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}assert.equal(removed,1);\n});\n"
            },
            {
              "label": "hover feedback 2",
              "before": " const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},replaceChildren(...xs){this.children=xs;},remove(){}});global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n const layers=[];let busy=false,created=0,requests=0;class Layer{constructor(p){Object.assign(this,p);this.visible=true;this.items=[];}removeAll(){this.items=[];}addMany(g){this.items.push(...g);this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}class Value{constructor(p){Object.assign(this,p);}}class Graphic extends Value{constructor(p){super(p);created++;}}\n const view={ready:true,stationary:true,destroyed:false,map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},ui:{add(){},remove(){}},watch(){return{remove(){}}},toScreen:()=>({x:10,y:10}),openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert.equal(list.children[0].children[1].children[0].textContent,'Place 4');assert(list.children[0].children[0].src.startsWith('data:image/svg+xml;'));assert.equal(list.children[0].children[1].children[1].textContent,'museum');list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');assert(owner.open([],target));const chosenList=view.popup.content.children[2];assert.equal(view.popup.content.children[3].children[1].textContent,'2 / 2');assert.equal(chosenList.children[0].children[1].children[2].textContent,'Selected');assert.equal(owner.selection.place.id,'p4');const staleRow=chosenList.children[1];owner.clear();staleRow.onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(requests,0);const before=created;busy=true;owner.regroup();assert.equal(created,before);assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('category preferences are validated, scoped and safe when browser storage is blocked',()=>{\n const preferences=load('placePreferences'),data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},url='https://host/FeatureServer/0';const key=preferences.placePreferenceKey('w','/experience/0',url);assert(key);preferences.savePlaceCategory(()=>store,key,'parks');assert.equal(preferences.readPlaceCategory(()=>store,key),'parks');assert.notEqual(key,preferences.placePreferenceKey('w','/experience/1',url));assert.notEqual(key,preferences.placePreferenceKey('other','/experience/0',url));assert.notEqual(key,preferences.placePreferenceKey('w','/experience/0','https://host/FeatureServer/1'));assert.equal(preferences.placePreferenceKey('w','/experience/0',url+'?token=secret'),null);data.set(key,'<script>');assert.equal(preferences.readPlaceCategory(()=>store,key),'all');assert.equal(preferences.readPlaceCategory(()=>{throw Error('blocked')},key,'education'),'education');assert.doesNotThrow(()=>preferences.savePlaceCategory(()=>{throw Error('blocked')},key,'parks'));preferences.savePlaceCategory(()=>store,key,'all');assert.equal(data.get(key),'all');preferences.savePlaceCategory(()=>store,key,'invalid');assert.equal(data.get(key),'all');\n",
              "after": " const {ArcGISPlaces}=load('ArcGISPlaces'),oldDocument=global.document,oldWindow=global.window;const element=()=>({children:[],style:{},setAttribute(){},appendChild(x){this.children.push(x);},replaceChildren(...xs){this.children=xs;},remove(){}});global.document={createElement:element,addEventListener(){},removeEventListener(){}};global.window={};\n const layers=[];let busy=false,created=0,requests=0;class Layer{constructor(p){Object.assign(this,p);this.visible=true;this.items=[];}removeAll(){this.items=[];}addMany(g){this.items.push(...g);this.graphics={toArray:()=>this.items};}destroy(){this.destroyed=true;}}class Value{constructor(p){Object.assign(this,p);}}class Graphic extends Value{constructor(p){super(p);created++;}}\n const view={ready:true,stationary:true,destroyed:false,map:{add:l=>layers.push(l),remove:l=>layers.splice(layers.indexOf(l),1)},ui:{add(){},remove(){}},watch(){return{remove(){}}},toScreen:()=>({x:10,y:10}),openPopup(p){this.popup=p;},closePopup(){this.popup=null;}};\n const owner=new ArcGISPlaces({id:'groups',url:'https://host/FeatureServer/0',modules:{GraphicsLayer:Layer,Graphic,Point:Value},view:()=>view,busy:()=>busy,geographic:x=>x,status(){},explore:async()=>{requests++;return[]},openImagery(){}});\n try{owner.controller.enabled=true;const places=Array.from({length:6},(_,i)=>({id:'p'+i,name:'Place '+i,category:'museum',group:'landmarks',lon:0,lat:0}));owner.display(places,view);assert.equal(layers[0].items.length,1);const target=owner.screenTarget({x:10,y:10});assert(target.startsWith('@places-group:'));assert.equal(owner.hoverLabel(owner.hit([{layer:layers[0],graphic:layers[0].items[0]}])),'6 places here · Click to choose');const marker=layers[0].items[0],base=marker.symbol;owner.setHover(target);const hovered=marker.symbol;assert.notEqual(hovered,base);assert.equal(hovered.width,base.width+3);assert.equal(base.width,18);owner.setHover(target);assert.equal(marker.symbol,hovered);owner.setHover(null);assert.equal(marker.symbol,base);const initialCreated=created;owner.regroup();assert.equal(created,initialCreated);assert(owner.open([],target));assert.equal(owner.selection.place,null);assert.equal(view.popup.title,'Nearby places');const list=view.popup.content.children[2],controls=view.popup.content.children[3];assert.equal(list.children.length,4);controls.children[2].onclick();assert.equal(list.children.length,2);assert.equal(list.children[0].children[1].children[0].textContent,'Place 4');assert(list.children[0].children[0].src.startsWith('data:image/svg+xml;'));assert.equal(list.children[0].children[1].children[1].textContent,'museum');list.children[0].onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(view.popup.title,'Nearby place');assert.equal(requests,0);assert(owner.screenTarget({x:10,y:10}).startsWith('@places-group:'),'selected badge retains access to overlapping places');assert(owner.open([],target));const chosenList=view.popup.content.children[2];assert.equal(view.popup.content.children[3].children[1].textContent,'2 / 2');assert.equal(chosenList.children[0].children[1].children[2].textContent,'Selected');assert.equal(owner.selection.place.id,'p4');const staleRow=chosenList.children[1];owner.clear();staleRow.onclick();assert.equal(owner.selection.place.id,'p4');assert.equal(requests,0);const before=created;busy=true;owner.regroup();assert.equal(created,before);assert.equal(owner.groups.size,0);\n }finally{owner.dispose();global.document=oldDocument;global.window=oldWindow;}\n});\ntest('category preferences are validated, scoped and safe when browser storage is blocked',()=>{\n const preferences=load('placePreferences'),data=new Map(),store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)},url='https://host/FeatureServer/0';const key=preferences.placePreferenceKey('w','/experience/0',url);assert(key);preferences.savePlaceCategory(()=>store,key,'parks');assert.equal(preferences.readPlaceCategory(()=>store,key),'parks');assert.notEqual(key,preferences.placePreferenceKey('w','/experience/1',url));assert.notEqual(key,preferences.placePreferenceKey('other','/experience/0',url));assert.notEqual(key,preferences.placePreferenceKey('w','/experience/0','https://host/FeatureServer/1'));assert.equal(preferences.placePreferenceKey('w','/experience/0',url+'?token=secret'),null);data.set(key,'<script>');assert.equal(preferences.readPlaceCategory(()=>store,key),'all');assert.equal(preferences.readPlaceCategory(()=>{throw Error('blocked')},key,'education'),'education');assert.doesNotThrow(()=>preferences.savePlaceCategory(()=>{throw Error('blocked')},key,'parks'));preferences.savePlaceCategory(()=>store,key,'all');assert.equal(data.get(key),'all');preferences.savePlaceCategory(()=>store,key,'invalid');assert.equal(data.get(key),'all');\n"
            },
            {
              "label": "hover feedback 3",
              "before": "  view.destroyed=true;w.goToSelectedPlace();view.destroyed=false;view.ready=false;w.goToSelectedPlace();view.ready=true;\n  w.state={...w.state,placesActive:false};w.goToSelectedPlace();w.state={...w.state,placesActive:true,selectedPlace:null};w.goToSelectedPlace();w.state={...w.state,selectedPlace:{lon:Infinity,lat:0}};w.goToSelectedPlace();assert.equal(calls,3);\n }\n});\n",
              "after": "  view.destroyed=true;w.goToSelectedPlace();view.destroyed=false;view.ready=false;w.goToSelectedPlace();view.ready=true;\n  w.state={...w.state,placesActive:false};w.goToSelectedPlace();w.state={...w.state,placesActive:true,selectedPlace:null};w.goToSelectedPlace();w.state={...w.state,selectedPlace:{lon:Infinity,lat:0}};w.goToSelectedPlace();assert.equal(calls,3);\n }\n});\ntest('POI hover reuses one SDK hit test and keeps its label when coverage resolves earlier or later',async()=>{\n let callback;function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)==='view.on'&&n.arguments[0]?.text==='pointer-move')callback=n.arguments[1];ts.forEachChild(n,visit);}visit(sf);assert(callback);\n for(const late of [false,true]){\n  let task,resolveCoverage,label='',tests=0,hovered=null;\n  const view={zoom:16,container:{getBoundingClientRect:()=>({left:0,top:0,right:400,bottom:400})}},place={id:'p',name:'Library',category:'public_library'};\n  const picked={attributes:{image_id:'coverage'}};\n  const w={state:{jimuMapView:{view},turboModeActive:true},turboCoverageLayer:{},tooltipDiv:{},_places:{hit:()=>place,hoverLabel:()=> 'Library · public library',setHover:id=>hovered=id},hitTestHoverLayers:async()=>{tests++;return{results:[]}},pickTurboGraphic:()=>late?new Promise(r=>resolveCoverage=r):Promise.resolve(picked),pickMapFeature:async()=>null,clearTurboHoverDetails:()=>label='',updateTurboHover:()=>label='coverage'};\n  const handler=new Function('TURBO_LIMITS','renderMapFeatureHoverLabel','setTimeout','clearTimeout','window','view',compile('let hoverHitTestTimeout=null; return '+callback.getText(sf))).call(w,{hoverRadiusPx:8,pickRadiusPx:10},(host,text)=>label=text,work=>{task=work;return 1},()=>{},{innerWidth:400,innerHeight:400},view);\n  handler({x:20,y:20});await task();if(late){resolveCoverage(picked);await flush();}\n  assert.equal(tests,1);assert.equal(label,'Library · public library');assert.equal(hovered,'p');\n }\n});\n"
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
              "label": "hover feedback 1",
              "before": "\n## v6.61 · Overlapping-place chooser\n\nCount-badge choosers show the existing local category icon, a readable place name and a separate category line. Names take at most two lines, with full text in the accessible action label and hover title. The current selection has a gold accent, Selected badge and aria-current marker. Reopening a group starts on the selected member’s page, if present. Four rows per page, alphabetical ordering, explicit details navigation and stale-popup guards remain. Names/categories use textContent and icons use the application-owned SVG set. No new request, thumbnail, dependency or background work is added; neutral styling leaves the SDK popup shell unchanged.\n",
              "after": "\n## v6.61 · Overlapping-place chooser\n\nCount-badge choosers show the existing local category icon, a readable place name and a separate category line. Names take at most two lines, with full text in the accessible action label and hover title. The current selection has a gold accent, Selected badge and aria-current marker. Reopening a group starts on the selected member’s page, if present. Four rows per page, alphabetical ordering, explicit details navigation and stale-popup guards remain. Names/categories use textContent and icons use the application-owned SVG set. No new request, thumbnail, dependency or background work is added; neutral styling leaves the SDK popup shell unchanged.\n\n## v6.62 · POI hover feedback\n\nThe existing shared map tooltip shows a place’s name and readable category, or a group count with Click to choose. Object/sign picking keeps priority; a direct loaded POI hit takes precedence over a nearby coverage hover. The same existing SDK hit test is reused. Hover enlarges only the existing local marker by 3pt in each dimension using a cloned symbol, leaving cached symbols and the gold selected marker unchanged. Repeated hits reuse the temporary symbol. Hover restores on exit, another feature, hiding/pausing, redraw, selection or disposal. No extra graphic, query, request, timer or animation loop is added. Touch selection remains click-driven.\n"
            }
          ]
        }
      ]
    }
  ]
};

const root = fs.realpathSync(process.cwd());
const normalize = value => String(value).replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
const count = (text, fragment) => text.split(fragment).length - 1;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const noFollow = fs.constants.O_NOFOLLOW || 0;
const prefix = 'places-hover-feedback-v6-62-';

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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed v6.62 installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'places-hover-feedback-v6-62' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after v6.62 installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after v6.62 installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed v6.62 installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-places-hover-feedback-v6-62.cjs [--dry-run] [--uninstall]');
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Places hover feedback v6.62 is already installed. No files changed.');
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
  const manifest = { installer: 'places-hover-feedback-v6-62', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Places hover feedback v6.62 ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
