# Agent Skills for WordPress

**Teach AI coding assistants how to build WordPress the right way.**

Agent Skills are portable bundles of instructions, checklists, and scripts that help AI assistants (Claude, Copilot, Codex, Cursor, etc.) understand WordPress development patterns, avoid common mistakes, and follow best practices.

<img width="2400" height="1260" alt="Agent Skills banner" src="https://github.com/user-attachments/assets/def9a6f9-cbba-4249-866f-b9a274b84188" />

## Why Agent Skills?

AI coding assistants are powerful, but they often:
- Generate outdated WordPress patterns (pre-Gutenberg, pre-block themes)
- Miss critical security considerations in plugin development
- Skip proper block deprecations, causing "Invalid block" errors
- Ignore existing tooling in your repo

Agent Skills solve this by giving AI assistants **expert-level WordPress knowledge** in a format they can actually use.

## Available Skills

| Skill | What it teaches |
|-------|-----------------|
| **wordpress-router** | Classifies WordPress repos and routes to the right workflow |
| **wp-project-triage** | Detects project type, tooling, and versions automatically |
| **wp-block-development** | Gutenberg blocks: `block.json`, attributes, rendering, deprecations |
| **wp-block-themes** | Block themes: `theme.json`, templates, patterns, style variations |
| **wp-plugin-development** | Plugin architecture, hooks, settings API, security |
| **wp-interactivity-api** | Frontend interactivity with `data-wp-*` directives and stores |
| **wp-abilities-api** | Capability-based permissions and REST API authentication |
| **wp-wpcli-and-ops** | WP-CLI commands, automation, multisite, search-replace |
| **wp-performance** | Profiling, caching, database optimization, Server-Timing |
| **wp-phpstan** | PHPStan static analysis for WordPress projects (config, baselines, WP-specific typing) |
| **wp-playground** | WordPress Playground for instant local environments |

## Quick Start

### Install into your repo

```bash
# Clone agent-skills
git clone https://github.com/Automattic/agent-skills.git
cd agent-skills

# Build the distribution
node shared/scripts/skillpack-build.mjs --clean

# Install into your WordPress project
node shared/scripts/skillpack-install.mjs --dest=../your-wp-project
```

This copies skills into:
- `.codex/skills/` for OpenAI Codex
- `.github/skills/` for VS Code / GitHub Copilot
- `.opencode/skill/` for OpenCode

### Manual installation

Copy any skill folder from `skills/` into your project's instructions directory for your AI assistant.

## How It Works

Each skill contains:

```
skills/wp-block-development/
├── SKILL.md              # Main instructions (when to use, procedure, verification)
├── references/           # Deep-dive docs on specific topics
│   ├── block-json.md
│   ├── deprecations.md
│   └── ...
└── scripts/              # Deterministic helpers (detection, validation)
    └── list_blocks.mjs
```

When you ask your AI assistant to work on WordPress code, it reads these skills and follows the documented procedures rather than guessing.

## Compatibility

- **WordPress 6.9+** (PHP 7.2.24+)
- Works with any AI assistant that supports project-level instructions

## Contributing

**We welcome contributions!** This project is a great way to share your WordPress expertise—you don't need to be a coding wizard. Most skills are written in Markdown, focusing on clear procedures and best practices.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

Quick commands:

```bash
# Scaffold a new skill
node shared/scripts/scaffold-skill.mjs <skill-name> "<description>"

# Validate skills
node eval/harness/run.mjs
```

## Documentation

- [Authoring Guide](docs/authoring-guide.md) - How to create and improve skills
- [Principles](docs/principles.md) - Design philosophy
- [Packaging](docs/packaging.md) - Build and distribution
- [Compatibility Policy](docs/compatibility-policy.md) - Version targeting

## License

MIT
