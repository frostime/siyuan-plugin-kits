/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:38:19
 * @FilePath     : /src/plugin-instance.ts
 * @LastEditTime : 2024-12-21 19:23:25
 * @Description  : 
 */
import { Plugin, App, Custom, openTab } from "siyuan";

let _plugin: Plugin;
export let app: App;
export let i18n: Plugin['i18n'];

export const registerPlugin = (plugin: Plugin) => {
    _plugin = plugin;
    app = plugin.app;
    i18n = plugin.i18n;
}

export const unregisterPlugin = () => {
    _plugin = null;
    app = null;
    i18n = null;
}

export const thisPlugin = () => _plugin;

/**
 * 打开一个自定义的 tab
 * @param args 
 */
export const openCustomTab = (args: {
    tabId: string,
    plugin?: Plugin
    title?: string,
    render?: (container: Element) => void,
    beforeDestroy?: () => void,
    icon?: string,
    position?: "right" | "bottom";
    keepCursor?: boolean; // 是否跳转到新 tab 上
    removeCurrentTab?: boolean; // 在当前页签打开时需移除原有页签
    afterOpen?: () => void; // 打开后回调
}) => {
    const plugin = args.plugin || _plugin;
    const opened = plugin.getOpenedTab();
    if (opened[args.tabId]) {
        plugin.addTab({
            'type': args.tabId,
            init(this: Custom) {
                args.render?.(this.element);
            },
            beforeDestroy() {
                args.beforeDestroy?.();
            }
        });
    }
    openTab({
        app: plugin.app,
        custom: {
            title: args.title || 'Custom Tab',
            icon: args.icon || 'iconEmoji',
            id: plugin.name + args.tabId,
        },
        position: args.position,
        keepCursor: args.keepCursor,
        removeCurrentTab: args.removeCurrentTab,
        afterOpen: args.afterOpen
    });
}
