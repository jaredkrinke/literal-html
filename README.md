# literal-html
Simple and unsafe HTML/XML templates for TypeScript, using [tagged template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).

**This library should not be used with untrusted strings!**

## Syntax
Tagged template literals in JavaScript start with a tag (`html` or `xml` for this library) and are enclosed in backticks (e.g. `` html`text goes here` ``).

Values are inserted as JavaScript expressions enclosed in braces, prefixed by a dollar sign (e.g. `` html`<p>${value}</p>` ``).

For literal-html, if the expression evaluates to an object with a single key, the key indicates the type of escaping that is required. For example, `{attr: "&"}` is an object with `attr` as its key and `"&"` as its (string) value. This tells literal-html to escape the value as a quotation mark-enclosed value. For example, `` html`<img alt="${{attr: "&"}}" />` `` would be escaped as `<img alt="&amp;" />`.

Supported types and keys:

| Format | Escapes | Notes |
|---|---|---|
| `${...}` | &<>'" | Supports `number` in addition to `string` |
| `${{content: ...}}` | &< | |
| `${{attr: ...}}` | &<" | Only supports quotation mark-enclosed values |
| `${{param: ...}}` | `encodeURIComponent()` | For URL query parameters |
| `${{verbatim: ...}}` | (none) | Only use with previously escaped strings |

## Examples
### General usage
```javascript
import { html, xml } from "./literal-html/mod.ts";

const value = ...; // Some string to be inserted

// Strings are escaped conservatively by default:
const fragmentHTML = html`<p>${value}</p>`;
const fragmentXML = xml`<text>${value}</text>`;

// You can specify the type of escaping required using an object with a single key, e.g. {attr: ...} for a quotation mark-enclosed attribute`:
const fragment3 = html`<img alt="${{attr: value}}" />`;

// To eliminate escaping altogether use the "verbatim" key:
const fragment4 = html`<p>${{verbatim: "This will NOT be escaped at all!"}}</p>`;
```

Examples of each type of escape follow.

### Default escaping (escapes: &<>'")
```javascript
const value = "what's <this> do? this & \"that\"!";
const result = html`<html><body><p>${value}</p></body></html>`;

// Result: <html><body><p>what&#39;s &lt;this&gt; do? this &amp; &quot;that&quot;!</p></body></html>
```

### Content between start and end tags (escapes: &<)
```javascript
const value = "what's <this> do? this & \"that\"!";
const result = html`<html><body><p>${{content: value}}</p></body></html>`;

// Result: <html><body><p>what's &lt;this> do? this &amp; "that"!</p></body></html>
```

### Attribute value (escapes: &<")
This should only be used for quotation mark-enclosed (XML style) attribute values.

```javascript
const value = "what's <this> do? this & \"that\"!";
const result = html`<html><body><img alt="${{attr: value}}" /></body></html>`;

// Result: <html><body><img alt="what's &lt;this> do? this &amp; &quot;that&quot;!" /></body></html>
```

### Query parameters/URI components (escapes using `encodeURIComponent()`)
```javascript
const value = "what's <this> do? 'this' & \"that\"!";
const result = html`<html><body><p><a href="https://www.bing.com/search?q=${{param: value}}">Link</a></p></body></html>`;

// Result: <html><body><p><a href="https://www.bing.com/search?q=what's%20%3Cthis%3E%20do%3F%20'this'%20%26%20%22that%22!">Link</a></p></body></html>
```

### Verbatim strings (no escaping)
This should only be used with strings that have already been properly escaped.

```javascript
const result = html`<p>${{verbatim: "Line 1<br/>Line 2<br/>"}}</p>`;

// Result: <p>Line 1<br/>Line 2<br/></p>
```

This is especially useful for conditional inclusion:

```javascript
const alt = "An image";
const result = html`<img ${{verbatim: alt ? html`alt="${alt}"` : ""}}/>`;

// Result: <img alt="An image"/>
```

Or applying templates to arrays of values:

```javascript
const listItems = ["<", ">", "&"];
const result = html`<ul>${{
    verbatim: listItems
        .map(x => html`<li>${x}</li>`)
        .join("")
}}</ul>`;

// Result: <ul><li>&lt;</li><li>&gt;</li><li>&amp;</li></ul>
```
