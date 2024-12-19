/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-19 21:06:07
 * @FilePath     : /src/dailynote.ts
 * @LastEditTime : 2024-12-19 13:55:10
 * @Description  : From git@github.com:frostime/siyuan-dailynote-today.git
 */

import { formatSiYuanDate } from "./time";
import { createDocWithMd, setBlockAttrs, sql } from "./api";
import { NotebookId } from "./types";

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


export async function createDalynote(boxId: NotebookId, todayDiaryHpath: string, date?: Date) {
    let doc_id = await createDocWithMd(boxId, todayDiaryHpath, "");

    // console.debug(`创建日记: ${boxId} ${todayDiaryHpath}`);
    await setCustomDNAttr(doc_id, date);

    return doc_id;
}

export const createDiary = createDalynote;

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
