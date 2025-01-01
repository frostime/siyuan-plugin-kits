/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2025-01-01 15:22:48
 * @FilePath     : /src/documents.ts
 * @LastEditTime : 2025-01-01 17:13:37
 * @Description  : 
 */
import { createDocWithMd, removeDocByID, renameDocByID, setBlockAttrs, sql, updateBlock } from "./api";
import { DocumentId, NotebookId } from "./types";

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


/**
 * Use a document that with specific attribute
 * This is useful when you want to use a specific document for your special purpose
 * @param options 
 * @returns 
 */
export const useDocumentWithAttr = async (options: {
    name: string;
    value: string;
    cond?: string;
    createOptions?: {
        notebook?: NotebookId;
        dir?: string;
        title?: string;
        content?: string;
    }
}): Promise<{
    id: DocumentId;
    isNew: boolean;
    duplicates: DocumentId[];
    setContent: (markdown: string) => Promise<unknown>;
    setTitle: (title: string) => Promise<unknown>;
    delete: () => Promise<unknown>;
    setAttrs: (attrs: { [key: string]: string }) => Promise<unknown>;
}> => {

    let docs = await sql(`
        SELECT B.*
        FROM blocks AS B
        WHERE B.id IN (
            SELECT A.block_id
            FROM attributes AS A
            WHERE A.name = '${options.name}' AND A.value = '${options.value}'
        ) ${options.cond ? 'AND ' + options.cond : ''}
        order by created;
        `);

    let isNew: boolean = false;
    let docId: DocumentId | null = null;


    if (!docs || docs.length === 0) {
        isNew = true;
        let createOptions = {
            notebook: null,
            dir: '/',
            title: 'New Doc',
            content: '',
        };
        if (options.createOptions) {
            createOptions = {
                ...createOptions,
                ...options.createOptions,
            }
        }
        if (!createOptions.notebook) {
            const notebooks = window.siyuan.notebooks.filter(n => n.closed === false);
            if (notebooks.length === 0) {
                throw new Error('No opened notebook found');
            }
            createOptions.notebook = notebooks[0].id;
        }
        if (!createOptions.dir.endsWith('/')) {
            createOptions.dir = createOptions.dir + '/';
        }
        if (createOptions.title.startsWith('/')) {
            createOptions.title = createOptions.title.slice(1);
        }
        docId = await createDocWithMd(createOptions.notebook, `${createOptions.dir}${createOptions.title}`, createOptions.content);
        await setBlockAttrs(docId, {
            [options.name]: options.value,
        });
    }

    let duplicates: DocumentId[] = [];
    if (docs.length >= 1) {
        docId = docs[0].id;
        duplicates = docs.slice(1).map(d => d.id);
    }

    const mixin = (docId: DocumentId) => {
        return {
            setContent: async (markdown: string) => {
                await updateBlock('markdown', markdown, docId);
                // 更新 block 之后可能会丢失属性
                await setBlockAttrs(docId, {
                    [options.name]: options.value,
                });
            },
            setTitle: async (title: string) => {
                return renameDocByID(docId, title);
            },
            delete: async () => {
                return removeDocByID(docId);
            },
            setAttrs: async (attrs: { [key: string]: string }) => {
                return setBlockAttrs(docId, attrs);
            }
        }
    }

    return {
        isNew,
        duplicates,
        id: docId,
        ...(mixin(docId))
    }
}
