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

export const plugin = new Proxy(_plugin, {
    get(target, prop) {
        return target[prop];
    }
});

/**
 * 打开一个自定义的 tab
 * @param args 
 */
export const openCustomTab = (args: {
    tabId: string,
    render: (container: Element) => void,
    destroyCb: () => void,
    plugin?: Plugin
    title?: string,
    icon?: string,
}) => {
    const plugin = args.plugin || _plugin;
    plugin.addTab({
        'type': args.tabId,
        init(this: Custom) {
            args.render(this.element);
        },
        beforeDestroy() {
            args.destroyCb();
        }
    });
    openTab({
        app: plugin.app,
        custom: {
            title: args.title || 'Custom Tab',
            icon: args.icon || 'iconEmoji',
            id: plugin.name + args.tabId,
        }
    });
}
