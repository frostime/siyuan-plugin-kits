/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2025-01-01 15:26:17
 * @FilePath     : /src/javascripts.ts
 * @LastEditTime : 2025-01-01 15:32:26
 * @Description  : 帮助自定义 javascript 模块；存储在思源中供插件自定义使用
 */

import { getFileBlob, putFile } from "./api";
import { thisPlugin } from "./plugin-instance";

export const createJavascriptFile = async (code: string, name: string, prefix: string = '/data/storage/petal/{{plugin}}') => {
    if (prefix.includes('{{plugin}}')) {
        const plugin = thisPlugin();
        if (plugin) {
            prefix = prefix.replaceAll('{{plugin}}', plugin.name);
        } else {
            console.error('Can not get plugin instance, so failed to parse {{plugin}} in prefix!');
        }
    }

    const file = new File([code], name, { type: 'text/javascript' });
    if (prefix.endsWith('/')) {
        prefix = prefix.slice(0, -1);
    }
    const path = `${prefix}/${name}`;
    const res = await putFile(path, false, file);
    return res;
}


export const importJavascriptFile = async (name: string, prefix: string = '/data/storage/petal/{{plugin}}') => {
    if (prefix.includes('{{plugin}}')) {
        const plugin = thisPlugin();
        if (plugin) {
            prefix = prefix.replaceAll('{{plugin}}', plugin.name);
        } else {
            console.error('Can not get plugin instance, so failed to parse {{plugin}} in prefix!');
        }
    }
    if (prefix.endsWith('/')) {
        prefix = prefix.slice(0, -1);
    }
    const path = `${prefix}/${name}`;
    const blob = await getFileBlob(path);
    if (!blob) {
        return null;
    }
    const url = URL.createObjectURL(blob);

    try {
        const module = await import(/* webpackIgnore: true */ url);
        return module;
    } catch (importError) {
        return null;
    } finally {
        URL.revokeObjectURL(url);  // 确保在出错时也清理 URL
    }
}

