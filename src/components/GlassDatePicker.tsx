/** @jsx jsx */
import { firstWeekday } from '../i18n/core';
import { React, jsx } from "jimu-core";
import { WidgetLocaleContext } from '../i18n/WidgetLocale';
import ReactDOM from "react-dom";
import { ACCENT, NAV_BTN, dateWrapperStyle, getDateTriggerStyle, dateIconStyle, dateLabelStyle, dateClearStyle, dateCalendarStyle, dateYearNavigationStyle, dateYearLabelStyle, dateMonthNavigationStyle, dateMonthLabelStyle, dateWeekHeaderGridStyle, dateWeekHeaderStyle, dateDayGridStyle, getDateDayStyle, dateTodaySectionStyle, dateTodayButtonStyle } from '../styles/glassDatePicker';

// Types
interface GlassDatePickerProps {
    floatingMenu?: boolean;
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    isClearable?: boolean;
    disabled?: boolean;
    dateFormat?: string;
    popperPlacement?: string;
    popperProps?: any;
    portalId?: string;
    customInput?: React.ReactElement;
}

interface GlassDatePickerState {
    open: boolean;
    viewYear: number;
    viewMonth: number;
    hoveredDay: number; // -1 = none
}

// Helpers


function daysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

// Presentation styles live in styles/glassDatePicker.ts.

//  Component
export class GlassDatePicker extends React.PureComponent<GlassDatePickerProps, GlassDatePickerState> {
    static contextType = WidgetLocaleContext;
    declare context: React.ContextType<typeof WidgetLocaleContext>;
    private menuRef = React.createRef<HTMLDivElement>();
    private closeFloatingMenu = (event?: Event) => {
        if (!this.props.floatingMenu || (event?.target instanceof Node && this.menuRef.current?.contains(event.target))) return;
        this.setState({ open: false });
    };
    private renderFloatingMenu = (menu: React.ReactNode) => this.props.floatingMenu
        ? ReactDOM.createPortal(menu, document.fullscreenElement || document.body) : menu;
    private floatingMenuStyle = (): React.CSSProperties => {
        const rect = this.wrapperRef.current?.getBoundingClientRect();
        if (!this.props.floatingMenu || !rect) return {};
        const width = 184;
        const above = rect.top > 250;
        return { position: "fixed", left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)), right: "auto", width,
            top: above ? "auto" : rect.bottom + 6, bottom: above ? window.innerHeight - rect.top + 6 : "auto",
            transform: "none", zIndex: 2147483647, maxHeight: Math.max(80, Math.min(250, above ? rect.top - 14 : window.innerHeight - rect.bottom - 14)), overflowY: "auto", boxSizing: "border-box" };
    };
    private wrapperRef = React.createRef<HTMLDivElement>();

    constructor(props: GlassDatePickerProps) {
        super(props);
        const now = props.selected ?? new Date();
        this.state = {
            open: false,
            viewYear: now.getFullYear(),
            viewMonth: now.getMonth(),
            hoveredDay: -1,
        };
    }

    componentDidMount() {
        document.addEventListener("mousedown", this.handleOutside);
        document.addEventListener("scroll", this.closeFloatingMenu, true);
        window.addEventListener("resize", this.closeFloatingMenu);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleOutside);
        document.removeEventListener("scroll", this.closeFloatingMenu, true);
        window.removeEventListener("resize", this.closeFloatingMenu);
    }

    componentDidUpdate(prev: GlassDatePickerProps) {
        if (prev.selected !== this.props.selected && this.props.selected) {
            this.setState({
                viewYear: this.props.selected.getFullYear(),
                viewMonth: this.props.selected.getMonth(),
            });
        }
    }

    private handleOutside = (e: MouseEvent) => {
        if (this.wrapperRef.current && !this.wrapperRef.current.contains(e.target as Node) && !this.menuRef.current?.contains(e.target as Node)) {
            this.setState({ open: false });
        }
    };

    private toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.props.disabled) return;
        this.setState(prev => ({ open: !prev.open, hoveredDay: -1 }));
    };

    private clear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        this.props.onChange(null);
        this.setState({ open: false });
    };

    private prevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.setState(prev => {
            let m = prev.viewMonth - 1, y = prev.viewYear;
            if (m < 0) { m = 11; y--; }
            return { viewMonth: m, viewYear: y };
        });
    };

    private nextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.setState(prev => {
            let m = prev.viewMonth + 1, y = prev.viewYear;
            if (m > 11) { m = 0; y++; }
            return { viewMonth: m, viewYear: y };
        });
    };

    private prevYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.setState(prev => ({ viewYear: prev.viewYear - 1 }));
    };

    private nextYear = (e: React.MouseEvent) => {
        e.stopPropagation();
        this.setState(prev => ({ viewYear: prev.viewYear + 1 }));
    };

    private selectDay = (e: React.MouseEvent, day: number) => {
        e.stopPropagation();
        const d = new Date(this.state.viewYear, this.state.viewMonth, day);
        this.props.onChange(d);
        this.setState({ open: false, hoveredDay: -1 });
    };

    render() {
        const { t, formatLocale:locale } = this.context;
        const { selected, isClearable, placeholderText = t('date'), disabled = false } = this.props;
        const weekStart = firstWeekday(locale);
        const weekdays = Array.from({length:7}, (_,i) => new Intl.DateTimeFormat(locale,{weekday:'short'}).format(new Date(2024,0,7+(i+weekStart)%7)));
        const { open, viewYear, viewMonth, hoveredDay } = this.state;

        const label      = selected ? new Intl.DateTimeFormat(locale).format(selected) : placeholderText;
        const totalDays  = daysInMonth(viewYear, viewMonth);
        const firstDay   = (firstDayOfMonth(viewYear, viewMonth) - weekStart + 7) % 7;
        const selDay     = selected?.getDate();
        const selMonth   = selected?.getMonth();
        const selYear    = selected?.getFullYear();
        const today      = new Date();

        // Build grid: leading nulls + day numbers + trailing nulls
        const cells: (number | null)[] = [];
        for (let i = 0; i < firstDay; i++) cells.push(null);
        for (let d = 1; d <= totalDays; d++) cells.push(d);
        while (cells.length % 7 !== 0) cells.push(null);

        return (
            <div
                ref={this.wrapperRef}
                style={dateWrapperStyle}
            >
                {/* Trigger button */}
                <button
                    type="button"
                    onClick={this.toggle}
                    style={getDateTriggerStyle(open, selected, disabled)}
                    title={placeholderText}
                >
                    <span style={dateIconStyle}>📅</span>
                    <span style={dateLabelStyle}>{label}</span>
                    {isClearable && selected && (
                        <span
                            onClick={this.clear}
                            style={dateClearStyle}
                        >
                            ✕
                        </span>
                    )}
                </button>

                {/* Calendar panel (absolute child, opens upward) */}
                {open && this.renderFloatingMenu(
                    <div dir={this.context.direction} ref={this.menuRef}
                        onClick={e => e.stopPropagation()}
                        style={{ ...dateCalendarStyle, ...this.floatingMenuStyle() }}
                    >
                        {/* Year navigation */}
                        <div style={dateYearNavigationStyle}>
                            <button type="button" aria-label={t('previousYear')} onClick={this.prevYear} style={NAV_BTN}>{this.context.direction==='rtl'?'»':'«'}</button>
                            <span style={dateYearLabelStyle}>
                                {new Intl.NumberFormat(locale,{useGrouping:false}).format(viewYear)}
                            </span>
                            <button type="button" aria-label={t('nextYear')} onClick={this.nextYear} style={NAV_BTN}>{this.context.direction==='rtl'?'«':'»'}</button>
                        </div>

                        {/* Month navigation */}
                        <div style={dateMonthNavigationStyle}>
                            <button type="button" aria-label={t('previousMonth')} onClick={this.prevMonth} style={NAV_BTN}>{this.context.direction==='rtl'?'›':'‹'}</button>
                            <span style={dateMonthLabelStyle}>
                                {new Intl.DateTimeFormat(locale,{month:'long'}).format(new Date(viewYear,viewMonth,1))}
                            </span>
                            <button type="button" aria-label={t('nextMonth')} onClick={this.nextMonth} style={NAV_BTN}>{this.context.direction==='rtl'?'‹':'›'}</button>
                        </div>

                        {/* Day-of-week headers */}
                        <div style={dateWeekHeaderGridStyle}>
                            {weekdays.map(d => (
                                <div key={d} style={dateWeekHeaderStyle}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div style={dateDayGridStyle}>
                            {cells.map((day, idx) => {
                                if (day === null) return <div key={`_${idx}`} />;

                                const isSelected = day === selDay && viewMonth === selMonth && viewYear === selYear;
                                const isToday    = day === today.getDate()
                                    && viewMonth === today.getMonth()
                                    && viewYear  === today.getFullYear();
                                const isHovered  = hoveredDay === day;

                                let bg = "transparent";
                                if (isSelected)     bg = ACCENT;
                                else if (isHovered) bg = "rgba(255,255,255,0.14)";
                                else if (isToday)   bg = `${ACCENT}20`;

                                return (
                                    <div
                                        key={day}
                                        className="day-cell"
                                        onClick={e => this.selectDay(e, day)}
                                        onMouseEnter={() => this.setState({ hoveredDay: day })}
                                        onMouseLeave={() => this.setState({ hoveredDay: -1 })}
                                        style={getDateDayStyle(bg, isSelected, isToday)}
                                    >
                                        {new Intl.NumberFormat(locale,{useGrouping:false}).format(day)}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Today shortcut */}
                        <div style={dateTodaySectionStyle}>
                            <button
                                type="button"
                                className="today-btn"
                                onClick={e => {
                                    e.stopPropagation();
                                    const t = new Date();
                                    this.props.onChange(t);
                                    this.setState({
                                        open: false,
                                        viewYear: t.getFullYear(),
                                        viewMonth: t.getMonth()
                                    });
                                }}
                                style={dateTodayButtonStyle}
                            >
                                {t('today')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
