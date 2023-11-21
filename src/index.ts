import { Arguments } from "./args_parser.ts";
import { crawl, normalize_url } from "./crawl.ts";

function print_report(pages: { [key: string]: number }) {
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

const args = new Arguments(process.argv.slice(2));
const url = normalize_url(args.get("url") || "");
if (!url) {
  console.error("No URL provided");
  process.exit(1);
}

const pages = {};
print_report(await crawl(url, url, pages));
