import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const projectRef = process.env.SUPABASE_PROJECT_REF;

if (!projectRef) {
  console.error("SUPABASE_PROJECT_REF is required.");
  process.exit(1);
}

const result = spawnSync(
  "pnpm",
  ["dlx", "supabase", "gen", "types", "typescript", "--project-id", projectRef],
  {
    encoding: "utf8",
    shell: process.platform === "win32",
  },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

writeFileSync("src/lib/supabase/database.types.ts", result.stdout);
console.log("Wrote src/lib/supabase/database.types.ts");
