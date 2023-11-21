import { Arguments } from "./args_parser.ts";
import { crawl, normalize_url, print_report } from "./crawl.ts";

const args = new Arguments(process.argv.slice(2));
const url = normalize_url(args.get("url") || "");
if (!url) {
  console.error("No URL provided");
  process.exit(1);
}

const pages = {};
print_report(await crawl(url, url, pages));
