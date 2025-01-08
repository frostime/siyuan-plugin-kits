/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2025-01-06 20:19:43
 * @FilePath     : /src/settings/setting-adpater.ts
 * @LastEditTime : 2025-01-06 21:56:50
 * @Description  : 
 */
import { useDevicewiseValue } from "./local-storage";
import { ISettingItemDefinition, ISettingItemAdapter } from "./types";

export const createSettingItemAdapter = <T>(item: ISettingItemDefinition<T>): ISettingItemAdapter<T> => {
    let adapter: ISettingItemAdapter<T> = null;
    if (item.devicewise !== true) {
        let _storage = item?.value ?? undefined;
        adapter = {
            storage: _storage,
            get: () => adapter.storage as T,
            set: (val: T) => {
                adapter.storage = val;
            },
            init: (storage: T | Record<string, T>) => {
                // item.value = storage;
                if (storage !== undefined) {
                    adapter.storage = storage;
                }
            },
            key: item.key
        }
    } else {
        adapter = {
            ...useDevicewiseValue(item.value),
            key: item.key
        };
    }

    return adapter;
}

export const createSettingAdapter = (items: ISettingItemDefinition<any>[]) => {
    const _storage: Record<string, ISettingItemAdapter<any>> = {};
    items.forEach(item => {
        _storage[item.key] = createSettingItemAdapter(item);
    });
    return {
        get storage() { return _storage },
        get: (key: string) => {
            // return _storage[key].get();
            const adapter = _storage[key];
            if (adapter) {
                return adapter.get();
            }
            return undefined;
        },
        set: (key: string, value: any) => {
            // _storage[key].set(value);
            const adapter = _storage[key];
            if (adapter) {
                adapter.set(value);
            }
        },
        init: (storage: Record<string, any>) => {
            for (const key in storage) {
                const adapter = _storage[key];
                if (adapter) {
                    adapter.init(storage[key]);
                }
            }
        },
        dump: () => {
            const result: Record<string, any> = {};
            for (const key in _storage) {
                const adapter = _storage[key];
                if (adapter) {
                    result[key] = adapter.storage;
                }
            }
            return result;
        }
    }
}

