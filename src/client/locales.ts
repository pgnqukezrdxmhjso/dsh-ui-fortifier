/** dsh-ui-fortifier 的文案。 */

/** locale key。 */
export type UiFortifierLocaleKey =
  | 'nav'
  | 'empty'
  | 'config.provider-label'
  | 'config.open-dsh-folder'
  | 'config.settings-frame'
  | 'config.model-picker'
  | 'config.session-id-copy'
  | 'openDshFolder'
  | 'openDshFolder.error'
  | 'openDshFolder.pathLabel'
  | 'settingsFrame.drag'
  | 'settingsFrame.resize'
  | 'modelPicker.trigger'
  | 'modelPicker.searchPlaceholder'
  | 'modelPicker.providers'
  | 'modelPicker.models'
  | 'modelPicker.emptyProviders'
  | 'modelPicker.emptySearch'
  | 'modelPicker.emptyModels'
  | 'modelPicker.loading'
  | 'modelPicker.loadError'
  | 'modelPicker.retry'
  | 'modelPicker.provider'
  | 'modelPicker.model'
  | 'sessionIdCopy.action'
  | 'sessionIdCopy.hint'
  | 'sessionIdCopy.copied'

/** 英文文案。 */
export const en: Record<UiFortifierLocaleKey, string> = {
  nav: 'ui-fortifier',
  empty: 'No feature modules registered.',
  'config.provider-label': 'Input - Provider',
  'config.open-dsh-folder': 'Settings top-right - Open .dsh folder',
  'config.settings-frame': 'Settings panel - Drag and resize',
  'config.model-picker': 'Input - Cascading model picker',
  'config.session-id-copy': 'Session header - Copy session ID',
  openDshFolder: 'Open .dsh folder',
  'openDshFolder.error': 'Could not open the .dsh folder',
  'openDshFolder.pathLabel': 'Path: ',
  'settingsFrame.drag': 'Drag the settings panel',
  'settingsFrame.resize': 'Resize the settings panel',
  'modelPicker.trigger': 'Open cascading model picker',
  'modelPicker.searchPlaceholder': 'Search providers or models',
  'modelPicker.providers': 'Providers',
  'modelPicker.models': 'Models',
  'modelPicker.emptyProviders': 'No providers loaded.',
  'modelPicker.emptySearch': 'No matching providers or models.',
  'modelPicker.emptyModels': 'No models for this provider.',
  'modelPicker.loading': 'Loading…',
  'modelPicker.loadError': 'Failed to load models',
  'modelPicker.retry': 'Retry',
  'modelPicker.provider': 'Provider: {name}',
  'modelPicker.model': 'Model: {name}',
  'sessionIdCopy.action': 'Copy Session ID',
  'sessionIdCopy.hint': 'Session ID: {id}',
  'sessionIdCopy.copied': 'Copied',
}

/** 中文文案。 */
export const zh: Record<UiFortifierLocaleKey, string> = {
  nav: 'ui-fortifier',
  empty: '没有已注册的功能模块。',
  'config.provider-label': '输入框 - 提供商',
  'config.open-dsh-folder': '设置右上角 - 打开 .dsh 文件夹',
  'config.settings-frame': '设置面板 - 拖动与缩放',
  'config.model-picker': '输入框 - 级联模型选择器',
  'config.session-id-copy': '会话标题栏 - 复制 Session ID',
  openDshFolder: '打开 .dsh 文件夹',
  'openDshFolder.error': '无法打开 .dsh 文件夹',
  'openDshFolder.pathLabel': '路径：',
  'settingsFrame.drag': '拖动设置面板',
  'settingsFrame.resize': '缩放设置面板',
  'modelPicker.trigger': '打开级联模型选择器',
  'modelPicker.searchPlaceholder': '搜索提供商或模型',
  'modelPicker.providers': '提供商',
  'modelPicker.models': '模型',
  'modelPicker.emptyProviders': '没有已加载的提供商。',
  'modelPicker.emptySearch': '没有匹配的提供商或模型。',
  'modelPicker.emptyModels': '该提供商没有模型。',
  'modelPicker.loading': '加载中…',
  'modelPicker.loadError': '模型加载失败',
  'modelPicker.retry': '重试',
  'modelPicker.provider': '提供商：{name}',
  'modelPicker.model': '模型：{name}',
  'sessionIdCopy.action': '复制 Session ID',
  'sessionIdCopy.hint': 'Session ID: {id}',
  'sessionIdCopy.copied': '已复制',
}
