type LiteralHtmlContentValue = { content: string };
type LiteralHtmlAttributeValue = { attr: string };
type LiteralHtmlQueryParameterValue = { param: string };
type LiteralHtmlVerbatimValue = { verbatim: string };

type LiteralHtmlValue =
    | string
    | number
    | LiteralHtmlContentValue
    | LiteralHtmlAttributeValue
    | LiteralHtmlQueryParameterValue
    | LiteralHtmlVerbatimValue
;

type taggedTemplateLiteralHandler = (strings: TemplateStringsArray, ...values: LiteralHtmlValue[]) => string;

function createEscaper(aposEntity: string): taggedTemplateLiteralHandler {
    return (strings, ...values): string => {
        let result = strings[0];
        let i = 1;
        for (const value of values) {
            switch (typeof(value)) {
                case "string":
                    // Default escaping: &<>'"
                    result += value
                        .replaceAll("&", "&amp;")
                        .replaceAll("<", "&lt;")
                        .replaceAll(">", "&gt;")
                        .replaceAll("'", aposEntity)
                        .replaceAll("\"", "&quot;")
                    ;
                    break;

                case "number":
                    // No escaping for numbers
                    result += value.toString();
                    break;

                case "object":
                    {
                        switch (Object.keys(value)[0]) {
                            case "content":
                                // Content escaping: &<
                                result += (value as LiteralHtmlContentValue).content
                                    .replaceAll("&", "&amp;")
                                    .replaceAll("<", "&lt;")
                                ;
                                break;
                            
                            case "attr":
                                // Quotation mark-delimited attribute escaping: &<"
                                result += (value as LiteralHtmlAttributeValue).attr
                                    .replaceAll("&", "&amp;")
                                    .replaceAll("<", "&lt;")
                                    .replaceAll("\"", "&quot;")
                                ;
                                break;
                            
                            case "param":
                                // URI Component escaping
                                result += encodeURIComponent((value as LiteralHtmlQueryParameterValue).param);
                                break;

                            case "verbatim":
                                // Verbatim copy: no escaping
                                result += (value as LiteralHtmlVerbatimValue).verbatim;
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

export const html: taggedTemplateLiteralHandler = createEscaper("&#39;");
export const xml: taggedTemplateLiteralHandler = createEscaper("&apos;");
