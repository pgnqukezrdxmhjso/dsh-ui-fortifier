# 2026-08-23-3-refactor-config-same-name-and-simplify-display-name

## Direct cause

- `Config` should follow the dsh official pattern: type and value share the same name.
- The Settings display name should not carry the `dsh-` prefix.

## Solution

- [src/index.ts](../../src/index.ts): merged `UiFortifierSettings` interface and `UI_FORTIFIER_SETTINGS_SCHEMA` into a same-named `Config` type + `Config` value (schema).
- [src/client/locales.ts](../../src/client/locales.ts): changed the `nav` display name from `dsh-ui-fortifier` to `ui-fortifier`.

## Approach

- Same-named Config is the standard Cordis plugin shape; `apply(ctx, config: Config)` references the same name.
- The display name is user-visible copy; dropping `dsh-` is cleaner.
