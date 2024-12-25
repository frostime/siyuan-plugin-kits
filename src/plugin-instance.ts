/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:38:19
 * @FilePath     : /src/plugin-instance.ts
 * @LastEditTime : 2024-12-25 20:13:08
 * @Description  : 
 */
import { Plugin, App, Custom, openTab, IMenu, Menu, IEventBusMap } from "siyuan";
import { IPluginProtyleSlash } from "./types";

interface PluginExtends extends Plugin {
    registerUnloadCallback(callback: (plugin?: Plugin) => void): void

    /**
     * 添加 protyle slash, 如果 slash.id 已经存在,不会添加
     * @param slash 
     */
    addProtyleSlash(slash: IPluginProtyleSlash): void;
    /**
     * 删除 protyle slash
     * @param id 
     */
    delProtyleSlash(id: string): void;
    /**
     * 删除命令
     * @param id 
     */
    delCommand(id: string): void;
    /**
     * 快速注册一个顶部菜单
     * @param args 
     */
    registerTopbarMenu(args: Omit<Parameters<Plugin['addTopBar']>[0], 'callback'> & {
        beforeShow: (menu: Menu, event: MouseEvent) => void,
        menus: IMenu[] | (() => IMenu[]),
        isLeft?: boolean
    }): void;

    registerEventbusHandler(event: keyof IEventBusMap, handler: (data: any) => void): void;

    registerOnClickBlockicon(callback: (details: IEventBusMap['click-blockicon'] & {
        blocks: Array<{
            type: string;
            id: string;
        }>
    }) => void): void
}

let _plugin: PluginExtends;
let unloadCallbacks: Array<(plugin?: Plugin) => void> = [];

export let app: App;
export let i18n: Plugin['i18n']

export const addUnloadCallback = (callback: (plugin?: Plugin) => void) => {
    unloadCallbacks.push(callback);
}

export const registerPlugin = (plugin: Plugin) => {

    const proxyPlugin = new Proxy(plugin, {
        get(target: Plugin, prop: string) {
            // Add the new methods
            const extraMethods = {
                registerUnloadCallback(callback: (plugin?: Plugin) => void) {
                    addUnloadCallback(callback);
                },

                addProtyleSlash(slash: IPluginProtyleSlash) {
                    for (let i = 0; i < target.protyleSlash.length; i++) {
                        if (target.protyleSlash[i].id === slash.id) {
                            return;
                        }
                    }
                    target.protyleSlash.push(slash);
                },
                delProtyleSlash(id: string) {
                    target.protyleSlash = target.protyleSlash.filter(slash => slash.id !== id);
                },
                delCommand(id: string) {
                    target.commands = target.commands.filter((command) => command.langKey !== id);
                },
                registerTopbarMenu(args: Parameters<PluginExtends['registerTopbarMenu']>[0]) {
                    const { menus, ...rest } = args;

                    const menuCreator = typeof menus === 'function' ? menus : () => menus;

                    const showMenu = (event: MouseEvent) => {
                        let menu = new Menu(plugin.name);
                        for (let item of menuCreator()) {
                            menu.addItem(item);
                        }
                        args.beforeShow && args.beforeShow(menu, event);
                        const rect = topbar.getBoundingClientRect();
                        menu.open({
                            x: rect.left,
                            y: rect.bottom,
                            isLeft: args.isLeft
                        });
                    }

                    const topbar = plugin.addTopBar({ ...rest, callback: showMenu });
                },

                registerEventbusHandler(event: keyof IEventBusMap, handler: (data: any) => void) {
                    const handlerWrapper = (data: any) => {
                        handler(data);
                    }
                    plugin.eventBus.on(event, handlerWrapper);
                    addUnloadCallback(() => {
                        plugin.eventBus.off(event, handlerWrapper);
                    });
                },

                registerOnClickBlockicon(callback: (details: IEventBusMap['click-blockicon'] & {
                    blocks: Array<{
                        type: string;
                        id: string;
                    }>
                }) => void) {

                    async function onClickBlock({ detail }: CustomEvent<IEventBusMap['click-blockicon']>) {
                        let blocksDetails = detail.blockElements.map((blockElement) => {
                            return {
                                type: blockElement.getAttribute("data-type"),
                                id: blockElement.getAttribute("data-node-id"),
                            }
                        });

                        await callback({
                            ...detail,
                            blocks: blocksDetails
                        });
                    }

                    plugin.eventBus.on("click-blockicon", onClickBlock);
                    addUnloadCallback(() => {
                        plugin.eventBus.off("click-blockicon", onClickBlock);
                    });
                }
            };

            //如果 target 本来就有这个方法,就返回这个方法
            if (target.hasOwnProperty(prop)) {
                return target[prop];
            }

            //如果 target 没有这个方法,就返回 extraMethods 的方法
            if (extraMethods.hasOwnProperty(prop)) {
                return extraMethods[prop];
            }
        }
    });

    _plugin = proxyPlugin as typeof _plugin;
    // 重写 _plugin.onunload
    const originalOnunload = _plugin.onunload ?? (() => { });
    _plugin.onunload = () => {
        originalOnunload.call(_plugin);
        // 执行所有注册的卸载回调
        unloadCallbacks.forEach(callback => {
            try {
                callback(_plugin);
            } catch (e) {
                console.error('Error executing unload callback:', e);
            }
        });
        // 清空回调列表
        unloadCallbacks = [];
    }

    app = plugin.app;
    i18n = plugin.i18n;
    return _plugin;
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
    if (!opened[args.tabId]) {
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
