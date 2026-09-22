import type { Context } from '@deepseek-ai/cordis'
// Type-only：拉取 settings 服务的 Context merge（ctx.settings）。
import type {} from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import type { Config as FortifierConfig } from './types.ts'
import { OpenDshFolderService } from './open-dsh-folder.ts'

/** 插件配置类型（定义见 `./types.ts`，与 Client 面共享）。 */
export type Config = FortifierConfig
export type { DshFolderOpenValue } from './types.ts'

/** 功能开关的 settings 命名空间。 */
export const UI_FORTIFIER_SETTINGS_NAMESPACE = 'ui-fortifier'

/** 插件配置 schema。 */
export const Config: z<FortifierConfig> = z.object({
  'provider-label': z.boolean().default(true),
  'open-dsh-folder': z.boolean().default(true),
  'settings-frame': z.boolean().default(true),
  'model-picker': z.boolean().default(true),
  'session-id-copy': z.boolean().default(true),
  'compact-button': z.boolean().default(true),
})

/**
 * 注册功能开关的 settings 命名空间并暴露打开 .dsh 文件夹的 Remote 服务。
 * @param ctx - 需已挂载 settings 服务的 Cordis 上下文。
 * @param config - 插件配置,作为 base 层。
 */
export function apply(ctx: Context, config: FortifierConfig): void {
  // 注册 Host 侧 Remote：网关按 SRC 反射发现该服务的端点。
  new OpenDshFolderService(ctx)
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.installSection(ctx, UI_FORTIFIER_SETTINGS_NAMESPACE, Config, config, {
      setSource: () => {},
      onChange: () => {},
    })
  })
}
