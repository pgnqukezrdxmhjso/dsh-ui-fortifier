/**
 * 本包 Host/Client 两面共享的类型。
 * 仅类型、无运行时代码：双面工程各自编译本文件，无需跨面引用。
 */

/** 插件配置：功能开关状态(配置默认值)。 */
export interface Config {
  /** 输入框显示当前提供商。 */
  'provider-label': boolean
  /** 设置页右上角显示打开 .dsh 文件夹按钮。 */
  'open-dsh-folder': boolean
  /** 设置面板可拖动位置与大小。 */
  'settings-frame': boolean
  /** 输入框右侧显示级联模型选择器(先选提供商、再选模型)。 */
  'model-picker': boolean
  /** 会话标题栏显示复制会话 ID 按钮。 */
  'session-id-copy': boolean
  /** 输入框工具行左组右端显示压缩上下文按钮。 */
  'compact-button': boolean
}

/** 打开 .dsh 文件夹的返回值。 */
export interface DshFolderOpenValue {
  /** 是否已发起系统打开。 */
  readonly opened: boolean
  /** .dsh 文件夹绝对路径（未打开时供 UI 展示）。 */
  readonly path: string
}
