import { App, getFrontend, openMobileFileById, openTab, TProtyleAction } from "siyuan";

import { Plugin } from "siyuan";
import { Notebook } from "./types";


import * as pluginInstance from "./plugin-instance";

export const matchIDFormat = (id: string) => {
    let match = id.match(/^\d{14}-[a-z0-9]{7}$/);
    if (match) {
        return true;
    } else {
        return false;
    }
}

export const isMobile = () => {
    return getFrontend().endsWith('mobile');
}

export const openBlock = (id: string, options: {
    app?: App;
    zoomIn?: boolean;
    action?: TProtyleAction[];
} = {}) => {
    let app = options.app || pluginInstance?.app;
    if (isMobile()) {
        openMobileFileById(app, id);
    } else {
        openTab({
            app: app,
            doc: {
                id: id,
                zoomIn: options.zoomIn,
                action: options.action,
            },
        });
    }
};

export const findPlugin = (name: string): Plugin => {
    let plugin = window.siyuan.ws.app.plugins.find(p => p.name === name);
    return plugin;
}

const User_Helps: Set<string> = new Set(["思源笔记用户指南", "SiYuan User Guide"]);

export const lsOpenedNotebooks = (options: {
    opened: boolean;
    userHelp: boolean;
} = {
    opened: true,
    userHelp: false,
}) => {
    let all_notebooks = window.siyuan.notebooks as Notebook[];
    let notebooks = all_notebooks.filter(
        notebook => {
            if (options.opened === true && notebook.closed) {
                return false;
            }
            if (options.userHelp === false && User_Helps.has(notebook.name)) {
                return false;
            }
            return true;
        }
    );
    return notebooks;
}


export const getNotebook = (boxId: string): Notebook => {
    let notebooks: Notebook[] = window.siyuan.notebooks;
    for (let notebook of notebooks) {
        if (notebook.id === boxId) {
            return notebook;
        }
    }
}

/**
 * 将 Hot key 翻译为思源内部的接受的配置
 * 例如 translateHotkey('Ctrl+Shift+F')
 */
export function translateHotkey(hotkey: string): string {
    // 定义映射关系
    const keyMap: Record<string, string> = {
        'Ctrl': '⌘',
        'Shift': '⇧',
        'Alt': '⌥',
        'Tab': '⇥',
        'Backspace': '⌫',
        'Delete': '⌦',
        'Enter': '↩'
    };

    // 分割快捷键字符串
    const keys = hotkey.split('+').map(key => key.trim());

    // 标准化顺序：Alt -> Shift -> Ctrl -> 其他键
    const standardOrder = ['Alt', 'Shift', 'Ctrl'];

    // 分离修饰键和普通键
    const modifiers = keys.filter(key => standardOrder.includes(key));
    const otherKeys = keys.filter(key => !standardOrder.includes(key));

    // 对修饰键进行排序
    modifiers.sort((a, b) =>
        standardOrder.indexOf(a) - standardOrder.indexOf(b)
    );

    // 转换所有键
    const translatedKeys = [...modifiers, ...otherKeys].map(key =>
        keyMap[key] || key
    );

    // 连接所有键
    return translatedKeys.join('');
}
