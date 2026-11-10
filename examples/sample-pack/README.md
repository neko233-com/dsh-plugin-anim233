# 示例动画包（sample-pack）

这是一个可直接导入 anim233 的动画包示例。

## 导入方式

1. 把这个仓库推到任意可访问的 git 地址（如 github.com/you/sample-pack）。
2. 在 DSH 设置 →「动画 233」→「导入别人的动画包（git）」填入：
   - 仓库地址：`https://github.com/you/sample-pack.git`
   - 目录名（可选）：`sample-pack`
3. 点「导入」，稍候刷新即可在动画包列表里选用 `示例·霓虹波`。

## 包结构

- `pack.js` —— 必须调用 `window.ANIM233.register({ id, name, style, build })`。
- `manifest.json` —— 可选，含 `name` / `style`，用于列表展示。
- `icon.svg` / `preview.png` —— 可选展示资源。

## 编写要点

- `build(ctx)` 返回一个时间线 `tl = ctx.timeline()`。
- 用 `tl.at(ms).call(fn)` / `tl.wait(ms)` 编排；返回 `tl` 即可。
- `ctx.username` 是当前用户名（默认「博士」）。
- `ctx.el(tag, id, css)` 快速建带样式的 DOM 节点。
