import type {
  HostObservable, InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { UiFortifierLocaleKey } from '../locales.ts'
import css from './FortifierSettingsPage.module.css'

/** 一个功能开关行的状态。 */
export interface FortifierToggleRow {
  /** 字段名(即 settings 的 key)。 */
  field: string
  /** 当前值。 */
  value: boolean
}

/** 设置页渲染所需的面。 */
export interface FortifierPageInjected {
  hooks: {
    /** 所有功能开关的当前值(响应式)。 */
    toggles: HostObservable<readonly FortifierToggleRow[]>
  }
  /** 写入一个开关值(user 层)。 */
  set: (field: string, value: boolean) => void
}

/** 设置页 props。 */
export type FortifierSettingsPageProps =
  PropsRuntime<'settings.section'>
  & PropsLocale<'ui-fortifier'>
  & InjectFace<FortifierPageInjected>

/** 设置页：读取配置项自动生成开关行。 */
export function FortifierSettingsPage(props: FortifierSettingsPageProps) {
  const t = props.t
  const rows = props.useToggles(value => value)
  return (
    <div className={css.page}>
      <h2 className={css.heading}>{t('nav')}</h2>
      {rows.length === 0 ? (
        <p>{t('empty')}</p>
      ) : (
        <ul className={css.list}>
          {rows.map(row => (
            <li key={row.field} className={css.row}>
              <label>
                <input
                  type="checkbox"
                  checked={row.value}
                  onChange={(event) => { props.set(row.field, event.target.checked) }}
                />
                <span>{t(`config.${row.field}` as UiFortifierLocaleKey)}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

