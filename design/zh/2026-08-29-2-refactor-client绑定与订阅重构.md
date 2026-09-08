# 2026-08-29-2-refactor-client绑定与订阅重构

## 直接原因

- client 侧 settings 绑定类型使用宽泛的 `Record<string, boolean>`,与 host 配置类型脱节;ProviderLabel 响应式订阅与设置页写法不一致。

## 解决方案

- `bind<Record<string, boolean>>` 改为 `bind<Config>`,client 从 host 类型导入 `Config`。
- `modules` 清单以 `Record<keyof Config, ModuleEntry>` 强约束,字段与 Config 强制同步。
- ProviderLabel 从手写 `useSyncExternalStore` 改为 inject hooks 的 `useDirectory`,与设置页 `useToggles` 一致。

## 思路

- 用一个权威类型(Config)驱动 client 的绑定与模块清单,避免多份声明漂移。
- 响应式订阅统一走 slots 的 hooks 机制(SnapshotStore 即 HostObservable)。
