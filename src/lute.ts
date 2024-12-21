import { Lute } from "siyuan";

let lute: Lute;

export const getLute = () => {
    if (lute) return lute;
    lute = window.Lute.New();
    lute.SetSpellcheck(window.siyuan.config.editor.spellcheck);
    lute.SetProtyleMarkNetImg(window.siyuan.config.editor.displayNetImgMark);
    lute.SetFileAnnotationRef(true);
    lute.SetTextMark(true);
    lute.SetHeadingID(false);
    lute.SetYamlFrontMatter(false);
    // lute.PutEmojis(options.emojis);
    // lute.SetEmojiSite(options.emojiSite);
    // lute.SetHeadingAnchor(options.headingAnchor);
    lute.SetInlineMathAllowDigitAfterOpenMarker(true);
    lute.SetToC(false);
    lute.SetIndentCodeBlock(false);
    lute.SetParagraphBeginningSpace(true);
    lute.SetSetext(false);
    lute.SetFootnotes(false);
    lute.SetLinkRef(false);
    // lute.SetSanitize(options.sanitize);
    // lute.SetChineseParagraphBeginningSpace(options.paragraphBeginningSpace);
    // lute.SetRenderListStyle(options.listStyle);
    lute.SetImgPathAllowSpace(true);
    lute.SetKramdownIAL(true);
    lute.SetTag(true);
    lute.SetSuperBlock(true);

    lute.SetMark(true);
    lute.SetSup(true);
    lute.SetSub(true);
    lute.SetProtyleWYSIWYG(true);
    // if (options.lazyLoadImage) {
    //     lute.SetImageLazyLoading(options.lazyLoadImage);
    // }
    lute.SetBlockRef(true);
    lute.SetHTMLTag2TextMark(true)
    return lute;
}

export const HTML2Md = (html: string) => {
    const lute = getLute();
    return lute.HTML2Md(html);
}

