/**
 * provider-label 功能：在模型选择按钮左侧显示当前会话的模型提供方。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// noinspection ES6UnusedImports
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { ProviderLabel } from './ProviderLabel.tsx'

/**
 * 注册 provider 标签到 conversation.input.right。
 * @param ctx - 需已提供 modelDirectories 服务的客户端上下文。
 * @returns 停止注入并卸载注册的 disposer。
 */
export function installProviderLabel(ctx: ClientContext): () => void {
  return ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'provider-label',
    order: 999,
    inject: (sessionId: SessionId) => ({
      hooks: {
        // directory.store 是 SnapshotStore,形状即 HostObservable(getSnapshot+subscribe)。
        directory: ctx.modelDirectories.directoryFor(sessionId).store,
      },
    }),
  }, ProviderLabel))
}
