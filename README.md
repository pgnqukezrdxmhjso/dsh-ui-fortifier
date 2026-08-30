# dsh-ui-fortifier

![AI-Crap](https://img.shields.io/badge/💩-AI_crap_code-5C4033?style=flat-square)
[![npm](https://img.shields.io/npm/v/dsh-ui-fortifier?style=flat-square)](https://www.npmjs.com/package/dsh-ui-fortifier)

[中文](README.zh.md)

A DSH Web UI enhancer plugin

See [design/en/current.md](design/en/current.md) for details.

## Installation

```sh
dsh plugin --profile web add dsh-ui-fortifier
```

Installing via GitHub is not supported.

## Features

Adds a "ui-fortifier" tab in Settings to toggle every feature module of this plugin.

| Feature | Description |
| --- | --- |
| provider-label | Shows the currently selected provider to the left of the model selector. |

## Developed against dsh `0.1.2-alpha.1`

## Secondary Development

Clone this repository into a dsh workspace package directory, then install and build:

```sh
git clone https://github.com/pgnqukezrdxmhjso/dsh-ui-fortifier packages/my/dsh-ui-fortifier
pnpm install
pnpm --filter dsh-ui-fortifier bundle
```
