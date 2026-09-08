# 2026-08-29-3-refactor-centralize-module-mounting

## Direct cause

- Each feature module's mount/unmount logic needed centralizing so modules do not sense their own toggle; the locale type merge should be consolidated at the client main entry.

## Solution

- The client index centrally manages module mounting: it subscribes to the toggle scope, calls the install function when enabled, and calls the returned disposer when disabled; modules are unaware of the toggle.
- The `'ui-fortifier'` `LocaleNamespaceMap` merge moved from the settings module to the client index.

## Approach

- Submodules only register themselves; control logic lives in the index, so adding a module is one entry in `modules`.
