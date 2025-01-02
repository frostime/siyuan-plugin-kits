import { getBlockByID, listDocsByPath, request, sql } from "./api";
import { getLute } from "./lute";
import { Block, BlockId } from "./types";

/**
 * Get the markdown content of a block
 * Special:
 * - If the block is a heading, it will return the markdown content of the heading and its children
 * - If the block is a document, it will return the markdown content of the document
 * @param id 
 * @returns 
 */
export const getMarkdown = async (id: BlockId): Promise<string> => {
    let block: Block = await getBlockByID(id);
    if (block.type === 'd') {
        const { content } = await request('/api/export/exportMdContent', {
            id: id
        });
        return content;
    } else if (block.type === 'h') {
        let dom = await request('/api/block/getHeadingChildrenDOM', {
            id
        });
        const lute = getLute();
        return lute.BlockDOM2StdMd(dom);
    } else {
        return block.markdown;
    }
}


export const searchIDs = async (ids: BlockId | BlockId[]): Promise<Block[]> => {
    let idList = Array.isArray(ids) ? ids.map((id) => `"${id}"`) : [`"${ids}"`];
    let sqlCode = `select * from blocks where id in (${idList.join(",")})`;
    let data = await sql(sqlCode);
    return data;
}

export const id2block = searchIDs;

export const searchChildDocs = async (documentId: BlockId): Promise<Block[]> => {
    let doc: Block = await getBlockByID(documentId);
    if (!doc) {
        return [];
    }
    let box = doc.box;
    let path = doc.path;

    let data = await listDocsByPath(box, path);
    let ids = data?.files.map((item) => item.id) || [];
    let childs = await id2block(ids);
    return childs;
}

export const searchBacklinks = async (id: BlockId, limit: number = 64): Promise<Block[]> => {
    return sql(`
    select * from blocks where id in (
        select block_id from refs where def_block_id = '${id}'
    ) order by updated desc ${limit ? `limit ${limit}` : ''};
    `);
}

export const searchAttr = async (name: string, val?: string, valMatch: '=' | 'like' = '=', limit?: number): Promise<Block[]> => {
    return sql(`
    SELECT B.*
    FROM blocks AS B
    WHERE B.id IN (
        SELECT A.block_id
        FROM attributes AS A
        WHERE A.name like '${name}'
        ${val ? `AND A.value ${valMatch} '${val}'` : ''}
        ${limit ? `limit ${limit}` : ''}
    );
    `);
}
