/* ============================================================================
 * anim233 — 动画框架运行时（浏览器侧，纯前端，无构建）
 * ----------------------------------------------------------------------------
 * 职责：
 *  - 时间线引擎（timeline）：add(at, fn) / wait(ms) / call(fn) / run()
 *  - 动画包（pack）注册表：ANIM233.register(pack) / getPack(id) / listPacks()
 *  - 用户名注入：default "博士"，可在设置页改
 *  - 启动动画（startup）+ 进入后 UI/UX 动画（entrance）两段式
 *  - 可调透明度背景层（background）：独立常驻层，由 ANIM233.background 管理
 *
 * 设计要点：
 *  - 本文件被 <script> 直接加载，不依赖模块系统，全部挂在 window.ANIM233。
 *  - 每个 pack 是一个 { id, name, style, build(ctx) } 对象：
 *      build 内用 ctx.startup(tl => {...}) 与 ctx.entrance(tl => {...}) 两段声明；
 *      没声明 entrance 就只播启动动画。
 *  - 背景层与启动动画解耦：背景常驻，启动动画结束不删背景。
 * ========================================================================== */
(function () {
  'use strict'

  var root = null
  function setRoot(r) { root = r }
  function getRoot() { return root }

  /* ── 工具 ──────────────────────────────────────────────────────────────── */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  function el(tag, cls, css) {
    var e = document.createElement(tag)
    if (cls) e.className = cls
    if (css) e.style.cssText = css
    return e
  }
  function injectStyle(id, text) {
    if (typeof document === 'undefined') return
    var tag = document.getElementById(id)
    if (!tag) {
      tag = document.createElement('style')
      tag.id = id
      document.head.appendChild(tag)
    }
    tag.textContent = text
  }

  /* ── 时间线引擎 ─────────────────────────────────────────────────────────── */
  function makeTimeline() {
    var steps = []
    var marker = 0
    var api = {
      /* 在绝对时间 at（毫秒，相对本段起点）调用 fn */
      add: function (at, fn) { steps.push({ at: at, fn: fn }); return api },
      /* 移动游标到 t（毫秒） */
      at: function (t) { marker = t; return api },
      /* 当前游标处调用 fn */
      call: function (fn) { return api.add(marker, fn) },
      /* 游标向后推进 ms */
      wait: function (ms) { marker += ms; return api },
      /* 执行本段时间线 */
      run: function () {
        return (async function () {
          steps.sort(function (a, b) { return a.at - b.at })
          var t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now())
          for (var i = 0; i < steps.length; i++) {
            var s = steps[i]
            var delay = s.at - ((typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0)
            if (delay > 0) await sleep(delay)
            try { await s.fn() } catch (e) { /* 单步失败不中断整段 */ }
          }
        })()
      }
    }
    return api
  }

  /* ── 动画包注册表 ──────────────────────────────────────────────────────── */
  var packs = {}
  function register(pack) {
    if (!pack || !pack.id) return
    packs[pack.id] = pack
  }
  function getPack(id) { return packs[id] || null }
  function listPacks() {
    return Object.keys(packs).map(function (k) {
      var p = packs[k]
      return { id: p.id, name: p.name || p.id, style: p.style || 'other', builtin: !!p.builtin }
    })
  }

  /* ── 用户名 ──────────────────────────────────────────────────────────────── */
  function getUsername(cfg) {
    var n = cfg && cfg.username
    n = (n == null ? '' : String(n)).trim()
    return n || '博士'
  }

  /* ── 背景层（可调透明度，常驻） ─────────────────────────────────────────── */
  /* 由 background.js 注入具体实现；这里只声明挂载点，避免循环依赖。 */

  /* ── 进入后 UI/UX 通用效果（entrance 未自定义时的兜底） ────────────────── */
  function defaultEntrance(ctx) {
    var tl = ctx.timeline()
    tl.add(0, function () {
      var r = ctx.root
      var ring = el('div', 'a233-entrance-ring',
        'position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:50%;' +
        'transform:translate(-50%,-50%);box-shadow:0 0 0 0 rgba(124,92,255,.5);' +
        'background:rgba(124,92,255,.9);pointer-events:none')
      r.appendChild(ring)
      requestAnimationFrame(function () {
        ring.style.transition = 'box-shadow .9s ease-out, width .9s, height .9s, opacity .9s'
        ring.style.boxShadow = '0 0 0 220px rgba(124,92,255,0)'
        ring.style.width = '260px'; ring.style.height = '260px'; ring.style.opacity = '0'
      })
    })
    tl.wait(900)
    return tl
  }

  /* ── 启动流程编排 ───────────────────────────────────────────────────────── */
  var bannerWarned = false
  async function start(opts) {
    opts = opts || {}
    var cfg = opts.config || (window.__ANIM233__ || {})
    var pack = opts.pack ? getPack(opts.pack) : getPack(cfg.pack)
    if (!pack) pack = getPack('genshin') // 兜底：原神
    if (!root) {
      root = document.getElementById('dsh-startup-root') || document.getElementById('anim233-root')
    }
    if (!root) return

    /* 背景层：常驻，先挂上再播启动动画 */
    if (window.ANIM233 && ANIM233.background && ANIM233.background.mount) {
      try { ANIM233.background.mount(root, cfg) } catch (e) { /* 背景失败不阻断 */ }
    }

    var state = {}
    var ctx = {
      root: root,
      config: cfg,
      username: getUsername(cfg),
      timeline: makeTimeline,
      startup: function (fn) { state.startupFn = fn },
      entrance: function (fn) { state.entranceFn = fn },
      el: el,
      injectStyle: injectStyle,
      getPackId: function () { return pack.id },
      setVar: function (k, v) { root.style.setProperty(k, v) }
    }

    /* 先让 pack 声明 startup/entrance 两段；兼容旧式 build() 直接返回 timeline */
    if (pack.build) {
      var built = await pack.build(ctx)
      if (built && typeof built.run === 'function') {
        await built.run()
        try { window.__ANIM233_SHOWN__ = true } catch (e) {}
        return pack.id
      }
    }

    if (state.startupFn) {
      var sTl = makeTimeline(); state.startupFn(sTl)
      await sTl.run()
    }

    if (state.entranceFn) {
      var eTl = makeTimeline(); state.entranceFn(eTl)
      await eTl.run()
    } else if (cfg.entranceEnabled !== false) {
      var dTl = defaultEntrance(ctx); await dTl.run()
    }

    /* 标记已播放（用于 daily/session 模式，由宿主侧落地） */
    try { window.__ANIM233_SHOWN__ = true } catch (e) {}
    return pack.id
  }

  /* ── 导出 ───────────────────────────────────────────────────────────────── */
  window.ANIM233 = {
    version: '1.0.0',
    register: register,
    getPack: getPack,
    listPacks: listPacks,
    getUsername: getUsername,
    start: start,
    makeTimeline: makeTimeline,
    el: el,
    injectStyle: injectStyle,
    setRoot: setRoot,
    getRoot: getRoot,
    background: {} // 由 background.js 填充
  }
})()
