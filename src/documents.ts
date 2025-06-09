/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2025-01-01 15:22:48
 * @FilePath     : /src/documents.ts
 * @LastEditTime : 2025-06-09 14:07:45
 * @Description  : 
 */
import { createDocWithMd, listDocsByPath, removeDocByID, renameDocByID, setBlockAttrs, sql, updateBlock } from "./api";
import { getBlockByID, id2block, searchChildDocs } from "./search";
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
 * Create and use a document for plugin purpose
 * @param createOptions - The options for creating the document
 * @param createOptions.createCallback - Custom document creation callback
 * @param createOptions.notebook - The notebook id for creating the document
 * @param createOptions.dir - The directory for creating the document
 * @param createOptions.title - The title for creating the document
 * @param createOptions.content - The content for creating the document
 * @returns Document operation interface
 */
export const useDocument = async (createOptions?: {
    notebook?: NotebookId;
    dir?: string;
    title?: string;
    content?: string;
    createCallback?: () => Promise<BlockId>;
}): Promise<{
    id: DocumentId;
    setContent: (markdown: string) => Promise<unknown>;
    setTitle: (title: string) => Promise<unknown>;
    delete: () => Promise<unknown>;
    setAttrs: (attrs: { [key: string]: string }) => Promise<unknown>;
}> => {
    let docId: DocumentId;
    const createFun = async () => {
        let options = {
            notebook: null,
            dir: '/',
            title: 'New Doc',
            content: '',
            ...createOptions
        };

        if (!options.notebook) {
            const notebooks = window.siyuan.notebooks.filter(n => n.closed === false);
            if (notebooks.length === 0) {
                throw new Error('No opened notebook found');
            }
            options.notebook = notebooks[0].id;
        }
        if (!options.dir.endsWith('/')) {
            options.dir = options.dir + '/';
        }
        if (options.title.startsWith('/')) {
            options.title = options.title.slice(1);
        }
        return await createDocWithMd(options.notebook, `${options.dir}${options.title}`, options.content);
    }

    if (createOptions?.createCallback) {
        docId = await createOptions.createCallback();
    } else {
        docId = await createFun();
    }

    return {
        id: docId,
        setContent: async (markdown: string) => {
            return updateBlock('markdown', markdown, docId);
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
        notebook?: NotebookId;
        dir?: string;
        title?: string;
        content?: string;
        createCallback?: () => Promise<BlockId>;
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


export const getParentDoc = async (docId: DocumentId) => {
    const doc = await getBlockByID(docId);
    if (!doc) {
        return null;
    }

    const path = doc.path;
    const parts = path.split('/').filter(p => p !== '');
    if (parts.length <= 1) {
        return null;
    }
    // 获取倒数第二个
    const parentId = parts[parts.length - 2];
    const parentDoc = await getBlockByID(parentId);
    if (!parentDoc) {
        return null;
    }
    return parentDoc;
}


/**
 * 列出子文档
 */
export const listSubDocs = (root: DocumentId, depth = 1) => {
    const MAX_DEPTH = 8;
    const buildTree = async (docId: DocumentId, depth = 1) => {
        if (depth > MAX_DEPTH) return [];
        let children = await searchChildDocs(docId);
        //@ts-ignore
        children = children.map(documentMapper);
        const result = [];

        for (const child of children) {
            result.push({
                ...child,
                children: await buildTree(child.id, depth + 1)
            });
        }

        return result;
    };
    if (root) {
        return buildTree(root, depth);
    }
}


export const listSiblingDocs = async (docId: DocumentId) => {
    const doc = await getBlockByID(docId);
    if (!doc) {
        return null;
    }

    const path = doc.path;
    const parts = path.split('/');
    if (parts.length <= 1) {
        return null;
    }

    const parentPath = parts.slice(0, -1).join('/');
    const docs = await listDocsByPath(doc.box, parentPath);
    if (!docs || docs.length === 0) {
        return null;
    }

    let blocks = await id2block(docs.files.map(doc => doc.id));
    return blocks;
}

export const listNotebookDocs = async (notebookId: NotebookId, depth: number = 1) => {
    let topLevel = await listDocsByPath(notebookId, '');
    if (!topLevel || topLevel.length === 0) {
        return null;
    }

    let topLevelDocs = await id2block(topLevel.files.map(doc => doc.id));
    if (depth === undefined || depth === 1) {
        return topLevelDocs;
    }

    const subDepth = depth - 1;
    const subDocs = await Promise.all(
        topLevelDocs.map(async (doc) => {
            const subDocs = await listSubDocs(doc.id, subDepth);
            return {
                ...doc,
                children: subDocs
            };
        })
    );

    return subDocs;
}
