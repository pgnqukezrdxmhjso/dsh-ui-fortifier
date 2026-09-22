/**
 * compact-button 功能：在输入框工具行左组右端注册压缩上下文按钮。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// noinspection ES6UnusedImports
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { CompactContextButton } from './CompactContextButton.tsx'

/**
 * 注册压缩上下文按钮到 conversation.input.left。
 * @param ctx - 需已提供 slots 与 remote.commands 的客户端上下文。
 * @returns 停止注入并卸载注册的 disposer。
 */
export function installCompactButton(ctx: ClientContext): () => void {
  return ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: 'compact-button',
    order: 100,
    locale: 'ui-fortifier',
    inject: (sessionId: SessionId) => ({
      compact: async () => {
        // 与官方 /plan 控件走同一命令通道：与手输指令等价。
        await ctx.remote.commands.execute(sessionId, '/compact', [])
      },
    }),
  }, CompactContextButton))
}
