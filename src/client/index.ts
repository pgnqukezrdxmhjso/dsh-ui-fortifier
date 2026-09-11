import type { Context } from '@deepseek-ai/cordis'
import type { Config } from '../types.ts'
// Type-only：拉取 ui-settings 的 Context merge（ctx.settingsScope）与 settings.section 插槽声明。
import type { } from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only：拉取 locale 的 Context merge（ctx.locale）。
import type { } from '@deepseek-ai/dsh-client-locale/client'
// Type-only：拉取 renderer 的 Context merge（ctx.slots）。
import type { } from '@deepseek-ai/dsh-client-ui-renderer/client'
// Type-only：拉取 api-session-controller 的 Context merge（ctx.sessions）。
import type { } from '@deepseek-ai/dsh-api-session-controller/client'
// Type-only：拉取 remotes 的 Context merge（ctx.remote / ctx.remote.session）。
import type { } from '@deepseek-ai/dsh-api-remotes/client'
import type { } from '@deepseek-ai/dsh-session/types'
import { installSettings } from './settings'
import { installProviderLabel } from './provider-label'
import { installOpenDshFolder } from './open-dsh-folder'
import { installSettingsFrame } from './settings-frame'
import { installModelPicker } from './model-picker'
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
  'open-dsh-folder': {
    module: installOpenDshFolder,
    dispose: undefined,
  },
  'settings-frame': {
    module: installSettingsFrame,
    dispose: undefined,
  },
  'model-picker': {
    module: installModelPicker,
    dispose: undefined,
  },
}

/** 设置页开关行的显示顺序(按位置排序)；不在表中的字段排在其后。 */
export const MODULE_ORDER: readonly (keyof Config)[] = [
  'provider-label',
  'model-picker',
  'open-dsh-folder',
  'settings-frame',
]

// 0.1.5 起服务方法在**调用方 Context** 下运行：`ctx.modelDirectories.directoryFor()`
// 内部读 this.ctx.sessions / this.ctx.remote.session（该服务自身声明了
// ['sessions','remote','remote.session']），故调用方必须同样声明，否则抛出
// `cannot get property "remote.session" without inject`。
export const inject = [
  'slots', 'locale', 'settingsScope', 'modelDirectories', 'connection',
  'sessions', 'remote', 'remote.session',
]

/**
 * 客户端插件体：注册设置页并据开关状态挂载各功能模块。
 * @param ctx - 需已提供 slots/locale/settingsScope/modelDirectories/connection/sessions/remote 的客户端上下文。
 */
export function apply(ctx: Context): void {
  const scope = installSettings(ctx, MODULE_ORDER)

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
