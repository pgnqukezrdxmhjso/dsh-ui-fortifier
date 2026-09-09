/**
 * model-picker 功能：在提供商标签右侧注册级联模型选择器。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// noinspection ES6UnusedImports
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import { ModelPicker } from './ModelPicker.tsx'

/**
 * 注册模型选择器到 conversation.input.right（provider-label 右侧）。
 * @param ctx - 需已提供 modelDirectories 服务的客户端上下文。
 * @returns 停止注入并卸载注册的 disposer。
 */
export function installModelPicker(ctx: ClientContext): () => void {
  return ctx.slots.inject('conversation.input.right', () => ctx.slots.register({
    name: 'conversation.input.right',
    id: 'model-picker',
    order: 1000,
    locale: 'ui-fortifier',
    inject: (sessionId: SessionId) => {
      const directory = ctx.modelDirectories.directoryFor(sessionId)
      return {
        hooks: {
          directory: directory.store,
        },
        load: () => { void directory.load().catch(() => { /* 错误落在共享 store */ }) },
        select: (selection: ModelSelection) => directory.select(selection).then(() => true, () => false),
      }
    },
  }, ModelPicker))
}
