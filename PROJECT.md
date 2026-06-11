# Project: Hide Embedded SC Player

## Architecture
- React/TypeScript project with Vite build system.
- Build configuration files: `vite.config.ts` and `vite.lib.config.ts`.
- Package dependencies defined in `package.json`.
- Entry points and output directories: `dist-demo` (for demo build) and `dist` (for library build).
- The assets to output: `.png` files from `public/images` to `dist-demo/images` or similar project conventions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Strategy | Inspect build config, code layout, package dependencies, and locate images. Recommend a fix strategy. | None | DONE |
| 2 | Implementation | Implement changes to vite.config.ts (or other relevant configuration files) to copy png files from public/images to dist-demo. | M1 | DONE |
| 3 | Verification & Review | Run build, verify .png files are in dist-demo, and verify no new dependencies are added to package.json. | M2 | DONE |
| 4 | Forensic Audit | Perform integrity verification to ensure no hardcoded test results, facade implementations, or cheating. | M3 | DONE |

## Code Layout
- `.agents/` - Orchestrator and worker coordination
- `public/` - Public assets including `public/images/`
- `src/` - React application source code
- `package.json` - Build commands and dependencies
- `vite.config.ts` - Main Vite application configuration
- `vite.lib.config.ts` - Vite library configuration
