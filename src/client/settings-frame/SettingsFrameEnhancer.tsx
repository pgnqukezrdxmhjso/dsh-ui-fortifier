/**
 * settings-frame 功能：让设置面板可拖动位置与缩放大小。
 * 组件注册在 settings.action 槽（作为宿主获得面板生命周期），两个手柄均经 portal
 * 挂载：拖动手柄进左上角标题行，缩放柄进面板右下角；面板改 fixed 定位后仅改内联
 * 几何，关闭时恢复由 CSS 负责的默认居中尺寸。
 */
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type {
  InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import css from './SettingsFrameEnhancer.module.css'

/** 面板最小宽高，防止缩放过小无法操作。 */
const MIN_WIDTH = 480
const MIN_HEIGHT = 320
/** localStorage 中面板几何的存储键。 */
const FRAME_STORAGE_KEY = 'dsh.ui-fortifier.settingsFrame'

/** 注入面：本功能无需 Host 数据。 */
export interface SettingsFrameInjected {
  /** 无 */
}

/** 槽位 owner 参数与本地化文案。 */
export type SettingsFrameEnhancerProps =
  PropsRuntime<'settings.action'>
  & PropsLocale<'ui-fortifier'>
  & InjectFace<SettingsFrameInjected>

/** 持久化的面板几何。 */
interface PanelGeometry {
  /** 面板左缘。 */
  left: number
  /** 面板顶缘。 */
  top: number
  /** 面板宽度。 */
  width: number
  /** 面板高度。 */
  height: number
}

/** 读取持久化的面板几何；缺失或损坏返回 undefined。 */
function readFrameGeometry(): PanelGeometry | undefined {
  const raw = localStorage.getItem(FRAME_STORAGE_KEY)
  if (raw === null) return undefined
  try {
    const parsed = JSON.parse(raw) as Partial<PanelGeometry>
    if (typeof parsed.left === 'number' && Number.isFinite(parsed.left)
      && typeof parsed.top === 'number' && Number.isFinite(parsed.top)
      && typeof parsed.width === 'number' && Number.isFinite(parsed.width)
      && typeof parsed.height === 'number' && Number.isFinite(parsed.height)) {
      return parsed as PanelGeometry
    }
    return undefined
  } catch {
    return undefined
  }
}

/** 写回持久化的面板几何。 */
function writeFrameGeometry(geometry: PanelGeometry): void {
  localStorage.setItem(FRAME_STORAGE_KEY, JSON.stringify(geometry))
}

/** 读取面板当前几何并持久化（拖动/缩放结束后调用）。 */
function persistGeometry(panel: HTMLElement): void {
  writeFrameGeometry({
    left: panel.offsetLeft,
    top: panel.offsetTop,
    width: panel.offsetWidth,
    height: panel.offsetHeight,
  })
}

/** 将面板几何钳制在视口内（左上角不小于 0，右下角不越出视口）。 */
function constrainPanel(panel: HTMLElement): void {
  const vw = window.innerWidth
  const vh = window.innerHeight
  panel.style.left = `${clamp(panel.offsetLeft, 0, Math.max(0, vw - panel.offsetWidth))}px`
  panel.style.top = `${clamp(panel.offsetTop, 0, Math.max(0, vh - panel.offsetHeight))}px`
}

/** 窗口尺寸变化时把面板收进视口：先收窄超出视口的宽高（不低于最小尺寸，窗口小于最小尺寸时随窗口），再钳制位置。 */
function constrainToViewport(panel: HTMLElement): void {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = clamp(panel.offsetWidth, Math.min(MIN_WIDTH, vw), vw)
  const height = clamp(panel.offsetHeight, Math.min(MIN_HEIGHT, vh), vh)
  panel.style.width = `${width}px`
  panel.style.height = `${height}px`
  panel.style.left = `${clamp(panel.offsetLeft, 0, Math.max(0, vw - width))}px`
  panel.style.top = `${clamp(panel.offsetTop, 0, Math.max(0, vh - height))}px`
}

/** 将一个数值限制在闭合区间。 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** 面板几何与指针手势的运行时状态。 */
interface DragState {
  /** 手势起点相对面板左上角的偏移。 */
  offsetX: number
  offsetY: number
}

/** 六点拖动把手图形（2 列 x 3 行规整点阵）。 */
function GripDots() {
  return (
    <svg className={css.gripIcon} viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
      <circle cx="2.5" cy="2.5" r="1.3" />
      <circle cx="7.5" cy="2.5" r="1.3" />
      <circle cx="2.5" cy="7" r="1.3" />
      <circle cx="7.5" cy="7" r="1.3" />
      <circle cx="2.5" cy="11.5" r="1.3" />
      <circle cx="7.5" cy="11.5" r="1.3" />
    </svg>
  )
}

/**
 * 渲染「拖动位置/大小」手柄。
 * @param props - header owner 参数与本地化文案。
 * @returns 挂入标题行的拖动手柄与挂入面板右下角的缩放柄。
 */
export function SettingsFrameEnhancer(props: SettingsFrameEnhancerProps): ReactNode {
  const { t } = props
  // 宿主锚点：组件注册在 actions 区但不可见，仅用于向上定位面板。
  const anchorRef = useRef<HTMLSpanElement | null>(null)
  const dragHandleRef = useRef<HTMLButtonElement | null>(null)
  const resizeHandleRef = useRef<HTMLButtonElement | null>(null)
  const [panel, setPanel] = useState<HTMLElement | null>(null)
  const [headerRow, setHeaderRow] = useState<HTMLElement | null>(null)

  // 挂载时把面板从 flex 居中改为 fixed，应用持久化几何或保持当前视觉位置；卸载时还原。
  useEffect(() => {
    const anchor = anchorRef.current
    if (anchor === null) return
    const dialog = anchor.closest('[role="dialog"]')
    if (!(dialog instanceof HTMLElement)) return
    const rect = dialog.getBoundingClientRect()
    const saved = readFrameGeometry()
    dialog.style.position = 'fixed'
    dialog.style.left = `${saved === undefined ? rect.left : saved.left}px`
    dialog.style.top = `${saved === undefined ? rect.top : saved.top}px`
    dialog.style.width = `${saved === undefined ? rect.width : saved.width}px`
    dialog.style.height = `${saved === undefined ? rect.height : saved.height}px`
    // flex 居中依赖父容器，fixed 后需清除可能继承的 margin。
    dialog.style.margin = '0'
    // 面板 CSS 自带 max-width: calc(100vw - 48px)，会截断内联 width，
    // 导致贴边后右边仍有一段拖不动；fixed 化后宽度完全由手势控制，移除该限制。
    dialog.style.maxWidth = 'none'
    // 存储的几何可能超出当前视口（窗口变小等），钳制回视口内。
    constrainToViewport(dialog)
    // 挂载即把当前视觉几何作为持久化基线，保证下次打开所见即上次关闭状态；
    // 窗口比最小尺寸还小时不覆盖旧几何（那是被视口强压的临时状态）。
    if (window.innerWidth >= MIN_WIDTH && window.innerHeight >= MIN_HEIGHT) {
      persistGeometry(dialog)
    }
    setPanel(dialog)
    // 标题行：nav 下第一个子节点（navigation 标题区），把手柄对齐到左上角。
    const nav = dialog.querySelector('nav')
    const row = nav?.firstElementChild
    setHeaderRow(row instanceof HTMLElement ? row : null)
    // 浏览器窗口尺寸变化后，把面板重新限制在视野内并保存收窄后的几何；
    // rAF 合帧避免每次 resize 事件都写 localStorage；
    // 窗口被拉得比最小尺寸还小时（如压到 0 高），面板仍需收缩适配视口，
    // 但这只是临时视觉状态，不持久化，避免下次打开读到被压扁的几何。
    let windowResizeFrame: number | null = null
    const onWindowResize = (): void => {
      if (windowResizeFrame !== null) return
      windowResizeFrame = requestAnimationFrame(() => {
        windowResizeFrame = null
        constrainToViewport(dialog)
        if (window.innerWidth >= MIN_WIDTH && window.innerHeight >= MIN_HEIGHT) {
          persistGeometry(dialog)
        }
      })
    }
    window.addEventListener('resize', onWindowResize)
    return () => {
      if (windowResizeFrame !== null) { cancelAnimationFrame(windowResizeFrame); windowResizeFrame = null }
      window.removeEventListener('resize', onWindowResize)
      dialog.style.position = ''
      dialog.style.left = ''
      dialog.style.top = ''
      dialog.style.width = ''
      dialog.style.height = ''
      dialog.style.margin = ''
      dialog.style.maxWidth = ''
      setPanel(null)
      setHeaderRow(null)
    }
  }, [])

  // portal 默认追加到标题文字之后；把拖动手柄移动到标题行首，置于「设置」文本左侧。
  useEffect(() => {
    const handle = dragHandleRef.current
    if (handle === null || headerRow === null) return
    if (headerRow.firstChild === handle) return
    headerRow.insertBefore(handle, headerRow.firstChild)
  }, [headerRow])

  // 拖动位置：pointer capture + rAF 节流，起点记录偏移避免跳动；移动中实时钳制在视口内。
  const dragState = useRef<DragState | null>(null)
  const latest = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const frame = useRef<number | null>(null)

  const onDragPointerDown = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (panel === null) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      offsetX: event.clientX - panel.offsetLeft,
      offsetY: event.clientY - panel.offsetTop,
    }
  }

  const onDragPointerMove = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (dragState.current === null) return
    latest.current = { x: event.clientX, y: event.clientY }
    frame.current ??= requestAnimationFrame(() => {
      frame.current = null
      if (panel === null || dragState.current === null) return
      panel.style.left = `${latest.current.x - dragState.current.offsetX}px`
      panel.style.top = `${latest.current.y - dragState.current.offsetY}px`
      constrainPanel(panel)
    })
  }

  const onDragPointerUp = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (dragState.current === null) return
    if (frame.current !== null) { cancelAnimationFrame(frame.current); frame.current = null }
    dragState.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (panel === null) return
    constrainPanel(panel)
    persistGeometry(panel)
  }

  // 拖动大小：右下角手柄，锚定左上角，向右下扩展；上限受视口与面板位置/CSS 约束。
  const resizeOrigin = useRef<{ x: number; y: number } | null>(null)
  const resizeBase = useRef<{ width: number; height: number } | null>(null)
  const resizeMax = useRef<{ width: number; height: number } | null>(null)
  const resizeFrame = useRef<number | null>(null)

  const onResizePointerDown = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (panel === null) return
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeOrigin.current = { x: event.clientX, y: event.clientY }
    resizeBase.current = { width: panel.offsetWidth, height: panel.offsetHeight }
    // 面板 CSS max-width 已在挂载时移除，宽度上限取视口右缘，可拖满到视口。
    resizeMax.current = {
      width: window.innerWidth - panel.offsetLeft,
      height: window.innerHeight - panel.offsetTop,
    }
  }

  const onResizePointerMove = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (resizeOrigin.current === null || resizeBase.current === null || resizeMax.current === null) return
    latest.current = { x: event.clientX, y: event.clientY }
    resizeFrame.current ??= requestAnimationFrame(() => {
      resizeFrame.current = null
      if (panel === null || resizeOrigin.current === null || resizeBase.current === null || resizeMax.current === null) return
      const width = clamp(
        resizeBase.current.width + (latest.current.x - resizeOrigin.current.x),
        MIN_WIDTH,
        Math.max(MIN_WIDTH, resizeMax.current.width),
      )
      const height = clamp(
        resizeBase.current.height + (latest.current.y - resizeOrigin.current.y),
        MIN_HEIGHT,
        Math.max(MIN_HEIGHT, resizeMax.current.height),
      )
      panel.style.width = `${width}px`
      panel.style.height = `${height}px`
      // 尺寸变化后位置可能越界（如面板贴左边缘时右上推），重新钳制。
      constrainPanel(panel)
    })
  }

  const onResizePointerUp = (event: React.PointerEvent<HTMLButtonElement>): void => {
    if (resizeOrigin.current === null) return
    if (resizeFrame.current !== null) { cancelAnimationFrame(resizeFrame.current); resizeFrame.current = null }
    resizeOrigin.current = null
    resizeBase.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    if (panel !== null) persistGeometry(panel)
  }

  const dragHandle = (
    <button
      ref={dragHandleRef}
      type="button"
      className={css.dragHandle}
      title={t('settingsFrame.drag')}
      aria-label={t('settingsFrame.drag')}
      onPointerDown={onDragPointerDown}
      onPointerMove={onDragPointerMove}
      onPointerUp={onDragPointerUp}
    >
      <GripDots />
    </button>
  )
  const resizeHandle = (
    <button
      ref={resizeHandleRef}
      type="button"
      className={css.resizeHandle}
      title={t('settingsFrame.resize')}
      aria-label={t('settingsFrame.resize')}
      onPointerDown={onResizePointerDown}
      onPointerMove={onResizePointerMove}
      onPointerUp={onResizePointerUp}
    />
  )

  return (
    <>
      {/* 宿主锚点：仅用于定位面板，不参与布局。 */}
      <span ref={anchorRef} className={css.hostAnchor} />
      {headerRow !== null && createPortal(dragHandle, headerRow)}
      {panel !== null && createPortal(resizeHandle, panel)}
    </>
  )
}
