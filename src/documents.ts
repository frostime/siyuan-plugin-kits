/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2025-01-01 15:22:48
 * @FilePath     : /src/documents.ts
 * @LastEditTime : 2025-01-02 11:55:44
 * @Description  : 
 */
import { createDocWithMd, removeDocByID, renameDocByID, setBlockAttrs, sql, updateBlock } from "./api";
import { BlockId, DocumentId, NotebookId } from "./types";

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
 * @param options.name - The name of the attribute
 * @param options.value - The value of the attribute
 * @param options.cond - The condition of the attribute
 * @param options.createOptions - The options for creating the document
 * @param options.createOptions.createCallback - The callback for creating the document, if this is provided, the document will be created by this callback, ignore other options
 * @param options.createOptions.notebook - The notebook id for creating the document; applied when createCallback is not provided
 * @param options.createOptions.dir - The directory for creating the document; applied when createCallback is not provided
 * @param options.createOptions.title - The title for creating the document; applied when createCallback is not provided
 * @param options.createOptions.content - The content for creating the document; applied when createCallback is not provided
 * @returns 
 */
export const useDocumentWithAttr = async (options: {
    name: string;
    value: string;
    cond?: string;
    createOptions?: {
        createCallback?: () => Promise<BlockId>;
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
        const createFun = async () => {
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
            return docId;
        }
        if (options.createOptions?.createCallback) {
            docId = await options.createOptions.createCallback();
        } else {
            docId = await createFun();
        }
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
