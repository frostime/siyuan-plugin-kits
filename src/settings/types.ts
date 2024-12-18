/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-19 18:30:12
 * @FilePath     : /src/settings/types.ts
 * @LastEditTime : 2024-12-18 21:04:08
 * @Description  : 
 */
export type TSettingItemType = "checkbox" | "select" | "textinput" | "textarea" | "number" | "slider" | "button" | "hint" | "custom";

export interface ISettingItemCore {
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
    }
}

export interface ISettingItem extends ISettingItemCore {
    title: string;
    description: string;
    direction?: "row" | "column";
    localOnly?: boolean; // 如果为 true，则各个设备使用独立的 deviceStorage
}

//Interface for setting-utils
export interface ISettingUtilsItem extends ISettingItem {
    action?: {
        callback: () => void;
    }
    createElement?: (currentVal: any) => HTMLElement;
    getEleVal?: (ele: HTMLElement) => any;
    setEleVal?: (ele: HTMLElement, val: any) => void;
}
