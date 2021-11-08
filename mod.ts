const escapeDefault: (str: string) => string = (str) => {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("'", "&apos;")
        .replaceAll("\"", "&quot;")
    ;
};

const escapeContent: (str: string) => string = (str) => {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
    ;
};

const escapeAttribute: (str: string) => string = (str) => {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll("\"", "&quot;")
    ;
};

type LitesTemplarContentValue = { content: string };
type LitesTemplarAttributeValue = { attr: string };
type LitesTemplarQueryParameterValue = { param: string };
type LitesTemplarVerbatimValue = { verbatim: string };

type LitesTemplarValue =
    | string
    | number
    | LitesTemplarContentValue
    | LitesTemplarAttributeValue
    | LitesTemplarQueryParameterValue
    | LitesTemplarVerbatimValue
;

export function html(strings: TemplateStringsArray, ...values: LitesTemplarValue[]): string {
    let result = "";
    let i = 0;
    for (const str of strings) {
        result += str;
        if (i < values.length) {
            const value = values[i++];
            switch (typeof(value)) {
                case "string":
                    result += escapeDefault(value);
                    break;
                
                case "number":
                    result += value.toString();
                    break;

                case "object":
                    {
                        const key = Object.keys(value)[0];
                        switch (key) {
                            case "content":
                                result += escapeContent((value as LitesTemplarContentValue).content);
                                break;
                            
                            case "attr":
                                result += escapeAttribute((value as LitesTemplarAttributeValue).attr);
                                break;
                            
                            case "param":
                                result += encodeURIComponent((value as LitesTemplarQueryParameterValue).param);
                                break;

                            case "verbatim":
                                result += (value as LitesTemplarVerbatimValue).verbatim;
                                break;
                        }
                    }
                    break;
            }
        }
    }
    return result;
}
