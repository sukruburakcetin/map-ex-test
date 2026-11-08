/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../i18n/WidgetLocale';

export const PlaceQualityControls: React.FC<{ minimum: number | null; hideClosed: boolean; onChange(minimum: number | null, hideClosed: boolean): void }> = props => {
  const { t } = useWidgetLocale();
  const [draft, setDraft] = React.useState(String(props.minimum ?? .5));
  const value = React.useRef(props.minimum ?? .5), applied = React.useRef(props.minimum);
  React.useEffect(() => { applied.current = props.minimum; if (props.minimum !== null) { value.current = props.minimum; setDraft(String(props.minimum)); } }, [props.minimum]);
  const all = props.minimum === null;
  const commit = () => {
    const minimum = Number(draft);
    if (all || draft.trim() === '' || !Number.isFinite(minimum) || minimum < 0 || minimum > 1) { setDraft(String(value.current)); return; }
    value.current = minimum;
    if (minimum !== applied.current) { applied.current = minimum; props.onChange(minimum, props.hideClosed); }
  };
  const changeMode = (checked: boolean) => { const minimum = checked ? null : value.current; applied.current = minimum; props.onChange(minimum, props.hideClosed); };
  return <div style={{ marginTop:8 }}>
    <style>{qualityCss}</style>
    <div>{t('uiPoiMinimumConfidence')}</div>
    <label className="mly-poi-check-label"><input className="mly-poi-check" type="checkbox" checked={all} onChange={event=>changeMode(event.target.checked)}/>{t('uiPoiAllScores')}</label>
    <div style={{display:'flex',alignItems:'center',gap:7,opacity:all?.45:1}}>
      <input className="mly-poi-range" type="range" min={0} max={1} step={.01} disabled={all} aria-label={t('uiPoiMinimumConfidence')} value={Number(draft) || 0}
        onChange={event=>setDraft(event.target.value)} onPointerUp={commit} onPointerCancel={()=>setDraft(String(value.current))} onKeyUp={event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key))commit();}} onBlur={commit}/>
      <input type="number" min={0} max={1} step="any" disabled={all} aria-label={t('uiPoiMinimumConfidence')} value={draft}
        onChange={event=>setDraft(event.target.value)} onBlur={event=>{if(event.currentTarget.checkValidity())commit();else {event.currentTarget.reportValidity();setDraft(String(value.current));}}} onKeyDown={event=>{if(event.key==='Enter'){event.preventDefault();event.currentTarget.blur();}}}
        style={{boxSizing:'border-box',width:60,minHeight:32,padding:'4px',background:'#213c2e',color:'inherit',border:'1px solid #72947d',borderRadius:4}}/>
    </div>
    <div style={{fontSize:9,lineHeight:1.4,opacity:.75,marginTop:3}}>{t('uiPoiConfidenceSliderHelp')}</div>
    <label className="mly-poi-check-label"><input className="mly-poi-check" type="checkbox" checked={props.hideClosed} onChange={event=>props.onChange(applied.current,event.target.checked)}/>{t('uiPoiHideClosed')}</label>
  </div>;
};
const qualityCss = `
.mly-poi-check-label{display:flex;gap:7px;align-items:center;margin:7px 0;min-height:28px;cursor:pointer}
.mly-poi-check{appearance:none;flex-shrink:0;width:15px;height:15px;margin:0;border:1px solid #72947d;border-radius:3px;background:#213c2e;cursor:pointer;display:grid;place-content:center}
.mly-poi-check:checked{background:#38694b;border-color:#a9cdb2}
.mly-poi-check:checked::after{content:'';width:7px;height:4px;border-left:2px solid #e3eddf;border-bottom:2px solid #e3eddf;transform:rotate(-45deg) translateY(-1px)}
.mly-poi-check:focus-visible,.mly-poi-range:focus-visible{outline:2px solid #b4d9bc;outline-offset:3px}
.mly-poi-range{width:100%;min-width:0;height:28px;margin:0;accent-color:#83b992;cursor:pointer}
.mly-poi-range:disabled{cursor:default}
@media(forced-colors:active){.mly-poi-check{appearance:auto}.mly-poi-check:checked::after{display:none}}
`;
