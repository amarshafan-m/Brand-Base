export const getColorScheme = () => "dark";
export const getUXPInfo = async () => ({ version: "cep", hostName: "premierepro", hostVersion: "1.0", pluginId: "com.brandbase", pluginVersion: "1.0" });
export const openURL = async (url: string) => { console.log("Open URL: ", url); };
export const openUXPPanel = async (id: string) => { return true; };
export const initUXP = () => {};
