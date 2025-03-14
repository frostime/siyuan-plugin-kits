/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-12-18 20:36:25
 * @FilePath     : /src/style.ts
 * @LastEditTime : 2025-01-18 21:52:28
 * @Description  : 
 */

export const updateStyleDom = (domId: string, css: string) => {
    let style: HTMLStyleElement = document.getElementById(domId) as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.id = domId;
        document.head.appendChild(style);
    }
    style.innerHTML = css;
}

export const removeStyleDom = (domId: string) => {
    const style = document.querySelector(`style#${domId}`);
    style?.remove();
}
