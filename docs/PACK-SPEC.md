# 动画包规范（Pack Spec）

一个动画包就是一个可被 `git clone` 的仓库，根目录至少包含 `pack.js`，可选 `manifest.json`。
用户在设置页「git 导入」填入仓库地址，Host 会 clone 到 `~/.dsh/anim233-packs/<dir>`。

## 最小示例

```js
// pack.js
window.ANIM233.register({
  id: 'my-pack',            // 唯一 id（必填）
  name: '我的动画',          // 展示名（必填）
  style: '自定义',           // 风格标签
  builtin: false,           // 内置包由框架置 true
  build: function (ctx) {
    var tl = ctx.timeline()
    tl.at(0).call(function () {
      ctx.root.appendChild(ctx.el('div', null, 'color:#fff'))
    })
    tl.wait(2000)
    return tl               // 必须返回时间线
  }
})
```

## manifest.json（可选）

```json
{ "name": "我的动画", "style": "自定义", "author": "you", "version": "1.0.0" }
```

## ctx 上下文对象

| 字段 | 类型 | 说明 |
|---|---|---|
| `ctx.root` | HTMLElement | 启动动画根节点，动画结束后整个节点会被移除 |
| `ctx.config` | object | 当前配置（含 `username`、`background*`） |
| `ctx.username` | string | 当前用户名（默认「博士」，已做空值兜底） |
| `ctx.timeline()` | `Timeline` | 创建一个时间线 |
| `ctx.el(tag, id?, css?)` | HTMLElement | 创建元素并可选设置 id / 内联样式 |
| `ctx.injectStyle(id, css)` | void | 注入一段 `<style>`（同 id 只注入一次） |
| `ctx.getPackId()` | string | 当前包 id |
| `ctx.setVar(name, value)` | void | 设置 CSS 变量到 root |

## 时间线 API

```js
var tl = ctx.timeline()
tl.at(0).call(fn)     // 在 0ms 执行 fn
tl.at(800).call(fn)   // 在 800ms 执行
tl.add(1200, fn)      // 同 at().call()
tl.wait(2000)         // 表示「至少持续到 2000ms」
tl.run()              // 由框架调用
```

时间线按时间排序串行执行，天然支持 `await`。`run()` 返回 Promise，框架会 `await` 它。

## 两段式（可选）

如果包希望区分「启动动画」和「进入后欢迎动画」，可声明：

```js
window.ANIM233.register({
  id: 'two-stage',
  name: '两段式',
  startup: function (ctx) { /* 启动段 */ },
  entrance: function (ctx) { /* 进入段 */ }
})
```

框架先跑 `startup`，再跑 `entrance`。若只实现 `build`，则作为单段动画。

## 安全约定

- `pack.js` **必须**调用 `window.ANIM233.register(...)`，否则 Host 拒绝加载。
- 脚本运行在浏览器页面上下文，等价于你在该页面执行任意 JS，**只导入你信任的来源**。
- 导入的包不会自动执行代码，只有被用户选中时才 `build()`。

## 背景层配置

背景层独立于启动动画，由设置页控制，字段如下：

| 字段 | 说明 |
|---|---|
| `backgroundEnabled` | 是否启用背景层 |
| `backgroundOpacity` | 0–1 透明度 |
| `backgroundType` | `preset` / `image` / `gradient` / `url` |
| `backgroundPreset` | `none` / `aurora` / `ember` / `ocean` / `forest` / `mono` |
| `backgroundImage` | 本地图片名（放在 `~/.dsh/anim233-assets/`） |
| `backgroundGradient` | CSS 渐变字符串 |
| `backgroundUrl` | 网络图片地址 |
