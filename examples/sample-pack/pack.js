/* 示例动画包 —— 别人可以 clone 这个仓库，然后在 DSH「动画 233」设置页导入。
 * 规则：
 *   1. 必须调用 window.ANIM233.register({ id, name, style, build })（否则被拒绝加载）。
 *   2. build(ctx) 必须返回一条时间线 tl（用 ctx.timeline() 创建）。
 *   3. 可用 ctx.root / ctx.el / ctx.username / ctx.timeline()。
 */
window.ANIM233.register({
  id: 'sample-pack',
  name: '示例·霓虹波',
  style: '示例',
  build: function (ctx) {
    var root = ctx.root
    var username = ctx.username /* 默认「博士」 */
    var tl = ctx.timeline()

    tl.at(0).call(function () {
      var stage = ctx.el('div', null,
        'position:absolute;inset:0;display:flex;flex-direction:column;' +
        'align-items:center;justify-content:center;gap:14px;' +
        'background:radial-gradient(circle at 50% 40%, rgba(80,200,255,.25), transparent 60%);' +
        'color:#eaf6ff;font-family:system-ui,sans-serif')
      var title = ctx.el('div', null, 'font-size:34px;font-weight:700;letter-spacing:.1em;' +
        'background:linear-gradient(90deg,#5ad7ff,#c77dff);-webkit-background-clip:text;background-clip:text;color:transparent')
      title.textContent = 'SAMPLE'
      var sub = ctx.el('div', null, 'font-size:15px;opacity:.8')
      sub.textContent = '欢迎，' + username + ' —— 这是一个导入的动画包'
      stage.appendChild(title); stage.appendChild(sub)
      root.appendChild(stage)
    })
    tl.wait(2400)
    return tl
  }
})
