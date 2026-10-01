import { os, uxp } from "../globals";
import { photoshop, premiere, indesign } from "./themes-data";

type ThemeName = "light" | "dark" | "lightest" | "darkest";
type ColorScheme = Record<string, string>;
type PlatformColorTable = {
  mac: Partial<Record<ThemeName, ColorScheme>>;
  win: Partial<Record<ThemeName, ColorScheme>>;
};

// Default Table
const colorTable: Record<ThemeName, ColorScheme> = {
  dark: {
    "--uxp-host-background-color": "#535353",
    "--uxp-host-text-color": "#ffffff",
    "--uxp-host-border-color": "#454545",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#5b5b5b",
    "--uxp-host-widget-hover-text-color": "#ffffff",
    "--uxp-host-widget-hover-border-color": "#5b5b5b",
    "--uxp-host-text-color-secondary": "#e5e5e5",
    "--uxp-host-link-hover-text-color": "#ffffff",
    "--uxp-host-label-text-color": "#ffffff",
  },
  darkest: {
    "--uxp-host-background-color": "#292929",
    "--uxp-host-text-color": "#ffffff",
    "--uxp-host-border-color": "#292929",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#3d3d3d",
    "--uxp-host-widget-hover-text-color": "#ffffff",
    "--uxp-host-widget-hover-border-color": "#3d3d3d",
    "--uxp-host-text-color-secondary": "#9b9b9b",
    "--uxp-host-link-hover-text-color": "#ffffff",
    "--uxp-host-label-text-color": "#ffffff",
  },
  light: {
    "--uxp-host-background-color": "#b8b8b8",
    "--uxp-host-text-color": "#424242",
    "--uxp-host-border-color": "#9c9c9c",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#9d9d9d",
    "--uxp-host-widget-hover-text-color": "#424242",
    "--uxp-host-widget-hover-border-color": "#9d9d9d",
    "--uxp-host-text-color-secondary": "#424242",
    "--uxp-host-link-hover-text-color": "#424242",
    "--uxp-host-label-text-color": "#424242",
  },
  lightest: {
    "--uxp-host-background-color": "#f0f0f0",
    "--uxp-host-text-color": "#4b4b4b",
    "--uxp-host-border-color": "#d1d1d1",
    "--uxp-host-link-text-color": "#4b9cf5",
    "--uxp-host-widget-hover-background-color": "#cecece",
    "--uxp-host-widget-hover-text-color": "#4b4b4b",
    "--uxp-host-widget-hover-border-color": "#cecece",
    "--uxp-host-text-color-secondary": "#606060",
    "--uxp-host-link-hover-text-color": "#4b4b4b",
    "--uxp-host-label-text-color": "#4b4b4b",
  },
};

const getTheme = (hostName: string): ThemeName => {
  //@ts-ignore
  let theme = document.theme.getCurrent() as ThemeName;

  // App-Specific-Overrides
  if (hostName === "indesign") {
    const INDESIGN_THEME_TABLE: Record<number, ThemeName> = {
      1: "lightest",
      0.51: "light",
      0.5: "dark",
      0: "darkest",
    };
    const overrideThemeValue = require("indesign").app.generalPreferences
      .uiBrightnessPreference as number;
    const overrideTheme = INDESIGN_THEME_TABLE[overrideThemeValue];
    if (overrideTheme) theme = overrideTheme;
  }
  return theme;
};

const getPlatformColors = (
  table: PlatformColorTable,
  platform: string,
  theme: ThemeName,
): ColorScheme | undefined => {
  if (platform === "darwin") return table.mac[theme];
  if (platform.includes("win")) return table.win[theme];
  return undefined;
};

export const getColorScheme = async () => {
  const hostName =
    uxp.host.name.toLowerCase().replace(/\s/g, "") || ("" as string);
  const theme = getTheme(hostName);
  let colors: ColorScheme = colorTable[theme];
  const platform = os.platform ? os.platform() : "";

  // Overrides
  if (hostName.startsWith("premierepro")) {
    colors = getPlatformColors(premiere, platform, theme) ?? colors;
  } else if (hostName.startsWith("indesign")) {
    colors = getPlatformColors(indesign, platform, theme) ?? colors;
  } else if (hostName.startsWith("photoshop")) {
    colors = getPlatformColors(photoshop, platform, theme) ?? colors;
  } else {
    console.warn("unknown host");
  }
  return { theme, colors };
};

export const updateColorScheme = (val: {
  theme: string;
  colors: ColorScheme;
}) => {
  const { theme, colors } = val;
  const root = document.querySelector(":root") as HTMLElement;
  for (const key in colors) {
    //@ts-ignore
    const color = colors[key];
    root.style.setProperty(key, color);
  }
  document.documentElement.dataset.theme = theme;
  return "hello from webview";
};

//* Currently only Photoshop has working UXP variables already
const UXP_VAR_WORKING_APPS = ["photoshop"];

export const polyfillUXPVars = () => {
  const hostName =
    uxp.host.name.toLowerCase().replace(/\s/g, "") || ("" as string);

  if (UXP_VAR_WORKING_APPS.find((app) => hostName.includes(app))) return;
  getColorScheme().then((scheme) => {
    updateColorScheme(scheme);
  });
  //@ts-ignore
  document.theme.onUpdated.addListener(() =>
    getColorScheme().then((scheme) => {
      updateColorScheme(scheme);
    }),
  );
};
