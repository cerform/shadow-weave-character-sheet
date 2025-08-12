export const ASSETS_BASE =
  "https://raw.githubusercontent.com/cerform/asets/main/assets/3d/";

export const ASSETS_INDEX_URL = ASSETS_BASE + "index.json";

export const assetUrl = (relativePath: string) =>
  ASSETS_BASE + relativePath.replace(/^\/+/, "");
