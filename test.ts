import { assertEquals, assertThrows } from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { html, xml } from "./mod.ts";

Deno.test({
    name: "Escape default (HTML)",
    fn: () => {
        assertEquals(
            html`<html><body><p>${"what's <this> do? this & \"that\"!"}</p></body></html>`,
            "<html><body><p>what&#39;s &lt;this&gt; do? this &amp; &quot;that&quot;!</p></body></html>"
        );
    },
});

Deno.test({
    name: "Escape default (XML)",
    fn: () => {
        assertEquals(
            xml`<demo>${"what's <this> do? this & \"that\"!"}</demo>`,
            "<demo>what&apos;s &lt;this&gt; do? this &amp; &quot;that&quot;!</demo>"
        );
    },
});

Deno.test({
    name: "Escape content",
    fn: () => {
        assertEquals(
            html`<html><body><p>${{content: "what's <this> do? this & \"that\"!"}}</p></body></html>`,
            "<html><body><p>what's &lt;this> do? this &amp; \"that\"!</p></body></html>"
        );
    },
});

Deno.test({
    name: "Escape attributes",
    fn: () => {
        assertEquals(
            html`<html><body><img alt=\"${{attr: "what's <this> do? this & \"that\"!"}}\" /></body></html>`,
            "<html><body><img alt=\"what's &lt;this> do? this &amp; &quot;that&quot;!\" /></body></html>"
        );
    },
});

Deno.test({
    name: "Escape URI components",
    fn: () => {
        assertEquals(
            html`<html><body><p><a href="https://www.bing.com/search?q=${{param: "what's <this> do? 'this' & \"that\"!"}}">Link</a></p></body></html>`,
            "<html><body><p><a href=\"https://www.bing.com/search?q=what's%20%3Cthis%3E%20do%3F%20'this'%20%26%20%22that%22!\">Link</a></p></body></html>"
        );
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
