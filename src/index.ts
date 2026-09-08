import type { Context } from '@deepseek-ai/cordis'
// Type-only：拉取 settings 服务的 Context merge（ctx.settings）。
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

/** 功能开关的 settings 命名空间。 */
export const UI_FORTIFIER_SETTINGS_NAMESPACE = 'ui-fortifier'

/** 插件配置：功能开关状态(配置默认值)。 */
export interface Config {
  /** 输入框显示当前提供商。 */
  'provider-label': boolean
}

/** 插件配置 schema。 */
export const Config: z<Config> = z.object({
  'provider-label': z.boolean().default(true),
})

/**
 * 注册功能开关的 settings 命名空间。
 * @param ctx - 需已挂载 settings 服务的 Cordis 上下文。
 * @param config - 插件配置,作为 base 层。
 */
export function apply(ctx: Context, config: Config): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.installSection(ctx, UI_FORTIFIER_SETTINGS_NAMESPACE, Config, config, {
      setSource: () => {},
      onChange: () => {},
    })
  })
}
