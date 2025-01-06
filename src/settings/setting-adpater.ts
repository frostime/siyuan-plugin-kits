import { useDevicewiseValue } from "./local-storage";
import { ISettingItemDefinition, ISettingItemAdapter } from "./types";

export const createSettingItemAdapter = <T>(item: ISettingItemDefinition<T>): ISettingItemAdapter<T> => {
    let storage: ISettingItemAdapter<T> = null;
    if (item.devicewise !== true) {
        let _storage = item.value;
        storage = {
            get storage() { return _storage },
            set storage(val: T) {
                _storage = val;
            },
            get: () => _storage,
            set: (val: T) => {
                _storage = val;
            },
            init: (storage: T | Record<string, T>) => {
                // item.value = storage;
                if (storage !== undefined && storage !== null) {
                    _storage = storage;
                }
            },
            key: item.key
        }
    } else {
        storage = {
            ...useDevicewiseValue(item.value),
            key: item.key
        };
    }

    return storage;
}

export const createSettingAdapter = (items: ISettingItemDefinition<any>[]) => {
    let _storage: Record<string, ISettingItemAdapter<any>> = {};
    items.forEach(item => {
        _storage[item.key] = createSettingItemAdapter(item);
    });
    return {
        get storage() { return _storage },
        get: (key: string) => {
            return _storage[key].get();
        },
        set: (key: string, value: any) => {
            _storage[key].set(value);
        },
        init: (storage: Record<string, any>) => {
            Object.keys(storage).forEach(key => {
                _storage[key].init(storage[key]);
            });
        },
        dump: () => {
            let result: Record<string, any> = {};
            Object.keys(_storage).forEach(key => {
                result[key] = _storage[key].storage;
            });
            return result;
        }
    }
}

