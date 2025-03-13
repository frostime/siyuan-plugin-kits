/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-06-08 20:36:30
 * @FilePath     : /src/const.ts
 * @LastEditTime : 2025-03-12 16:19:47
 * @Description  : 
 */

import type { Block, BlockSubType, BlockType } from "./types";

export const SIAYUN_ATTR = {
    READONLY: 'custom-sy-readonly',
    FULLWIDTH: 'custom-sy-fullwidth',
    AV_VIEW: 'custom-sy-av-view',
    HIDDEN: 'custom-hidden'  //only for document block
};


const BlockTypeName_ZH: Record<BlockType | BlockSubType, string> = {
    "d": "文档",
    "h": "标题",
    "h1": "一级标题",
    "h2": "二级标题",
    "h3": "三级标题",
    "h4": "四级标题",
    "h5": "五级标题",
    "h6": "六级标题",
    "p": "段落",
    "l": "列表",
    "o": "有序列表",
    "u": "无序列表",
    "i": "列表项",
    "c": "代码",
    "m": "数学公式",
    "t": "表格",
    "b": "引述",
    "s": "超级块",
    "html": "HTML块",
    "query_embed": "嵌入块",
    'av': '属性视图',
    'widget': '挂件',
    'iframe': '内嵌块',
    'tb': '分隔线',
    'audio': '音频'
}

const BlockTypeName_EN: Record<BlockType | BlockSubType, string> = {
    "d": "Document",
    "h": "Heading",
    "h1": "Heading 1",
    "h2": "Heading 2",
    "h3": "Heading 3",
    "h4": "Heading 4",
    "h5": "Heading 5",
    "h6": "Heading 6",
    "l": "List",
    "o": "Ordered List",
    "u": "Unordered List",
    "i": "ListItem",
    "c": "Code",
    "m": "Math",
    "t": "Table",
    "b": "Blockquote",
    "s": "SuperBlock",
    "p": "Paragraph",
    "html": "HTML",
    "query_embed": "Embed",
    'av': 'Attribute View',
    'widget': 'Widget',
    'iframe': 'IFrame',
    'tb': 'Thematic Break',
    'audio': 'Audio'
}

export const BlockTypeName = window.siyuan.config.lang.startsWith('zh') ? BlockTypeName_ZH : BlockTypeName_EN;
export const BlockTypeShort = BlockTypeName; //alias


export const BlockType2NodeType: { [key in BlockType]: string } = {
    d: 'NodeDocument',
    p: 'NodeParagraph',
    query_embed: 'NodeBlockQueryEmbed',
    l: 'NodeList',
    i: 'NodeListItem',
    h: 'NodeHeading',
    iframe: 'NodeIFrame',
    tb: 'NodeThematicBreak',
    b: 'NodeBlockquote',
    s: 'NodeSuperBlock',
    c: 'NodeCodeBlock',
    widget: 'NodeWidget',
    t: 'NodeTable',
    html: 'NodeHTMLBlock',
    m: 'NodeMathBlock',
    av: 'NodeAttributeView',
    audio: 'NodeAudio'
}

export const NodeType2BlockType: { [key in string]: BlockType } = Object.fromEntries(Object.entries(BlockType2NodeType).map(([key, value]) => [value, key as BlockType]));


export const NodeIcons = {
    NodeAttributeView: {
        icon: "iconDatabase"
    },
    NodeAudio: {
        icon: "iconRecord"
    },
    NodeBlockQueryEmbed: {
        icon: "iconSQL"
    },
    NodeBlockquote: {
        icon: "iconQuote"
    },
    NodeCodeBlock: {
        icon: "iconCode"
    },
    NodeDocument: {
        icon: "iconFile"
    },
    NodeHTMLBlock: {
        icon: "iconHTML5"
    },
    NodeHeading: {
        icon: "iconHeadings",
        subtypes: {
            h1: { icon: "iconH1" },
            h2: { icon: "iconH2" },
            h3: { icon: "iconH3" },
            h4: { icon: "iconH4" },
            h5: { icon: "iconH5" },
            h6: { icon: "iconH6" }
        }
    },
    NodeIFrame: {
        icon: "iconLanguage"
    },
    NodeList: {
        subtypes: {
            o: { icon: "iconOrderedList" },
            t: { icon: "iconCheck" },
            u: { icon: "iconList" }
        }
    },
    NodeListItem: {
        icon: "iconListItem"
    },
    NodeMathBlock: {
        icon: "iconMath"
    },
    NodeParagraph: {
        icon: "iconParagraph"
    },
    NodeSuperBlock: {
        icon: "iconSuper"
    },
    NodeTable: {
        icon: "iconTable"
    },
    NodeThematicBreak: {
        icon: "iconLine"
    },
    NodeVideo: {
        icon: "iconVideo"
    },
    NodeWidget: {
        icon: "iconBoth"
    }
};


export const getBlockTypeIcon = (block: Block) => {
    const nodeType = BlockType2NodeType[block.type];
    const icon = NodeIcons[nodeType];
    if (!icon) {
        return '';
    }

    if (block.subtype) {
        const subtype = icon.subtypes?.[block.subtype];
        if (subtype) {
            return subtype.icon;
        }
    }

    return icon.icon;
}
