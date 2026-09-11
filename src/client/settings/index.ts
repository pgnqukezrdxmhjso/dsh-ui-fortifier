import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { Config } from '../../types.ts'
import type { FortifierToggleRow } from './FortifierSettingsPage.tsx'
import { FortifierSettingsPage } from './FortifierSettingsPage.tsx'
import { en, zh } from '../locales.ts'

export type { FortifierPageInjected, FortifierSettingsPageProps } from './FortifierSettingsPage.tsx'

/** 本插件设置命名空间(与 host 侧一致)。 */
export const UI_FORTIFIER = 'ui-fortifier'

/**
 * 注册设置页并绑定功能开关的 settings 作用域。
 * @param ctx - 需已提供 slots/locale/settingsScope 的客户端上下文。
 * @param moduleOrder - 功能模块字段的显示顺序(settings 开关 key)。
 * @returns 功能开关的 settings 绑定,供调用方控制子模块注册。
 */
export function installSettings(ctx: ClientContext, moduleOrder: readonly string[]): SettingsScope<Config> {
  ctx.effect(() => ctx.locale.register(UI_FORTIFIER, { zh, en }), 'dsh-ui-fortifier: copy dictionaries')
  const scope = ctx.settingsScope.bind<Config>({ namespace: UI_FORTIFIER })
  const mirror = ctx.settingsScope.describe()

  // 从 describe mirror 读本命名空间 view;value 里拿当前值。
  const view = () => mirror.getSnapshot().view?.namespaces.find(row => row.ns === UI_FORTIFIER)

  const sectionInjected = () => {
    let cached: readonly FortifierToggleRow[] = []
    let cachedSignature = ''
    return {
      hooks: {
        toggles: {
          getSnapshot: (): readonly FortifierToggleRow[] => {
            const current = view()
            const value = (current?.value ?? {}) as Record<string, boolean>
            const rows = moduleOrder.map(field => ({ field, value: value[field] ?? true }))
            // 稳定引用：HostObservable 契约要求 getSnapshot 在数据不变时返回同一引用。
            const signature = JSON.stringify(rows)
            if (signature !== cachedSignature) {
              cached = rows
              cachedSignature = signature
            }
            return cached
          },
          subscribe: (listener: () => void) => {
            const offScope = scope.subscribe(listener)
            const offMirror = mirror.subscribe(listener)
            return () => {
              offScope()
              offMirror()
            }
          },
        },
      },
      set: (field: string, value: boolean) => { void scope.set(field, value) },
    }
  }

  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: UI_FORTIFIER,
    order: 30,
    label: () => ctx.locale.bind(UI_FORTIFIER)('nav'),
    locale: UI_FORTIFIER,
    inject: sectionInjected,
  }, FortifierSettingsPage))

  return scope
}
