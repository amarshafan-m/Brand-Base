import { UXP_Manifest, UXP_Config, UXP_Config_Extra } from "vite-uxp-plugin";
import { version } from "./package.json";

const extraPrefs: UXP_Config_Extra = {
  hotReloadPort: 8080,
  webviewUi: false,
  webviewReloadPort: 8081,
  copyZipAssets: ["public-zip/*"],
  uniqueIds: true,
  debugger: "udt",
};

export const id = "com.brandbase.premiere";
const name = "Brand Base"; 

const manifest: UXP_Manifest = {
  id,
  name,
  version,
  main: "index.html",
  manifestVersion: 6,
  host: [
    {
      app: "premierepro",
      minVersion: "25.6",
    },
              ],
  entrypoints: [
    {
      type: "panel",
      id: `${id}.main`,
      label: {
        default: name,
      },
      minimumSize: { width: 230, height: 200 },
      maximumSize: { width: 2000, height: 2000 },
      preferredDockedSize: { width: 230, height: 300 },
      preferredFloatingSize: { width: 450, height: 400 },
    },


    // * Example of a UXP Secondary panel
    // * Must also enable the <uxp-panel panelid="bolt.uxp.plugin.settings">
    //* tag in your entrypoint (.tsx, .vue, or .svelte) file
    // {
    //   type: "panel",
    //   id: `${id}.settings`,
    //   label: {
    //     default: `${name} Settings`,
    //   },
    //   minimumSize: { width: 230, height: 200 },
    //   maximumSize: { width: 2000, height: 2000 },
    //   preferredDockedSize: { width: 230, height: 300 },
    //   preferredFloatingSize: { width: 230, height: 300 },
    // },

    // * Example of a UXP Command
    // {
    //   type: "command",
    //   id: "showAbout",
    //   label: {
    //     default: "Bolt UXP Command",
    //   },
    // },

  ],
  featureFlags: {
    enableAlerts: true,
  },
  requiredPermissions: {
    localFileSystem: "request",
    network: {
      domains: [
        `ws://localhost:${extraPrefs.hotReloadPort}`, // Required for hot reload
      ],
    },
  },
};

export const config: UXP_Config = {
  manifest,
  ...extraPrefs,
};
