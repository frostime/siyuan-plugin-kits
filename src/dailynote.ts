/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-19 21:06:07
 * @FilePath     : /src/dailynote.ts
 * @LastEditTime : 2025-02-18 11:24:05
 * @Description  : From git@github.com:frostime/siyuan-dailynote-today.git
 */

import { formatDateTime, formatSiYuanDate } from "./time";
import { appendBlock, createDocWithMd, getIDsByHPath, getNotebookConf, renderSprig, request, setBlockAttrs, sql } from "./api";
import { Block, NotebookId } from "./types";
import { getNotebook } from "./siyuan-instance";
import { thisPlugin } from "./plugin-instance";

/**
 * 对 DailyNote 的自定义属性进行设置, custom-dailynote-yyyyMMdd: yyyyMMdd
 * https://github.com/siyuan-note/siyuan/issues/9807
 * @param doc_id 日记的 id
 */
export async function setCustomDNAttr(doc_id: string, date?: Date) {
    let td = formatSiYuanDate(date);
    let attr = `custom-dailynote-${td}`;
    let attrs: { [key: string]: string } = {};
    attrs[attr] = td;
    await setBlockAttrs(doc_id, attrs);
}


/**
 * 获取日记本 dailynote 路径的 sprig 模板
 * @param notebookId 
 * @returns 
 */
export async function getDailynoteSprig(notebookId: string): Promise<string> {
    let conf = await getNotebookConf(notebookId);
    let sprig: string = conf.conf.dailyNoteSavePath;
    return sprig;
}

export async function getDailynoteHpath(notebookId: NotebookId, date: Date): Promise<string> {
    let notebook = getNotebook(notebookId);
    if (notebook === null) {
        // throw new Error('DailyNoteToday: 请先设置日记本');
        return null;
    }

    let dnSprig = await getDailynoteSprig(notebook.id);
    if (dnSprig === undefined) {
        // throw new Error('DailyNoteToday: 请先设置日记本');
        return null;
    }

    let dateStr = formatDateTime('yyyy-MM-dd', date);
    let sprig = `toDate "2006-01-02" "${dateStr}"`;

    dnSprig = dnSprig.replaceAll(/now/g, sprig);

    let hpath = await renderSprig(dnSprig)

    return hpath;
}

/**
 * 创建 dailynote 日记
 * 如果已经存在，在直接返回 id；如果不存在，则创建日记并返回 id
 * @param boxId 
 * @param date 
 * @param createContent 创建日记时，日记的内容
 * @returns 
 */
export async function createDailynote(boxId: NotebookId, date?: Date, createContent?: string) {
    let isToday = date === undefined;
    date = date ?? new Date();

    let hpath = await getDailynoteHpath(boxId, date);
    let ids = await getIDsByHPath(boxId, hpath);
    if (ids.length > 0) {
        return ids[0];
    }

    let docId: string = "";
    if (isToday) {
        let url = '/api/filetree/createDailyNote';
        let result = await request(url, { notebook: boxId, app: thisPlugin().app });
        docId = result.id as string;
    } else {
        docId = await createDocWithMd(boxId, hpath, createContent || "");
        if (createContent === undefined) {
            const notebookConf = await getNotebookConf(boxId);
            // notebookConf.conf.dailyNoteTemplatePath;
            const dataDir = window.siyuan.config.system.dataDir;
            const templatePath = `${dataDir}/templates/${notebookConf.conf.dailyNoteTemplatePath}`;

            const { content } = await request('/api/template/render', {
                id: docId,
                path: templatePath,
                preview: false
            });
            await appendBlock('dom', content, docId);
        }
    }

    if (!docId) {
        return null;
    }

    await setCustomDNAttr(docId, date);

    return docId;
}

export const createDiary = createDailynote;


export const searchDailynote = async (boxId: NotebookId, date: Date, options?: {
    returnAll?: boolean;
}): Promise<Block | Block[]> => {
    let returnAll = options?.returnAll ?? false;

    const dateStr = formatSiYuanDate(date);
    const query = `
        SELECT B.*
        FROM blocks AS B
        WHERE B.type = 'd' AND B.box = '${boxId}' AND B.id IN (
            SELECT A.block_id
            FROM attributes AS A
            WHERE A.name = 'custom-dailynote-${dateStr}'
        ) ORDER BY B.created DESC;
        `;
    const docs = await sql(query);
    // return docs?.[0]?.id ?? null;
    if (!docs || docs.length === 0) {
        return null;
    }
    if (returnAll === true) {
        return docs;
    }
    return docs[0];
}


export const listDailynote = async (options?: {
    boxId?: NotebookId;
    before?: Date;
    after?: Date;
    limit?: number;
}): Promise<Block[]> => {
    const { boxId, before, after, limit } = options ?? {};
    const query = `
    SELECT B.*, A.value
    FROM blocks AS B
    LEFT JOIN attributes AS A ON B.id = A.block_id AND A.name LIKE 'custom-dailynote-%'
    WHERE B.type = 'd'
      ${boxId ? `AND B.box = '${boxId}'` : ''}
      ${before ? `AND A.value <= '${formatSiYuanDate(before)}'` : ''}
      ${after ? `AND A.value >= '${formatSiYuanDate(after)}'` : ''}
    ORDER BY A.value DESC
    LIMIT ${limit ?? 64};
`;
    const docs = await sql(query);
    if (!docs || docs.length === 0) {
        return [];
    }
    // return docs?.map(doc => docToBlock(doc)) ?? [];
    return docs;
}
