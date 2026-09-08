# 2026-09-09-1-fix-adapt-settings-registration-to-new-api

## Direct cause

- After upgrading dsh to 0.1.2-rc.1, `@deepseek-ai/dsh-settings` removed the host-side convenience functions `installSettingsSection` and `settingsNamespace`, replaced by the settings service method `ctx.settings.installSection(owner, ns, schema, entry, hooks)`; the namespace is now a literal argument checked by the type layer against the lowercase letter, digit, and hyphen grammar. The old calls no longer compile.

## Solution

- [src/index.ts](../../src/index.ts) obtains the settings service via `ctx.inject(['settings'])` and registers the `ui-fortifier` namespace through `ctx.settings.installSection`; the namespace constant is now a plain string literal.
- The "dsh version used for development" section in [README.md](../../README.md) and [README.zh.md](../../README.zh.md) now reads 0.1.2-rc.1.

## Approach

- Follow the same migration the in-tree consumers made (e.g. `web-search-deepseek`): `installSection`'s `entry` is the plugin config, used as the base layer with fallback to that config when the service is absent, matching the old convenience function's behavior.