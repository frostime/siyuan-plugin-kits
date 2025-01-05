/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-07-13 21:19:23
 * @FilePath     : /src/settings/local-storage.ts
 * @LastEditTime : 2025-01-06 01:03:41
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

export const useDevicewiseConfigs = useLocalDeviceStorage;

export const useDevicewiseValue = <T>(defaultValue: T) => {
    const device = window.siyuan.config.system;
    let _storage: Record<string, T> = {};
    _storage[device.id] = defaultValue;

    return {
        get storage() {
            return _storage;
        },
        init: (values: Record<string, T>) => {
            _storage = deepMerge(_storage, values);
        },
        get: () => {
            return _storage[device.id];
        },
        set: (value: T) => {
            _storage[device.id] = value;
        }
    }
}
