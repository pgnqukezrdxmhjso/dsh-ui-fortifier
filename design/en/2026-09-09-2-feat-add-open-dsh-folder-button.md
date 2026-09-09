# 2026-09-09-2-feat-add-open-dsh-folder-button

## Direct Reason

The user wants to reuse the top-right area of the Settings page that holds "Open configuration file" and add an "Open .dsh folder" button next to it, opening the dsh data directory in the system file manager with one click.

## Solution

"Open configuration file" is an entry registered by `ui-settings-general` into the `settings.action` slot (a list slot, id `open-document`, order 0). A list slot supports multiple entries rendered side by side in order, so this plugin registers a second entry (id `open-dsh-folder`, order 1) to display next to it.

Opening a local folder is a privileged operation the browser cannot perform; the Host must do it. The dsh gateway supports SRC reflection: any `TypertRemoteService` subclass registered into ctx (carrying a `typertRemote` binding and `@Remote` methods) is discovered by the gateway and exposed as an endpoint, without typert generator artifacts. This plugin's Host side adds `OpenDshFolderService` under the `uiFortifier` namespace, exposing the `openDshFolder` endpoint:

- `resolveDshHome()` resolves the `.dsh` directory (`$DSH_HOME` → `~/.dsh`);
- when `canOpenNativePath()` is true, calls `openNativePath(home, signal)` to open the directory and returns `{ opened: true, path }`;
- without a native opener (e.g. headless Linux), returns `{ opened: false, path }` and the button shows the path as text.

The client-side `open-dsh-folder` module registers the new `settings.action` entry; clicking calls the endpoint via `ctx.connection.rpc.call('/api', 'uiFortifier/openDshFolder', { args: {} })`. The security boundary matches "Open configuration file": the button registers only when `connection.isLoopback` is true, so remote deployments never render it and request authentication blocks the call anyway.

The feature reuses the `ui-fortifier` settings namespace: the `open-dsh-folder` config key defaults to true and can be disabled on the Settings page.

## Approach

- Button placement: reuse the existing `settings.action` list slot without touching `ui-settings-general`'s declaration.
- Capability boundary: the whole feature lives inside the plugin; the Host half exposes the endpoint via SRC reflection, changing nothing in dsh itself, aligned with the dsh.md collaboration rules.
- Security: shares the loopback restriction and connection authentication with "Open configuration file"; remote deployments degrade to no button rather than a non-functional one.
- Reuse: module toggles, locale copy, and the low-level `connection.rpc.call` channel all reuse existing facilities, keeping new code small.

## Involved Files

- [src/open-dsh-folder.ts](../../src/open-dsh-folder.ts): Host-side Remote service.
- [src/index.ts](../../src/index.ts): registers the Remote service and adds the `open-dsh-folder` config key.
- [src/client/open-dsh-folder/](../../src/client/open-dsh-folder/): client button module (component + installer + styles).
- [src/client/index.ts](../../src/client/index.ts): adds the module and `connection` to inject.
- [src/client/locales.ts](../../src/client/locales.ts): Chinese and English copy.
- [package.json](../../package.json): adds `dsh-typert-protocol`, `dsh-home-paths`, `dsh-native-command`, `dsh-client-connection` dependencies; adds `dsh-client-connection` to `dsh.client.inject`.
- [tsconfig.json](../../tsconfig.json): adds references for those packages.
- [README.md](../../README.md) / [README.zh.md](../../README.zh.md): adds one feature row.