/**
 * 打开本机 .dsh 文件夹的 Host Remote 服务。
 * 端点 `uiFortifier/openDshFolder` 由网关的 SRC 反射发现，无需 typert 生成器产物。
 */
import { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'
import { canOpenNativePath, openNativePath } from '@deepseek-ai/dsh-native-command'

/** 打开 .dsh 文件夹的返回值。 */
export interface DshFolderOpenValue {
  /** 是否已发起系统打开。 */
  readonly opened: boolean
  /** .dsh 文件夹绝对路径（未打开时供 UI 展示）。 */
  readonly path: string
}

/** 用系统默认方式打开 .dsh 文件夹；无原生打开器时返回路径让 UI 展示。 */
export class OpenDshFolderService extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'uiFortifierRemote', { namespace: 'uiFortifier' })
  }

  /**
   * 打开 .dsh 文件夹。
   * @param signal - 调用方可取消信号。
   * @returns opened 为 false 时 path 为 .dsh 文件夹路径。
   */
  @Remote
  async openDshFolder(signal: AbortSignal): Promise<DshFolderOpenValue> {
    const home = resolveDshHome()
    if (!canOpenNativePath()) return { opened: false, path: home }
    try {
      await openNativePath(home, signal)
      return { opened: true, path: home }
    } catch (error) {
      if (signal.aborted) throw new RemoteError('gateway/cancelled', 'dsh folder open was aborted', {})
      throw new RemoteError('gateway/internal', `path open failed: ${messageOf(error)}`, {}, { cause: error })
    }
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
