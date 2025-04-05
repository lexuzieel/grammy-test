import { assert } from "@japa/assert";
import { configure, processCLIArgs, run } from "@japa/runner";

processCLIArgs(process.argv.splice(2));
configure({
  files: ["tests/**/*.spec.ts", "tests/**/*.test.ts"],
  plugins: [assert()],
});
run();
