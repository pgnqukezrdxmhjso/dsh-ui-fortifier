/** dsh-ui-fortifier 的文案。 */

/** locale key。 */
export type UiFortifierLocaleKey =
  | 'nav'
  | 'empty'
  | 'config.provider-label'

/** 英文文案。 */
export const en: Record<UiFortifierLocaleKey, string> = {
  nav: 'ui-fortifier',
  empty: 'No feature modules registered.',
  'config.provider-label': 'Show provider in input',
}

/** 中文文案。 */
export const zh: Record<UiFortifierLocaleKey, string> = {
  nav: 'ui-fortifier',
  empty: '没有已注册的功能模块。',
  'config.provider-label': '输入框显示提供商',
}
