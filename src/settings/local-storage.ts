/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-07-13 21:19:23
 * @FilePath     : /src/settings/local-storage.ts
 * @LastEditTime : 2025-01-06 21:52:27
 * @Description  : 
 */
import { Plugin } from "siyuan";
import { deepMerge } from "./utils";

/**
 * 创建一个设备相关的配置存储对象。
 * 用于配置思源中设备间互相独立的设置项目, 保存为 json 文件。
 *
 * @param plugin Siyuan 插件实例。
 * @param filePrefix 文件名前缀，默认为 'config.device'
 * @returns
 */
export const useDevicewiseConfigs = async (plugin: Plugin, filePrefix: string = 'config.device') => {
    const device = window.siyuan.config.system;
    const fname = `${filePrefix || 'config.device'}@${device.id}.json`;
    let data = await plugin.loadData(fname);
    const config = data || {};
    return {
        get storage() {
            return config;
        },
        /**
         * 获取指定键的值。
         * @param key 键名。
         * @returns 键对应的值。
         */
        get: (key: string | number) => {
            return config[key];
        },
        /**
         * 设置指定键的值。
         * @param key 键名。
         * @param value 键值。
         * @param save 是否立即保存到磁盘，默认为 true。
         */
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

export const useLocalDeviceStorage = useDevicewiseConfigs;

/**
 * 创建一个设备相关的本地存储值对象。用于存储设备间互相独立的值。
 *
 * 本质上是一个 {<设备ID>: <值>} 的对象，可以通过 storage 属性访问
 * 
 * @param defaultValue 默认值。
 * @returns 一个包含 storage, init, get, set 方法的对象，用于操作设备相关的本地存储值。
 */
export const useDevicewiseValue = <T>(defaultValue: T) => {
    const device = window.siyuan.config.system;
    const _storage: Record<string, T> = {};
    _storage[device.id] = defaultValue;

    return {
        /**
         * 获取存储对象。
         */
        get storage() {
            return _storage;
        },
        /**
         * 初始化存储对象。
         * @param values 初始值。
         */
        init: (values: Record<string, T>) => {
            Object.assign(_storage, values);
        },
        /**
         * 获取当前设备的值。
         * @returns 当前设备的值。
         */
        get: () => {
            return _storage[device.id];
        },
        /**
         * 设置当前设备的值。
         * @param value 要设置的值。
         */
        set: (value: T) => {
            _storage[device.id] = value;
        }
    }
}
