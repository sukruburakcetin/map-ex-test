/** @jsx jsx */
import { useWidgetLocale } from '../i18n/WidgetLocale';
import { React, jsx } from "jimu-core";
import { DetectionDisplayControls } from '../features/detections/DetectionDisplayControls';
import { CategoryMultiSelect } from '../features/detections/CategoryMultiSelect';
import { GlassSelect } from "../components/GlassSelect";
import { GlassDatePicker } from "../components/GlassDatePicker";
import { filterInputStyle, filterLabelStyle } from "../styles/filterBar";
import { FilterScrollRegion } from "./FilterScrollRegion";
import { FilterBarProps } from "./types";
import { organizationFilterId } from "../utils/organizationFilter";

/**
    * FilterBar
    * Collapsible glass-style filter panel shown above the control bar.
    * Contains three independent filter groups:
    *   - Turbo Mode filters (username, date range, pano toggle, colour-by-date)
    *   - Traffic Signs filter (GlassSelect dropdown)
    *   - Objects filter (GlassSelect dropdown)
    * Each group is only rendered when its corresponding `show*FilterBox` flag is true.
*/
export const FilterBar: React.FC<FilterBarProps> = ({
    appearanceStyle,
    signSpriteScale = 1, objectSpriteScale = 1, onSpriteScaleChange,
    detectionLabelZoom,
    signLabels = false, objectLabels = false, onDetectionLabelsChange,
    signReduceOverlap = false, objectReduceOverlap = false, onDetectionOverlapChange,
    signDisplayMode = 'selected', objectDisplayMode = 'selected', onDetectionDisplayModeChange,
    signOpacity = 1, objectOpacity = 1, onDetectionOpacityChange, onDetectionDisplayReset,
    trafficSignsSelectedCodes = null, objectsSelectedCodes = null, onTrafficSignCategoriesChange, onObjectCategoriesChange,
    showTurboFilterBox,
    showTrafficSignsFilterBox,
    showObjectsFilterBox,
    turboFilterUsername,
    turboFilterOrganization,
    turboFilterStartDate,
    turboFilterEndDate,
    turboFilterIsPano,
    turboFilterOnFoot,
    onTurboTravelMethodChange,
    turboColorByDate,
    turboCreator,
    turboOrganization,
    trafficSignsFilterValue,
    trafficSignsOptions,
    objectsFilterValue,
    objectsOptions,
    onTurboUsernameChange,
    onTurboUsernameEnter,
    onTurboUsernameClear,
    onTurboOrganizationChange,
    onTurboOrganizationEnter,
    onTurboOrganizationClear,
    onTurboStartDateChange,
    onTurboEndDateChange,
    onTurboIsPanoChange,
    onTurboColorByDateChange,
    onTrafficSignsFilterChange,
    onObjectsFilterChange,
}) => {
    const {t,owned} = useWidgetLocale();
    const changeDisplayMode = (kind:'signs'|'objects',mode:'selected'|'highlight') => {
      try{if(sessionStorage.getItem('mlyDisplayDebug')==='1')console.info('[Mapillary display mode]',JSON.stringify({stage:'filter-bar',kind,requested:mode,hasCallback:typeof onDetectionDisplayModeChange==='function'}));}catch{}
      onDetectionDisplayModeChange?.(kind,mode);
    };
    const signOptions = React.useMemo(() => (trafficSignsOptions || []).map(option => option.label === 'All traffic signs' ? {...option,label:t('uiAllSigns')} : {...option,label:owned(option.label)}), [trafficSignsOptions,t,owned]);
    const pointOptions = React.useMemo(() => (objectsOptions || []).map(option => option.label === 'All points' ? {...option,label:t('uiAllPoints')} : {...option,label:owned(option.label)}), [objectsOptions,t,owned]);
    if (!showTurboFilterBox && !showTrafficSignsFilterBox && !showObjectsFilterBox) {
        return null;
    }

    return (
        <FilterScrollRegion>
            {/* COVERAGE FILTERS */}
            {showTurboFilterBox && (
                <div className="mly-filter-group" role="group" aria-label={t('coverageFilters')}>

                    {/* Username input */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder={t('username')}
                            disabled={!!turboCreator}
                            value={turboFilterUsername}
                            className="glass-input-placeholder"
                            onChange={(e) => onTurboUsernameChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    onTurboUsernameEnter();
                                }
                            }}
                            style={{
                                ...filterInputStyle,
                                width: "80px",
                                minWidth: "60px",
                                height: "18px",
                                flexShrink: 1,
                                opacity: turboCreator ? 0.6 : 1,
                                cursor: turboCreator ? "not-allowed" : "text"
                            }}
                            autoFocus={!turboCreator}
                        />
                        {!turboCreator && turboFilterUsername && (
                            <button
                                onClick={onTurboUsernameClear}
                                style={{
                                    position: "absolute",
                                    right: "10px",
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--mly-theme-muted, rgba(255,255,255,0.6))",
                                    fontSize: "8px",
                                    cursor: "pointer",
                                    padding: 0,
                                    display: "flex"
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Organization input */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input type="text" inputMode="numeric" aria-label={t('organizationLabel')}
                            placeholder={t('organizationId')} value={turboFilterOrganization} disabled={!!turboOrganization}
                            aria-invalid={organizationFilterId(turboFilterOrganization) === -1}
                            title={turboOrganization ? t('organizationFixed') : t('organizationHelp')}
                            className="glass-input-placeholder"
                            onChange={event => onTurboOrganizationChange(event.target.value)}
                            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onTurboOrganizationEnter(); } }}
                            style={{ ...filterInputStyle, width: 112, minWidth: 90, height: 18, paddingRight: 18,
                                opacity: turboOrganization ? 0.6 : 1, cursor: turboOrganization ? "not-allowed" : "text",
                                ...(organizationFilterId(turboFilterOrganization) === -1 ? { outline: "1px solid #ff8c8c" } : {}) }} />
                        {!turboOrganization && turboFilterOrganization && <button type="button" aria-label={t('clearOrganization')}
                            title={t('clearOrganization')} onClick={onTurboOrganizationClear}
                            style={{ position: "absolute", right: 6, background: "transparent", border: "none", color: "var(--mly-theme-muted, rgba(255,255,255,0.6))", fontSize: 10, cursor: "pointer", padding: 0 }}>✕</button>}
                    </div>

                    {/* Date range */}
                    <div className="mly-filter-dates">
                        <GlassDatePicker floatingMenu
                            selected={turboFilterStartDate ? new Date(turboFilterStartDate) : null}
                            onChange={(date) => onTurboStartDateChange(date ? date.toISOString().split("T")[0] : "")}
                            isClearable
                            placeholderText={t('start')}
                        />
                        <GlassDatePicker floatingMenu
                            selected={turboFilterEndDate ? new Date(turboFilterEndDate) : null}
                            onChange={(date) => onTurboEndDateChange(date ? date.toISOString().split("T")[0] : "")}
                            isClearable
                            placeholderText={t('end')}
                        />
                    </div>

                    {/* Divider */}
                    <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />

                    {/* Is Pano toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={filterLabelStyle}>{t('pano')} </span>
                        <div className="mly-filter-pano" style={{ display: "flex", gap: "2px" }}>
                            {([
                                { label: t('all'), value: undefined },
                                { label: "360", value: true },
                                { label: t('flat'), value: false }
                            ] as { label: string; value: boolean | undefined }[]).map((opt) => {
                                const isActive = turboFilterIsPano === opt.value;
                                return (
                                    <button className="mly-text-action"
                                        key={opt.label}
                                        onClick={() => onTurboIsPanoChange(opt.value)}
                                        style={{
                                            padding: "1px 4px",
                                            fontSize: "8px",
                                            fontWeight: isActive ? 700 : 400,
                                            background: isActive ? "var(--mly-theme-selected, #2b8054)" : "var(--mly-theme-control, #183f2c)",
                                            border: isActive ? "1px solid #74c397" : "1px solid #456b58",
                                            borderRadius: "3px",
                                            color: "var(--mly-theme-text, white)",
                                            cursor: "pointer",
                                            transition: "all 0.15s ease"
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <label className="mly-filter-travel" style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                        <span style={filterLabelStyle}>{t('travel')} </span>
                        <select aria-label={t('travelMethod')} title={t('travelHelp')} value={turboFilterOnFoot === undefined ? "any" : turboFilterOnFoot ? "foot" : "other"} onChange={event => onTurboTravelMethodChange?.(event.target.value === "foot" ? true : event.target.value === "other" ? false : undefined)} style={{ height: 22, maxWidth: 96, padding: "0 3px", fontSize: 10, borderRadius: 4, border: "1px solid var(--mly-theme-border, #ffffff35)", background: "var(--mly-theme-control, #214d36)", color: "var(--mly-theme-text, white)" }}>
                            <option value="any">{t('any')} </option><option value="foot">{t('onFoot')}</option><option value="other">{t('otherTravel')}</option>
                        </select>
                    </label>

                    {/* Date colour toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={filterLabelStyle}>{t('dateColor')} </span>
                        <label style={{ position: "relative", display: "inline-block", width: "26px", height: "16px", marginBottom: 0, marginRight: "2px" }}>
                            <input
                                type="checkbox"
                                checked={turboColorByDate === true}
                                onChange={(e) => onTurboColorByDateChange(e.target.checked)}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: turboColorByDate ? "#4CAF50" : "rgba(255,255,255,0.2)",
                                borderRadius: "34px", transition: "0.3s"
                            }} />
                            <span style={{
                                position: "absolute", height: "12px", width: "12px",
                                left: turboColorByDate ? "14px" : "2px", bottom: "2px",
                                backgroundColor: "white", transition: "0.3s", borderRadius: "50%"
                            }} />
                        </label>
                    </div>
                </div>
            )}

            {/* TRAFFIC SIGN FILTERS */}
            {showTrafficSignsFilterBox && (
                <div className="mly-filter-group mly-filter-group--features" role="group" aria-label={t('signFilters')}>
                    {onTrafficSignCategoriesChange ? <CategoryMultiSelect appearanceStyle={appearanceStyle} label={t('signFilters')} allLabel={t('uiAllSigns')} options={signOptions} selected={trafficSignsSelectedCodes} onChange={onTrafficSignCategoriesChange}/> : <GlassSelect floatingMenu compact
                        value={trafficSignsFilterValue}
                        onChange={onTrafficSignsFilterChange}
                        options={signOptions}
                        accentColor="#63c38e"
                        menuPlacement="top"
                    />}
                    {onSpriteScaleChange && <DetectionDisplayControls appearanceStyle={appearanceStyle} zoom={detectionLabelZoom} label={t('sign')} scale={signSpriteScale} opacity={signOpacity} labels={signLabels} onLabels={enabled=>onDetectionLabelsChange?.('signs',enabled)} reduceOverlap={signReduceOverlap} onOverlap={reduce=>onDetectionOverlapChange?.('signs',reduce)} mode={signDisplayMode} onMode={mode=>changeDisplayMode('signs',mode)} onScale={value=>onSpriteScaleChange('signs',value)} onOpacity={value=>onDetectionOpacityChange?.('signs',value)} onReset={()=>onDetectionDisplayReset?.('signs')} />}
                </div>
            )}

            {/* OBJECT FILTERS */}
            {showObjectsFilterBox && (
                <div className="mly-filter-group mly-filter-group--features" role="group" aria-label={t('objectFilters')}>
                    {onObjectCategoriesChange ? <CategoryMultiSelect appearanceStyle={appearanceStyle} label={t('objectFilters')} allLabel={t('uiAllPoints')} options={pointOptions} selected={objectsSelectedCodes} onChange={onObjectCategoriesChange}/> : <GlassSelect floatingMenu compact
                        value={objectsFilterValue}
                        onChange={onObjectsFilterChange}
                        options={pointOptions}
                        accentColor="#63c38e"
                        menuPlacement="top"
                    />}
                    {onSpriteScaleChange && <DetectionDisplayControls appearanceStyle={appearanceStyle} zoom={detectionLabelZoom} label={t('object')} scale={objectSpriteScale} opacity={objectOpacity} labels={objectLabels} onLabels={enabled=>onDetectionLabelsChange?.('objects',enabled)} reduceOverlap={objectReduceOverlap} onOverlap={reduce=>onDetectionOverlapChange?.('objects',reduce)} mode={objectDisplayMode} onMode={mode=>changeDisplayMode('objects',mode)} onScale={value=>onSpriteScaleChange('objects',value)} onOpacity={value=>onDetectionOpacityChange?.('objects',value)} onReset={()=>onDetectionDisplayReset?.('objects')} />}
                </div>
            )}
        </FilterScrollRegion>
    );
};
