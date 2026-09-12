/**
 * session-id-copy 功能：在会话标题栏工具区注册复制会话 ID 的按钮。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
// Type-only：拉取 ui-conversation 的 SlotMap merge（header.utilities 插槽声明）。
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { SessionIdCopyAction } from './SessionIdCopyAction.tsx'

/** 本模块文案命名空间(与 host 侧一致)。 */
const NS = 'ui-fortifier'

/**
 * 注册复制会话 ID 按钮到会话标题栏工具区（list 槽，追加式；order -20 排在最左，
 * 位于「在本地打开」按钮之前）。官方三点菜单的菜单项为硬编码、无插槽，
 * 故本功能以相邻按钮而非菜单项实现。
 * @param ctx - 需已提供 slots/locale 的客户端上下文。
 * @returns 停止注入并卸载注册的 disposer。
 */
export function installSessionIdCopy(ctx: ClientContext): () => void {
  return ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
    name: 'conversation.session.header.utilities',
    id: 'session-id-copy',
    order: -20,
    locale: NS,
  }, SessionIdCopyAction))
}
