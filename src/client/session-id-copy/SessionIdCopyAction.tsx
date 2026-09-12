/**
 * session-id-copy 功能：会话标题栏的复制 Session ID 按钮。
 */
import { useEffect, useRef, useState } from 'react'
import {
  IconCheckOutline16, IconCopyOutline16, Tooltip, writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only：拉取 ui-conversation 的 SlotMap merge（header.utilities 插槽声明）。
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import css from './SessionIdCopyAction.module.css'

/** 槽位 owner 参数与本地化文案。 */
export type SessionIdCopyActionProps =
  PropsRuntime<'conversation.session.header.utilities'>
  & PropsLocale<'ui-fortifier'>

/**
 * 井号字形：官方图标库没有标识符类图标，故内联两竖两横的 # 描边。
 * 与相邻的复制图标并排，让按钮直接表达「复制标识符」而非只有复制。
 * @returns 装饰性内联图标（按钮已有 aria-label）。
 */
function HashGlyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M6.2 2.2 4.9 13.8M11.1 2.2 9.8 13.8M2.6 5.6h11.2M2.2 10.4h11.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 渲染复制 Session ID 的图标按钮：悬停提示直接给出会话 ID，点击写入剪贴板，
 * 成功后按钮短暂换成对勾。
 * @param props - owner 参数(含当前会话 ID)与文案。
 * @returns 会话标题栏工具区的复制按钮。
 */
export function SessionIdCopyAction(props: SessionIdCopyActionProps) {
  const t = props.t
  const id = String(props.sessionId)
  const [copied, setCopied] = useState(false)
  const pending = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const epoch = useRef(0)

  // 卸载时终止在途写入的反馈，避免对已卸载组件提交状态。
  useEffect(() => () => {
    epoch.current += 1
    pending.current = false
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = (): void => {
    // 反馈窗口内的重复点击既不重复写入也不叠加定时器。
    if (copied || pending.current) return
    const started = epoch.current
    pending.current = true
    void writeClipboard(id).then((accepted) => {
      if (started !== epoch.current) return
      pending.current = false
      if (!accepted) return
      setCopied(true)
      timer.current = window.setTimeout(() => {
        timer.current = null
        setCopied(false)
      }, 1000)
    })
  }

  return (
    <Tooltip label={copied ? t('sessionIdCopy.copied') : t('sessionIdCopy.hint', { id })} side="bottom">
      <button
        type="button"
        className={css.button}
        aria-label={t('sessionIdCopy.action')}
        onClick={copy}
      >
        {copied
          ? <IconCheckOutline16 />
          : (
            <>
              <HashGlyph />
              <IconCopyOutline16 />
            </>
          )}
      </button>
    </Tooltip>
  )
}
