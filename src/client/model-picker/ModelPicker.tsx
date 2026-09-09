/**
 * model-picker 功能：输入框右下角(following provider-label)的级联模型选择器。
 * 左列提供商、右列该提供商的模型；顶部搜索框按名称过滤提供商与模型。
 * 选择写回官方共享的 modelDirectories，因此与官方模型选择按钮/斜杠命令互通。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ModelSelection } from '@deepseek-ai/dsh-api-session-controller/types'
import type {
  HostObservable, InjectFace, PropsLocale, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import css from './ModelPicker.module.css'

/** 注入面：响应式目录快照 + load/select 回写动作。 */
export interface ModelPickerInjected {
  hooks: {
    /** 会话共享的模型目录快照(与官方选择器同一 store)。 */
    directory: HostObservable<ModelDirectoryState>
  }
  /** 确保共享目录已加载。 */
  load: () => void
  /** 提交一次提供方/模型选择。 */
  select: (selection: ModelSelection) => Promise<boolean>
}

/** 槽位 owner 参数与本地化文案。 */
export type ModelPickerProps =
  PropsRuntime<'conversation.input.right'>
  & PropsLocale<'ui-fortifier'>
  & InjectFace<ModelPickerInjected>

/** 选择器的面板状态。 */
interface PickerState {
  /** 面板是否展开。 */
  open: boolean
  /** 左列当前选中的提供商 id。 */
  provider: string | null
  /** 搜索关键字(按提供商/模型名称过滤)。 */
  query: string
  /** 上次失败文案(用于内联错误)。 */
  error: string | null
}

/** 名称是否命中搜索关键字。 */
function matchesQuery(name: string, query: string): boolean {
  return query === '' || name.toLowerCase().includes(query)
}

/**
 * 渲染级联模型选择器(左列提供商、右列模型)。
 * @param props - owner 参数、文案与注入面。
 * @returns 图标触发器按钮与展开时的两列面板。
 */
export function ModelPicker(props: ModelPickerProps) {
  const t = props.t
  const state = props.useDirectory(value => value)
  const [picker, setPicker] = useState<PickerState>({ open: false, provider: null, query: '', error: null })
  const [loading, setLoading] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  const groups = state.groups
  const current = state.current
  const query = picker.query.trim().toLowerCase()
  // 任何提供商的任一模型名是否命中搜索词：命中则按模型名过滤左列
  //（只保留提供匹配模型的提供商、隐藏未提供的），右列按模型名过滤；
  // 没有任何模型命中时才按提供商名过滤左列，并显示该提供商全部模型
  //（避免搜索提供商名时右列被清空、以及提供商名与模型名相同导致两列行为不一致）。
  const hasModelHit = groups.some(group =>
    group.models.some(model => matchesQuery(model.name, query)))
  const visibleGroups = useMemo(() => {
    if (query === '') return groups
    if (hasModelHit) {
      return groups.filter(group => group.models.some(model => matchesQuery(model.name, query)))
    }
    return groups.filter(group => matchesQuery(group.name, query))
  }, [groups, query, hasModelHit])

  // 当前提供商被搜索过滤掉时，回退到第一个可见提供商。
  const holding = visibleGroups.find(group => group.id === picker.provider)
  const activeGroup = holding ?? visibleGroups[0]
  const activeProvider = activeGroup?.id ?? null
  const activeModels = useMemo(() => {
    if (activeGroup === undefined) return []
    if (query === '') return activeGroup.models
    if (hasModelHit) return activeGroup.models.filter(model => matchesQuery(model.name, query))
    return activeGroup.models
  }, [activeGroup, query, hasModelHit])

  // 展开时点击面板外关闭。
  useEffect(() => {
    if (!picker.open) return
    const closeOutside = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPicker(p => ({ ...p, open: false }))
      }
    }
    document.addEventListener('mousedown', closeOutside)
    return () => { document.removeEventListener('mousedown', closeOutside) }
  }, [picker.open])

  // 展开时确保目录已加载，并让搜索框获得焦点。
  const open = (): void => {
    setPicker(p => ({ ...p, open: true, provider: p.provider ?? current?.provider ?? null }))
    props.load()
    setLoading(state.status === 'loading' || state.status === 'idle')
    queueMicrotask(() => { searchRef.current?.focus() })
  }

  const close = (restoreFocus = false): void => {
    setPicker(p => ({ ...p, open: false }))
    if (restoreFocus) queueMicrotask(() => { triggerRef.current?.focus() })
  }

  const chooseProvider = (provider: string): void => {
    setPicker(p => ({ ...p, provider }))
  }

  const chooseModel = (modelId: string): void => {
    if (activeProvider === null) return
    const model = activeGroup?.models.find(m => m.id === modelId)
    if (model === undefined) return
    const selection: ModelSelection = {
      provider: activeProvider,
      model: modelId,
      ...model.reasoning?.defaultEffort === undefined ? {} : { reasoningEffort: model.reasoning.defaultEffort },
    }
    if (current?.provider === activeProvider && current.model === modelId) {
      close(true)
      return
    }
    void props.select(selection).then((accepted) => {
      if (accepted) close(true)
      else setPicker(p => ({ ...p, error: t('modelPicker.loadError') }))
    })
  }

  const hasError = state.error !== null || picker.error !== null
  const shownError = state.error ?? picker.error

  return (
    <div ref={rootRef} className={css.root}>
      <button
        ref={triggerRef}
        type="button"
        className={css.trigger}
        aria-label={t('modelPicker.trigger')}
        aria-haspopup="dialog"
        aria-expanded={picker.open}
        title={t('modelPicker.trigger')}
        onClick={() => { if (picker.open) { close() } else { open() } }}
      >
        <svg viewBox="0 0 16 16" className={css.triggerIcon} aria-hidden="true" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="2" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {picker.open && (
        <div className={css.menu} role="dialog" aria-label={t('modelPicker.trigger')}>
          <div className={css.search}>
            <span className={css.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <input
              ref={searchRef}
              className={css.searchInput}
              type="text"
              value={picker.query}
              placeholder={t('modelPicker.searchPlaceholder')}
              onChange={(event) => { setPicker(p => ({ ...p, query: event.target.value })) }}
              aria-label={t('modelPicker.searchPlaceholder')}
            />
          </div>

          <div className={css.columns}>
            <aside className={css.providers} aria-label={t('modelPicker.providers')}>
              <div className={css.columnTitle}>{t('modelPicker.providers')}</div>
              {state.status === 'loading' || loading
                ? <div className={css.status}>{t('modelPicker.loading')}</div>
                : groups.length === 0
                  ? <div className={css.status}>{t('modelPicker.emptyProviders')}</div>
                  : visibleGroups.length === 0
                    ? <div className={css.status}>{t('modelPicker.emptySearch')}</div>
                    : visibleGroups.map(group => (
                      <button
                        type="button"
                        className={`${css.cell} ${group.id === activeProvider ? css.cellActive : ''}`}
                        key={group.id}
                        onClick={() => { chooseProvider(group.id) }}
                      >
                        {group.name}
                      </button>
                    ))}
            </aside>
            <section className={css.models} aria-label={t('modelPicker.models')}>
              <div className={css.columnTitle}>{t('modelPicker.models')}</div>
              {hasError && (
                <div className={css.error} role="alert">
                  <span>{shownError}</span>
                  <button
                    type="button"
                    className={css.retry}
                    onClick={() => { props.load(); setPicker(p => ({ ...p, error: null })) }}
                  >
                    {t('modelPicker.retry')}
                  </button>
                </div>
              )}
              {activeProvider === null
                ? <div className={css.status}>{t('modelPicker.emptyModels')}</div>
                : activeModels.length === 0
                  ? <div className={css.status}>{t('modelPicker.emptyModels')}</div>
                  : activeModels.map((model) => {
                    const selected = current?.provider === activeProvider && current.model === model.id
                    return (
                      <button
                        type="button"
                        className={`${css.cell} ${selected ? css.cellSelected : ''}`}
                        key={model.id}
                        disabled={state.status === 'selecting'}
                        onClick={() => { chooseModel(model.id) }}
                      >
                        <span className={css.modelName}>{model.name}</span>
                        {selected ? <span className={css.check} aria-hidden="true">✓</span> : null}
                      </button>
                    )
                  })}
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
