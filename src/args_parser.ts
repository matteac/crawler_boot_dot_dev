export class Arguments {
  args: { [key: string]: string | null } = {};
  constructor(args: string[] = []) {
    if (args.length === 0) {
      console.error("No arguments provided");
      process.exit(1);
    }
    this.args = this._parse(args);
  }
  get(key: string): string | null {
    return this.args[key];
  }
  private _parse(args: string[]): { [key: string]: string | null } {
    let a: { [key: string]: string | null } = {};
    for (let arg of args) {
      if (!arg.startsWith("--")) {
        continue;
      }
      const [key, value] = arg.split("=");
      if (!value) {
        console.error("Missing value for argument: " + key);
        process.exit(1);
      }
      a[key.slice(2)] = value;
    }
    return a;
  }
}
