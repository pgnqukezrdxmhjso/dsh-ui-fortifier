/** dsh-ui-fortifier 的文案。 */

/** locale key。 */
export type UiFortifierLocaleKey =
  | 'nav'
  | 'empty'
  | 'config.provider-label'
  | 'config.open-dsh-folder'
  | 'config.settings-frame'
  | 'openDshFolder'
  | 'openDshFolder.error'
  | 'openDshFolder.pathLabel'
  | 'settingsFrame.drag'
  | 'settingsFrame.resize'

/** 英文文案。 */
export const en: Record<UiFortifierLocaleKey, string> = {
  nav: 'ui-fortifier',
  empty: 'No feature modules registered.',
  'config.provider-label': 'Input - Provider',
  'config.open-dsh-folder': 'Settings top-right - Open .dsh folder',
  'config.settings-frame': 'Settings panel - Drag and resize',
  openDshFolder: 'Open .dsh folder',
  'openDshFolder.error': 'Could not open the .dsh folder',
  'openDshFolder.pathLabel': 'Path: ',
  'settingsFrame.drag': 'Drag the settings panel',
  'settingsFrame.resize': 'Resize the settings panel',
}

/** 中文文案。 */
export const zh: Record<UiFortifierLocaleKey, string> = {
  nav: 'ui-fortifier',
  empty: '没有已注册的功能模块。',
  'config.provider-label': '输入框 - 提供商',
  'config.open-dsh-folder': '设置右上角 - 打开 .dsh 文件夹',
  'config.settings-frame': '设置面板 - 拖动与缩放',
  openDshFolder: '打开 .dsh 文件夹',
  'openDshFolder.error': '无法打开 .dsh 文件夹',
  'openDshFolder.pathLabel': '路径：',
  'settingsFrame.drag': '拖动设置面板',
  'settingsFrame.resize': '缩放设置面板',
}
