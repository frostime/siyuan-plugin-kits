/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:30:09
 * @FilePath     : /src/misc.ts
 * @LastEditTime : 2025-01-01 17:18:49
 * @Description  : 
 */
export const html2frag = (html: string): DocumentFragment => {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    let ele = document.importNode(template.content, true);
    return ele;
}

export const html2ele = (html: string): HTMLElement => {
    let frag = html2frag(html);
    return frag.children[0] as HTMLElement;
}

export const parseEmojiCode = (code: string) => {
    let codePoint = parseInt(code, 16);
    if (Number.isNaN(codePoint)) return null;
    return String.fromCodePoint(codePoint);
}

export const siyuanIcons = (): string[] => {
    const symbols = document.querySelectorAll('symbol');
    return Array.from(symbols).map(symbol => symbol.id);
}

export const iconSvg = (icon: string) => {
    if (icon.startsWith('#')) {
        icon = icon.slice(1);
    }
    return `<svg><use href="#${icon}" /></svg>`;
}

