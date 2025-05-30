/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-12-17 18:28:19
 * @FilePath     : /src/settings/setting-utils.ts
 * @LastEditTime : 2025-02-24 23:38:27
 * @Description  : 
 */

import { Plugin, Setting } from 'siyuan';
import { TSettingItemType, ISettingUtilsItem, ISettingItemAdapter } from './types';
// import { useDevicewiseValue } from './local-storage';
import { createSettingItemAdapter } from './setting-adpater';

/**
 * The default function to get the value of the element
 * @param type 
 * @returns 
 */
const createDefaultElementGetter = (type: TSettingItemType) => {
    let getter: (ele: HTMLElement) => any;
    switch (type) {
        case 'checkbox':
            getter = (ele: HTMLInputElement) => {
                return ele.checked;
            };
            break;
        case 'select':
        case 'slider':
        case 'textinput':
        case 'textarea':
            getter = (ele: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
                return ele.value;
            };
            break;
        case 'number':
            getter = (ele: HTMLInputElement) => {
                return parseInt(ele.value);
            }
            break;
        default:
            getter = () => null;
            break;
    }
    return getter;
}


/**
 * The default function to set the value of the element
 * @param type 
 * @returns 
 */
const createDefaultElementSetter = (type: TSettingItemType) => {
    let setter: (ele: HTMLElement, value: any) => unknown;
    switch (type) {
        case 'checkbox':
            setter = (ele: HTMLInputElement, value: any) => {
                ele.checked = value;
            };
            break;
        case 'select':
        case 'slider':
        case 'textinput':
        case 'textarea':
        case 'number':
            setter = (ele: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: any) => {
                ele.value = value;
            };
            break;
        default:
            setter = () => { };
            break;
    }
    return setter;

}


// const adaptSettingItemStorage = <T>(item: ISettingUtilsItem<T>): ISettintItemStorage<T> => {
//     let storage: ISettingItemStorage<T>;
//     if (item.devicewise !== true) {
//         // 普通的 setting item
//         let _storage = item.value;
//         storage = {
//             get storage() { return _storage },
//             set storage(val: T) {
//                 _storage = val;
//             },
//             get: () => _storage,
//             set: (val: T) => {
//                 _storage = val;
//             },
//             init: (storage: T | Record<string, T>) => {
//                 // item.value = storage;
//                 if (storage !== undefined && storage !== null) {
//                     _storage = storage;
//                 }
//             },
//         }
//     } else {
//         storage = useDevicewiseValue(item.value);
//     }
//     let adapter: ISettintItemStorage<T> = {
//         ...storage,
//         key: item.key,
//         type: item.type,
//         getEleVal: item.getEleVal,
//         setEleVal: item.setEleVal
//     };

//     if (adapter.getEleVal === undefined) {
//         adapter.getEleVal = createDefaultElementGetter(adapter.type);
//     }
//     if (adapter.setEleVal === undefined) {
//         adapter.setEleVal = createDefaultElementSetter(adapter.type);
//     }

//     return adapter;
// }
type ISettingUtilsItemStorage = ISettingItemAdapter<any> & {
    type: TSettingItemType;
    // key: string;
    getEleVal: (ele: HTMLElement) => any;
    setEleVal: (ele: HTMLElement, val: any) => void;
}

export class SettingUtils {
    plugin: Plugin;
    name: string;
    file: string;


    settings: Map<string, ISettingUtilsItemStorage> = new Map();
    elements: Map<string, HTMLElement> = new Map();

    constructor(args: {
        plugin: Plugin,
        name?: string,
        callback?: (data: any) => void,
        width?: string,
        height?: string
    }) {
        this.name = args.name ?? 'settings';
        this.plugin = args.plugin;
        this.file = this.name.endsWith('.json') ? this.name : `${this.name}.json`;
        this.plugin.setting = new Setting({
            width: args.width,
            height: args.height,
            confirmCallback: () => {
                for (let key of this.settings.keys()) {
                    this.updateValueFromElement(key);
                }
                let data = this.dump();
                if (args.callback !== undefined) {
                    args.callback(data);
                }
                this.plugin.data[this.name] = data;
                this.save(data);
            },
            destroyCallback: () => {
                //Restore the original value
                for (let key of this.settings.keys()) {
                    this.updateElementFromValue(key);
                }
            }
        });
    }

    async load() {
        let data = await this.plugin.loadData(this.file);
        console.debug('Load config:', data);
        if (data) {
            for (let [key, storage] of this.settings) {
                // item.value = data?.[key] ?? item.value;
                let dataValue = data?.[key];
                if (dataValue !== undefined) {
                    storage.init(data?.[key]);
                }
            }
        }
        this.plugin.data[this.name] = this.dump();
        return data;
    }

    async save(data?: any) {
        data = data ?? this.dump();
        await this.plugin.saveData(this.file, this.dump());
        console.debug('Save config:', data);
        return data;
    }

    /**
     * read the data after saving
     * @param key key name
     * @returns setting item value
     */
    get(key: string) {
        return this.settings.get(key)?.get();
    }

    /**
     * Set data to this.settings, 
     * but do not save it to the configuration file
     * @param key key name
     * @param value value
     */
    set(key: string, value: any) {
        let storage = this.settings.get(key);
        if (storage) {
            // item.value = value;
            storage.set(value);
            this.updateElementFromValue(key);
        }
    }

    /**
     * Set and save setting item value
     * If you want to set and save immediately you can use this method
     * @param key key name
     * @param value value
     */
    async setAndSave(key: string, value: any) {
        let storage = this.settings.get(key);
        if (storage) {
            // item.value = value;
            storage.set(value);
            this.updateElementFromValue(key);
            await this.save();
        }
    }

    /**
      * Read in the value of element instead of setting obj in real time
      * @param key key name
      * @param apply whether to apply the value to the setting object
      *        if true, the value will be applied to the setting object
      * @returns value in html
      */
    take(key: string, apply: boolean = false) {
        let item = this.settings.get(key);
        let element = this.elements.get(key) as any;
        if (!element) {
            return
        }
        if (apply) {
            this.updateValueFromElement(key);
        }
        return item.getEleVal(element);
    }

    /**
     * Read data from html and save it
     * @param key key name
     * @param value value
     * @return value in html
     */
    async takeAndSave(key: string) {
        let value = this.take(key, true);
        await this.save();
        return value;
    }

    /**
     * Disable setting item
     * @param key key name
     */
    disable(key: string) {
        let element = this.elements.get(key) as any;
        if (element) {
            element.disabled = true;
        }
    }

    /**
     * Enable setting item
     * @param key key name
     */
    enable(key: string) {
        let element = this.elements.get(key) as any;
        if (element) {
            element.disabled = false;
        }
    }

    /**
     * 将设置项目导出为 JSON 对象
     * @returns object
     */
    dump(): Object {
        let data: any = {};
        for (let [key, storage] of this.settings) {
            if (storage.type === 'button') continue;
            data[key] = storage.get();
        }
        return data;
    }

    private createSettingItemStorage<T>(item: ISettingUtilsItem<T>) {
        let _storage = createSettingItemAdapter(item);
        let adapter: ISettingUtilsItemStorage = {
            ..._storage,
            type: item.type,
            getEleVal: item.getEleVal,
            setEleVal: item.setEleVal
        };

        if (adapter.getEleVal === undefined) {
            adapter.getEleVal = createDefaultElementGetter(adapter.type);
        }
        if (adapter.setEleVal === undefined) {
            adapter.setEleVal = createDefaultElementSetter(adapter.type);
        }
        return adapter;
    }

    addItem<T>(item: ISettingUtilsItem<T>, style?: Record<string, any>) {
        // this.settings.set(item.key, item);
        const IsCustom = item.type === 'custom';
        let error = IsCustom && (item.createElement === undefined || item.getEleVal === undefined || item.setEleVal === undefined);
        if (error) {
            console.error('The custom setting item must have createElement, getEleVal and setEleVal methods');
            return;
        }

        let adapter = this.createSettingItemStorage(item);
        this.settings.set(item.key, adapter);

        if (item.createElement === undefined) {
            let itemElement = this.createDefaultElement(item);
            this.elements.set(item.key, itemElement);
            this.plugin.setting.addItem({
                title: item.title,
                description: item?.description,
                direction: item?.direction,
                createActionElement: () => {
                    this.updateElementFromValue(item.key);
                    let element = this.getElement(item.key);
                    if (style) {
                        Object.assign(element.style, style);
                    }
                    return element;
                }
            });
        } else {
            this.plugin.setting.addItem({
                title: item.title,
                description: item?.description,
                direction: item?.direction,
                createActionElement: () => {
                    let val = this.get(item.key);
                    let element = item.createElement(val);
                    if (style) {
                        Object.assign(element.style, style);
                    }
                    this.elements.set(item.key, element);
                    return element;
                }
            });
        }
    }

    createDefaultElement<T>(item: ISettingUtilsItem<T>) {
        let itemElement: HTMLElement;
        //阻止思源内置的回车键确认
        const preventEnterConfirm = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        }
        switch (item.type) {
            case 'checkbox':
                let element: HTMLInputElement = document.createElement('input');
                element.type = 'checkbox';
                element.checked = item.value;
                element.className = "b3-switch fn__flex-center";
                itemElement = element;
                element.onchange = item.action?.callback ?? (() => { });
                break;
            case 'select':
                let selectElement: HTMLSelectElement = document.createElement('select');
                selectElement.className = "b3-select fn__flex-center fn__size200";
                let options = item?.options ?? {};
                for (let val in options) {
                    let optionElement = document.createElement('option');
                    let text = options[val];
                    optionElement.value = val;
                    optionElement.text = text;
                    selectElement.appendChild(optionElement);
                }
                selectElement.value = item.value;
                selectElement.onchange = item.action?.callback ?? (() => { });
                itemElement = selectElement;
                break;
            case 'slider':
                let sliderElement: HTMLInputElement = document.createElement('input');
                sliderElement.type = 'range';
                sliderElement.className = 'b3-slider fn__size200 b3-tooltips b3-tooltips__n';
                sliderElement.ariaLabel = item.value;
                sliderElement.min = item.slider?.min.toString() ?? '0';
                sliderElement.max = item.slider?.max.toString() ?? '100';
                sliderElement.step = item.slider?.step.toString() ?? '1';
                sliderElement.value = item.value;
                sliderElement.onchange = (e: Event) => {
                    sliderElement.ariaLabel = sliderElement.value;
                    item.action?.callback(e);
                }
                itemElement = sliderElement;
                break;
            case 'textinput':
                let textInputElement: HTMLInputElement = document.createElement('input');
                textInputElement.className = 'b3-text-field fn__flex-center fn__size200';
                textInputElement.value = item.value;
                textInputElement.onchange = item.action?.callback ?? (() => { });
                itemElement = textInputElement;
                textInputElement.addEventListener('keydown', preventEnterConfirm);
                break;
            case 'textarea':
                let textareaElement: HTMLTextAreaElement = document.createElement('textarea');
                textareaElement.className = "b3-text-field fn__block";
                textareaElement.value = item.value;
                textareaElement.onchange = item.action?.callback ?? (() => { });
                itemElement = textareaElement;
                break;
            case 'number':
                let numberElement: HTMLInputElement = document.createElement('input');
                numberElement.type = 'number';
                numberElement.className = 'b3-text-field fn__flex-center fn__size200';
                numberElement.value = item.value;
                if (item.slider) {
                    numberElement.min = item.slider.min.toString();
                    numberElement.max = item.slider.max.toString();
                    numberElement.step = item.slider.step.toString();
                }
                itemElement = numberElement;
                numberElement.addEventListener('keydown', preventEnterConfirm);
                break;
            case 'button':
                let buttonElement: HTMLButtonElement = document.createElement('button');
                buttonElement.className = "b3-button b3-button--outline fn__flex-center fn__size200";
                buttonElement.innerText = item.button?.label ?? 'Button';
                buttonElement.onclick = item.button?.callback ?? (() => { });
                itemElement = buttonElement;
                break;
            case 'hint':
                let hintElement: HTMLElement = document.createElement('div');
                hintElement.className = 'b3-label fn__flex-center';
                itemElement = hintElement;
                break;
        }
        return itemElement;
    }

    /**
     * return the setting element
     * @param key key name
     * @returns element
     */
    getElement(key: string) {
        // let item = this.settings.get(key);
        let element = this.elements.get(key) as any;
        return element;
    }

    private updateValueFromElement(key: string) {
        let item: ISettingUtilsItemStorage = this.settings.get(key);
        if (item.type === 'button' || item.type === 'hint') return;
        let element = this.elements.get(key) as any;
        const value = item.getEleVal(element);
        item.set(value);
    }

    private updateElementFromValue(key: string) {
        let item: ISettingUtilsItemStorage = this.settings.get(key);
        if (item.type === 'button' || item.type === 'hint') return;
        let element = this.elements.get(key) as any;
        const value = item.get();
        item.setEleVal(element, value);
    }
}