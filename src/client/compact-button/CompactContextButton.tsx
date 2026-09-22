/**
 * compact-button 功能：输入框工具行左组右端的压缩上下文按钮。
 */
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { CSSProperties } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  Button, Tooltip, useAnchoredPosition, useDismissOnOutsidePointer,
} from '@deepseek-ai/dsh-client-ui-primitives'
// Type-only：拉取 ui-conversation 的 SlotMap merge(input.left 插槽声明)与会话标准套件。
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import css from './CompactContextButton.module.css'

/** 气泡与按钮之间的间距。 */
const POPOVER_GAP = 8

/** 气泡与视口边缘保留的距离。 */
const POPOVER_MARGIN = 12

// useAnchoredPosition 在开启的同一帧量面板尺寸，故面板必须先挂载再定位。
// 首次绘制前用隐藏的测量位置，避免未定位时闪现在视口角落。
const MEASURE_STYLE: CSSProperties = { visibility: 'hidden', left: 0, top: 0 }

/** 注入面：提交一次压缩指令。 */
export interface CompactContextButtonInjected {
  /** 提交 `/compact` 指令；指令生命周期由 host 写入会话流。 */
  compact: () => Promise<void>
}

/** 槽位 owner 参数、本地化文案与注入回调。 */
export type CompactContextButtonProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<'ui-fortifier'>
  & InjectFace<CompactContextButtonInjected>

/**
 * 压缩字形：官方图标库没有压缩语义的字形（`IconApiOutline14` 是终端提示符、
 * `IconEnhanceOutline16` 是四条段落横线，在此都会误读），故内联字形，与
 * `session-id-copy` 因官方无井号而内联 `HashGlyph` 同一做法。字形由用户提供。
 * @returns 装饰性内联图标（按钮已有 aria-label）。
 */function CompressGlyph() {
  return (
    <svg className={css.glyph} viewBox="0 0 1024 1024" aria-hidden="true">
      <path d="M318.1248 840.533333l31.5264-99.8336a759.4624 759.4624 0 0 0 0-457.399466L318.1248 183.466667h332.7296l67.6416 67.6416a733.216 733.216 0 0 0-32.590933 526.184533L705.8752 840.533333H318.1248z m0-733.866666c-51.908267 0-88.866133 50.427733-73.2352 99.925333l31.5264 99.835733a682.658133 682.658133 0 0 1 0 411.144534l-31.5264 99.8336C229.258667 866.9056 266.216533 917.333333 318.1248 917.333333h387.7504c51.908267 0 88.866133-50.427733 73.2352-99.927466l-19.970133-63.240534a656.420267 656.420267 0 0 1 29.947733-472.744533 73.845333 73.845333 0 0 0-14.833067-83.165867l-69.0944-69.0944A76.8 76.8 0 0 0 650.8544 106.666667H318.1248zM152.123733 764.7168c-13.051733-5.437867-19.170133-20.413867-14.2656-33.674667a631.473067 631.473067 0 0 0 0-438.0864c-4.904533-13.2608 1.216-28.2368 14.2656-33.674666l15.752534-6.564267c13.051733-5.437867 28.087467 0.7232 33.045333 13.9648a699.746133 699.746133 0 0 1 0 490.634667c-4.957867 13.2416-19.9936 19.402667-33.045333 13.9648l-15.752534-6.564267z m733.538134-33.474133l-12.343467-29.6256a419.4688 419.4688 0 0 1 8.7744-342.293334c6.101333-12.7552 1.725867-28.311467-10.632533-35.178666l-14.920534-8.288c-12.3584-6.8672-28.010667-2.4384-34.2208 10.263466a487.741867 487.741867 0 0 0-12.017066 401.7536l12.343466 29.623467c5.437867 13.051733 20.426667 19.223467 33.4784 13.7856l15.752534-6.564267c13.051733-5.437867 19.223467-20.426667 13.7856-33.476266z" /></svg>
  )
}

/**
 * 渲染压缩上下文按钮：点击先弹出确认气泡，气泡内确认后才提交 `/compact` 指令；
 * 点气泡外或按 Escape 取消。回合运行中与提交等待期间按钮禁用。
 * @param props - 会话标准套件、本地化文案与注入的压缩回调。
 * @returns 工具行左组右端的图标按钮与确认气泡。
 */
export function CompactContextButton(props: CompactContextButtonProps) {
  const running = props.useSession(snapshot => snapshot.running)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const rootRef = useRef<HTMLSpanElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const alive = useRef(true)

  const position = useAnchoredPosition({
    open,
    anchorRef: rootRef,
    panelRef,
    side: 'top',
    gap: POPOVER_GAP,
    margin: POPOVER_MARGIN,
  })

  // 气泡挂在 body 上(列有 overflow 裁切)，故 root 与 portal 都算「内部」。
  useDismissOnOutsidePointer(rootRef, open, setOpen, panelRef)

  useEffect(() => {
    alive.current = true
    return () => { alive.current = false }
  }, [])

  // 运行中转忙碌时收起气泡：此时确认也只会落一条失败节点。
  useEffect(() => {
    if (running) setOpen(false)
  }, [running])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => { document.removeEventListener('keydown', onKeyDown) }
  }, [open])

  const compact = (): void => {
    if (pending) return
    setOpen(false)
    setPending(true)
    // 指令成败都落会话流节点(command/done)，故只在等待期间禁用，不在此重复呈现结果。
    const settle = (): void => {
      if (alive.current) setPending(false)
    }
    void props.compact().then(settle, settle)
  }

  const disabled = running || pending

  return (
    <span ref={rootRef} className={css.root}>
      <Tooltip label={props.t('compactButton.action')} side="top" delayMs={500} disabled={open}>
        <button
          type="button"
          className={css.button}
          aria-label={props.t('compactButton.action')}
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          // 与左组其余按钮一致：抑制 mousedown 的默认聚焦，点击后光标留在编辑器里。
          onMouseDown={(event) => { event.preventDefault() }}
          onClick={() => { setOpen(value => !value) }}
        >
          <CompressGlyph />
        </button>
      </Tooltip>
      {open && createPortal(
        <div
          ref={panelRef}
          className={css.popover}
          role="dialog"
          aria-label={props.t('compactButton.confirmTitle')}
          style={position ?? MEASURE_STYLE}
        >
          <p className={css.popoverText}>{props.t('compactButton.confirmText')}</p>
          <Button variant="primary" size="sm" disabled={disabled} onClick={compact}>
            {props.t('compactButton.confirm')}
          </Button>
        </div>,
        document.body,
      )}
    </span>
  )
}
