export type PageId =
  | "home"
  | "assets"
  | "brands"
  | "colors"
  | "typography"
  | "audio"
  | "graphics"
  | "mogrts"
  | "templates"
  | "presets"
  | "packages"
  | "favorites"
  | "recent"
  | "settings";

export type IconName =
  | "home"
  | "assets"
  | "brand"
  | "palette"
  | "type"
  | "audio"
  | "graphics"
  | "motion"
  | "template"
  | "sliders"
  | "package"
  | "star"
  | "clock"
  | "settings"
  | "chevronLeft"
  | "chevronRight"
  | "search"
  | "chevronDown"
  | "plus"
  | "folder"
  | "grid"
  | "list"
  | "filter"
  | "sort"
  | "more"
  | "command"
  | "info"
  | "arrowUpRight"
  | "x";

export interface NavigationItem {
  id: PageId;
  label: string;
  icon: IconName;
  shortcut?: string;
}

export const navigationGroups: Array<{
  label: string;
  items: NavigationItem[];
}> = [
  {
    label: "Workspace",
    items: [
      { id: "home", label: "Home", icon: "home" },
      { id: "assets", label: "Assets", icon: "assets", shortcut: "⌘1" },
    ],
  },
  {
    label: "Brand system",
    items: [
      { id: "brands", label: "Brands", icon: "brand" },
      { id: "colors", label: "Brand Colors", icon: "palette" },
      { id: "typography", label: "Typography", icon: "type" },
    ],
  },
  {
    label: "Media library",
    items: [
      { id: "audio", label: "Audio", icon: "audio" },
      { id: "graphics", label: "Graphics", icon: "graphics" },
      { id: "mogrts", label: "MOGRTs", icon: "motion" },
      { id: "templates", label: "Templates", icon: "template" },
      { id: "presets", label: "Presets", icon: "sliders" },
      { id: "packages", label: "Brand Packages", icon: "package" },
    ],
  },
  {
    label: "Saved",
    items: [
      { id: "favorites", label: "Favorites", icon: "star" },
      { id: "recent", label: "Recent", icon: "clock" },
    ],
  },
];

export const settingsNavigation = [
  "General",
  "Appearance",
  "Library",
  "Premiere Pro",
  "Data & Backup",
  "About",
] as const;

export type SettingsSection = (typeof settingsNavigation)[number];
