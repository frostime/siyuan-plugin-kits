import { BlockTypeShort } from "./const";
import { getNotebook } from "./siyuan-instance";
import { formatDateTime, parseSiYuanTimestamp } from "./time";
import { Block, BlockId } from "./types";

/**
 * from sy-query-view plugin
 * Renders the value of a block attribute as markdown format
 * @param b - Block object
 * @param attr - Attribute name
 * @returns Rendered attribute value
 */
export const renderAttr = (b: Block & { [key: string | number]: string | number }, attr: keyof Block & string | number, options?: {
    onlyDate?: boolean;
    onlyTime?: boolean;
}): string => {
    let v: string | number = '';

    const link = (title: string, id: BlockId) => `[${title}](siyuan://blocks/${id})`;
    const parseTime = (dt: string) => {
        let date = parseSiYuanTimestamp(dt);
        if (options?.onlyDate) {
            return formatDateTime('yyyy-MM-dd', date);
        } else if (options?.onlyTime) {
            return formatDateTime('HH:mm:ss', date);
        } else {
            return formatDateTime('yyyy-MM-dd HH:mm:ss', date);
        }
    }

    const docName = () => {
        let hpath = b.hpath;
        let idx = hpath.lastIndexOf('/');
        let docname = hpath.substring(idx + 1);
        return docname;
    }

    switch (attr) {
        case 'type':
            const type = (BlockTypeShort[b.type] ?? b.type);
            v = link(type, b.id);
            break;

        case 'id':
            v = link(b.id, b.id);
            break;

        case 'root_id':
            if (b.hpath) {
                v = link(docName(), b.root_id);
            } else {
                v = b.root_id;
            }
            break;

        case 'hpath':
            if (b.root_id) {
                v = link(b.hpath, b.root_id);
            } else {
                v = b.hpath;
            }
            break;

        case 'content':
            v = b.fcontent || b.content
            break;

        case 'box':
            let notebook = getNotebook(b.box);
            v = notebook.name;
            break;

        case 'updated':
        case 'created':
            v = parseTime(b[attr]);
            break;

        case 'ial':
            v = JSON.stringify(parseIal(b));
            break;

        /**
         * 兼容 refs 表中的字段
         */
        //@ts-ignore
        case 'block_id':
        //@ts-ignore
        case 'def_block_id':
        //@ts-ignore
        case 'def_block_parent_id':
        //@ts-ignore
        case 'def_block_root_id':
            if (b[attr]) {
                //@ts-ignore
                v = link(b[attr], b[attr]);
            } else {
                v = b[attr]
            }
            break;

        default:
            v = b[attr];
            break;
    }
    return v.toString();
}

export const parseIal = (b: Block) => {
    let ial = b.ial;
    ial = ial.replace('{:', '').replace('}', '').trim();
    let ialObj: Record<string, string> = {};
    ial.split(' ').forEach(item => {
        let [key, value] = item.split('=');
        ialObj[key] = value;
    });
    return ialObj;
}

export const asurl = (b: Block) => {
    return `siyuan://blocks/${b.id}`;
}

export const aslink = (block: Block, title?: string) => {
    title = title ?? (block.fcontent || block.content);
    return `[${title}](siyuan://blocks/${block.id})`;
}

export const updatedDate = (block: Block) => {
    return parseSiYuanTimestamp(block.updated);
}

export const createdDate = (block: Block) => {
    return parseSiYuanTimestamp(block.created);
}



