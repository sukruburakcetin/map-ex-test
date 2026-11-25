import type { CSSProperties } from "react";

export type WidgetTheme = "green" | "dark" | "light" | "high-contrast" | "sandstone" | "slate";
/** Scope an override to its experience and widget instance. Ignore map and selection query parameters. */
export function widgetThemeStorageKey(widgetId: string): string {
  const location = typeof window === "undefined" ? undefined : window.location;
  const experienceId = new URLSearchParams(location?.search).get("id");
  return "mapillary-explorer:theme:" + JSON.stringify([location?.pathname ?? "", experienceId, widgetId]);
}
export function isWidgetTheme(value: unknown): value is WidgetTheme {
  return value === "green" || value === "dark" || value === "light" || value === "high-contrast" || value === "sandstone" || value === "slate";
}
export function readWidgetTheme(storageKey: string): WidgetTheme | undefined {
  try {
    const value = window.localStorage.getItem(storageKey);
    if (isWidgetTheme(value)) return value;
  } catch { /* The widget can run without browser storage. */ }
  return undefined;
}
/** Draft previews allow a session-only choice; the Builder canvas always shows the authored theme. */
export function canSelectVisitorTheme(allowed: boolean | undefined): boolean {
  if (allowed !== true || typeof window === "undefined") return false;
  const host = window as Window & { jimuConfig?: { isInBuilder?: boolean } };
  return host.jimuConfig?.isInBuilder !== true;
}

export function canUseVisitorTheme(allowed: boolean | undefined): boolean {
  return canSelectVisitorTheme(allowed) && new URLSearchParams(window.location?.search).get("draft") !== "true";
}

export function resolveWidgetTheme(configured: unknown, allowOverride: boolean, preference?: WidgetTheme): WidgetTheme {
  if (allowOverride && preference) return preference;
  return isWidgetTheme(configured) ? configured : "green";
}

export function saveWidgetTheme(storageKey: string, theme?: WidgetTheme): void {
  try {
    if (theme === undefined) window.localStorage.removeItem(storageKey);
    else window.localStorage.setItem(storageKey, theme);
  }
  catch { /* Keep the current session's appearance when storage is unavailable. */ }
}

type ThemeVariables = CSSProperties & Record<`--mly-theme-${string}`, string>;
export const widgetThemeStyles: Record<WidgetTheme, ThemeVariables> = {
  green: {},
  dark: {
    "--mly-theme-color-scheme": "dark",
    "--mly-theme-panel": "#22262e",
    "--mly-theme-chrome": "#22262eef",
    "--mly-theme-control": "#353b46",
    "--mly-theme-input": "#171b22",
    "--mly-theme-selected": "#3a4e6d",
    "--mly-theme-text": "#f1f4f9",
    "--mly-theme-muted": "#bac4d4",
    "--mly-theme-accent": "#b8d3ff",
    "--mly-theme-border": "#6c788b",
    "--mly-theme-hover": "#465165",
    "--mly-theme-check": "#b8d3ff",
    "--mly-theme-danger": "#ffbfb0",
    "--mly-theme-primary": "#355b88",
  },
  light: {
    "--mly-theme-color-scheme": "light",
    "--mly-theme-panel": "#fffdf9",
    "--mly-theme-chrome": "#faf8f3f5",
    "--mly-theme-control": "#e6ecf5",
    "--mly-theme-input": "#f5f2ec",
    "--mly-theme-selected": "#cbdcf5",
    "--mly-theme-text": "#172334",
    "--mly-theme-muted": "#42546b",
    "--mly-theme-accent": "#24508b",
    "--mly-theme-border": "#73859f",
    "--mly-theme-hover": "#d6e1f2",
    "--mly-theme-check": "#24508b",
    "--mly-theme-danger": "#92372a",
    "--mly-theme-primary": "#24508b",
    "--mly-theme-rail-surface": "linear-gradient(155deg, #faf8f3, #e8eef7)",
    "--mly-theme-rail-border": "#a2b0c4",
    "--mly-theme-rail-divider": "#b9c5d6",
    "--mly-theme-sign-dot": "#34547c",
    "--mly-theme-sign-yellow": "#a76a09",
    "--mly-theme-sign-orange": "#b64c22",
    "--mly-theme-idle-pulse": "rgba(52, 84, 124, 0.4)",
    "--mly-theme-idle-border": "#a2b0c4",
    "--mly-theme-idle-text-shadow": "none",
  },
  slate: {
    "--mly-theme-color-scheme": "dark",
    "--mly-theme-panel": "#26384a",
    "--mly-theme-chrome": "#26384a",
    "--mly-theme-control": "#344b61",
    "--mly-theme-input": "#1d2e40",
    "--mly-theme-selected": "#385a74",
    "--mly-theme-text": "#f6f9ff",
    "--mly-theme-muted": "#d7e4f3",
    "--mly-theme-accent": "#a9dcff",
    "--mly-theme-border": "#8ba6bd",
    "--mly-theme-hover": "#405d76",
    "--mly-theme-check": "#a9dcff",
    "--mly-theme-danger": "#ffbeaf",
    "--mly-theme-primary": "#2f5774",
    "--mly-theme-rail-divider": "#7894ab",
    "--mly-theme-idle-pulse": "rgba(169, 220, 255, 0.55)",
    "--mly-theme-idle-border": "#8ba6bd",
  },
  sandstone: {
    "--mly-theme-color-scheme": "light",
    "--mly-theme-panel": "#fff5e5",
    "--mly-theme-chrome": "#f7e8d2",
    "--mly-theme-control": "#edd8bb",
    "--mly-theme-input": "#f8ebd7",
    "--mly-theme-selected": "#e7c49c",
    "--mly-theme-text": "#322116",
    "--mly-theme-muted": "#634631",
    "--mly-theme-accent": "#81391f",
    "--mly-theme-border": "#8c694f",
    "--mly-theme-hover": "#e9ccaa",
    "--mly-theme-check": "#81391f",
    "--mly-theme-danger": "#852c26",
    "--mly-theme-primary": "#81391f",
    "--mly-theme-rail-divider": "#b09477",
    "--mly-theme-sign-dot": "#594638",
    "--mly-theme-sign-yellow": "#865900",
    "--mly-theme-sign-orange": "#a13d1c",
    "--mly-theme-idle-pulse": "rgba(129, 57, 31, 0.42)",
    "--mly-theme-idle-border": "#b09477",
    "--mly-theme-idle-text-shadow": "none",
  },
  "high-contrast": {
    "--mly-theme-color-scheme": "dark",
    "--mly-theme-panel": "#0b1018",
    "--mly-theme-chrome": "#0b1018",
    "--mly-theme-control": "#192434",
    "--mly-theme-input": "#070b12",
    "--mly-theme-selected": "#173c65",
    "--mly-theme-text": "#ffffff",
    "--mly-theme-muted": "#d9e6fa",
    "--mly-theme-accent": "#7ac5ff",
    "--mly-theme-border": "#8da6c5",
    "--mly-theme-hover": "#254565",
    "--mly-theme-check": "#7ac5ff",
    "--mly-theme-danger": "#ffb6a6",
    "--mly-theme-primary": "#21588f",
    "--mly-theme-idle-pulse": "rgba(122, 197, 255, 0.65)",
    "--mly-theme-idle-border": "#8da6c5",
  },
};

const themeVariableKeys = new Set(Object.values(widgetThemeStyles).flatMap(style => Object.keys(style)));

export function applyWidgetThemeVariables(element: HTMLElement, theme: WidgetTheme): void {
  // Portaled DOM tooltips have no themed ancestor. Remove old variables when returning to Green.
  for (const key of themeVariableKeys)
    element.style.removeProperty(key);
  for (const [key, color] of Object.entries(widgetThemeStyles[theme])) element.style.setProperty(key, color);
}
