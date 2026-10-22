/** @jsx jsx */
import { React, jsx } from "jimu-core";
import ReactDOM from "react-dom";
import { base, controlStyle, menuStyle, optionStyle, chevron } from '../styles/glassSelect';

// Types
export interface GlassSelectOption {
    value: string;
    label: string;
    iconUrl: string | null;
}

interface GlassSelectProps {
    floatingMenu?: boolean;
    compact?: boolean;
    value: GlassSelectOption;
    onChange: (option: GlassSelectOption) => void;
    options: GlassSelectOption[];
    accentColor?: string;       // e.g. '#FFA500' or '#FF3C3C'
    menuPlacement?: "top" | "bottom";
    menuPortalTarget?: Element; // kept for API compat, not needed
}


// Presentation styles live in styles/glassSelect.ts.

// Component
export class GlassSelect extends React.PureComponent<
    GlassSelectProps,
    { open: boolean; hoveredIdx: number; searchQuery: string }
> {
    private menuRef = React.createRef<HTMLDivElement>();
    private closeFloatingMenu = (event?: Event) => {
        if (!this.props.floatingMenu || (event?.target instanceof Node && this.menuRef.current?.contains(event.target))) return;
        this.setState({ open: false });
    };
    private renderFloatingMenu = (menu: React.ReactNode) => this.props.floatingMenu
        ? ReactDOM.createPortal(menu, document.fullscreenElement || document.body) : menu;
    private floatingMenuStyle = (): React.CSSProperties => {
        const rect = this.containerRef.current?.getBoundingClientRect();
        if (!this.props.floatingMenu || !rect) return {};
        const width = Math.min(Math.max(240, rect.width), window.innerWidth - 16);
        const above = rect.top > 250;
        return { position: "fixed", left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), right: "auto", width,
            top: above ? "auto" : rect.bottom + 6, bottom: above ? window.innerHeight - rect.top + 6 : "auto",
            transform: "none", zIndex: 2147483647, maxHeight: Math.max(80, Math.min(250, above ? rect.top - 14 : window.innerHeight - rect.bottom - 14)), overflowY: "auto", boxSizing: "border-box" };
    };
    private containerRef = React.createRef<HTMLDivElement>();
    private searchRef = React.createRef<HTMLInputElement>();

    state: { open: boolean; hoveredIdx: number; searchQuery: string } = {
        open: false,
        hoveredIdx: -1,
        searchQuery: "",
    };

    componentDidMount() {
        document.addEventListener("mousedown", this.handleOutsideClick);
        document.addEventListener("scroll", this.closeFloatingMenu, true);
        window.addEventListener("resize", this.closeFloatingMenu);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleOutsideClick);
        document.removeEventListener("scroll", this.closeFloatingMenu, true);
        window.removeEventListener("resize", this.closeFloatingMenu);
    }

    private handleOutsideClick = (e: MouseEvent) => {
        if (this.containerRef.current && !this.containerRef.current.contains(e.target as Node) && !this.menuRef.current?.contains(e.target as Node)) {
            this.setState({ open: false, searchQuery: "" });
        }
    };

    private toggle = () => {
        this.setState(
            prev => ({ open: !prev.open, searchQuery: "", hoveredIdx: -1 }),
            () => {
                if (this.state.open) {
                    // Focus the search input when menu opens
                    setTimeout(() => this.searchRef.current?.focus(), 30);
                }
            }
        );
    };

    private select = (opt: GlassSelectOption) => {
        this.setState({ open: false, searchQuery: "" });
        this.props.onChange(opt);
    };

    render() {
        const {
            value,
            options,
            accentColor = "#37d582",
            menuPlacement = "top",
        } = this.props;

        const { open, hoveredIdx, searchQuery } = this.state;

        const filtered = searchQuery
            ? options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
            : options;

        return (
            <div ref={this.containerRef} style={{ ...base, ...(this.props.compact ? { width: `clamp(190px, ${Math.max(190, (value?.label?.length || 0) * 5.3 + 48)}px, 320px)`, flexShrink: 0 } : {}) }}>
                {/* Control (trigger) */}
                <div
                    style={controlStyle(accentColor, open)}
                    onClick={this.toggle}
                    role="combobox"
                    aria-expanded={open}
                    title={value?.label}
                >
                    {/* Selected value label */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", overflow: "hidden", flex: 1 }}>
                        {value?.iconUrl && (
                            <img
                                src={value.iconUrl}
                                alt=""
                                style={{ width: 14, height: 14, objectFit: "contain", flexShrink: 0 }}
                            />
                        )}
                        <span style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "#fff",
                            fontSize: "10px",
                        }}>
                            {value?.label ?? "Select…"}
                        </span>
                    </div>
                    <div style={chevron(open, accentColor)} />
                </div>

                {/* Dropdown menu */}
                {open && this.renderFloatingMenu(
                    <div ref={this.menuRef} style={{ ...menuStyle(accentColor, menuPlacement), ...this.floatingMenuStyle() }}>
                        {/* Search input */}
                        {options.length > 6 && (
                            <div style={{ padding: "4px 6px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                                <input
                                    ref={this.searchRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => this.setState({ searchQuery: e.target.value, hoveredIdx: -1 })}
                                    placeholder="Search…"
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        width: "100%",
                                        background: "rgba(255,255,255,0.07)",
                                        border: `1px solid ${accentColor}44`,
                                        borderRadius: "4px",
                                        color: "#fff",
                                        fontSize: "9px",
                                        padding: "3px 6px",
                                        outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                        )}

                        {/* Options */}
                        {filtered.length === 0 ? (
                            <div style={{ padding: "8px", color: "rgba(255,255,255,0.4)", fontSize: "9px", textAlign: "center" }}>
                                No results
                            </div>
                        ) : (
                            filtered.map((opt, idx) => (
                                <div
                                    key={opt.value}
                                    style={{ ...optionStyle(hoveredIdx === idx, opt.value === value?.value, accentColor), fontSize: "10px", whiteSpace: "normal" }}
                                    title={opt.label}
                                    onMouseEnter={() => this.setState({ hoveredIdx: idx })}
                                    onMouseLeave={() => this.setState({ hoveredIdx: -1 })}
                                    onMouseDown={e => { e.preventDefault(); this.select(opt); }}
                                    title={opt.label}
                                >
                                    {opt.iconUrl && (
                                        <img
                                            src={opt.iconUrl}
                                            alt=""
                                            style={{ width: 14, height: 14, objectFit: "contain", flexShrink: 0 }}
                                        />
                                    )}
                                    <span style={{ whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.4 }}>
                                        {opt.label}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    }
}
