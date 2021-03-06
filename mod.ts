type LiteralHTMLContentValue = {
    /** General HTML/XML content that should have &, <, and > escaped (e.g. html`<p>${{content: "This will be <escaped>"}}</p>`) */
    content: string
};

type LiteralHTMLAttributeValue = {
    /** HTML/XML attribute value that should have &, <, >, ', and " escaped (e.g. html`<img alt="${{attr: 'This will be "escaped"'}}" />`) */
    attr: string
};

type LiteralHTMLScriptStringLiteralValue = {
    /** A string literal within an HTML script tag (namely for JSON-LD) that should have <, ", and \ escaped */
    scriptString: string
};

type LiteralHTMLQueryParameterValue = {
    /** Value for a URI Component (e.g. query parameter) that should be escaped using encodeURIComponent() */
    param: string
};

type LiteralHTMLVerbatimValue = {
    /** Verbatim HTML/XML content that should be copied verbatim; only use with valid HTML/XML strings (e.g. html`<p>${{verbatim: "Line 1<br/>Line 2<br/>"}}</p>`)  */
    verbatim: string
};

type LiteralHTMLValue =
    | string
    | number
    | LiteralHTMLContentValue
    | LiteralHTMLAttributeValue
    | LiteralHTMLScriptStringLiteralValue
    | LiteralHTMLQueryParameterValue
    | LiteralHTMLVerbatimValue
;

type taggedTemplateLiteralHandler = (strings: TemplateStringsArray, ...values: LiteralHTMLValue[]) => string;

function createEscaper(aposEntity: string): taggedTemplateLiteralHandler {
    const escapeDefault = (str: string) => str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("'", aposEntity)
        .replaceAll("\"", "&quot;")
    ;

    return (strings, ...values): string => {
        let result = strings[0];
        let i = 1;
        for (const value of values) {
            switch (typeof(value)) {
                case "string":
                    // Default escaping: &<>'"
                    result += escapeDefault(value);
                    break;

                case "number":
                    // No escaping for numbers
                    result += value.toString();
                    break;

                case "object":
                    {
                        switch (Object.keys(value)[0]) {
                            case "content":
                                // Content escaping: &<>
                                result += (value as LiteralHTMLContentValue).content
                                    .replaceAll("&", "&amp;")
                                    .replaceAll("<", "&lt;")
                                    .replaceAll(">", "&gt;")
                                ;
                                break;
                            
                            case "attr":
                                // Attribute value escaping: &<>'"
                                result += escapeDefault((value as LiteralHTMLAttributeValue).attr);
                                break;

                            case "scriptString" :
                                // HTML script string literal escaping: <"\
                                result += (value as LiteralHTMLScriptStringLiteralValue).scriptString
                                    .replaceAll("\\", "\\\\")
                                    .replaceAll("<", "\\x3C")
                                    .replaceAll("\"", "\\\"")
                                ;
                                break;
                            
                            case "param":
                                // URI Component (and attribute) escaping
                                result += escapeDefault(encodeURIComponent((value as LiteralHTMLQueryParameterValue).param));
                                break;

                            case "verbatim":
                                // Verbatim copy: no escaping
                                result += (value as LiteralHTMLVerbatimValue).verbatim;
                                break;
                        }
                    }
                    break;
            }

            result += strings[i++];
        }
        return result;
    };
}

/** Tagged literal template handler for HTML templates; accepts strings, numbers, and objects with a single key named content, attr, param, or verbatim */
export const html: taggedTemplateLiteralHandler = createEscaper("&#39;");

/** Tagged literal template handler for XML templates; accepts strings, numbers, and objects with a single key named content, attr, param, or verbatim */
export const xml: taggedTemplateLiteralHandler = createEscaper("&apos;");
