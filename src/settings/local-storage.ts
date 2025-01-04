/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-07-13 21:19:23
 * @FilePath     : /src/settings/local-storage.ts
 * @LastEditTime : 2025-01-04 20:04:09
 * @Description  : 
 */
import { Plugin } from "siyuan";
import { deepMerge } from "./utils";

export const useLocalDeviceStorage = async (plugin: Plugin, filePrefix: string = 'Device') => {
    const device = window.siyuan.config.system;
    const fname = `${filePrefix || 'Device'}@${device.id}.json`;
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


export const useDevicewiseValue = <T>(defaultValue: T) => {
    const device = window.siyuan.config.system;
    let storage: Record<string, T> = {};
    storage[device.id] = defaultValue;

    return {
        storage,
        init: (values: Record<string, T>) => {
            storage = deepMerge(storage, values);
        },
        get: () => {
            return storage[device.id];
        },
        set: (value: T) => {
            storage[device.id] = value;
        }
    }
}
