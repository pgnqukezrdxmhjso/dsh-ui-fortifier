# 2026-08-29-1-migrate-适配dsh包拆分

## 直接原因

- dsh 更新删除 `@deepseek-ai/dsh-client-runtime` 包,拆分为 session-controller/store 等,插件构建崩溃。

## 解决方案

- `ClientContext` 改从 `@deepseek-ai/cordis` 导入。
- `SessionId` 改从 `@deepseek-ai/dsh-session/types` 导入。
- `SettingsScope` 改从 `@deepseek-ai/dsh-client-ui-settings/client` 导入。
- `ctx.slots` 类型通过 `@deepseek-ai/dsh-client-ui-renderer/client` 空 import 引入。
- [package.json](../../package.json) 依赖删 dsh-client-runtime,加 dsh-api-session-controller、dsh-client-ui-renderer。
- [tsconfig.json](../../tsconfig.json) references 改用 session-controller/tsconfig.client.json、ui-renderer、core/session。

## 思路

- 新包未发布 npm,依赖统一用 workspace:^ 保证仓库内解析。
