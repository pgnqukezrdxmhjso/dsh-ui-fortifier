/**
 * 打开本机 .dsh 文件夹的 Host Remote 服务。
 * 端点 `uiFortifier/openDshFolder` 由网关的 SRC 反射发现，无需 typert 生成器产物。
 */
import { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { resolveDshHome } from '@deepseek-ai/dsh-home-paths'
import {
  canOpenNativePath, openNativePath, runNativeCommand,
} from '@deepseek-ai/dsh-native-command'
import type { DshFolderOpenValue } from './types.ts'

export type { DshFolderOpenValue }

/** SetForegroundWindow / keybd_event 的 P/Invoke 声明（成员定义内无单引号，可直接单引号包裹）。 */
const WIN32_FOREGROUND_MEMBERS = '[DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, System.UIntPtr dwExtraInfo); [DllImport("user32.dll")] public static extern bool SetForegroundWindow(System.IntPtr hWnd);'

/** PowerShell 单引号字面量（内部单引号翻倍）。 */
function powershellLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

/**
 * 构造 Windows 打开脚本：`Invoke-Item` 打开文件夹，轮询定位该文件夹的资源管理器
 * 窗口，再解锁前台并把该窗口置顶；未定位到窗口时按成功退出（文件夹已经打开）。
 * @param path - 要打开的绝对路径。
 * @returns 传给 `powershell.exe -Command` 的完整脚本。
 */
function windowsOpenScript(path: string): string {
  return [
    "$ErrorActionPreference = 'Stop'",
    `$target = ${powershellLiteral(path)}`,
    'Invoke-Item -LiteralPath $target',
    // explorer 异步建窗，轮询等待；LocationURL 与 [Uri] 的绝对 URI 同为百分号
    // 编码形式，去掉尾部斜杠后比较。
    "$want = ([Uri]$target).AbsoluteUri.TrimEnd('/')",
    '$shell = New-Object -ComObject Shell.Application',
    '$hwnd = [int64]0',
    'for ($i = 0; $i -lt 30 -and $hwnd -eq 0; $i++) {',
    '  Start-Sleep -Milliseconds 100',
    '  foreach ($window in $shell.Windows()) {',
    '    try { $url = $window.LocationURL } catch { continue }',
    "    if ($url -ne $null -and $url.TrimEnd('/') -eq $want) { $hwnd = [int64]$window.HWND; break }",
    '  }',
    '}',
    'if ($hwnd -eq 0) { exit 0 }',
    `Add-Type -Namespace DshUiFortifier -Name Foreground -MemberDefinition ${powershellLiteral(WIN32_FOREGROUND_MEMBERS)}`,
    // 合成一次 Alt 按放（VK_MENU 0x12，抬键标志 KEYEVENTF_KEYUP 0x2）：本进程由此
    // 成为「最近输入拥有者」，Windows 才允许它调用 SetForegroundWindow 激活
    // explorer 的窗口。
    '[DshUiFortifier.Foreground]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero)',
    '[DshUiFortifier.Foreground]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)',
    '[void][DshUiFortifier.Foreground]::SetForegroundWindow([IntPtr]$hwnd)',
  ].join('\n')
}

/**
 * 打开文件夹并把它的资源管理器窗口提到前台（Windows）。
 *
 * explorer 创建的窗口不属于本进程，而 Windows 只允许前台进程、它启动的进程、
 * 或刚接收过输入的进程执行激活，因此新窗口会压在其他窗口之下（harness 共享的
 * `openNativePath` 未处理这一点）。这里先合成 Alt 让本进程取得激活资格，再显式
 * 对目标窗口调用 SetForegroundWindow——与 harness 原生文件夹对话框同一思路，
 * 区别是该窗口归 explorer 所有，必须显式置顶。
 * @param path - 要打开的绝对路径。
 * @param signal - 调用方/连接生命周期；中止会终止该子进程。
 */
async function openWindowsFolderInForeground(path: string, signal: AbortSignal): Promise<void> {
  await runNativeCommand('powershell.exe', ['-NoProfile', '-Command', windowsOpenScript(path)], signal)
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
      if (process.platform === 'win32') {
        await openWindowsFolderInForeground(home, signal)
      } else {
        await openNativePath(home, signal)
      }
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
