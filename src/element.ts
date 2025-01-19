type CSSProperties = Partial<CSSStyleDeclaration>;

// Helper function to set styles
function setStyles(element: HTMLElement | SVGSVGElement, styles?: CSSProperties) {
    if (styles) {
        Object.assign(element.style, styles);
    }
}

export function Button(props: {
    label?: string;
    onClick?: () => void;
    style?: CSSProperties;
    classOutlined?: boolean;
    classText?: boolean;
}): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'b3-button';
    if (props.classOutlined) button.classList.add('b3-button--outline');
    if (props.classText) button.classList.add('b3-button--text');
    if (props.label) button.textContent = props.label;
    if (props.onClick) button.onclick = props.onClick;
    setStyles(button, props.style);
    return button;
}

export function Checkbox(props: {
    checked?: boolean;
    changed?: (value: boolean) => void;
    style?: CSSProperties;
}): HTMLInputElement {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'b3-switch fn__flex-center';
    if (props.checked) checkbox.checked = props.checked;
    if (props.changed) {
        checkbox.oninput = (e) => props.changed?.((e.target as HTMLInputElement).checked);
    }
    setStyles(checkbox, props.style);
    return checkbox;
}

export function IconSymbol(props: {
    iconName: string;
    size?: string;
    onClick?: (e: MouseEvent) => void;
}): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${props.iconName}`);
    svg.appendChild(use);

    setStyles(svg, {
        height: props.size || '100%',
        width: props.size || '100%',
        margin: '0 auto',
        fill: 'currentColor'
    });

    if (props.onClick) svg.onclick = props.onClick;
    return svg;
}

export function Markdown(props: {
    markdown: string;
    fontSize?: string;
}): HTMLDivElement {
    const div = document.createElement('div');
    div.className = 'item__readme b3-typography';
    const lute = window.Lute!.New();
    // @ts-ignore
    div.innerHTML = lute.Md2HTML(props.markdown);
    if (props.fontSize) {
        div.style.fontSize = `${props.fontSize} !important`;
    }
    return div;
}

export function NumberInput(props: {
    value?: number;
    changed?: (value: number) => void;
    style?: CSSProperties;
    min?: number;
    max?: number;
    step?: number;
}): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'b3-text-field fn__flex-center';
    if (props.value !== undefined) input.value = String(props.value);
    if (props.min !== undefined) input.min = String(props.min);
    if (props.max !== undefined) input.max = String(props.max);
    if (props.step !== undefined) input.step = String(props.step);
    if (props.changed) {
        input.oninput = (e) => props.changed?.(Number((e.target as HTMLInputElement).value));
    }
    setStyles(input, props.style);
    return input;
}

export function Select(props: {
    value?: string;
    changed?: (value: string) => void;
    style?: CSSProperties;
    options: Record<string, string>;
}): HTMLSelectElement {
    const select = document.createElement('select');
    select.className = 'b3-select fn__flex-center';

    Object.entries(props.options).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        if (props.value === value) option.selected = true;
        select.appendChild(option);
    });

    if (props.changed) {
        select.onchange = (e) => props.changed?.((e.target as HTMLSelectElement).value);
    }
    setStyles(select, props.style);
    return select;
}

export function Slider(props: {
    value?: number;
    changed?: (value: number) => void;
    style?: CSSProperties;
    min?: number;
    max?: number;
    step?: number;
}): HTMLDivElement {
    const container = document.createElement('div');
    container.className = 'b3-tooltips b3-tooltips__n';
    container.setAttribute('aria-label', String(props.value ?? 0));

    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'b3-slider';
    if (props.value !== undefined) input.value = String(props.value);
    input.min = String(props.min ?? 0);
    input.max = String(props.max ?? 100);
    input.step = String(props.step ?? 1);

    if (props.changed) {
        input.oninput = (e) => {
            const value = Number((e.target as HTMLInputElement).value);
            props.changed?.(value);
            container.setAttribute('aria-label', String(value));
        };
    }

    setStyles(input, props.style);
    container.appendChild(input);
    return container;
}

export function TextArea(props: {
    value?: string;
    changed?: (value: string) => void;
    style?: CSSProperties;
    spellcheck?: boolean;
}): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.className = 'b3-text-field fn__block';
    if (props.value !== undefined) textarea.value = props.value;
    if (props.spellcheck !== undefined) textarea.spellcheck = props.spellcheck;

    const baseStyle: CSSProperties = {
        resize: 'vertical',
        height: '10rem',
        whiteSpace: 'nowrap'
    };
    setStyles(textarea, { ...baseStyle, ...(props.style || {}) });

    if (props.changed) {
        textarea.oninput = (e) => props.changed?.((e.target as HTMLTextAreaElement).value);
    }
    return textarea;
}

export function TextInput(props: {
    value?: string;
    changed?: (value: string) => void;
    style?: CSSProperties;
    placeholder?: string;
    password?: boolean;
    spellcheck?: boolean;
}): HTMLInputElement {
    const input = document.createElement('input');
    input.className = 'b3-text-field fn__flex-center';
    input.type = props.password ? 'password' : 'text';
    if (props.value !== undefined) input.value = props.value;
    if (props.placeholder) input.placeholder = props.placeholder;
    if (props.spellcheck !== undefined) input.spellcheck = props.spellcheck;

    if (props.changed) {
        input.oninput = (e) => props.changed?.((e.target as HTMLInputElement).value);
    }
    setStyles(input, props.style);
    return input;
}
