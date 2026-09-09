/**
 * open-dsh-folder 功能：在设置页右上角「打开配置文件」旁增加「打开 .dsh 文件夹」。
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConnectionHandle, ConnectionRpcResult } from '@deepseek-ai/dsh-client-connection/client'
import type { DshFolderOpenValue } from '../../open-dsh-folder.ts'
import { OpenDshFolderAction } from './OpenDshFolderAction.tsx'

export type { OpenDshFolderActionProps, OpenDshFolderInjected } from './OpenDshFolderAction.tsx'

/** 本模块文案命名空间(与 host 侧一致)。 */
const NS = 'ui-fortifier'

/**
 * 注册「打开 .dsh 文件夹」到设置页右上角操作区，仅在回环连接下注册。
 * @param ctx - 需已提供 slots/connection 的客户端上下文。
 * @returns 停止注入并卸载注册的 disposer。
 */
export function installOpenDshFolder(ctx: ClientContext): () => void {
  const connection = ctx.get('connection') as ConnectionHandle
  // 远程浏览器无打开本机文件夹能力，与「打开配置文件」同规则只注册回环连接。
  if (!connection.isLoopback) return () => {}
  const openDshFolder = (): Promise<ConnectionRpcResult<DshFolderOpenValue>> =>
    connection.rpc.call('/api', 'uiFortifier/openDshFolder', { args: {} }) as Promise<ConnectionRpcResult<DshFolderOpenValue>>
  return ctx.slots.inject('settings.action', () => ctx.slots.register({
    name: 'settings.action',
    id: 'open-dsh-folder',
    order: 1,
    locale: NS,
    inject: () => ({ openDshFolder }),
  }, OpenDshFolderAction))
}
