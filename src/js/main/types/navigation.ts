export type PageId =
  | "home"
  | "assets"
  | "brands"
  | "colors"
  | "typography"
  | "audio"
  | "video"
  | "graphics"
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
  | "dropper"
  | "audio"
  | "video"
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
  | "x"
  | "copy"
  | "starFilled"
  | "refresh"
  | "pencil"
  | "lightbulb"
  | "message";

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
      { id: "assets", label: "Assets", icon: "assets" },
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
      { id: "video", label: "Video", icon: "video" },
      { id: "graphics", label: "Images", icon: "graphics" },
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
  "Library"
] as const;

export type SettingsSection = (typeof settingsNavigation)[number];
