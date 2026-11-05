#!/usr/bin/env node
'use strict';
/**
 * Infobox export and bottom spacing confirmation. Compatible current v6 sources.
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
      "file": "src/components/InfoBox.tsx",
      "variants": [
        {
          "blocks": [
            {
              "label": "Infobox export and bottom spacing 1",
              "before": "            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />\n          )}\n\n          <div ref={this.detectionControlsRef} style={{display:\"grid\",gap:4,minWidth:0,paddingInline:4,boxSizing:\"border-box\"}}>\n          <DetectionToolsSection\n            trafficSignsActive={trafficSignsActive}\n            objectsActive={objectsActive}\n",
              "after": "            <ElevationToolsSection isElevationProfileActive={this.props.isElevationProfileActive} onToggleElevationProfile={this.props.onToggleElevationProfile} />\n          )}\n\n          <div ref={this.detectionControlsRef} style={{display:\"grid\",gap:4,minWidth:0,paddingInline:4,paddingBottom:4,boxSizing:\"border-box\"}}>\n          <DetectionToolsSection\n            trafficSignsActive={trafficSignsActive}\n            objectsActive={objectsActive}\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/styles/detectionControls.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Infobox export and bottom spacing 1",
              "before": " color:'#fff',border:'1px solid #648b7366',borderRadius:5,background:'rgba(55,213,130,0.3)',cursor:'pointer',\n transition:'background-color 120ms ease,border-color 120ms ease',pointerEvents:'auto'};\nexport const detectionExportButtonStyle:React.CSSProperties={...button};\nexport const detectionExportLabelStyle:React.CSSProperties={fontWeight:700};\nexport function detectionOverlayButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}\nexport const detectionOverlayLabelStyle:React.CSSProperties={fontSize:9,fontWeight:700};\nexport function detectionLabelsButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}\nexport const detectionControlsCss=`\n.mly-detection-button > svg { flex-shrink:0; width:12px; height:12px; }\n.mly-detection-button:focus-visible { outline:2px solid #c5f6d6; outline-offset:1px; }\n.mly-detection-button:disabled { opacity:.55; cursor:wait; }\n",
              "after": " color:'#fff',border:'1px solid #648b7366',borderRadius:5,background:'rgba(55,213,130,0.3)',cursor:'pointer',\n transition:'background-color 120ms ease,border-color 120ms ease',pointerEvents:'auto'};\nexport const detectionExportButtonStyle:React.CSSProperties={...button};\nexport const detectionExportLabelStyle:React.CSSProperties={fontWeight:700,minWidth:0,overflow:'hidden',textOverflow:'ellipsis'};\nexport function detectionOverlayButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}\nexport const detectionOverlayLabelStyle:React.CSSProperties={fontSize:9,fontWeight:700};\nexport function detectionLabelsButtonStyle(active:boolean):React.CSSProperties{return {...button,background:active?'rgba(55,213,130,0.8)':button.background};}\nexport const detectionControlsCss=`\n.mly-info-panel .mly-info-more .mly-detection-export > span { white-space:nowrap !important; overflow-wrap:normal; }\n.mly-detection-button > svg { flex-shrink:0; width:12px; height:12px; }\n.mly-detection-button:focus-visible { outline:2px solid #c5f6d6; outline-offset:1px; }\n.mly-detection-button:disabled { opacity:.55; cursor:wait; }\n"
            }
          ]
        }
      ]
    },
    {
      "file": "src/i18n/runtimeMessages.ts",
      "variants": [
        {
          "blocks": [
            {
              "label": "Infobox export and bottom spacing 1",
              "before": " \"uiClickToShowAllQualityBands\": \"Click to show all quality bands\",\n \"uiExportActiveSignsAndObjectsWithinTheMap\": \"Export active signs and objects within the map bounding box, using current filters\",\n \"uiExporting\": \"EXPORTING\u2026\",\n \"uiExportArea\": \"EXPORT AREA\",\n \"uiShowOrHideDetectionOutlines\": \"Show or hide detection outlines\",\n \"uiDetectionOutlines\": \"Detection outlines\",\n \"uiAiOverlay\": \"AI OVERLAY\",\n",
              "after": " \"uiClickToShowAllQualityBands\": \"Click to show all quality bands\",\n \"uiExportActiveSignsAndObjectsWithinTheMap\": \"Export active signs and objects within the map bounding box, using current filters\",\n \"uiExporting\": \"EXPORTING\u2026\",\n \"uiExportArea\": \"Export data\",\n \"uiShowOrHideDetectionOutlines\": \"Show or hide detection outlines\",\n \"uiDetectionOutlines\": \"Detection outlines\",\n \"uiAiOverlay\": \"AI OVERLAY\",\n"
            }
          ]
        }
      ]
    },
    {
      "file": "tests/panelControls.browser.cjs",
      "variants": [
        {
          "blocks": [
            {
              "label": "Infobox export and bottom spacing 1",
              "before": " const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n",
              "after": " const analyse=page.locator('.mly-coverage-analysis-trigger button');await analyse.waitFor({state:'visible'});await exportButton.scrollIntoViewIfNeeded();\n const layout=await page.evaluate(()=>{const analyse=document.querySelector('.mly-coverage-analysis-trigger button'),exportButton=document.querySelector('.mly-detection-export'),a=analyse.getBoundingClientRect(),e=exportButton.getBoundingClientRect();return {gap:e.top-a.bottom,left:Math.abs(e.left-a.left),width:Math.abs(e.width-a.width),height:a.height,font:getComputedStyle(analyse).fontSize}});\n assert(layout.gap>=6);assert(layout.left<1&&layout.width<1);assert(layout.height>=24&&layout.font==='9px');checks++;\n assert.equal(await exportButton.innerText(),'Export data');assert.equal(await exportButton.locator('span').evaluate(node=>getComputedStyle(node).whiteSpace),'nowrap');assert.equal(await labelsButton.count(),0);await page.evaluate(()=>window.renderInfo({detectionsActive:true}));await labelsButton.waitFor({state:'visible'});const bottomInset=await labelsButton.evaluate(node=>{const group=node.parentElement;return group.getBoundingClientRect().bottom-node.getBoundingClientRect().bottom});assert(bottomInset>=4);checks++;\n\n trace('spacing done '+mobile);const bar=page.getByRole('scrollbar',{name:'Scroll filters horizontally'});await bar.waitFor({state:'visible'});const scroll=page.locator('.mly-filter-scroll'),thumb=page.locator('.mly-filter-progress > span');const initial=await scroll.evaluate(e=>e.scrollLeft);await page.evaluate(()=>{window.mapPointerDowns=0;document.addEventListener('pointerdown',()=>window.mapPointerDowns++)});const b=await thumb.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+1);await page.mouse.down();await page.mouse.move(b.x+b.width/2+60,b.y-20,{steps:6});await page.mouse.up();assert((await scroll.evaluate(e=>e.scrollLeft))>initial+100,'Dragging thumb outside its hit area must scroll');checks++;assert.equal(await page.evaluate(()=>window.mapPointerDowns),0,'Track dragging must not bubble into map gestures');\n if(mobile){await bar.press('Home');const box=await thumb.boundingBox(),cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+1,id:1}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width/2+i*10,y:box.y+1,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert((await scroll.evaluate(e=>e.scrollLeft))>100,'Touch dragging must scroll');await cdp.detach();checks++;}\n\n"
            }
          ]
        }
      ]
    },
    {
      "file": "docs/localization/translations.csv",
      "variants": [
        {
          "blocks": [
            {
              "label": "Infobox export and bottom spacing 1",
              "before": "\"runtime\",\"uiClickToShowAllQualityBands\",\"Click to show all quality bands\",\"Click to show all quality bands\",\"\u0627\u0646\u0642\u0631 \u0644\u0625\u0638\u0647\u0627\u0631 \u0643\u0627\u0641\u0629 \u0646\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u062c\u0648\u062f\u0629\",\"T\u00fcm kalite gruplar\u0131n\u0131 g\u00f6stermek i\u00e7in t\u0131klay\u0131n\",\"Haz clic para mostrar todos los niveles de calidad\",\"Cliquez pour afficher tous les niveaux de qualit\u00e9\",\"Klicken, um alle Qualit\u00e4tsstufen anzuzeigen\",\"Clique para mostrar todas as faixas de qualidade\",\"Fai clic per mostrare tutte le fasce di qualit\u00e0\",\"\u30af\u30ea\u30c3\u30af\u3057\u3066\u3059\u3079\u3066\u306e\u54c1\u8cea\u533a\u5206\u3092\u8868\u793a\",\"\ud074\ub9ad\ud558\uc5ec \ubaa8\ub4e0 \ud488\uc9c8 \uad6c\uac04 \ud45c\uc2dc\",\"\u70b9\u51fb\u663e\u793a\u6240\u6709\u8d28\u91cf\u7b49\u7ea7\",\"\u6309\u4e00\u4e0b\u986f\u793a\u6240\u6709\u54c1\u8cea\u7b49\u7d1a\"\n\"runtime\",\"uiExportActiveSignsAndObjectsWithinTheMap\",\"Export active signs and objects within the map bounding box, using current filters\",\"Export active signs and objects within the map bounding box, using current filters\",\"\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u0631\u0628\u0639 \u0627\u0644\u0645\u062d\u064a\u0637 \u0628\u0627\u0644\u062e\u0631\u064a\u0637\u0629\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\",\"Ge\u00e7erli filtrelerle haritan\u0131n s\u0131n\u0131r kutusundaki etkin i\u015faretleri ve nesneleri d\u0131\u015fa aktar\",\"Exportar se\u00f1ales y objetos activos dentro de los l\u00edmites del mapa con los filtros actuales\",\"Exporter les panneaux et objets actifs dans l\u2019emprise de la carte avec les filtres actuels\",\"Aktive Verkehrszeichen und Objekte innerhalb des Kartenausschnitts mit den aktuellen Filtern exportieren\",\"Exportar placas e objetos ativos dentro dos limites do mapa usando os filtros atuais\",\"Esporta segnali e oggetti attivi entro i limiti della mappa usando i filtri correnti\",\"\u73fe\u5728\u306e\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u9069\u7528\u3057\u3066\u3001\u30de\u30c3\u30d7\u7bc4\u56f2\u5185\u306e\u6709\u52b9\u306a\u6a19\u8b58\u3068\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\ud604\uc7ac \ud544\ud130\ub97c \uc801\uc6a9\ud574 \uc9c0\ub3c4 \ubc94\uc704 \uc548\uc758 \ud65c\uc131 \ud45c\uc9c0\ud310\uacfc \uac1d\uccb4 \ub0b4\ubcf4\ub0b4\uae30\",\"\u6309\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u5bfc\u51fa\u5730\u56fe\u8303\u56f4\u5185\u7684\u6d3b\u52a8\u6807\u5fd7\u548c\u5bf9\u8c61\",\"\u6309\u76ee\u524d\u7be9\u9078\u689d\u4ef6\u532f\u51fa\u5730\u5716\u7bc4\u570d\u5167\u7684\u6d3b\u52d5\u6a19\u8a8c\u548c\u7269\u4ef6\"\n\"runtime\",\"uiExporting\",\"EXPORTING\u2026\",\"EXPORTING\u2026\",\"\u062a\u0635\u062f\u064a\u0631 ...\",\"AKTARILIYOR\u2026\",\"EXPORTANDO\u2026\",\"EXPORT EN COURS\u2026\",\"EXPORT L\u00c4UFT\u2026\",\"EXPORTANDO\u2026\",\"ESPORTAZIONE\u2026\",\"\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\u4e2d\u2026\",\"\ub0b4\ubcf4\ub0b4\ub294 \uc911\u2026\",\"\u6b63\u5728\u5bfc\u51fa\u2026\",\"\u6b63\u5728\u532f\u51fa\u2026\"\n\"runtime\",\"uiExportArea\",\"EXPORT AREA\",\"EXPORT AREA\",\"\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062a\u0635\u062f\u064a\u0631\",\"ALANI DI\u015eA AKTAR\",\"EXPORTAR \u00c1REA\",\"EXPORTER LA ZONE\",\"GEBIET EXPORTIEREN\",\"EXPORTAR \u00c1REA\",\"ESPORTA AREA\",\"\u7bc4\u56f2\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\uc601\uc5ed \ub0b4\ubcf4\ub0b4\uae30\",\"\u5bfc\u51fa\u533a\u57df\",\"\u532f\u51fa\u5340\u57df\"\n\"runtime\",\"uiShowOrHideDetectionOutlines\",\"Show or hide detection outlines\",\"Show or hide detection outlines\",\"\u0625\u0638\u0647\u0627\u0631 \u0623\u0648 \u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0639\u0631\u064a\u0636\u0629 \u0644\u0644\u0643\u0634\u0641\",\"Tespit s\u0131n\u0131rlar\u0131n\u0131 g\u00f6ster veya gizle\",\"Mostrar u ocultar contornos de detecci\u00f3n\",\"Afficher ou masquer les contours des d\u00e9tections\",\"Erkennungsumrisse ein- oder ausblenden\",\"Mostrar ou ocultar contornos de detec\u00e7\u00e3o\",\"Mostra o nascondi i contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\u3092\u8868\u793a\u30fb\u975e\u8868\u793a\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120 \ud45c\uc2dc \ub610\ub294 \uc228\uae30\uae30\",\"\u663e\u793a\u6216\u9690\u85cf\u68c0\u6d4b\u8f6e\u5ed3\",\"\u986f\u793a\u6216\u96b1\u85cf\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiDetectionOutlines\",\"Detection outlines\",\"Detection outlines\",\"\u0645\u062e\u0637\u0637\u0627\u062a \u0627\u0644\u0643\u0634\u0641 \u0639\u0646\",\"Tespit s\u0131n\u0131rlar\u0131\",\"Contornos de detecci\u00f3n\",\"Contours des d\u00e9tections\",\"Erkennungsumrisse\",\"Contornos de detec\u00e7\u00e3o\",\"Contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120\",\"\u68c0\u6d4b\u8f6e\u5ed3\",\"\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiAiOverlay\",\"AI OVERLAY\",\"AI OVERLAY\",\"\u062a\u0631\u0627\u0643\u0628 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\",\"YAPAY ZEK\u00c2 KATMANI\",\"SUPERPOSICI\u00d3N DE IA\",\"SUPERPOSITION IA\",\"KI-\u00dcBERLAGERUNG\",\"SOBREPOSI\u00c7\u00c3O DE IA\",\"SOVRAPPOSIZIONE IA\",\"AI\u30aa\u30fc\u30d0\u30fc\u30ec\u30a4\",\"AI \uc624\ubc84\ub808\uc774\",\"AI \u53e0\u52a0\u5c42\",\"AI \u758a\u52a0\u5c64\"\n",
              "after": "\"runtime\",\"uiClickToShowAllQualityBands\",\"Click to show all quality bands\",\"Click to show all quality bands\",\"\u0627\u0646\u0642\u0631 \u0644\u0625\u0638\u0647\u0627\u0631 \u0643\u0627\u0641\u0629 \u0646\u0637\u0627\u0642\u0627\u062a \u0627\u0644\u062c\u0648\u062f\u0629\",\"T\u00fcm kalite gruplar\u0131n\u0131 g\u00f6stermek i\u00e7in t\u0131klay\u0131n\",\"Haz clic para mostrar todos los niveles de calidad\",\"Cliquez pour afficher tous les niveaux de qualit\u00e9\",\"Klicken, um alle Qualit\u00e4tsstufen anzuzeigen\",\"Clique para mostrar todas as faixas de qualidade\",\"Fai clic per mostrare tutte le fasce di qualit\u00e0\",\"\u30af\u30ea\u30c3\u30af\u3057\u3066\u3059\u3079\u3066\u306e\u54c1\u8cea\u533a\u5206\u3092\u8868\u793a\",\"\ud074\ub9ad\ud558\uc5ec \ubaa8\ub4e0 \ud488\uc9c8 \uad6c\uac04 \ud45c\uc2dc\",\"\u70b9\u51fb\u663e\u793a\u6240\u6709\u8d28\u91cf\u7b49\u7ea7\",\"\u6309\u4e00\u4e0b\u986f\u793a\u6240\u6709\u54c1\u8cea\u7b49\u7d1a\"\n\"runtime\",\"uiExportActiveSignsAndObjectsWithinTheMap\",\"Export active signs and objects within the map bounding box, using current filters\",\"Export active signs and objects within the map bounding box, using current filters\",\"\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0639\u0644\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0643\u0627\u0626\u0646\u0627\u062a \u0627\u0644\u0646\u0634\u0637\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u0631\u0628\u0639 \u0627\u0644\u0645\u062d\u064a\u0637 \u0628\u0627\u0644\u062e\u0631\u064a\u0637\u0629\u060c \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062a\u0635\u0641\u064a\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629\",\"Ge\u00e7erli filtrelerle haritan\u0131n s\u0131n\u0131r kutusundaki etkin i\u015faretleri ve nesneleri d\u0131\u015fa aktar\",\"Exportar se\u00f1ales y objetos activos dentro de los l\u00edmites del mapa con los filtros actuales\",\"Exporter les panneaux et objets actifs dans l\u2019emprise de la carte avec les filtres actuels\",\"Aktive Verkehrszeichen und Objekte innerhalb des Kartenausschnitts mit den aktuellen Filtern exportieren\",\"Exportar placas e objetos ativos dentro dos limites do mapa usando os filtros atuais\",\"Esporta segnali e oggetti attivi entro i limiti della mappa usando i filtri correnti\",\"\u73fe\u5728\u306e\u30d5\u30a3\u30eb\u30bf\u30fc\u3092\u9069\u7528\u3057\u3066\u3001\u30de\u30c3\u30d7\u7bc4\u56f2\u5185\u306e\u6709\u52b9\u306a\u6a19\u8b58\u3068\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\ud604\uc7ac \ud544\ud130\ub97c \uc801\uc6a9\ud574 \uc9c0\ub3c4 \ubc94\uc704 \uc548\uc758 \ud65c\uc131 \ud45c\uc9c0\ud310\uacfc \uac1d\uccb4 \ub0b4\ubcf4\ub0b4\uae30\",\"\u6309\u5f53\u524d\u7b5b\u9009\u6761\u4ef6\u5bfc\u51fa\u5730\u56fe\u8303\u56f4\u5185\u7684\u6d3b\u52a8\u6807\u5fd7\u548c\u5bf9\u8c61\",\"\u6309\u76ee\u524d\u7be9\u9078\u689d\u4ef6\u532f\u51fa\u5730\u5716\u7bc4\u570d\u5167\u7684\u6d3b\u52d5\u6a19\u8a8c\u548c\u7269\u4ef6\"\n\"runtime\",\"uiExporting\",\"EXPORTING\u2026\",\"EXPORTING\u2026\",\"\u062a\u0635\u062f\u064a\u0631 ...\",\"AKTARILIYOR\u2026\",\"EXPORTANDO\u2026\",\"EXPORT EN COURS\u2026\",\"EXPORT L\u00c4UFT\u2026\",\"EXPORTANDO\u2026\",\"ESPORTAZIONE\u2026\",\"\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\u4e2d\u2026\",\"\ub0b4\ubcf4\ub0b4\ub294 \uc911\u2026\",\"\u6b63\u5728\u5bfc\u51fa\u2026\",\"\u6b63\u5728\u532f\u51fa\u2026\"\n\"runtime\",\"uiExportArea\",\"Export data\",\"Export data\",\"\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u062a\u0635\u062f\u064a\u0631\",\"ALANI DI\u015eA AKTAR\",\"EXPORTAR \u00c1REA\",\"EXPORTER LA ZONE\",\"GEBIET EXPORTIEREN\",\"EXPORTAR \u00c1REA\",\"ESPORTA AREA\",\"\u7bc4\u56f2\u3092\u30a8\u30af\u30b9\u30dd\u30fc\u30c8\",\"\uc601\uc5ed \ub0b4\ubcf4\ub0b4\uae30\",\"\u5bfc\u51fa\u533a\u57df\",\"\u532f\u51fa\u5340\u57df\"\n\"runtime\",\"uiShowOrHideDetectionOutlines\",\"Show or hide detection outlines\",\"Show or hide detection outlines\",\"\u0625\u0638\u0647\u0627\u0631 \u0623\u0648 \u0625\u062e\u0641\u0627\u0621 \u0627\u0644\u062e\u0637\u0648\u0637 \u0627\u0644\u0639\u0631\u064a\u0636\u0629 \u0644\u0644\u0643\u0634\u0641\",\"Tespit s\u0131n\u0131rlar\u0131n\u0131 g\u00f6ster veya gizle\",\"Mostrar u ocultar contornos de detecci\u00f3n\",\"Afficher ou masquer les contours des d\u00e9tections\",\"Erkennungsumrisse ein- oder ausblenden\",\"Mostrar ou ocultar contornos de detec\u00e7\u00e3o\",\"Mostra o nascondi i contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\u3092\u8868\u793a\u30fb\u975e\u8868\u793a\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120 \ud45c\uc2dc \ub610\ub294 \uc228\uae30\uae30\",\"\u663e\u793a\u6216\u9690\u85cf\u68c0\u6d4b\u8f6e\u5ed3\",\"\u986f\u793a\u6216\u96b1\u85cf\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiDetectionOutlines\",\"Detection outlines\",\"Detection outlines\",\"\u0645\u062e\u0637\u0637\u0627\u062a \u0627\u0644\u0643\u0634\u0641 \u0639\u0646\",\"Tespit s\u0131n\u0131rlar\u0131\",\"Contornos de detecci\u00f3n\",\"Contours des d\u00e9tections\",\"Erkennungsumrisse\",\"Contornos de detec\u00e7\u00e3o\",\"Contorni dei rilevamenti\",\"\u691c\u51fa\u306e\u8f2a\u90ed\",\"\ud0d0\uc9c0 \uc724\uacfd\uc120\",\"\u68c0\u6d4b\u8f6e\u5ed3\",\"\u5075\u6e2c\u8f2a\u5ed3\"\n\"runtime\",\"uiAiOverlay\",\"AI OVERLAY\",\"AI OVERLAY\",\"\u062a\u0631\u0627\u0643\u0628 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a\",\"YAPAY ZEK\u00c2 KATMANI\",\"SUPERPOSICI\u00d3N DE IA\",\"SUPERPOSITION IA\",\"KI-\u00dcBERLAGERUNG\",\"SOBREPOSI\u00c7\u00c3O DE IA\",\"SOVRAPPOSIZIONE IA\",\"AI\u30aa\u30fc\u30d0\u30fc\u30ec\u30a4\",\"AI \uc624\ubc84\ub808\uc774\",\"AI \u53e0\u52a0\u5c42\",\"AI \u758a\u52a0\u5c64\"\n"
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
const prefix = 'infobox-export-bottom-spacing-';

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
      if (entry.content !== undefined && next !== normalize(entry.content)) continue;
      if (entry.required && !entry.required.every(fragment => next.includes(fragment))) continue;
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
  if (!fs.existsSync(backupRoot)) throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
  const candidates = fs.readdirSync(backupRoot).filter(name => name.startsWith(prefix) && !name.startsWith(prefix + 'uninstall-')).sort().reverse();
  const allowed = new Set(payload.entries.map(entry => entry.file));
  for (const name of candidates) {
    const relative = '.refactor-backups/' + name;
    const metadata = readTarget(relative + '/changes.json');
    if (!metadata.bytes) continue;
    const manifest = JSON.parse(metadata.bytes.toString('utf8'));
    if (manifest.installer !== 'infobox-export-bottom-spacing' || !manifest.completed || manifest.uninstall) continue;
    const writes = [], seen = new Set();
    for (const change of manifest.changes) {
      if (!allowed.has(change.file) || seen.has(change.file)) throw new Error('Invalid backup manifest. No files changed.');
      seen.add(change.file);
      const current = readTarget(change.file, change.originalSha256 !== null && change.resultSha256 !== null);
      if (change.originalSha256 === null) {
        if (current.bytes === null) continue;
        if (digest(current.bytes) !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
        writes.push({ ...current, relative: change.file, original: current.bytes, content: null });
        continue;
      }
      const original = readTarget(relative + '/' + change.file, true).bytes;
      if (digest(original) !== change.originalSha256) throw new Error('Backup checksum mismatch: ' + change.file);
      if (change.resultSha256 === null) {
        if (current.bytes === null) writes.push({ ...current, relative: change.file, original: null, content: original });
        else if (digest(current.bytes) !== change.originalSha256) conflict(change.file + ' (replacement at removed component path)');
        continue;
      }
      const currentHash = digest(current.bytes);
      if (currentHash === change.originalSha256) continue;
      if (currentHash !== change.resultSha256) conflict(change.file + ' (edited after collaboration workspaces upgrade installation)');
      writes.push({ ...current, relative: change.file, original: current.bytes, content: original });
    }
    return writes;
  }
  throw new Error('No completed collaboration workspaces upgrade installation backup found. No files changed.');
}

try {
  if (args.some(arg => !['--dry-run', '--uninstall'].includes(arg))) throw new Error('Usage: node apply-infobox-export-bottom-spacing.cjs [--dry-run] [--uninstall]');
  readTarget('src/runtime/widget.tsx', true);
  let writes;
  if (uninstall) writes = uninstallWrites();
  else {
    const seen = new Set(); writes = [];
    for (const entry of payload.entries) {
      if (seen.has(entry.file)) throw new Error('Duplicate patch path: ' + entry.file);
      seen.add(entry.file);
      if (entry.removeIfContent !== undefined) {
        const current = readTarget(entry.file);
        if (current.bytes === null) continue;
        if (normalize(current.bytes.toString('utf8')) !== normalize(entry.removeIfContent)) conflict(entry.file + ' (edited retired component)');
        writes.push({ ...current, relative: entry.file, original: current.bytes, content: null });
        continue;
      }
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
    console.log(uninstall ? 'V6 is already uninstalled. No files changed.' : 'Infobox export and bottom spacing confirmation is already installed. No files changed.');
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
  const manifest = { installer: 'infobox-export-bottom-spacing', uninstall, completed: false, changes: writes.map(item => ({ file: item.relative, originalSha256: item.original === null ? null : digest(item.original), resultSha256: item.content === null ? null : digest(item.content) })) };
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
  console.log('Infobox export and bottom spacing confirmation ' + (uninstall ? 'uninstalled' : 'installed') + '. Backup: ' + backupRelative);
  console.log('Rebuild/reload Experience Builder. Tests and the host build do not run in this installer.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
