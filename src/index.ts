/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-09 21:09:34
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-12-18 20:46:42
 * @Description  : 
 */

export { matchIDFormat, isMobile, openBlock, getPlugin } from "./siyuan-instance";
export { registerPlugin, unregisterPlugin, plugin, app, i18n } from "./plugin-instance";
export { SettingUtils, useDeviceStorage, deepMerge } from "./settings";
export * as api from "./api";

export { simpleDialog, confirmDialog } from "./dialog";
export { debounce, throttle, PromiseLimitPool } from "./performance";

export { parseSiYuanTimestamp, formatDateTime, SiYuanDate } from "./time";
export { updateStyleDom, removeStyleDom } from "./style";
export { html2frag, html2ele } from "./misc";
