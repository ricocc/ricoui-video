"use client";

import type { ReactNode } from "react";
import { createContext, createElement, useContext } from "react";

export interface SnapCnTheme {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  radius: number;
}

// Default tokens follow the snap-cn design system: a clean, dense,
// professional light-first palette — white surfaces on a near-white page,
// hairline cool-gray borders, deep slate text, and a single blue accent.
// All values are concrete oklch (never `var()`) so `mixOklch` can
// interpolate them under Remotion's headless renderer.
export const defaultLightTheme: SnapCnTheme = {
  background: "oklch(0.985 0 0)", // page bg — #FAFAFA
  foreground: "oklch(0.21 0.034 263)", // text — #101828
  card: "oklch(1 0 0)", // surface — #FFFFFF
  cardForeground: "oklch(0.21 0.034 263)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.21 0.034 263)",
  primary: "oklch(0.57 0.21 261)", // accent blue — #266DF0
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.966 0.005 258)", // subtle fill — #F2F4F7
  secondaryForeground: "oklch(0.21 0.034 263)",
  muted: "oklch(0.966 0.005 258)",
  mutedForeground: "oklch(0.544 0.035 265)", // muted text — #667085
  accent: "oklch(0.966 0.005 258)", // hover wash — #F2F4F7
  accentForeground: "oklch(0.21 0.034 263)",
  destructive: "oklch(0.577 0.245 27.325)",
  destructiveForeground: "oklch(1 0 0)",
  border: "oklch(0.927 0.007 261)", // hairline — #E4E7EC
  input: "oklch(0.927 0.007 261)",
  ring: "oklch(0.57 0.21 261)", // accent blue — #266DF0
  radius: 10,
};

export const defaultDarkTheme: SnapCnTheme = {
  background: "oklch(0.145 0.002 286)", // page bg — #0A0A0B
  foreground: "oklch(0.985 0 0)", // text — #FAFAFA
  card: "oklch(0.193 0.006 286)", // surface — #141417
  cardForeground: "oklch(0.985 0 0)",
  popover: "oklch(0.193 0.006 286)",
  popoverForeground: "oklch(0.985 0 0)",
  primary: "oklch(0.57 0.21 261)", // same accent blue — #266DF0
  primaryForeground: "oklch(1 0 0)",
  secondary: "oklch(0.273 0.007 275)", // subtle fill — #26272B
  secondaryForeground: "oklch(0.985 0 0)",
  muted: "oklch(0.273 0.007 275)",
  mutedForeground: "oklch(0.712 0.013 286)", // muted text — #A1A1AA
  accent: "oklch(0.273 0.007 275)", // hover wash — #26272B
  accentForeground: "oklch(0.985 0 0)",
  destructive: "oklch(0.704 0.191 22.216)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.273 0.007 275)", // hairline — #26272B
  input: "oklch(0.273 0.007 275)",
  ring: "oklch(0.57 0.21 261)", // same accent blue — #266DF0
  radius: 10,
};

interface SnapCnThemeContextValue {
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
}

const SnapCnThemeContext = createContext<SnapCnThemeContextValue>({});

export interface SnapCnUIProviderProps {
  theme?: Partial<SnapCnTheme>;
  mode?: "light" | "dark";
  children: ReactNode;
}

export function SnapCnUIProvider({
  theme,
  mode,
  children,
}: SnapCnUIProviderProps) {
  return createElement(
    SnapCnThemeContext.Provider,
    { value: { theme, mode } },
    children,
  );
}

export function useSnapCnTheme(
  override?: Partial<SnapCnTheme>,
  modeOverride?: "light" | "dark",
): SnapCnTheme {
  const ctx = useContext(SnapCnThemeContext);
  const mode = modeOverride ?? ctx.mode ?? "light";
  const base = mode === "dark" ? defaultDarkTheme : defaultLightTheme;
  return { ...base, ...ctx.theme, ...override };
}
