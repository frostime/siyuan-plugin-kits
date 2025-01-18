/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:38:19
 * @FilePath     : /src/plugin-instance.ts
 * @LastEditTime : 2025-01-18 21:49:39
 * @Description  : 
 */
import { Plugin, App, Custom, openTab, IMenu, Menu, IEventBusMap, Protyle } from "siyuan";
import { IPluginProtyleSlash } from "./types";
import { getFileBlob, putFile, removeFile } from "./api";

type Disposer = () => void;

export interface PluginExtends extends Plugin {
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
     * @returns plugin.addTopBar 返回的 HTMLElement
     */
    registerTopbarMenu(args: Omit<Parameters<Plugin['addTopBar']>[0], 'callback'> & {
        menus: IMenu[] | (() => IMenu[]),
        beforeShow?: (menu: Menu, event: MouseEvent) => void,
        isLeft?: boolean
    }): HTMLElement;

    /**
     * Register eventbus handler for SiYuan
     * The registered handler will be automatically disconnected when the plugin is unloaded
     * The return is the dispose function, you can call it manually to disconnect the handler
     * @param event 
     * @param handler 
     * @returns () => void
     */
    registerEventbusHandler<T extends keyof IEventBusMap>(
        event: T,
        handler: (detail: IEventBusMap[T]) => void
    ): Disposer;

    registerOnClickBlockicon(callback: (details: IEventBusMap['click-blockicon'] & {
        blocks: Array<{
            type: string;
            id: string;
        }>
    }) => void): Disposer

    registerOnClickDocIcon(callback: (details: IEventBusMap['click-editortitleicon'] & {
        root_id: string;
    }) => void): Disposer

    registerOnDestroyProtyle(callback: (details: IEventBusMap['destroy-protyle']) => void): Disposer

    /**
     * Load a blob from storage
     * @param storageName Storage name
     * @param prefix Storage path prefix
     */
    loadBlob(storageName: string, prefix?: string): Promise<Blob | null>;

    /**
     * Save data as blob to storage
     * @param storageName Storage name
     * @param data Data to save (Blob, File, Object, or string)
     * @param prefix Storage path prefix
     */
    saveBlob(storageName: string, data: Blob | File | Object | string, prefix?: string): Promise<Blob | null>;

    /**
     * Remove a blob from storage
     * @param storageName Storage name
     * @param prefix Storage path prefix
     */
    removeBlob(storageName: string, prefix?: string): Promise<any>;
}

let _plugin: PluginExtends;
let unloadCallbacks: Array<(plugin?: Plugin) => void> = [];

export let app: App;
export let i18n: Plugin['i18n']

export const addUnloadCallback = (callback: (plugin?: Plugin) => void) => {
    unloadCallbacks.push(callback);
}

export const registerPlugin = <T extends Plugin>(plugin: T) => {

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
                        if (args.beforeShow) {
                            args.beforeShow(menu, event);
                        }
                        const rect = topbar.getBoundingClientRect();
                        menu.open({
                            x: args.isLeft ? rect.right : rect.left,
                            y: rect.bottom,
                            isLeft: args.isLeft
                        });
                    }

                    const topbar = plugin.addTopBar({ ...rest, callback: showMenu });
                    return topbar;
                },

                registerEventbusHandler<T extends keyof IEventBusMap>(
                    event: T,
                    handler: (detail: IEventBusMap[T]) => void
                ): Disposer {
                    const handlerWrapper = (e: CustomEvent<IEventBusMap[T]>) => {
                        handler(e.detail);
                    }
                    plugin.eventBus.on(event, handlerWrapper);
                    let disposed = false;
                    const dispose = () => {
                        if (disposed) return;
                        plugin.eventBus.off(event, handlerWrapper);
                        disposed = true;
                    }
                    addUnloadCallback(dispose);
                    return dispose;
                },

                registerOnClickBlockicon(callback: (details: IEventBusMap['click-blockicon'] & {
                    blocks: Array<{
                        type: string;
                        id: string;
                    }>
                }) => void): Disposer {

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
                    let disposed = false;
                    const dispose = () => {
                        if (disposed) return;
                        plugin.eventBus.off("click-blockicon", onClickBlock);
                        disposed = true;
                    }
                    addUnloadCallback(dispose);
                    return dispose;
                },

                registerOnClickDocIcon(callback: (details: IEventBusMap['click-editortitleicon'] & {
                    root_id: string;
                }) => void): Disposer {
                    const onClick = async (e: CustomEvent<IEventBusMap['click-editortitleicon']>) => {
                        let details = e.detail;
                        let root_id = details.data.rootID;
                        await callback({
                            ...details,
                            root_id
                        });
                    }

                    target.eventBus.on('click-editortitleicon', onClick);
                    let disposed = false;
                    const dispose = () => {
                        if (disposed) return;
                        target.eventBus.off('click-editortitleicon', onClick);
                        disposed = true;
                    }
                    addUnloadCallback(dispose);
                    return dispose;
                },

                registerOnLoadedProtyleStatic(callback: (details: IEventBusMap['loaded-protyle-static']) => void): Disposer {
                    return _plugin.registerEventbusHandler('loaded-protyle-static', callback);
                },

                registerOnLoadedProtyleDynamic(callback: (details: IEventBusMap['loaded-protyle-dynamic']) => void): Disposer {
                    return _plugin.registerEventbusHandler('loaded-protyle-dynamic', callback);
                },

                registerOnSwitchProtyle(callback: (details: IEventBusMap['switch-protyle']) => void): Disposer {
                    return _plugin.registerEventbusHandler('switch-protyle', callback);
                },

                registerOnDestroyProtyle(callback: (details: IEventBusMap['destroy-protyle']) => void): Disposer {
                    return _plugin.registerEventbusHandler('destroy-protyle', callback);
                },

                loadBlob(storageName: string, prefix: string = '/data/storage/petal/{{plugin}}'): Promise<Blob | null> {
                    prefix = prefix.replace('{{plugin}}', target.name);
                    return getFileBlob(`${prefix}/${storageName}`);
                },

                saveBlob(storageName: string, data: Blob | File | Object | string, prefix: string = '/data/storage/petal/{{plugin}}'): Promise<Blob | null> {
                    let dataBlob: Blob | File;

                    if (data instanceof Blob) {
                        dataBlob = data;
                    } else if (data instanceof File) {
                        dataBlob = data;
                    } else if (typeof data === 'object') {
                        dataBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
                    } else if (typeof data === 'string') {
                        dataBlob = new Blob([data], { type: 'text/plain' });
                    } else {
                        throw new Error('Unsupported data type');
                    }

                    prefix = prefix.replace('{{plugin}}', target.name);
                    const pathString = `${prefix}/${storageName}`;
                    const file = new File([dataBlob], pathString.split("/").pop());

                    return putFile(pathString, false, file);
                },

                removeBlob(storageName: string, prefix: string = '/data/storage/petal/{{plugin}}'): Promise<any> {
                    prefix = prefix.replace('{{plugin}}', target.name);
                    return removeFile(`${prefix}/${storageName}`);
                },
            };

            //如果 target 本来就有这个方法,就返回这个方法
            if (prop in target) { // 修改这里
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
    tabData?: any,
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
    let tab = openTab({
        app: plugin.app,
        custom: {
            title: args.title || 'Custom Tab',
            icon: args.icon || 'iconEmoji',
            id: plugin.name + args.tabId,
            data: args.tabData
        },
        position: args.position,
        keepCursor: args.keepCursor,
        removeCurrentTab: args.removeCurrentTab,
        afterOpen: args.afterOpen
    });
    return tab;
}


export const clearSlash = (protyle: Protyle) => {
    protyle.insert(window.Lute.Caret, false, false);
}
