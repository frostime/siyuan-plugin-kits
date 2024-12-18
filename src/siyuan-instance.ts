import { App, getFrontend, openMobileFileById, openTab } from "siyuan";

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

export const openBlock = (id: string, app?: App) => {
    app = app || pluginInstance?.app;
    if (isMobile()) {
        openMobileFileById(app, id);
    } else {
        openTab({
            app: app,
            doc: {
                id: id,
                zoomIn: false,
            },
        });
    }
};

export const findPlugin = (name: string): Plugin => {
    let plugin = window.siyuan.ws.app.plugins.find(p => p.name === name);
    return plugin;
}


export const getNotebook = (boxId: string): Notebook => {
    let notebooks: Notebook[] = window.siyuan.notebooks;
    for (let notebook of notebooks) {
        if (notebook.id === boxId) {
            return notebook;
        }
    }
}

export function getActiveDoc() {
    let tab = document.querySelector("div.layout__wnd--active ul.layout-tab-bar>li.item--focus");
    let dataId: string = tab?.getAttribute("data-id");
    if (!dataId) {
        return null;
    }
    const activeTab: HTMLDivElement = document.querySelector(
        `.layout-tab-container.fn__flex-1>div.protyle[data-id="${dataId}"]`
    ) as HTMLDivElement;
    if (!activeTab) {
        return;
    }
    const eleTitle = activeTab.querySelector(".protyle-title");
    let docId = eleTitle?.getAttribute("data-node-id");
    return docId;
}
