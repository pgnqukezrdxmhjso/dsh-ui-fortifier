# dsh-ui-fortifier 项目当前状态

## 简介

DSH Web 界面强化插件：不改动 dsh 源码，为官方 Web 界面补充额外的交互能力。

## 宏观描述

插件分 host 半侧与 client 半侧。host 半侧注册 `ui-fortifier` settings 命名空间，承载各功能模块的开关状态；client 半侧注册设置页（`settings.section`），读取配置项自动生成开关行，并由 index 统一控制各功能子模块的挂载（见「模块控制机制」）。

开关状态采用 dsh settings 服务三层解析：schema 默认值 → base 层（插件配置 cordis.yml 默认值）→ user 层（用户设置页覆盖）。

两面各有独立编译面（`tsconfig.host.json` 走 node 全局、`tsconfig.client.json` 走浏览器全局），根 `tsconfig.json` 仅作 solution 聚合；两面共享的类型集中在 `src/types.ts`（仅类型、无运行时代码），因此 client 面不引用 host 文件。

服务方法在**调用方 Context** 下运行，故 client `inject` 必须与官方 `ui-model-selection` 同样声明 `sessions` / `remote` / `remote.session`：`ctx.modelDirectories.directoryFor()` 内部要读 `this.ctx.sessions` / `this.ctx.remote.session`，未声明即报 `cannot get property "remote.session" without inject`。

## todo

- open-dsh-folder 兼容侧边栏插件：按钮改为嵌合按钮，常规部分用系统打开，示意部分在侧边栏打开；远程 dsh 下只保留在侧边栏打开；按当前是否加载了侧边栏插件自动切换这两种表现。

## 功能

### 设置页

- 功能描述：在设置页新增「ui-fortifier」标签页，集中开关本插件各功能模块。开关行由设置页读取 `ui-fortifier` 命名空间的配置项自动生成。
- 实现位置：[src/client/index.ts](../../src/client/index.ts)、[src/client/settings/FortifierSettingsPage.tsx](../../src/client/settings/FortifierSettingsPage.tsx)
- 解决方案：client 侧绑定 settingsScope，从 describe mirror 读取命名空间值；开关行列表由显式顺序数组 `MODULE_ORDER`（`src/client/index.ts`）驱动、按各模块在界面上的位置排列（会话标题栏 → 输入行 → 设置页）后逐字段渲染；写入走 settings 作用域的写接口。
- 思路：新增功能时在 host `Config` 加字段、`modules` 加条目、`locales.ts` 加文案 key（`config.<字段名>`），设置页自动出现新开关，无需修改设置页代码。
- 排版约束：列表内容限宽 520px（面板被拖宽时开关不远离文字），相邻选项用 0.5px 横线分隔。
- 开关样式：照抄官方 `ui-settings-plugins` 的 Switch 模式（`role="switch"` + thumb），thumb 为 `border-radius: 50%` 正圆并配对 `corner-shape: round`——与 dsh 内置开关一致，受 ui-theme 全局超椭圆平滑规范约束（正圆必须配对保持圆弧）。

### provider-label

- 功能描述：在模型选择按钮左侧（`conversation.input.right` 插槽）显示当前选择的模型提供方。
- 实现位置：[src/client/provider-label/index.ts](../../src/client/provider-label/index.ts)、[src/client/provider-label/ProviderLabel.tsx](../../src/client/provider-label/ProviderLabel.tsx)
- 解决方案：组件经 inject hooks 的 `useDirectory` 订阅模型目录快照，取当前提供方字段渲染。
- 思路：数据源为 ModelDirectory store 的当前提供方字段。

### model-picker

- 功能描述：在输入框工具行（`conversation.input.right`，provider-label 右侧）提供级联模型选择器：左列提供商、右列该提供商模型，解决官方分组列表在提供商众多时难以定位的问题。
- 实现位置：[src/client/model-picker/](../../src/client/model-picker/)
- 解决方案：注册 `conversation.input.right` list 槽（`order: 1000`）；组件经 `hooks.directory` 订阅官方共享目录快照，`load`/`select` 走同一 `modelDirectories` 实例，与官方模型选择器（按钮/斜杠命令）状态互通。
- 面板定位：经 `createPortal` 挂到 `document.body` 并以 `position: fixed` 呈现（`z-index: 1100`），使列的 `overflow: hidden` 裁切与侧栏遮挡均不再作用于它；坐标由本地 `useRightAlignedMenuPosition` 给出——右边缘对齐触发器、仅越出视口时钳位（官方 `useAnchoredPosition` 只从左边缘定位且无对齐选项，官方 `ModelSelect` 出于同一原因自行镜像了该逻辑）。
- 窄屏适配：宽度下限为 `min(420px, calc(100vw - 32px))`，随视口收缩；模型名以 `overflow-wrap: anywhere` 换行完整显示，不截断。
- 滚动行为：展开时在绘制前（`useLayoutEffect`）把当前提供商与当前模型滚进视野，每次展开只定位一次；切换提供商时模型列回到顶部；切回当前模型所属提供商时定位到当前模型。
- 思路：不改官方 `ui-model-selection`（单槽无子槽可注入、整体替换会脱离官方更新）；复用共享 store 免自持状态；面板开合为 entry 本地状态。

### session-id-copy

- 功能描述：在会话标题栏工具区增加复制 Session ID 的按钮；悬停提示直接显示会话 ID，点击写入剪贴板，成功后按钮短暂换成对勾。
- 实现位置：[src/client/session-id-copy/](../../src/client/session-id-copy/)
- 解决方案：注册 `conversation.session.header.utilities` list 槽（`order: -20`，排在该槽最左）；按钮为 28px 高胶囊，内含内联井号字形与复制字形并排；会话 ID 取自该槽的 owner 参数（`scope: 'session'`），经 `Tooltip` 原语在悬停/聚焦时以 `Session ID: {id}` 显示；复制走 ui-primitives 的 `writeClipboard`（优先异步 Clipboard API，缺失时回退 `execCommand`）。
- 思路：三点菜单（「下载会话日志」所在菜单）的菜单项是硬编码数组、无插槽可注入，故以相邻按钮实现而非菜单项；不改 dsh 仓的 `session-log-export`（harness 源码会被 dsh 升级覆盖）；反馈方式照抄官方 `MessageIconActions` 的短对勾换图标；井号内联因官方图标库无标识符字形，提示用 `Tooltip` 原语而非原生 `title`（兼顾键盘聚焦，且不叠加两套提示）。

### compact-button

- 功能描述：在输入框工具行左组（「+」、回形针、模式选择之后）的右端增加压缩上下文按钮，点击后经确认气泡确认才提交 `/compact` 指令。
- 实现位置：[src/client/compact-button/](../../src/client/compact-button/)
- 解决方案：注册 `conversation.input.left` list 槽（`order: 100`，该槽此前无占用者）；按钮为 28px 圆、与左组「+」「回形针」同材质；点击先弹出确认气泡，气泡内确认才经 `ctx.remote.commands.execute(sessionId, '/compact', [])` 提交指令，与官方 `/plan` 控件走同一命令通道；图标为内联压缩字形（用户指定，`viewBox 0 0 1024 1024`，16px，填充随按钮取色）；悬停提示用 `Tooltip` 原语，气泡展开时抑制提示避免叠两层。
- 确认气泡：一句确认问句（`确认压缩？`）+ 一个确认键；无取消键，点外部或按 Escape 即取消。经 `createPortal` 挂 body、`position: fixed` 呈现（列的 `overflow: hidden` 无法裁切它），定位走官方 `useAnchoredPosition`（`side: 'top'`）；该 hook 在开启的同一帧量面板尺寸，故面板必须以隐藏的测量位置先挂载、量到坐标后再定位，否则高度按 0 计算且钳位与 `ResizeObserver` 修正均不生效，气泡会朝下溢出视口。
- 禁用条件：`useSession(snapshot => snapshot.running)` 为真时禁用（运行中转忙碌时同时收起已展开的气泡）；提交等待期间亦禁用。
- 焦点保持：`mousedown` 阻止默认行为，点击后光标留在编辑器内（左组其余按钮都这么做，否则点击会抢走焦点、正在输入的草稿失去光标）。
- 思路：复用官方命令通道而非自行调用压缩能力，指令本身即「和压缩上下文指令一样」的定义，且 host 会把 `command/run`/`command/done` 生命周期写入会话流、结果作为会话节点呈现，故按钮不重复呈报成败；加确认气泡是因为压缩会重写历史且无撤销通道，一次误点即造成不可逆结果；运行中禁用是因为手动压缩要求 agent 空闲，不禁用只会让用户拿到一条必然失败的节点。图标为内联字形，因官方图标库没有压缩语义的字形；尺寸取 16px（官方图标集默认值）而非左组那两个图标的 14px，因该字形笔画更密，14px 下细节糊成一团。

### open-dsh-folder

- 功能描述：在设置页右上角操作区增加「打开 .dsh 文件夹」按钮，一键打开 `$DSH_HOME` 目录。
- 实现位置：[src/client/open-dsh-folder/](../../src/client/open-dsh-folder/)、[src/open-dsh-folder.ts](../../src/open-dsh-folder.ts)
- 解决方案：host 侧提供 TypertRemoteService（`uiFortifierRemote`）暴露 `openDshFolder` 远程方法，经 `ctx.reflect` 自动挂到 `/api` 网关；client 侧经 `connection.rpc.call('/api', 'uiFortifier/openDshFolder')` 调用，按钮仅在 `connection.isLoopback`（本地回环）时注册到 `settings.action` 槽。
- Windows 前台激活：共享的 `openNativePath` 只执行 `Invoke-Item`，而窗口由 explorer 创建、宿主又在后台，Windows 拒绝其前置，窗口会落到浏览器后面（dsh 自带按钮同样如此）。故 Windows 分支改走自写 PowerShell：打开后按 `LocationURL` 匹配该文件夹的 explorer 窗口取 `HWND`，合成 Alt 按放取得激活资格，再 `SetForegroundWindow` 置顶；非 Windows 仍用共享 `openNativePath`。
- 思路：宿主端点复用网关反射免写 typert 生成器；远程调用结果含 `opened`/`path` 用于按钮反馈与报错文案；前台激活沿用 harness 原生文件夹对话框已验证的 Alt 合成思路，因目标窗口归 explorer 所有而额外显式置顶。

### settings-frame

- 功能描述：让设置面板可拖动位置与缩放大小；浏览器窗口变化后面板始终限制在视野内，几何持久化到 localStorage。
- 实现位置：[src/client/settings-frame/](../../src/client/settings-frame/)
- 解决方案：组件注册在 `settings.action` 槽，挂载时用 `closest('[role="dialog"]')` 定位面板并改为 `position: fixed`；拖动手柄经 portal 放进标题行首、缩放柄放入面板右下角（pointer capture + rAF 节流）；最小 480x320，窗口 resize 时收窄超出视口宽高并钳位位置（窗口小于最小尺寸时不写持久化，防止临时压扁几何入库）。
- 思路：面板几何无现成槽位承载，经 DOM 定位 + 内联样式实现；持久化参照 `dsh.conversation.contentWidth` 的 localStorage 既有做法；卸载即还原 CSS 默认样式。

### 模块控制机制

- 功能描述：各功能模块的挂载/卸载由 client index 依据 settings 开关状态统一控制；关闭时 index 卸载整个注册，模块自身不感知开关。
- 实现位置：[src/client/index.ts](../../src/client/index.ts)
- 解决方案：`modules` 清单以 `Record<keyof Config, ModuleEntry>` 强约束；index 订阅开关 scope，开关开则调用安装函数注册，关则调用返回的 disposer 卸载。
- 思路：子模块只管注册自身，控制逻辑集中在 index，新增模块在 `modules` 加一条即可。
