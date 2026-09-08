# 2026-09-09-1-fix-适配settings新注册api

## 直接原因

- dsh 升级到 0.1.2-rc.1 后，`@deepseek-ai/dsh-settings` 移除了宿主侧便捷函数 `installSettingsSection` 与 `settingsNamespace`，改为 settings 服务方法 `ctx.settings.installSection(owner, ns, schema, entry, hooks)`；namespace 改用字面量参数，由类型层按小写字母、数字与连字符文法检查。旧用法导致编译失败。

## 解决方案

- [src/index.ts](../../src/index.ts) 改为经 `ctx.inject(['settings'])` 取得 settings 服务，调用 `ctx.settings.installSection` 注册 `ui-fortifier` 命名空间；namespace 常量改为普通字符串字面量。
- 中英文 [README.md](../../README.md)、[README.zh.md](../../README.zh.md) 的「构建使用的 dsh 版本」更新为 0.1.2-rc.1。

## 思路

- 参照仓库内置消费方的同款迁移（如 `web-search-deepseek`）：`installSection` 的 entry 即插件配置，作为 base 层，并在服务缺失时回退到该配置，行为与旧便捷函数一致。