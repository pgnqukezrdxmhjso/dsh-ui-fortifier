# 2026-08-29-1-migrate-adapt-to-dsh-split-packages

## Direct cause

- dsh updated and removed the `@deepseek-ai/dsh-client-runtime` package, splitting it into session-controller/store and others; the plugin build broke.

## Solution

- `ClientContext` now imports from `@deepseek-ai/cordis`.
- `SessionId` now imports from `@deepseek-ai/dsh-session/types`.
- `SettingsScope` now imports from `@deepseek-ai/dsh-client-ui-settings/client`.
- `ctx.slots` typing pulled in via an empty import of `@deepseek-ai/dsh-client-ui-renderer/client`.
- [package.json](../../package.json): removed dsh-client-runtime, added dsh-api-session-controller and dsh-client-ui-renderer.
- [tsconfig.json](../../tsconfig.json) references switched to session-controller/tsconfig.client.json, ui-renderer, core/session.

## Approach

- The new packages are not published to npm yet, so dependencies use `workspace:^` to resolve inside this repository.
