# 架构

anim233 由 Host 半侧与浏览器半侧组成，通过 HTTP 路由 + 首屏注入协作。

```
┌──────────────────────────── DSH Host 进程 ────────────────────────────┐
│  lib/index.js                                                          │
│   ├─ webServer.tapIndex(html => 注入 #anim233-root + bootstrap + 脚本)  │
│   ├─ GET /anim233/config       读取 ~/.dsh/anim233.json                 │
│   ├─ POST /anim233/config      保存 / 重置 / git 导入                   │
│   ├─ GET /anim233/{anim233,background,packs,splash}.js  框架脚本        │
│   ├─ GET /anim233/packs        内置 + 已导入包清单                       │
│   ├─ GET /anim233/packs/:dir.js 单个导入包脚本                          │
│   └─ GET /anim233/asset?name=  白名单静态资源                           │
└───────────────────────────────────────────────────────────────────────┘
                              │ HTTP
┌─────────────────────────── 浏览器 ────────────────────────────────────┐
│  splash.js   读取 window.__ANIM233__ 配置 → 决定是否播放 → ANIM233.start │
│  anim233.js  时间线引擎 + 包注册表 + start 编排                         │
│  background.js  常驻半透明背景层（z-index 2147482000）                  │
│  packs.js    13 个内置包                                                 │
│  client.js   settings.section「动画 233」设置页面板                     │
└───────────────────────────────────────────────────────────────────────┘
```

## 安装与挂载

1. `scripts/install.cjs` 把本包 link 进 profile 的 `node_modules`。
2. 写入 profile `package.json` 的 `dependencies` 与 `dsh.profile.bundles`。
3. 重启 DSH 后，loader 读取 `dsh.profile.bundles`，加载 `dsh.bundle.patch`（`cordis.patch.yml`），mount 插件。
4. 插件 `apply()` 注册 Host 路由并 `tapIndex` 注入；浏览器侧 `client.js` 注册设置页。

## 配置持久化

配置存放在 `~/.dsh/anim233.json`，不走 DSH settings 命名空间，避免与宿主配置耦合。
字段见 [PACK-SPEC.md](PACK-SPEC.md#背景层配置)。

## 导入包目录

`~/.dsh/anim233-packs/<dir>/pack.js`，由 Host 的 `git clone --depth 1` 写入；更新时 `git pull --ff-only`。
`~/.dsh/anim233-assets/` 存放本地背景图片。

## 首屏注入时序

1. Host 在 `index.html` 的 `<head>` 注入 critical CSS 与 bootstrap。
2. bootstrap 立即给 `<html>` 加 `a233-lock`（防滚动）+ 9 秒兜底解锁。
3. `splash.js`（defer）在 DOM 就绪后读取 `window.__ANIM233__`，按 `mode` 决定是否播放。
4. 播放结束 `finish()` 移除 root、解锁、写 `sessionStorage`/`localStorage` 标记。
5. 背景层由 `background.js` 常驻，不随 splash 移除。
