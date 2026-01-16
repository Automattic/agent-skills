# Packaging and installation

This repo is the **source of truth** under `skills/`.

To distribute skills to other repos/tools (without symlinks), use the skillpack scripts.

## Build dist

Build a packaged copy under `dist/`:

- `node shared/scripts/skillpack-build.mjs --clean`

Outputs:

- `dist/codex/.codex/skills/*` (OpenAI Codex repo layout)
- `dist/vscode/.github/skills/*` (VS Code / Copilot repo layout)
- `dist/opencode/.opencode/skill/*` (OpenCode repo layout)

## Install into another repo

1. Build dist (above).
2. Install into a destination repo:

- `node shared/scripts/skillpack-install.mjs --dest=../some-repo`

By default, all three targets (codex, vscode, opencode) are installed. You can specify specific targets with `--targets=codex,vscode,opencode`.

Install mode defaults to `replace` (it replaces only the skill directories it installs).

