import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { html, xml } from "./mod.ts";

// From the documentation
Deno.test({
    name: "Content example",
    fn: () => {
        assertEquals(html`<p>${{content: "This will be <escaped>"}}</p>`, "<p>This will be &lt;escaped&gt;</p>");
    },
});

Deno.test({
    name: "Attribute examples",
    fn: () => {
        assertEquals(html`<img alt="${{attr: 'This will be "escaped"'}}" />`, '<img alt="This will be &quot;escaped&quot;" />');
        assertEquals(html`<img alt="${{attr: "&"}}" />`, `<img alt="&amp;" />`);
    },
});

Deno.test({
    name: "Verbatim example",
    fn: () => {
        assertEquals(html`<p>${{verbatim: "Line 1<br/>Line 2<br/>"}}</p>`, "<p>Line 1<br/>Line 2<br/></p>");
    },
});

Deno.test({
    name: "Verbatim example using a condition",
    fn: () => {
        {
            const alt = "An image";
            assertEquals(html`<img ${{verbatim: alt ? html`alt="${alt}"` : ""}}/>`, '<img alt="An image"/>');
        }
        {
            const alt = "";
            assertEquals(html`<img ${{verbatim: alt ? html`alt="${alt}"` : ""}}/>`, "<img />");
        }
    },
});

Deno.test({
    name: "Verbatim example using a list",
    fn: () => {
        const listItems = ["<", ">", "&"];
        assertEquals(html`<ul>${{
            verbatim: listItems
                .map(x => html`<li>${x}</li>`)
                .join("")
        }}</ul>`, "<ul><li>&lt;</li><li>&gt;</li><li>&amp;</li></ul>");
    },
});

// Functional tests
Deno.test({
    name: "Escape default (HTML)",
    fn: () => {
        const value = "what's <this> do? this & \"that\"!";
        const result = html`<html><body><p>${value}</p></body></html>`;
        assertEquals(result, "<html><body><p>what&#39;s &lt;this&gt; do? this &amp; &quot;that&quot;!</p></body></html>");
    },
});

Deno.test({
    name: "Escape default (XML)",
    fn: () => {
        const value = "what's <this> do? this & \"that\"!";
        const result = xml`<demo>${value}</demo>`;
        assertEquals(result, "<demo>what&apos;s &lt;this&gt; do? this &amp; &quot;that&quot;!</demo>");
    },
});

Deno.test({
    name: "Escape content",
    fn: () => {
        const value = "what's <this> do? this & \"that\"!";
        const result = html`<html><body><p>${{content: value}}</p></body></html>`;
        assertEquals(result, `<html><body><p>what's &lt;this&gt; do? this &amp; "that"!</p></body></html>`);
    },
});

Deno.test({
    name: "Escape attributes",
    fn: () => {
        const value = "what's <this> do? this & \"that\"!";
        const result = html`<html><body><img alt="${{attr: value}}" /></body></html>`;
        assertEquals(result, `<html><body><img alt="what&#39;s &lt;this&gt; do? this &amp; &quot;that&quot;!" /></body></html>`);
    },
});

Deno.test({
    name: "Escape URI components",
    fn: () => {
        const value = "what's <this> do? 'this' & \"that\"!";
        const result = html`<html><body><p><a href="https://www.bing.com/search?q=${{param: value}}">Link</a></p></body></html>`;
        assertEquals(result, `<html><body><p><a href="https://www.bing.com/search?q=what&#39;s%20%3Cthis%3E%20do%3F%20&#39;this&#39;%20%26%20%22that%22!">Link</a></p></body></html>`);
    },
});

Deno.test({
    name: "Verbatim content",
    fn: () => {
        assertEquals(
            html`<html><body>${{verbatim: "<p>what's &lt;this> do? this &amp; \"that\"!</p>"}}</body></html>`,
            "<html><body><p>what's &lt;this> do? this &amp; \"that\"!</p></body></html>"
        );
    },
});

Deno.test({
    name: "Verbatim number",
    fn: () => {
        assertEquals(
            html`<html><body><p>${99}</p></body></html>`,
            "<html><body><p>99</p></body></html>"
        );
    },
});

Deno.test({
    name: "Empty string",
    fn: () => {
        assertEquals(
            html``,
            ""
        );
    },
});

Deno.test({
    name: "Empty first string",
    fn: () => {
        assertEquals(
            html`${{verbatim: "<html>"}}</html>`,
            "<html></html>"
        );
    },
});

Deno.test({
    name: "Empty final string",
    fn: () => {
        assertEquals(
            html`${{verbatim: "<html></html>"}}`,
            "<html></html>"
        );
    },
});
