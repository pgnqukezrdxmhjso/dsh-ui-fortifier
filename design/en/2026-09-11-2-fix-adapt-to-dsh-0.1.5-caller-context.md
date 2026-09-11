# 2026-09-11-2-fix-adapt-to-dsh-0.1.5-caller-context

## Direct Reason

After dsh upgraded to `0.1.5-rc.2`, both entries in the input-row slot crashed:

```
Uncaught Error: cannot get property "remote.session" without inject
  at Proxy.directoryFor (service.ts:78)
  at inject (model-picker/index.ts:23)
slot entry crashed in 'conversation.input.right'
```

Since 0.1.5, service methods run under the **caller's Context** (cordis `getTraceable` binds the traceable proxy's `this.ctx` to the calling fiber). The official `ui-model-selection` `ModelDirectoryResolver` declares `static inject = ['sessions', 'remote', 'remote.session']` and reads `this.ctx.sessions` / `this.ctx.remote.session` inside `directoryFor()`. When this plugin calls `ctx.modelDirectories.directoryFor(sessionId)`, `this.ctx` is this plugin's client fiber, which declared only `['slots','locale','settingsScope','modelDirectories','connection']` — the three services were missing, so resolution threw.

## Solution

The client plugin `inject` in `src/client/index.ts` now reads:

```
'slots', 'locale', 'settingsScope', 'modelDirectories', 'connection',
'sessions', 'remote', 'remote.session',
```

The matching Context merge type imports were added (`@deepseek-ai/dsh-api-session-controller/client` supplies `ctx.sessions`; `@deepseek-ai/dsh-api-remotes/client` supplies `ctx.remote` / `ctx.remote.session`), and `@deepseek-ai/dsh-api-remotes` joined devDependencies and the `dsh.client.inject` list as a browser/type relationship.

## Approach

- Aligns with the official `ui-model-selection`: its client `inject` is exactly `['commandUi','locale','sessions','slots','remote','remote.session']` — it declares those three services solely because `directoryFor()` reads them under the caller ctx.
- The affected entries are the two registered into `conversation.input.right` (`provider-label`, `model-picker`); both share the client plugin ctx, so one addition at plugin level covers both.
- The remaining called services were checked for the same hazard: `ui-settings`'s `SettingsScopeBinder.bind()` builds its controller from `this.owner` (ui-settings' own ctx) and `describe()` returns its own mirror, so the Settings page needs no `remote.settings`; `ui-slots` and `connection` read no nested services internally (no `this.ctx.<service>` hits).
- The `connection.rpc.handle` 0.1.5 defect does not apply: this plugin only calls `connection.rpc.call('/api', ...)` against the official Gateway (`open-dsh-folder`) and registers no physical route.

## Involved Files

- [src/client/index.ts](../../src/client/index.ts): adds `sessions` / `remote` / `remote.session` to the client plugin `inject` plus the type merge imports.
- [package.json](../../package.json): adds `@deepseek-ai/dsh-api-remotes` to devDependencies and to `dsh.client.inject`.