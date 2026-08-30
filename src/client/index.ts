import type { Context } from '@deepseek-ai/cordis'
import type { Config } from '../index'
// Type-only：拉取 ui-settings 的 Context merge（ctx.settingsScope）与 settings.section 插槽声明。
import type { } from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only：拉取 locale 的 Context merge（ctx.locale）。
import type { } from '@deepseek-ai/dsh-client-locale/client'
// Type-only：拉取 renderer 的 Context merge（ctx.slots）。
import type { } from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { } from '@deepseek-ai/dsh-session/types'
import { installSettings } from './settings'
import { installProviderLabel } from './provider-label'
import type { UiFortifierLocaleKey } from './locales.ts'

/** 一个功能模块的安装面。 */
interface ModuleEntry {
  /** 安装函数：注册模块并返回卸载 disposer。 */
  module: (ctx: Context) => () => void
  /** 当前注册的 disposer；归位后为 undefined。 */
  dispose: (() => void) | undefined
}

/** 功能模块清单：字段名(settings 开关 key) → 模块安装面。 */
export const modules: Record<keyof Config, ModuleEntry> = {
  'provider-label': {
    module: installProviderLabel,
    dispose: undefined,
  },
}

export const inject = ['slots', 'locale', 'settingsScope', 'modelDirectories']

/**
 * 客户端插件体：注册设置页并据开关状态挂载各功能模块。
 * @param ctx - 需已提供 slots/locale/settingsScope/modelDirectories 的客户端上下文。
 */
export function apply(ctx: Context): void {
  const scope = installSettings(ctx, Object.keys(modules))

  // 子模块不感知开关：index 据开关状态动态注册/卸载。
  for (const field of Object.keys(modules) as (keyof Config)[]) {
    const item = modules[field]
    const sync = (): void => {
      const enabled = scope.getSnapshot().value?.[field] ?? true
      item.dispose?.()
      if (enabled) {
        item.dispose = item.module(ctx)
      } else {
        item.dispose = undefined
      }
    }
    scope.subscribe(sync)
    sync()
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'ui-fortifier': UiFortifierLocaleKey
  }
}
