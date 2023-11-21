import { test, expect } from "bun:test";
import { get_urls_from_html, normalize_url } from "./crawl";

test("normal url", () => {
  const url = "https://blog.boot.dev/path";
  expect(normalize_url(url)).toBe("blog.boot.dev/path");
});

test("url with trailing slash", () => {
  const url = "https://blog.boot.dev/path/";
  expect(normalize_url(url)).toBe("blog.boot.dev/path");
});

test("url with port", () => {
  const url = "https://blog.boot.dev:8080/path";
  expect(normalize_url(url)).toBe("blog.boot.dev/path");
});

test("url with user and password", () => {
  const url = "https://user:V8c2B@blog.boot.dev/path/";
  expect(normalize_url(url)).toBe("blog.boot.dev/path");
});

test("empty url", () => {
  const url = "";
  expect(normalize_url(url)).toBe("");
});

test("null url", () => {
  const url = null;
  // @ts-expect-error
  expect(normalize_url(url)).toBe("");
});

test("undefined url", () => {
  const url = undefined;
  // @ts-expect-error
  expect(normalize_url(url)).toBe("");
});

test("NaN url", () => {
  const url = NaN;
  // @ts-expect-error
  expect(normalize_url(url)).toBe("");
});

test("get_urls_from_html", () => {
  const html = `
    <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <a href="/path/">https://blog.boot.dev/path/</a>
        <h1>Lorem Ipsum</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <a href="/path2/">https://blog.boot.dev/path2/</a>
        <a href="/path3/">https://blog.boot.dev/path3/</a>
      </body>
    </html>
  `;
  const base_url = "https://blog.boot.dev/";
  expect(get_urls_from_html(html, base_url)).toEqual([
    "blog.boot.dev/path",
    "blog.boot.dev/path2",
    "blog.boot.dev/path3",
  ]);
});
