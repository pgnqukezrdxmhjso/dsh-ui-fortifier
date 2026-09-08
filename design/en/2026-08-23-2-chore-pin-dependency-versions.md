# 2026-08-23-2-chore-pin-dependency-versions

## Direct cause

In secondary-development environments the workspace dependency versions may drift, and `workspace:^` cannot record the versions used at development time.

## Solution

- Changed all `@deepseek-ai/dsh-*` dependencies in [package.json](../../package.json) except `@deepseek-ai/dsh-invariants` from `workspace:^` to exact versions (`0.1.1-rc.2`), `@deepseek-ai/cordis` to `4.0.1`, and `@deepseek-ai/schemastery` to `3.18.1`.
- `@deepseek-ai/dsh-invariants` stays `workspace:^` (forced by the verify-package-invariants gate).

## Approach

- The dependency versions are recorded directly in [package.json](../../package.json); secondary developers can match the workspace versions against the "Developed against dsh version" section of [README.md](../../README.md).
- Publishing to npm no longer needs pnpm's workspace protocol conversion.

## Extra benefits

- Simplified release flow (dependencies are already npm versions).
