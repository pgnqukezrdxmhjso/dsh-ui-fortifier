/* jscpd:ignore-start */
import type { Context } from '@deepseek-ai/cordis'
import type { InvariantInstaller } from '@deepseek-ai/dsh-invariants'

const PACKAGE_NAME = 'dsh-ui-fortifier'

export const name = 'ui-fortifier-invariant'
export const inject = ['invariants']

/**
 * No runtime invariant: 本包是纯插槽表面，注册/卸载由 slots 系统的
 * effect 语义保证，无自有事件流或可变数据可断言。
 */
const install: InvariantInstaller = () => {}

export const apply = (ctx: Context): Promise<() => void> =>
  Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install))
/* jscpd:ignore-end */
