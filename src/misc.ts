/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:30:09
 * @FilePath     : /src/misc.ts
 * @LastEditTime : 2025-01-19 15:41:08
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


export const sleep = (second: number) => {
    let ms = second * 1000;
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * 重复执行函数，直到成功或达到最大次数
 * @param attempt 尝试执行的函数
 * @param options 选项
 * @param options.predicate 判断成功的条件函数, 默认 (result) => Boolean(result)
 * @param options.onFailed 失败处理函数, 默认为空
 * @param options.onError 错误处理函数, 默认为空
 * @param options.max_times 最大尝试次数, 默认 3
 * @param options.interval_seconds 每次尝试的间隔时间, 默认 1 秒
 * @param options.failureReturn 失败时返回的值, 默认 null
 * @returns attempt 的返回值或者 options.failureReturn
 */
export const retry = async (attempt: () => Promise<any>, options?: {
    predicate?: (result: any) => boolean,
    onFailed?: (result: any) => void,
    onError?: (error: any) => void,
    max_times?: number,
    interval_seconds?: number,
    failureReturn?: any,
}) => {
    let { max_times = 3, interval_seconds = 1, failureReturn = null } = options || {};
    let times = 0;
    let predicate = options?.predicate || ((result) => Boolean(result));
    let onFailed = options?.onFailed || (() => {});
    let onError = options?.onError || (() => {});

    while (times < max_times) {
        try {
            const result = await attempt();
            if (predicate(result)) {
                return result;
            }
            onFailed(result);
        } catch (e) {
            onError(e);
        }
        times++;
        if (times < max_times) {
            await sleep(interval_seconds);
        }
    }
    return failureReturn;
}


