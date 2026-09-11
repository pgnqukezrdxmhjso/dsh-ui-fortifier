import type {
  InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import type { ReactNode } from 'react'
import type { ConnectionRpcResult } from '@deepseek-ai/dsh-client-connection/client'
import type { DshFolderOpenValue } from '../../types.ts'
import css from './OpenDshFolderAction.module.css'

/** 打开 .dsh 文件夹的注入面。 */
export interface OpenDshFolderInjected {
  /** 请求 Host 打开 .dsh 文件夹。 */
  openDshFolder: () => Promise<ConnectionRpcResult<DshFolderOpenValue>>
}

/** header 操作区的 owner 参数、本地化文案与注入回调。 */
export type OpenDshFolderActionProps =
  PropsRuntime<'settings.action'>
  & PropsLocale<'ui-fortifier'>
  & InjectFace<OpenDshFolderInjected>

/** 一次打开操作的短暂结果。 */
type OpenState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'opening' }
  | { readonly kind: 'error' }
  | { readonly kind: 'path'; readonly path: string }

/**
 * 渲染「打开 .dsh 文件夹」操作，点击后请求 Host 打开 .dsh 目录。
 * @param props - header owner 参数、本地化文案与注入的打开回调。
 * @returns 操作按钮及其结果提示。
 */
export function OpenDshFolderAction(props: OpenDshFolderActionProps): ReactNode {
  const { openDshFolder, t } = props
  const [state, setState] = useState<OpenState>({ kind: 'idle' })

  const open = async (): Promise<void> => {
    setState({ kind: 'opening' })
    const result = await openDshFolder()
    if (!result.ok) {
      setState({ kind: 'error' })
      return
    }
    setState(result.value.opened ? { kind: 'idle' } : { kind: 'path', path: result.value.path })
  }

  return (
    <div className={css.action}>
      {state.kind === 'error' ? <span className={css.error} role="alert">{t('openDshFolder.error')}</span> : null}
      {state.kind === 'path' ? <span className={css.error} role="alert">{t('openDshFolder.pathLabel')}{state.path}</span> : null}
      <Button
        variant="outline"
        size="sm"
        disabled={state.kind === 'opening'}
        onClick={() => { void open() }}
      >
        {t('openDshFolder')}
      </Button>
    </div>
  )
}
