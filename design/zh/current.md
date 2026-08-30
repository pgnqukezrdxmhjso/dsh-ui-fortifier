# dsh-ui-fortifier 项目当前状态

## 简介

DSH Web UI 强化插件：在设置页提供功能模块开关，并显示当前会话的模型提供方。

## 宏观描述

插件分 host 半侧与 client 半侧。host 半侧注册 `ui-fortifier` settings 命名空间，承载各功能模块的开关状态；client 半侧注册设置页（`settings.section`），读取配置项自动生成开关行，并由 index 统一控制各功能子模块的挂载（见「模块控制机制」）。

开关状态采用 dsh settings 服务三层解析：schema 默认值 → base 层（插件配置 cordis.yml 默认值）→ user 层（用户设置页覆盖）。

## todo

- [ ] GitHub 仓库推送

## 功能

### 设置页

- 功能描述：在设置页新增「ui-fortifier」标签页，集中开关本插件各功能模块。开关行由设置页读取 `ui-fortifier` 命名空间的配置项自动生成。
- 实现位置：[src/client/index.ts](../src/client/index.ts)、[src/client/settings/FortifierSettingsPage.tsx](../src/client/settings/FortifierSettingsPage.tsx)
- 解决方案：client 侧绑定 settingsScope，从 describe mirror 读取命名空间值；开关行列表由功能模块字段列表驱动，逐字段渲染；写入走 settings 作用域的写接口。
- 思路：新增功能时在 host `Config` 加字段、`modules` 加条目、`locales.ts` 加文案 key（`config.<字段名>`），设置页自动出现新开关，无需修改设置页代码。

### provider-label

- 功能描述：在模型选择按钮左侧（`conversation.input.right` 插槽）显示当前选择的模型提供方。
- 实现位置：[src/client/provider-label/index.ts](../src/client/provider-label/index.ts)、[src/client/provider-label/ProviderLabel.tsx](../src/client/provider-label/ProviderLabel.tsx)
- 解决方案：组件经 inject hooks 的 `useDirectory` 订阅模型目录快照，取当前提供方字段渲染。
- 思路：数据源为 ModelDirectory store 的当前提供方字段。

### 模块控制机制

- 功能描述：各功能模块的挂载/卸载由 client index 依据 settings 开关状态统一控制；关闭时 index 卸载整个注册，模块自身不感知开关。
- 实现位置：[src/client/index.ts](../src/client/index.ts)
- 解决方案：`modules` 清单以 `Record<keyof Config, ModuleEntry>` 强约束；index 订阅开关 scope，开关开则调用安装函数注册，关则调用返回的 disposer 卸载。
- 思路：子模块只管注册自身，控制逻辑集中在 index，新增模块在 `modules` 加一条即可。
