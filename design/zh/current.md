# dsh-ui-fortifier 项目当前状态

## 简介

DSH Web UI 强化插件：在设置页提供功能模块开关，并显示当前会话的模型提供方。

## 宏观描述

插件分 host 半侧与 client 半侧。host 半侧注册 `ui-fortifier` settings 命名空间，承载各功能模块的开关状态；client 半侧注册设置页（`settings.section`），读取配置项自动生成开关行，并由 index 统一控制各功能子模块的挂载（见「模块控制机制」）。

开关状态采用 dsh settings 服务三层解析：schema 默认值 → base 层（插件配置 cordis.yml 默认值）→ user 层（用户设置页覆盖）。

## todo

## 功能

### 设置页

- 功能描述：在设置页新增「ui-fortifier」标签页，集中开关本插件各功能模块。开关行由设置页读取 `ui-fortifier` 命名空间的配置项自动生成。
- 实现位置：[src/client/index.ts](../../src/client/index.ts)、[src/client/settings/FortifierSettingsPage.tsx](../../src/client/settings/FortifierSettingsPage.tsx)
- 解决方案：client 侧绑定 settingsScope，从 describe mirror 读取命名空间值；开关行列表由功能模块字段列表驱动，逐字段渲染；写入走 settings 作用域的写接口。
- 思路：新增功能时在 host `Config` 加字段、`modules` 加条目、`locales.ts` 加文案 key（`config.<字段名>`），设置页自动出现新开关，无需修改设置页代码。
- 排版约束：列表内容限宽 520px（面板被拖宽时开关不远离文字），相邻选项用 0.5px 横线分隔。
- 开关样式：照抄官方 `ui-settings-plugins` 的 Switch 模式（`role="switch"` + thumb），thumb 为 `border-radius: 50%` 正圆并配对 `corner-shape: round`——与 dsh 内置开关一致，受 ui-theme 全局超椭圆平滑规范约束（正圆必须配对保持圆弧）。

### open-dsh-folder

- 功能描述：在设置页右上角操作区增加「打开 .dsh 文件夹」按钮，一键打开 `$DSH_HOME` 目录。
- 实现位置：[src/client/open-dsh-folder/](../../src/client/open-dsh-folder/)、[src/open-dsh-folder.ts](../../src/open-dsh-folder.ts)
- 解决方案：host 侧提供 TypertRemoteService（`uiFortifierRemote`）暴露 `openDshFolder` 远程方法，经 `ctx.reflect` 自动挂到 `/api` 网关；client 侧经 `connection.rpc.call('/api', 'uiFortifier/openDshFolder')` 调用，按钮仅在 `connection.isLoopback`（本地回环）时注册到 `settings.action` 槽。
- 思路：宿主端点复用网关反射免写 typert 生成器；远程调用结果含 `opened`/`path` 用于按钮反馈与报错文案。

### settings-frame

- 功能描述：让设置面板可拖动位置与缩放大小；浏览器窗口变化后面板始终限制在视野内，几何持久化到 localStorage。
- 实现位置：[src/client/settings-frame/](../../src/client/settings-frame/)
- 解决方案：组件注册在 `settings.action` 槽，挂载时用 `closest('[role="dialog"]')` 定位面板并改为 `position: fixed`；拖动手柄经 portal 放进标题行首、缩放柄放入面板右下角（pointer capture + rAF 节流）；最小 480x320，窗口 resize 时收窄超出视口宽高并钳位位置（窗口小于最小尺寸时不写持久化，防止临时压扁几何入库）。
- 思路：面板几何无现成槽位承载，经 DOM 定位 + 内联样式实现；持久化参照 `dsh.conversation.contentWidth` 的 localStorage 既有做法；卸载即还原 CSS 默认样式。

### provider-label

- 功能描述：在模型选择按钮左侧（`conversation.input.right` 插槽）显示当前选择的模型提供方。
- 实现位置：[src/client/provider-label/index.ts](../../src/client/provider-label/index.ts)、[src/client/provider-label/ProviderLabel.tsx](../../src/client/provider-label/ProviderLabel.tsx)
- 解决方案：组件经 inject hooks 的 `useDirectory` 订阅模型目录快照，取当前提供方字段渲染。
- 思路：数据源为 ModelDirectory store 的当前提供方字段。

### 模块控制机制

- 功能描述：各功能模块的挂载/卸载由 client index 依据 settings 开关状态统一控制；关闭时 index 卸载整个注册，模块自身不感知开关。
- 实现位置：[src/client/index.ts](../../src/client/index.ts)
- 解决方案：`modules` 清单以 `Record<keyof Config, ModuleEntry>` 强约束；index 订阅开关 scope，开关开则调用安装函数注册，关则调用返回的 disposer 卸载。
- 思路：子模块只管注册自身，控制逻辑集中在 index，新增模块在 `modules` 加一条即可。
