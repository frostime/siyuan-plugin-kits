/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-19 21:06:07
 * @FilePath     : /src/dailynote.ts
 * @LastEditTime : 2025-01-19 14:53:21
 * @Description  : From git@github.com:frostime/siyuan-dailynote-today.git
 */

import { formatDateTime, formatSiYuanDate } from "./time";
import { createDocWithMd, getIDsByHPath, getNotebookConf, renderSprig, setBlockAttrs, sql } from "./api";
import { Block, NotebookId } from "./types";
import { getNotebook } from "./siyuan-instance";

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
    date = date ?? new Date();

    let hpath = await getDailynoteHpath(boxId, date);
    let ids = await getIDsByHPath(boxId, hpath);
    if (ids.length > 0) {
        return ids[0];
    }

    let doc_id = await createDocWithMd(boxId, hpath, createContent || "");

    await setCustomDNAttr(doc_id, date);

    return doc_id;
}

export const createDiary = createDailynote;

export const searchDailynote = async (boxId: NotebookId, date: Date): Promise<string> => {
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
    return docs?.[0]?.id ?? null;
}
