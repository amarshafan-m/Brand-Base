# Development Guide

## Requirements

- Adobe Premiere Pro 25.6 or newer.
- Adobe UXP Developer Tool (UDT) 2.2 or newer.
- Node.js 20 or newer. The checked-in Premiere TypeScript package declares Node 20 as its minimum engine.
- The package-lock dependency set checked into this project.

## Install and verify

```bash
npm install
npm test
npm run build
npx tsc --noEmit
```

`npm run build` is the production UXP bundle command. It executes Vite with `MODE=build`, emits `dist/`, produces `dist/manifest.json` from `uxp.config.ts`, and uses inline source maps for UDT debugging. Vite transpiles TypeScript but does not replace a dedicated type check, so Phase 0 also runs `npx tsc --noEmit`.

`npm test` runs Vitest against the pure domain, utility, repository, and service modules. Tests do not use UXP, Premiere, Node filesystem APIs, or a browser runtime.

## Development loop

```bash
npm run build       # create a loadable initial build
npm run dev         # watch build with Bolt hot reload
```

In UDT, choose **Add Plugin**, select the project's generated `dist/` folder, then load the Brand Base panel in Premiere. Reload through UDT after a non-HMR configuration or manifest change. Use the UDT debugger for breakpoints; the configuration currently selects `debugger: "udt"`.

## Existing package scripts

| Script | Purpose |
| --- | --- |
| `dev` | watches a development UXP build with Vite |
| `build` | emits the production UXP bundle to `dist/` |
| `ccx` | produces a CCX package through the Bolt build integration |
| `zip` | produces the configured ZIP output |
| `preview` | runs Vite's preview server; it is not a Premiere runtime |
| `ccx-install` / `ccx-uninstall` | invoke Bolt's CCX actions |
| `hmr` | starts Vite directly |
| `test` | runs the Vitest unit suite once |

## Debugging

- Use UDT for the UXP context, not browser-only developer tooling.
- Keep actual UXP APIs behind services and adapters so failures can be logged and translated.
- Never paste raw paths, stack traces, tokens, or credentials into user-facing errors.
- If the generated UXP manifest or an API boundary changes, rebuild before reloading in UDT.

## Local library and Premiere integration

The library does not exist yet in Phase 0. Phase 3 will create it only after explicit folder selection and will use UXP entries and persistent tokens. Premiere import is also intentionally unimplemented; see [PREMIERE-API.md](./PREMIERE-API.md) for the verified API boundary and test requirements.

During `npm run dev`, the Phase 2 container initializes optional in-memory seed records through services. Production builds do not seed data and remain empty until a local library is introduced in Phase 3.

## Packaging

Run `npm run ccx` only after the production bundle and strict TypeScript check pass. Packaging and distribution requirements may evolve; validate the generated manifest, icons, signing, and current Adobe distribution guidance before release.
