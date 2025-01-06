/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-19 18:30:12
 * @FilePath     : /src/settings/types.ts
 * @LastEditTime : 2025-01-06 20:35:49
 * @Description  : 
 */
export type TSettingItemType = "checkbox" | "select" | "textinput" | "textarea" | "number" | "slider" | "button" | "hint" | "custom";

export interface ISettingItemDefinition<T> {
    type: TSettingItemType;
    key: string;
    value: any;
    placeholder?: string;
    slider?: {
        min: number;
        max: number;
        step: number;
    };
    options?: { [key: string | number]: string };
    button?: {
        label: string;
        callback: () => void;
    },
    devicewise?: boolean;  // 如果为 true, 意味着不同设备的配置选项需要不一样
}

/**
 * 主要是用在需要分设备独立的配置项的情况下
 */
export interface ISettingItemAdapter<T> {
    key: string;
    storage: T | Record<string, T>;  // 如果为 devicewise 为 true, 则需要存储各个设备的 value
    get: () => T;
    set: (val: T) => void;
    init: (storage: T | Record<string, T>) => void;
}


//Interface for setting-utils
export interface ISettingUtilsItem<T> extends ISettingItemDefinition<T> {
    title: string;
    description: string;
    direction?: "row" | "column";
    action?: {
        callback: (e?: Event) => void;
    }
    createElement?: (currentVal: T) => HTMLElement;
    getEleVal?: (ele: HTMLElement) => T;
    setEleVal?: (ele: HTMLElement, val: T) => void;
}
