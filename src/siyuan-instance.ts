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


export const siyuanWsParams = () => {
    const url = new URL(window.siyuan.ws.ws.url);
    const port = url.port;
    const searchParams = url.searchParams;
    return {
        port: port,
        app: searchParams.get('app'),
        wsId: searchParams.get('id'),
    }
}

/**
 * Parses and compares SiYuan kernel versions.
 * 
 * @returns An object containing:
 *   - major: The major version number
 *   - minor: The minor version number
 *   - patch: The patch version number
 *   - version: The full version string
 *   - compare: A function to compare against another version string
 */
export const siyuanVersion = () => {
    const version = window.siyuan.config.system.kernelVersion;
    const [major, minor, patch] = version.split('.').map(Number);

    const cmp = (n1: number, n2: number) => {
        if (n1 > n2) {
            return 1;
        } else if (n1 < n2) {
            return -1;
        } else {
            return 0;
        }
    };

    return { 
        major, minor, patch, version,
        /**
         * Compare the current version against another version string.
         * @param anotherVersion 
         * @returns -1 if current version is less, 1 if greater, 0 if equal
         */
        compare: (anotherVersion: string) => {
            const [amajor, aminor, apatch] = anotherVersion.split('.').map(Number);
            return cmp(major, amajor) || cmp(minor, aminor) || cmp(patch, apatch);
        }
    };
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



/**
 * 检查给定的快捷键是否与现有键映射冲突。
 * @param hotkey - 需要检查的快捷键字符串, 输入的字符必须是思源内定义的快捷键格式，可以用 translateHotkey 函数转换。
 * @returns 返回一个数组，包含所有与 `hotkey` 冲突的键映射路径及其 `custom` 和 `default` 值。
 */
export const checkHotkeyConflict = (hotkey: string) => {
    const root: object = window.siyuan.config.keymap;

    let conflict: {
        path: string;
        accessor: () => ({ custom: string; default: string });
        custom: string;
        default: string;
        isCustomConflict: boolean;  // custom 和当前 hotkey 冲突
    }[] = [];

    /**
     * 深度优先遍历键映射对象，检查快捷键冲突。
     * @param keymapObj - 当前遍历的键映射对象。
     * @param path - 当前路径，用于记录键映射的层级关系。
     */
    const dfs = (keymapObj: object, path: string[]) => {
        // 如果当前对象是叶子节点（包含 `custom` 和 `default` 属性）
        if ('custom' in keymapObj && 'default' in keymapObj) {
            // 检查 `custom` 或 `default` 是否与 `hotkey` 冲突
            if (keymapObj['custom'] === hotkey || keymapObj['default'] === hotkey) {
                conflict.push({
                    path: path.join('.'),
                    custom: keymapObj['custom'] as string,
                    default: keymapObj['default'] as string,
                    isCustomConflict: keymapObj['custom'] === hotkey,
                    accessor: () => {
                        // 根据路径访问冲突的键映射节点
                        let node = root;
                        for (let p of path) {
                            node = node[p];
                        }
                        return node as { custom: string; default: string };
                    }
                });
            }
        } else {
            // 如果不是叶子节点，继续递归遍历子节点
            for (const key in keymapObj) {
                dfs(keymapObj[key], [...path, key]);
            }
        }
    };

    // 从根节点开始遍历
    dfs(root, []);

    return conflict;
};