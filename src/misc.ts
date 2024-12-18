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

