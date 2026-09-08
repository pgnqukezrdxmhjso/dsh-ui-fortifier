# 2026-08-29-2-refactor-client-binding-and-subscription

## Direct cause

- The client settings binding used the loose `Record<string, boolean>` type, disconnected from the Host config type; ProviderLabel's reactive subscription style differed from the Settings page.

## Solution

- `bind<Record<string, boolean>>` became `bind<Config>`; the client imports `Config` from the Host type.
- The `modules` registry is strongly constrained by `Record<keyof Config, ModuleEntry>`; fields stay in sync with Config.
- ProviderLabel switched from hand-written `useSyncExternalStore` to the `useDirectory` inject hook, matching the Settings page's `useToggles`.

## Approach

- Drive the client binding and module registry from one authoritative type (Config) to avoid declaration drift.
- Unify reactive subscription through the slots hooks mechanism (a SnapshotStore is a HostObservable).
