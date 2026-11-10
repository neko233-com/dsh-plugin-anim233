# Changelog

## [1.0.0] - 2026-11-10

### Added
- 动画框架 `ANIM233`：时间线引擎、包注册表、启动编排、两段式（startup + entrance）。
- 13 款内置游戏风格启动动画：原神、明日方舟、星穹铁道、崩坏3、绝区零、艾尔登法环、塞尔达传说、巫师3、怪物猎人、只狼、英雄联盟、王者荣耀、赛博朋克2077。
- 进入后 UI/UX 动画：用户名欢迎语、进度环、签名母题、光幕。
- 独立背景层：预设 / 本地图片 / 自定义渐变 / 网络图片，透明度 0–100% 可调。
- git 导入动画包：Host 侧 `git clone` / `git pull`，校验 `pack.js` 必须调用 `ANIM233.register`。
- 自定义用户名：默认「博士」。
- 设置页「动画 233」：选包、用户名、背景、git 导入、保存、预览、恢复默认。
- 工程化：`node:test` 测试、语法检查脚本、GitHub Actions CI、安装脚本、PACK-SPEC 文档。
- 本地安装脚本 `scripts/install.cjs`（无需 npm registry）。

### Notes
- npm 发布未启用；安装走 DSH 本地 link / 插件页。
