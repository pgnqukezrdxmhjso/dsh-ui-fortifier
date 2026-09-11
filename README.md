# dsh-ui-fortifier

![AI-Crap](https://img.shields.io/badge/💩-AI_crap_code-5C4033?style=flat-square) [![npm](https://img.shields.io/npm/v/dsh-ui-fortifier?style=flat-square)](https://www.npmjs.com/package/dsh-ui-fortifier)

[中文](./README.zh.md)

A DSH Web UI enhancer plugin

See [design/en/current.md](design/en/current.md) for details.

## Installation

```sh
dsh plugin --profile web add dsh-ui-fortifier
```

**Installing via GitHub is not supported.**

## Features

Adds a "ui-fortifier" tab in Settings to toggle every feature module of this plugin.

| Feature | Description |
| --- | --- |
| provider-label | Shows the currently selected provider to the left of the model selector. |
| model-picker | Cascading model picker (provider → model) next to the model selector in the input row. |
| open-dsh-folder | Adds an "Open .dsh folder" button next to "Open configuration file" at the top-right of the Settings page. |
| settings-frame | Makes the Settings panel draggable and resizable. |

## dsh version used for development

- dsh version used for development: `0.1.5-rc.2`. `@deepseek-ai/dsh-*` dependencies use `workspace:^`.

## Secondary Development

Clone this repository into a dsh workspace package directory, then install and build:

```sh
git clone https://github.com/pgnqukezrdxmhjso/dsh-ui-fortifier packages/my/dsh-ui-fortifier
pnpm install
pnpm --filter dsh-ui-fortifier build
```

---

No runtime invariant companion is published because this package is a pure slot surface: it registers slots, a settings namespace, and one Remote endpoint, and owns no event stream or mutable state to assert.
