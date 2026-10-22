/** @jsx jsx */
import { React, jsx } from "jimu-core";
import { GlassSelect } from "../components/GlassSelect";
import { GlassDatePicker } from "../components/GlassDatePicker";
import { glassStyles } from "../utils/styles";
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
const SpriteSize: React.FC<{ label: string; value: number; onChange: (value: number) => void }> = ({ label, value, onChange }) => (
    <label title={`${label} icon size`} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: "#e4eee8", flexShrink: 0 }}>
      Size<select aria-label={`${label} icon size`} value={value} onChange={event => onChange(Number(event.target.value))} style={{ height: 22, fontSize: 10, padding: "0 2px", borderRadius: 4, border: "1px solid #ffffff35", background: "#214d36", color: "white" }}>
        {[0.75, 1, 1.25, 1.5, 2].map(scale => <option key={scale} value={scale}>{scale * 100}%</option>)}
      </select>
    </label>
);

export const FilterBar: React.FC<FilterBarProps> = ({
    signSpriteScale = 1, objectSpriteScale = 1, onSpriteScaleChange,
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
    if (!showTurboFilterBox && !showTrafficSignsFilterBox && !showObjectsFilterBox) {
        return null;
    }

    return (
        <div
            className="glass-scroll-container"
            role="region" aria-label="Mapillary filters"
            style={{ ...glassStyles.filterBarContainer, height: 34, boxSizing: "border-box", flexWrap: "nowrap", justifyContent: "flex-start", padding: "3px 5px", gap: 5, overflowX: "auto", overflowY: "hidden", scrollbarWidth: "none", maxWidth: "100%", borderRadius: 10 }}
        >
            {/* Auto margins center spare space, resolving to zero when the row overflows. */}
            <div style={{ display: "flex", flexShrink: 0, alignItems: "center", gap: 5, height: 26, marginInline: "auto" }}>
            {/* TURBO MODE FILTER GROUP (GOLD) */}
            {showTurboFilterBox && (
                <div role="group" aria-label="Coverage filters" style={{ ...glassStyles.filterGroup("#FFD700"), flexShrink: 0, height: 26, padding: "0 3px", boxSizing: "border-box" }}>

                    {/* Username input */}
                    <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="Username"
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
                                ...glassStyles.glassInput,
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
                                    color: "rgba(255,255,255,0.6)",
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
                        <input type="text" inputMode="numeric" aria-label="Mapillary organization ID"
                            placeholder="Organization ID" value={turboFilterOrganization} disabled={!!turboOrganization}
                            aria-invalid={organizationFilterId(turboFilterOrganization) === -1}
                            title={turboOrganization ? "Organization is set in widget settings" : "Filter by numeric Mapillary organization ID. Combined with Username when both are set."}
                            className="glass-input-placeholder"
                            onChange={event => onTurboOrganizationChange(event.target.value)}
                            onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); onTurboOrganizationEnter(); } }}
                            style={{ ...glassStyles.glassInput, width: 112, minWidth: 90, height: 18, paddingRight: 18,
                                opacity: turboOrganization ? 0.6 : 1, cursor: turboOrganization ? "not-allowed" : "text",
                                ...(organizationFilterId(turboFilterOrganization) === -1 ? { outline: "1px solid #ff8c8c" } : {}) }} />
                        {!turboOrganization && turboFilterOrganization && <button type="button" aria-label="Clear organization filter"
                            title="Clear organization filter" onClick={onTurboOrganizationClear}
                            style={{ position: "absolute", right: 6, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 10, cursor: "pointer", padding: 0 }}>✕</button>}
                    </div>

                    {/* Date range */}
                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                        <GlassDatePicker floatingMenu
                            selected={turboFilterStartDate ? new Date(turboFilterStartDate) : null}
                            onChange={(date) => onTurboStartDateChange(date ? date.toISOString().split("T")[0] : "")}
                            isClearable
                            placeholderText="Start"
                        />
                        <GlassDatePicker floatingMenu
                            selected={turboFilterEndDate ? new Date(turboFilterEndDate) : null}
                            onChange={(date) => onTurboEndDateChange(date ? date.toISOString().split("T")[0] : "")}
                            isClearable
                            placeholderText="End"
                        />
                    </div>

                    {/* Divider */}
                    <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)", margin: "0 2px" }} />

                    {/* Is Pano toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={glassStyles.labelSmall}>Is Pano:</span>
                        <div style={{ display: "flex", gap: "2px" }}>
                            {([
                                { label: "All", value: undefined },
                                { label: "360", value: true },
                                { label: "Flat", value: false }
                            ] as { label: string; value: boolean | undefined }[]).map((opt) => {
                                const isActive = turboFilterIsPano === opt.value;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => onTurboIsPanoChange(opt.value)}
                                        style={{
                                            padding: "1px 4px",
                                            fontSize: "8px",
                                            fontWeight: isActive ? 700 : 400,
                                            background: isActive ? "rgba(255, 215, 0, 0.6)" : "rgba(255,255,255,0.1)",
                                            border: isActive ? "1px solid rgba(255,215,0,0.8)" : "1px solid rgba(255,255,255,0.2)",
                                            borderRadius: "3px",
                                            color: "white",
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

                    <label style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                        <span style={glassStyles.labelSmall}>Travel:</span>
                        <select aria-label="Coverage travel method" title="Filters sequence and image coverage. Zoom closer at overview scale. Other travel includes non-pedestrian capture methods." value={turboFilterOnFoot === undefined ? "any" : turboFilterOnFoot ? "foot" : "other"} onChange={event => onTurboTravelMethodChange?.(event.target.value === "foot" ? true : event.target.value === "other" ? false : undefined)} style={{ height: 22, maxWidth: 96, padding: "0 3px", fontSize: 10, borderRadius: 4, border: "1px solid #ffffff35", background: "#214d36", color: "white" }}>
                            <option value="any">Any</option><option value="foot">On foot</option><option value="other">Other travel</option>
                        </select>
                    </label>

                    {/* Date colour toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={glassStyles.labelSmall}>Date Color:</span>
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

            {/* TRAFFIC SIGNS FILTER GROUP (ORANGE) */}
            {showTrafficSignsFilterBox && (
                <div role="group" aria-label="Traffic sign filters" style={{ ...glassStyles.filterGroup("#FFA500"), flexShrink: 0, height: 26, padding: "0 3px", boxSizing: "border-box" }}>
                    <GlassSelect floatingMenu compact
                        value={trafficSignsFilterValue}
                        onChange={onTrafficSignsFilterChange}
                        options={trafficSignsOptions}
                        accentColor="#FFA500"
                        menuPlacement="top"
                    />
                    {onSpriteScaleChange && <SpriteSize label="Traffic sign" value={signSpriteScale} onChange={value => onSpriteScaleChange("signs", value)} />}
                </div>
            )}

            {/* OBJECTS FILTER GROUP (RED) */}
            {showObjectsFilterBox && (
                <div role="group" aria-label="Object filters" style={{ ...glassStyles.filterGroup("#FF3C3C"), flexShrink: 0, height: 26, padding: "0 3px", boxSizing: "border-box" }}>
                    <GlassSelect floatingMenu compact
                        value={objectsFilterValue}
                        onChange={onObjectsFilterChange}
                        options={objectsOptions}
                        accentColor="#FF3C3C"
                        menuPlacement="top"
                    />
                    {onSpriteScaleChange && <SpriteSize label="Object" value={objectSpriteScale} onChange={value => onSpriteScaleChange("objects", value)} />}
                </div>
            )}
            </div>
        </div>
    );
};
