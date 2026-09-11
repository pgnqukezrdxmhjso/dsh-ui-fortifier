# 2026-09-11-3-chore-remove-empty-invariant-companion

## Direct Reason

`verify-package-invariants` reported two violations for this package:

```
package.json: @deepseek-ai/dsh-invariants must not be a peerDependency under this package dependency policy
src/invariant.ts: empty install function is unnecessary; omit the companion and its publication wiring
```

This package is a pure slot surface (it registers slots, one settings namespace, and one Remote endpoint, and only reads the official shared store), so it owns no event stream or mutable state and has no observation that could independently diverge. Harness decision `2026-08-28-omit-unneeded-invariant-companions` reversed the earlier "every package publishes `./invariant`" requirement: when no qualifying relationship exists, the companion is omitted, empty installers are rejected, and the package README records the reason. This package's `src/invariant.ts` is an empty shell (`const install: InvariantInstaller = () => {}`) left by the original 08-31 scaffold under the old rule.

## Solution

Delete `src/invariant.ts` and every publication wire:

- `src/invariant.ts`: deleted (empty installer).
- [package.json](../../package.json): dropped `exports["./invariant"]`, `lib/invariant.js` from `files`, and the `dsh-invariants` peer and dev dependencies.
- [tsconfig.host.json](../../tsconfig.host.json), [tsconfig.client.json](../../tsconfig.client.json): dropped the `runtime-diagnostics/invariants` project reference.
- [tsdown.config.ts](../../tsdown.config.ts): dropped `lib/types/invariant.js` from the build entries.
- [README.md](../../README.md), [README.zh.md](../../README.zh.md): record that no companion is published and why (the English sentence satisfies the gate's omission-reason requirement).

## Approach

- Follows harness's criterion: publish a companion only when the package can compare observations that may independently diverge (cross-event lifecycle/order/identity/pairing protocols; events against authoritative mutable state; multi-producer assembled output; durable data a later operation folds or consumes). Otherwise the behavior belongs to type, load, or unit tests. This package satisfies none of the four.
- The gate has hard requirements for omission: the export, the published file, the build wiring, and the project references must all go together, and the English README must state the reason — otherwise the violations are merely exchanged for different ones.
- If this package later gains an owned mutable relationship or a consumed event protocol (a cross-entry shared state it owns, a custom event protocol, or durable data a downstream reads), this conclusion must be revisited and a companion with real assertions added.

## Involved Files

- `src/invariant.ts`: deleted.
- [package.json](../../package.json), [tsconfig.host.json](../../tsconfig.host.json), [tsconfig.client.json](../../tsconfig.client.json), [tsdown.config.ts](../../tsdown.config.ts): publication wiring and project reference removed.
- [README.md](../../README.md), [README.zh.md](../../README.zh.md): omission reason recorded.