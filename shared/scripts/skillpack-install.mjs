import fs from "node:fs";
import path from "node:path";

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  node shared/scripts/skillpack-install.mjs --dest=<repo-root> [--from=dist] [--targets=codex,vscode,opencode] [--mode=replace|merge] [--dry-run]",
      "",
      "Examples:",
      "  node shared/scripts/skillpack-build.mjs --clean",
      "  node shared/scripts/skillpack-install.mjs --dest=../my-wp-repo --targets=codex,vscode,opencode",
      "",
    ].join("\n")
  );
}

function parseArgs(argv) {
  const args = { from: "dist", dest: null, targets: ["codex", "vscode", "opencode"], mode: "replace", dryRun: false };
  for (const a of argv) {
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--dry-run") args.dryRun = true;
    else if (a.startsWith("--from=")) args.from = a.slice("--from=".length);
    else if (a.startsWith("--dest=")) args.dest = a.slice("--dest=".length);
    else if (a.startsWith("--targets=")) args.targets = a.slice("--targets=".length).split(",").filter(Boolean);
    else if (a.startsWith("--mode=")) args.mode = a.slice("--mode=".length);
    else {
      process.stderr.write(`Unknown arg: ${a}\n`);
      args.help = true;
    }
  }
  return args;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isSymlink(p) {
  try {
    return fs.lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

function copyFileSyncPreserveMode(src, dest) {
  const st = fs.statSync(src);
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, st.mode);
}

function copyDir({ srcDir, destDir }) {
  if (isSymlink(srcDir)) throw new Error(`Refusing to copy symlink dir: ${srcDir}`);
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === ".DS_Store") continue;
    const src = path.join(srcDir, ent.name);
    const dest = path.join(destDir, ent.name);

    if (isSymlink(src)) throw new Error(`Refusing to copy symlink: ${src}`);

    if (ent.isDirectory()) {
      copyDir({ srcDir: src, destDir: dest });
      continue;
    }
    if (ent.isFile()) {
      copyFileSyncPreserveMode(src, dest);
      continue;
    }
  }
}

function listSkillDirs(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) return [];
  return fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(skillsRoot, d.name))
    .filter((d) => fs.existsSync(path.join(d, "SKILL.md")));
}

function installTarget({ fromDir, destRepoRoot, target, mode, dryRun }) {
  const srcSkillsRoot =
    target === "codex"
      ? path.join(fromDir, "codex", ".codex", "skills")
      : target === "vscode"
        ? path.join(fromDir, "vscode", ".github", "skills")
        : target === "opencode"
          ? path.join(fromDir, "opencode", ".opencode", "skill")
          : null;

  const destSkillsRoot =
    target === "codex"
      ? path.join(destRepoRoot, ".codex", "skills")
      : target === "vscode"
        ? path.join(destRepoRoot, ".github", "skills")
        : target === "opencode"
          ? path.join(destRepoRoot, ".opencode", "skill")
          : null;

  assert(srcSkillsRoot && destSkillsRoot, `Unknown target: ${target}`);
  assert(fs.existsSync(srcSkillsRoot), `Missing source skillpack dir: ${srcSkillsRoot}`);

  const skillDirs = listSkillDirs(srcSkillsRoot);
  assert(skillDirs.length > 0, `No skills found in: ${srcSkillsRoot}`);

  if (!dryRun) fs.mkdirSync(destSkillsRoot, { recursive: true });

  for (const srcSkillDir of skillDirs) {
    const name = path.basename(srcSkillDir);
    const destSkillDir = path.join(destSkillsRoot, name);

    if (mode === "replace") {
      if (!dryRun) fs.rmSync(destSkillDir, { recursive: true, force: true });
    }

    if (!dryRun) copyDir({ srcDir: srcSkillDir, destDir: destSkillDir });
  }

  process.stdout.write(
    `OK: installed ${skillDirs.length} skill(s) to ${path.relative(destRepoRoot, destSkillsRoot) || "."}\n`
  );
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.dest) {
    usage();
    process.exit(args.help ? 2 : 1);
  }

  const repoRoot = process.cwd();
  const fromDir = path.isAbsolute(args.from) ? args.from : path.join(repoRoot, args.from);
  const destRepoRoot = path.isAbsolute(args.dest) ? args.dest : path.join(repoRoot, args.dest);

  const targets = [...new Set(args.targets)];
  for (const t of targets) assert(t === "codex" || t === "vscode" || t === "opencode", `Invalid target: ${t}`);
  assert(args.mode === "replace" || args.mode === "merge", "mode must be 'replace' or 'merge'");

  for (const target of targets) {
    installTarget({ fromDir, destRepoRoot, target, mode: args.mode, dryRun: args.dryRun });
  }
}

main();

