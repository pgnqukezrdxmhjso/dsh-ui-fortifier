# dsh-ui-fortifier

![AI-Crap](https://img.shields.io/badge/💩-AI_crap_code-5C4033?style=flat-square) [![npm](https://img.shields.io/npm/v/dsh-ui-fortifier?style=flat-square)](https://www.npmjs.com/package/dsh-ui-fortifier)

[English](./README.md)

DSH Web UI 强化插件

详情见 [design/zh/current.md](design/zh/current.md)。

## 安装

```sh
dsh plugin --profile web add dsh-ui-fortifier
```

**不支持通过 GitHub 安装。**

## 功能

在设置页新增「ui-fortifier」标签页，集中开关本插件各功能模块。

| 功能 | 描述 |
| --- | --- |
| provider-label | 在模型选择按钮左侧显示当前选择的提供方。 |
| model-picker | 输入行模型选择器旁提供级联模型选择器（提供商 → 模型）。 |
| open-dsh-folder | 在设置页右上角「打开配置文件」旁增加「打开 .dsh 文件夹」。 |
| settings-frame | 设置面板可拖动位置与拖动大小。 |

## 构建时使用的 dsh 版本

- 构建时使用的 dsh 版本：`0.1.5-rc.2`；`@deepseek-ai/dsh-*` 依赖使用 `workspace:^`。

## 二次开发说明

将此仓库克隆到 dsh workspace 的包目录，然后安装并构建：

```sh
git clone https://github.com/pgnqukezrdxmhjso/dsh-ui-fortifier packages/my/dsh-ui-fortifier
pnpm install
pnpm --filter dsh-ui-fortifier build
```

---

本包不发布运行时 invariant 伴生入口：它是纯插槽表面，只注册插槽、一个 settings 命名空间和一个 Remote 端点，没有自有事件流或可变状态可供断言。
