/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-03-23 21:37:33
 * @FilePath     : /src/dialog.ts
 * @LastEditTime : 2024-12-19 14:48:39
 * @Description  : 对话框相关工具
 */
import { Dialog } from "siyuan";

export const simpleDialog = (args: {
    title: string, ele: HTMLElement | DocumentFragment,
    width?: string, height?: string,
    maxWidth?: string, maxHeight?: string,
    callback?: () => void;
}) => {
    const dialog = new Dialog({
        title: args.title,
        content: `<div class="dialog-content" style="display: flex; height: 100%;"/>`,
        width: args.width,
        height: args.height,
        destroyCallback: args.callback
    });
    dialog.element.querySelector(".dialog-content")!.appendChild(args.ele);
    const container: HTMLElement = dialog.element.querySelector(".b3-dialog__container")!;
    if (container) {
        Object.assign(container.style, {
            maxWidth: args.maxWidth,
            maxHeight: args.maxHeight
        });
    }
    return {
        dialog,
        close: dialog.destroy.bind(dialog)
    };
}


export const confirmDialog = (args: {
    title: string;
    content: string | HTMLElement | DocumentFragment;
    confirm?: (ele?: HTMLElement) => void;
    cancel?: (ele?: HTMLElement) => void;
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
}) => {
    const { title, content, confirm, cancel, width, height, maxWidth, maxHeight } = args;

    const dialog = new Dialog({
        title,
        content: `<div class="b3-dialog__content">
    <div class="ft__breakword" style="height: 100%;">
    </div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text" id="confirmDialogConfirmBtn">${window.siyuan.languages.confirm}</button>
</div>`,
        width: width,
        height: height
    });

    const target: HTMLElement = dialog.element.querySelector(".b3-dialog__content>div.ft__breakword")!;
    if (typeof content === "string") {
        target.innerHTML = content;
    } else {
        target.appendChild(content);
    }

    const btnsElement = dialog.element.querySelectorAll(".b3-button");
    btnsElement[0].addEventListener("click", () => {
        if (cancel) {
            cancel(target);
        }
        dialog.destroy();
    });
    btnsElement[1].addEventListener("click", () => {
        if (confirm) {
            confirm(target);
        }
        dialog.destroy();
    });

    const container: HTMLElement = dialog.element.querySelector(".b3-dialog__container")!;
    if (container) {
        Object.assign(container.style, {
            maxWidth: maxWidth,
            maxHeight: maxHeight
        });
    }

    return {
        dialog,
        close: dialog.destroy.bind(dialog)
    };
};

export const inputDialog = (args: {
    title: string,
    defaultText?: string,
    confirm?: (text: string) => void,
    type?: 'textline' | 'textarea',
    width?: string,
    height?: string,
    maxWidth?: string,
    maxHeight?: string,
    fontSize?: string
}) => {
    const dialog = new Dialog({
        title: args.title,
        content: `<div class="fn__flex" style="height: 100%; flex: 1; padding: 16px 24px; overflow-y: auto">
            <div class="ft__breakword fn__flex fn__flex-1" style="height: 100%;">
                ${args.type === 'textarea'
                ? `<textarea class="b3-text-field fn__block" style="font-size: ${args.fontSize || '17px'}; resize: none;" spellcheck="false">${args.defaultText || ''}</textarea>`
                : `<input class="b3-text-field fn__flex-center" style="flex: 1; font-size: ${args.fontSize || '17px'};" value="${args.defaultText || ''}">`
            }
            </div>
        </div>
        <div class="b3-dialog__action">
            <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button>
            <div class="fn__space"></div>
            <button class="b3-button b3-button--text">${window.siyuan.languages.confirm}</button>
        </div>`,
        width: args.width,
        height: args.height
    });

    const inputElement = dialog.element.querySelector('textarea, input') as HTMLTextAreaElement | HTMLInputElement;

    // Prevent Enter key from closing dialog
    inputElement.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.stopImmediatePropagation();
        }
    });

    const btnsElement = dialog.element.querySelectorAll('.b3-button');
    btnsElement[0].addEventListener('click', () => {
        dialog.destroy();
    });

    btnsElement[1].addEventListener('click', () => {
        if (args.confirm) {
            args.confirm(inputElement.value);
        }
        dialog.destroy();
    });

    const container: HTMLElement = dialog.element.querySelector(".b3-dialog__container")!;
    if (container) {
        Object.assign(container.style, {
            maxWidth: args.maxWidth,
            maxHeight: args.maxHeight
        });
    }

    return {
        dialog,
        close: dialog.destroy.bind(dialog)
    };
};
