# 2026-09-11-1-fix-bring-folder-window-to-front

## Direct Reason

On Windows the window opened by "Open .dsh folder" often lands behind the browser. Windows only lets the foreground process, a process it started, or a process that received recent input activate a window; this plugin's chain is browser → (RPC) → dsh web host (a background process) → powershell.exe → explorer.exe, satisfying none of the three, so the new window is not allowed to come to the front.

dsh's shared `@deepseek-ai/dsh-native-command` `openNativePath` runs only `Invoke-Item` on that platform branch and does no foreground activation, so dsh's own "open configuration file/folder" is pushed back the same way.

## Solution

The Windows branch no longer calls the shared `openNativePath`; it runs its own PowerShell (`windowsOpenScript` in `src/open-dsh-folder.ts`):

1. Open the folder with `Invoke-Item -LiteralPath`.
2. Poll `Shell.Application`'s `Windows()` and match that folder's explorer window by `LocationURL` to read its `HWND` (explorer creates windows asynchronously; up to 3 seconds).
3. Synthesize one Alt press/release through `keybd_event`, making this process the most recent input owner and thereby eligible to activate.
4. Call `SetForegroundWindow` on that `HWND`.

When no window matches, the script exits successfully (the folder is open; only its window could not be located). Non-Windows platforms keep using the shared `openNativePath`.

## Approach

- Reuses the technique harness itself validates in its native folder dialog (`packages/host/directory-picker-native`): synthesizing Alt makes a background process eligible to activate. The difference is that the dialog there is created by the same process, while the Explorer window belongs to explorer, so the script must additionally call `SetForegroundWindow` on its `HWND`.
- The script runs through `runNativeCommand` (`execFile`, no shell); the path is injected as a PowerShell single-quoted literal with embedded quotes doubled, avoiding injection and escaping problems.
- Verification: with Notepad holding the foreground, run the generated script through the production path (`execFile` + `-NoProfile -Command`), then compare `GetForegroundWindow()` against the target `HWND` to confirm the foreground actually switched.
- Side work (project layout): Host/Client shared types moved to `src/types.ts` (types only, no runtime code), and the single tsconfig split into `tsconfig.host.json` + `tsconfig.client.json` leaves with a solution-only root, per repository convention. The whole package previously compiled against the Client face, so the Host half had no node global declarations and could not use `process.platform`.

## Involved Files

- [src/open-dsh-folder.ts](../../src/open-dsh-folder.ts): the Windows foreground-activation script and branch.
- [src/types.ts](../../src/types.ts): shared types for both faces (new).
- [src/index.ts](../../src/index.ts): imports and re-exports the config type from `types.ts`.
- [src/client/index.ts](../../src/client/index.ts), [src/client/settings/index.ts](../../src/client/settings/index.ts), [src/client/open-dsh-folder/](../../src/client/open-dsh-folder/): cross-face type references now point at `types.ts`.
- [tsconfig.host.json](../../tsconfig.host.json), [tsconfig.client.json](../../tsconfig.client.json), [tsconfig.json](../../tsconfig.json): per-face compiler configuration.