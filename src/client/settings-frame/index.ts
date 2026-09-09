/**
 * settings-frame 功能：让设置面板可拖动位置与缩放大小。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import { SettingsFrameEnhancer } from './SettingsFrameEnhancer.tsx'
import type { SettingsFrameInjected } from './SettingsFrameEnhancer.tsx'

export type { SettingsFrameEnhancerProps, SettingsFrameInjected } from './SettingsFrameEnhancer.tsx'

/** 本模块文案命名空间(与 host 侧一致)。 */
const NS = 'ui-fortifier'

/**
 * 注册「拖动位置/大小」增强到设置页右上角操作区。
 * @param ctx - 需已提供 slots 的客户端上下文。
 * @returns 停止注入并卸载注册的 disposer。
 */
export function installSettingsFrame(ctx: ClientContext): () => void {
  const injected = (): SettingsFrameInjected => ({})
  return ctx.slots.inject('settings.action', () => ctx.slots.register({
    name: 'settings.action',
    id: 'settings-frame-enhancer',
    order: 2,
    locale: NS,
    inject: injected,
  }, SettingsFrameEnhancer))
}
