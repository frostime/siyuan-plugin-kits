/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-07-13 21:19:23
 * @FilePath     : /src/settings/local-storage.ts
 * @LastEditTime : 2024-12-19 21:36:44
 * @Description  : 
 */
import { Plugin } from "siyuan";

export const useLocalDeviceStorage = async (plugin: Plugin) => {
    const device = window.siyuan.config.system;
    const fname = `Device@${device.id}.json`;
    let config = await plugin.loadData(fname);
    config = config || {};
    return {
        get: (key: string | number) => {
            return config[key];
        },
        set: async (key: string | number, value: any, save: boolean = true) => {
            config[key] = value;
            if (save) {
                await plugin.saveData(fname, config);
            }
        },
        save: async () => {
            await plugin.saveData(fname, config);
        },
        keys: () => {
            return Object.keys(config);
        },
        includes: (key: string | number) => {
            if (config[key]) {
                return true;
            }
            return false;
        },
        forEach: async (callback: (key: string | number, value: any) => void) => {
            for (let key in config) {
                await callback(key, config[key]);
            }
        }
    }
}

