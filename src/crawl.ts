import { JSDOM } from "jsdom";

export async function crawl(
  base_url: URL,
  current_url: URL,
  pages: { [key: string]: number },
): Promise<{ [key: string]: number }> {
  if (current_url.hostname !== base_url.hostname) {
    return pages;
  }

  if (pages[current_url.href] > 0) {
    pages[current_url.href]++;
    return pages;
  }

  if (current_url === base_url) {
    pages[current_url.href] = 0;
  } else {
    pages[current_url.href] = 1;
  }

  console.log(`Crawling ${current_url}`);
  let html = "";
  try {
    const resp = await fetch(current_url);
    if (resp.status > 399) {
      console.log(`HTTP error, status code: ${resp.status}`);
      return pages;
    }
    const content_type = resp.headers.get("content-type");
    if (!content_type) {
      console.log(`No content-type header`);
      return pages;
    }
    if (!content_type.includes("text/html")) {
      console.log(`Non-html response: ${content_type}`);
      return pages;
    }
    html = await resp.text();
  } catch (err) {
    // @ts-ignore
    console.log(err.message);
  }

  const next_urls = get_urls_from_html(html, base_url.href);
  for (const next_url of next_urls) {
    const normalized_url = normalize_url(next_url);
    if (!normalized_url) {
      continue;
    }
    pages = await crawl(base_url, normalized_url, pages);
  }

  return pages;
}

export function normalize_url(url: string): URL | null {
  if (!url) {
    console.error("No URL provided");
    return null;
  }
  if (!url.startsWith("http") && !url.startsWith("//")) {
    url = "https://" + url;
  }
  try {
    return new URL(url);
  } catch (e) {
    // @ts-ignore
    console.error(e.message);
    return null;
  }
}

export function get_urls_from_html(html: string, base_url: string): string[] {
  const dom = new JSDOM(html);
  // I hate prettier
  const links: NodeListOf<HTMLAnchorElement> =
    dom.window.document.querySelectorAll("a");

  return Array.from(links).map((link) => {
    if (
      link.getAttribute("href")?.startsWith("http") ||
      link.getAttribute("href")?.startsWith("www") ||
      link.getAttribute("href")?.startsWith("//")
    ) {
      return (
        normalize_url(link.getAttribute("href") || "")?.href.replace(
          /\/$/,
          "",
        ) || ""
      );
    }

    return (
      normalize_url(
        `${base_url.replace(/\/$/, "")}${link.getAttribute("href")}`,
      )?.href.replace(/\/$/, "") || ""
    );
  });
}

export function print_report(pages: { [key: string]: number }) {
  if (Object.keys(pages).length === 0) {
    console.log("No internal links found");
  }

  console.log("\n\n");
  console.log("\x1b[32mReport:\x1b[0m");
  // sort pages by number of pages visited
  const sorted_pages = Object.entries(pages).sort((a, b) => b[1] - a[1]);
  for (const [url, count] of sorted_pages) {
    console.log(
      `Found \x1b[34m${count}\x1b[0m internal links on \x1b[35m${url}\x1b[0m`,
    );
  }
}
