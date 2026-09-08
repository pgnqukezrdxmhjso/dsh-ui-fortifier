# 2026-08-23-3-refactor-Config同名并精简显示名

## 直接原因

- `Config` 应遵循 dsh 官方模式:类型与值同名。
- 设置页显示名不应带 `dsh-` 前缀。

## 解决方案

- [src/index.ts](../../src/index.ts):`UiFortifierSettings` 接口与 `UI_FORTIFIER_SETTINGS_SCHEMA` 合并为 `Config` 类型 + `Config` 值(schema)同名导出。
- [src/client/locales.ts](../../src/client/locales.ts):`nav` 显示名从 `dsh-ui-fortifier` 改为 `ui-fortifier`。

## 思路

- Config 同名是 Cordis 插件标准形态,`apply(ctx, config: Config)` 引用同一名字。
- 显示名是用户可见文案,去掉 `dsh-` 更简洁。
