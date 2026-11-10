# anim233 — DeepSeek Harness 动画框架插件

一个可扩展的动画框架：内置 **13 款** 热门游戏风格启动动画 + 进入后 UI/UX 动画，自带**可调透明度背景层**，支持 **git 导入别人的动画包**，并允许**自定义用户名（默认「博士」**）。

> 参考 [dsh-startup-screen](https://github.com/6shenhonghong9/dsh-startup-screen) 的注入式启动动画思路，做成了框架化、可扩展、多包、带背景层的版本。

## 功能

- **动画框架**：纯前端时间线引擎 `ANIM233`，无需构建，按 `window.ANIM233.register(pack)` 注册即可。
- **内置 13 款游戏风格**：原神、明日方舟、星穹铁道、崩坏3、绝区零、艾尔登法环、塞尔达传说、巫师3、怪物猎人、只狼、英雄联盟、王者荣耀、赛博朋克2077。
- **两段式动画**：启动动画（startup）+ 进入后 UI/UX 动画（entrance），各包可独立声明。
- **可调透明度背景层**：独立于启动动画的常驻背景，支持「内置预设 / 本地图片 / 自定义渐变 / 网络图片」四种来源，透明度 0–100% 实时可调。
- **git 导入**：设置页填别人的 git 仓库地址，一键 clone（或 pull 更新），仓库需含 `pack.js`（`window.ANIM233.register(...)`）与可选 `manifest.json`。
- **自定义用户名**：默认「博士」，启动动画与欢迎语里会显示，设置页可改。

## 安装

```bash
# 从本地目录安装（开发用）
dsh plugin --profile web add link:<本目录>

# 或从 npm 安装（发布后）
dsh plugin --profile web add dsh-plugin-anim233
```

安装后打开 DSH 设置 →「动画 233」即可配置；刷新页面会触发启动动画。

## 编写自己的动画包

新建仓库，放一个 `pack.js`：

```js
window.ANIM233.register({
  id: 'my-pack',
  name: '我的动画',
  style: '自定义',
  build: function (ctx) {
    var tl = ctx.timeline()           // 时间线引擎
    var root = ctx.root               // 启动动画根节点
    var username = ctx.username        // 当前用户名（默认「博士」）
    // 用 at(ms) / call(fn) / wait(ms) 编排；返回 tl 即可
    tl.at(0).call(function () {
      var t = ctx.el('div', null, 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#fff;font-size:28px')
      t.textContent = '欢迎，' + username
      root.appendChild(t)
    })
    tl.wait(2000)
    return tl
  }
})
```

可选 `manifest.json`：`{ "name": "我的动画", "style": "自定义" }`。

> 安全说明：导入的 `pack.js` 必须调用 `ANIM233.register`，否则被拒绝加载；脚本运行在浏览器侧，请只导入你信任的来源。

## 目录结构

```
lib/
  index.js         Host 半侧：路由、配置持久化、pack 扫描、git 导入、首屏注入
  client.js        浏览器半侧：设置页面板
  anim233.js       框架运行时（时间线引擎 / 包注册表 / 启动编排）
  background.js    可调透明度背景层
  packs.js         13 款内置游戏动画包
  splash.js        启动编排（建根 / 跳过 / 重播 API）
```

## License

MIT
