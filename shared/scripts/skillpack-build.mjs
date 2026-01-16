import fs from "node:fs";
import path from "node:path";

function usage() {
  process.stderr.write(
    [
      "Usage:",
      "  node shared/scripts/skillpack-build.mjs [--out=dist] [--targets=codex,vscode,opencode] [--clean]",
      "",
      "Outputs:",
      "  - <out>/codex/.codex/skills/<skill>/SKILL.md",
      "  - <out>/vscode/.github/skills/<skill>/SKILL.md",
      "  - <out>/opencode/.opencode/skill/<skill>/SKILL.md",
      "",
      "Notes:",
      "- Avoids symlinks (Codex ignores symlinked directories).",
      "",
    ].join("\n")
  );
}

function parseArgs(argv) {
  const args = { out: "dist", targets: ["codex", "vscode", "opencode"], clean: false };
  for (const a of argv) {
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--clean") args.clean = true;
    else if (a.startsWith("--out=")) args.out = a.slice("--out=".length);
    else if (a.startsWith("--targets=")) args.targets = a.slice("--targets=".length).split(",").filter(Boolean);
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
  assert(!isSymlink(srcDir), `Refusing to copy symlink dir: ${srcDir}`);
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name === ".DS_Store") continue;
    const src = path.join(srcDir, ent.name);
    const dest = path.join(destDir, ent.name);

    if (isSymlink(src)) {
      throw new Error(`Refusing to copy symlink: ${src}`);
    }

    if (ent.isDirectory()) {
      copyDir({ srcDir: src, destDir: dest });
      continue;
    }
    if (ent.isFile()) {
      copyFileSyncPreserveMode(src, dest);
      continue;
    }
    // Ignore sockets, devices, etc.
  }
}

function listSkillDirs(skillsRoot) {
  if (!fs.existsSync(skillsRoot)) return [];
  const dirs = fs
    .readdirSync(skillsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(skillsRoot, d.name));

  return dirs.filter((d) => fs.existsSync(path.join(d, "SKILL.md")));
}

function buildTarget({ repoRoot, outDir, target, skillDirs }) {
  const rootByTarget = {
    codex: path.join(outDir, "codex", ".codex", "skills"),
    vscode: path.join(outDir, "vscode", ".github", "skills"),
    opencode: path.join(outDir, "opencode", ".opencode", "skill"),
  };
  const destSkillsRoot = rootByTarget[target];
  assert(destSkillsRoot, `Unknown target: ${target}`);

  fs.mkdirSync(destSkillsRoot, { recursive: true });

  for (const srcSkillDir of skillDirs) {
    const name = path.basename(srcSkillDir);
    const destSkillDir = path.join(destSkillsRoot, name);
    copyDir({ srcDir: srcSkillDir, destDir: destSkillDir });
  }

  const rel = path.relative(repoRoot, destSkillsRoot);
  process.stdout.write(`OK: built ${target} skillpack at ${rel}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    process.exit(2);
  }

  const repoRoot = process.cwd();
  const skillsRoot = path.join(repoRoot, "skills");
  const outDir = path.isAbsolute(args.out) ? args.out : path.join(repoRoot, args.out);

  const skillDirs = listSkillDirs(skillsRoot);
  assert(skillDirs.length > 0, "No skills found under ./skills");

  const targets = [...new Set(args.targets)];
  for (const t of targets) {
    assert(t === "codex" || t === "vscode" || t === "opencode", `Invalid target: ${t}`);
  }

  if (args.clean) {
    for (const t of targets) {
      const p =
        t === "codex"
          ? path.join(outDir, "codex")
          : t === "vscode"
            ? path.join(outDir, "vscode")
            : t === "opencode"
              ? path.join(outDir, "opencode")
              : null;
      if (p) fs.rmSync(p, { recursive: true, force: true });
    }
  }

  for (const target of targets) {
    buildTarget({ repoRoot, outDir, target, skillDirs });
  }
}

main();

