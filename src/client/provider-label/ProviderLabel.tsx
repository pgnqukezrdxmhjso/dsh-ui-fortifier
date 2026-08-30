import type {
  HostObservable, InjectFace, PropsRuntime,
} from '@deepseek-ai/dsh-client-ui-slots'
import type { ModelDirectoryState } from '@deepseek-ai/dsh-client-ui-model-selection/client'
import css from './ProviderLabel.module.css'

/** 注入面：模型目录的响应式快照。 */
export interface ProviderLabelInjected {
  hooks: {
    /** 模型目录 store(SnapshotStore 即 HostObservable)。 */
    directory: HostObservable<ModelDirectoryState>
  }
}

export type ProviderLabelProps =
  PropsRuntime<'conversation.input.right'>
  & InjectFace<ProviderLabelInjected>

export function ProviderLabel(props: ProviderLabelProps) {
  const state = props.useDirectory(value => value)
  const provider = state.current?.provider
  if (provider === undefined || provider.length === 0) return null
  return (
    <span className={css.label} title={provider}>
      {provider}
    </span>
  )
}
