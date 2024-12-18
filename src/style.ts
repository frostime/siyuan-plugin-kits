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
