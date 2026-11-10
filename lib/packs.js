/* ============================================================================
 * anim233 — 内置动画包（13 个热门游戏风格）
 * ----------------------------------------------------------------------------
 * 每个包：{ id, name, style, build(ctx) -> timeline }
 * build 返回一条覆盖「启动 + 进入后」的完整时间线（旧式写法，框架兼容）。
 * 共用一套骨架（标题 + 用户名 + 进度 + 签名母题），母题按游戏各不相同。
 * 用户名默认「博士」，可在设置页改（ctx.username）。
 * ========================================================================== */
(function () {
  'use strict'
  var A = window.ANIM233
  if (!A) return

  /* ── 共享关键帧 ─────────────────────────────────────────────────────────── */
  A.injectStyle('anim233-packs-kf', [
    '@keyframes a233-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}',
    '@keyframes a233-float{0%{transform:translateY(0);opacity:.0}30%{opacity:.8}100%{transform:translateY(-60px);opacity:0}}',
    '@keyframes a233-scan{0%{top:-10%}100%{top:110%}}',
    '@keyframes a233-glitch{0%,100%{transform:translate(-50%,-50%)}20%{transform:translate(calc(-50% - 3px),-50%)}40%{transform:translate(calc(-50% + 3px),-50%)}60%{transform:translate(-50%,calc(-50% - 2px))}}',
    '@keyframes a233-pulse{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.7}50%{transform:translate(-50%,-50%) scale(1.08);opacity:1}}',
    '@keyframes a233-streak{0%{transform:translateX(-120%)}100%{transform:translateX(120%)}}',
    '@keyframes a233-ring{0%{stroke-dashoffset:628}100%{stroke-dashoffset:0}}'
  ].join('\n'))

  /* ── 基础构件 ──────────────────────────────────────────────────────────── */
  function addStage(ctx, bg) {
    var s = A.el('div', 'a233-stage',
      'position:absolute;inset:0;overflow:hidden;background:' + (bg || '#000') +
      ';font-family:system-ui,-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;color:#fff')
    ctx.root.appendChild(s)
    return s
  }
  function center(stage, html, css) {
    var e = A.el('div', null,
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);opacity:0;text-align:center;' +
      'letter-spacing:.14em;line-height:1.4;' + (css || ''))
    e.innerHTML = html
    stage.appendChild(e)
    return e
  }
  function showEl(e, ms, trans) {
    ms = ms || 700
    e.style.transition = 'opacity ' + ms + 'ms ease, transform ' + ms + 'ms ease' + (trans || '')
    e.style.opacity = '1'
  }
  function hideEl(e, ms) {
    e.style.transition = 'opacity ' + (ms || 500) + 'ms ease'
    e.style.opacity = '0'
  }
  function particles(stage, n, colors) {
    for (var i = 0; i < n; i++) {
      var p = A.el('div', null,
        'position:absolute;width:4px;height:4px;border-radius:50%;opacity:0;background:' +
        colors[i % colors.length])
      var x = Math.random() * 100, y = Math.random() * 100, dur = 2 + Math.random() * 3
      p.style.left = x + '%'; p.style.top = y + '%'
      p.style.animation = 'a233-float ' + dur + 's linear infinite'
      p.style.animationDelay = (Math.random() * 3) + 's'
      stage.appendChild(p)
    }
  }
  function progressRing(stage, color) {
    var wrap = A.el('div', null,
      'position:absolute;left:50%;top:72%;transform:translate(-50%,-50%);width:90px;height:90px;opacity:0')
    wrap.innerHTML =
      '<svg viewBox="0 0 200 200" width="90" height="90">' +
      '<circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6"/>' +
      '<circle id="a233-ring-fg" cx="100" cy="100" r="90" fill="none" stroke="' + color +
      '" stroke-width="6" stroke-linecap="round" stroke-dasharray="565" stroke-dashoffset="565" ' +
      'transform="rotate(-90 100 100)"/></svg>'
    stage.appendChild(wrap)
    return {
      el: wrap,
      show: function () { showEl(wrap, 400) },
      fill: function (ms) {
        var fg = wrap.querySelector('#a233-ring-fg')
        fg.style.transition = 'stroke-dashoffset ' + (ms || 2600) + 'ms linear'
        fg.style.strokeDashoffset = '0'
      }
    }
  }

  /* ── 各游戏签名母题 ─────────────────────────────────────────────────────── */
  var MOTIFS = {
    genshin: function (stage) {
      var m = A.el('div', null,
        'position:absolute;left:50%;top:34%;width:84px;height:84px;transform:translate(-50%,-50%) rotate(45deg);' +
        'border:3px solid #7fd6c2;box-shadow:0 0 30px #7fd6c2;animation:a233-spin 9s linear infinite')
      stage.appendChild(m)
      particles(stage, 18, ['#7fd6c2', '#cdeee6', '#a9f0e0'])
      return { start: function () { showEl(m, 900) }, entrance: function () {
        m.style.transition = 'transform 1s ease, opacity 1s'; m.style.opacity = '0'
        m.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(6)'
      } }
    },
    arknights: function (stage) {
      var grid = A.el('div', null,
        'position:absolute;inset:0;opacity:.18;background-image:linear-gradient(#1f6f63 1px,transparent 1px),linear-gradient(90deg,#1f6f63 1px,transparent 1px);background-size:34px 34px')
      stage.appendChild(grid)
      var scan = A.el('div', null,
        'position:absolute;left:0;width:100%;height:3px;background:#ff8a3c;box-shadow:0 0 18px #ff8a3c;animation:a233-scan 2.4s linear infinite')
      stage.appendChild(scan)
      return { start: function () { showEl(grid, 600); showEl(scan, 600) }, entrance: function () {
        scan.style.transition = 'opacity .6s'; scan.style.opacity = '0'
        grid.style.transition = 'opacity .6s'; grid.style.opacity = '0'
      } }
    },
    starrail: function (stage) {
      var streak = A.el('div', null,
        'position:absolute;top:50%;left:0;width:60%;height:2px;background:linear-gradient(90deg,transparent,#9db4ff,#fff);transform:translateY(-50%);opacity:.0;box-shadow:0 0 14px #9db4ff;animation:a233-streak 1.6s ease-in-out infinite')
      stage.appendChild(streak)
      particles(stage, 26, ['#9db4ff', '#cfd8ff', '#ffffff'])
      return { start: function () { showEl(streak, 500) }, entrance: function () {
        streak.style.transition = 'opacity .6s'; streak.style.opacity = '0'
      } }
    },
    honkai3: function (stage) {
      var burst = A.el('div', null,
        'position:absolute;left:50%;top:40%;width:20px;height:20px;border-radius:50%;transform:translate(-50%,-50%);background:#ff4d4d;box-shadow:0 0 40px 12px #ff4d4d')
      stage.appendChild(burst)
      particles(stage, 22, ['#ff4d4d', '#ffd24d', '#ffffff'])
      return { start: function () {
        showEl(burst, 200)
        burst.style.transition = 'transform 1s ease, opacity 1s'; burst.style.transform = 'translate(-50%,-50%) scale(8)'; burst.style.opacity = '.2'
      }, entrance: function () {
        burst.style.transition = 'transform .8s, opacity .8s'; burst.style.transform = 'translate(-50%,-50%) scale(40)'; burst.style.opacity = '0'
      } }
    },
    zzz: function (stage) {
      var neon = A.el('div', null,
        'position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);width:140px;height:140px;border:3px solid #ff2e88;box-shadow:0 0 26px #ff2e88,inset 0 0 26px #00e5ff;animation:a233-glitch .4s steps(2) infinite')
      stage.appendChild(neon)
      return { start: function () { showEl(neon, 500) }, entrance: function () {
        neon.style.transition = 'transform .8s, opacity .8s'; neon.style.opacity = '0'; neon.style.transform = 'translate(-50%,-50%) scale(1.6)'
      } }
    },
    eldenring: function (stage) {
      var ring = A.el('div', null,
        'position:absolute;left:50%;top:36%;width:110px;height:110px;border-radius:50%;transform:translate(-50%,-50%);border:4px solid #e6c34a;box-shadow:0 0 34px #e6c34a;animation:a233-pulse 2.4s ease-in-out infinite')
      stage.appendChild(ring)
      return { start: function () { showEl(ring, 900) }, entrance: function () {
        ring.style.transition = 'transform 1s, opacity 1s'; ring.style.opacity = '0'; ring.style.transform = 'translate(-50%,-50%) scale(4)'
      } }
    },
    zelda: function (stage) {
      var tri = A.el('div', null,
        'position:absolute;left:50%;top:36%;transform:translate(-50%,-50%);width:0;height:0;opacity:0;' +
        'border-left:46px solid transparent;border-right:46px solid transparent;border-bottom:80px solid #c8e6a0;' +
        'filter:drop-shadow(0 0 18px #9fcf6a)')
      stage.appendChild(tri)
      return { start: function () { showEl(tri, 800) }, entrance: function () {
        tri.style.transition = 'transform 1s, opacity 1s'; tri.style.opacity = '0'; tri.style.transform = 'translate(-50%,-50%) scale(2.4) rotate(12deg)'
      } }
    },
    witcher3: function (stage) {
      var sword = A.el('div', null,
        'position:absolute;left:50%;top:38%;width:4px;height:120px;transform:translate(-50%,-50%) rotate(20deg);background:linear-gradient(#cfd6e0,#ffffff);box-shadow:0 0 18px #fff')
      stage.appendChild(sword)
      return { start: function () { showEl(sword, 600) }, entrance: function () {
        sword.style.transition = 'transform .8s, opacity .8s'; sword.style.opacity = '0'; sword.style.transform = 'translate(-50%,-50%) rotate(20deg) scale(3)'
      } }
    },
    monsterhunter: function (stage) {
      var emblem = A.el('div', null,
        'position:absolute;left:50%;top:38%;width:96px;height:96px;border-radius:8px;transform:translate(-50%,-50%) rotate(45deg);border:4px solid #e08a2e;box-shadow:0 0 30px #e08a2e;animation:a233-pulse 2s ease-in-out infinite')
      stage.appendChild(emblem)
      return { start: function () { showEl(emblem, 700) }, entrance: function () {
        emblem.style.transition = 'transform 1s, opacity 1s'; emblem.style.opacity = '0'; emblem.style.transform = 'translate(-50%,-50%) rotate(45deg) scale(3.4)'
      } }
    },
    sekiro: function (stage) {
      var kanji = A.el('div', null,
        'position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);font-size:120px;font-weight:900;color:#e23b3b;text-shadow:0 0 30px #e23b3b;opacity:0')
      kanji.textContent = '死'
      stage.appendChild(kanji)
      return { start: function () { showEl(kanji, 400); }, entrance: function () {
        kanji.style.transition = 'transform .8s, opacity .8s'; kanji.style.opacity = '0'; kanji.style.transform = 'translate(-50%,-50%) scale(2)'
      } }
    },
    league: function (stage) {
      var rune = A.el('div', null,
        'position:absolute;left:50%;top:38%;width:104px;height:104px;border-radius:50%;transform:translate(-50%,-50%);border:3px dashed #1e90ff;box-shadow:0 0 26px #1e90ff;animation:a233-spin 6s linear infinite')
      stage.appendChild(rune)
      return { start: function () { showEl(rune, 700) }, entrance: function () {
        rune.style.transition = 'transform 1s, opacity 1s'; rune.style.opacity = '0'; rune.style.transform = 'translate(-50%,-50%) scale(3)'
      } }
    },
    wangzhe: function (stage) {
      var dragon = A.el('div', null,
        'position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;border:4px solid #f5c542;box-shadow:0 0 34px #f5c542,inset 0 0 20px #e23b3b;animation:a233-pulse 2.2s ease-in-out infinite')
      stage.appendChild(dragon)
      return { start: function () { showEl(dragon, 700) }, entrance: function () {
        dragon.style.transition = 'transform 1s, opacity 1s'; dragon.style.opacity = '0'; dragon.style.transform = 'translate(-50%,-50%) scale(3.2)'
      } }
    },
    cyberpunk: function (stage) {
      var glitch = A.el('div', null,
        'position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);width:140px;height:140px;border:3px solid #fcee0a;box-shadow:0 0 24px #fcee0a;animation:a233-glitch .3s steps(2) infinite')
      stage.appendChild(glitch)
      return { start: function () { showEl(glitch, 400) }, entrance: function () {
        glitch.style.transition = 'transform .8s, opacity .8s'; glitch.style.opacity = '0'; glitch.style.transform = 'translate(-50%,-50%) scale(1.5)'
      } }
    }
  }

  /* ── 游戏定义（标题 + 副标题含用户名 + 配色 + 背景） ───────────────────── */
  var GAMES = [
    { id: 'genshin', name: '原神', style: '二次元', bg: 'radial-gradient(circle at 50% 30%,#0e3b35,#04140f)',
      title: '原神 · GENSHIN IMPACT', sub: function (u) { return u + '，旅途开启' }, accent: '#7fd6c2' },
    { id: 'arknights', name: '明日方舟', style: '科幻', bg: 'linear-gradient(160deg,#0a1f1c,#061412)',
      title: '明日方舟 · RHODES ISLAND', sub: function (u) { return u + '，作战开始' }, accent: '#ff8a3c' },
    { id: 'starrail', name: '星穹铁道', style: '科幻', bg: 'radial-gradient(circle at 50% 40%,#131a3a,#05070f)',
      title: '星穹铁道 · HONKAI: STAR RAIL', sub: function (u) { return u + '，列车启程' }, accent: '#9db4ff' },
    { id: 'honkai3', name: '崩坏3', style: '动作', bg: 'radial-gradient(circle at 50% 40%,#2a0a0a,#0a0303)',
      title: '崩坏3rd · HONKAI IMPACT 3rd', sub: function (u) { return u + '，出击' }, accent: '#ff4d4d' },
    { id: 'zzz', name: '绝区零', style: '都市', bg: 'linear-gradient(160deg,#1a0a1c,#07030a)',
      title: '绝区零 · ZENLESS ZONE ZERO', sub: function (u) { return u + '，欢迎来到新艾利都' }, accent: '#ff2e88' },
    { id: 'eldenring', name: '艾尔登法环', style: '魂系', bg: 'radial-gradient(circle at 50% 40%,#241c08,#0a0803)',
      title: 'ELDEN RING · 艾尔登法环', sub: function (u) { return u + '，黄金树指引你' }, accent: '#e6c34a' },
    { id: 'zelda', name: '塞尔达传说', style: '冒险', bg: 'radial-gradient(circle at 50% 40%,#16240f,#070b05)',
      title: 'THE LEGEND OF ZELDA', sub: function (u) { return u + '，海拉鲁在等待' }, accent: '#c8e6a0' },
    { id: 'witcher3', name: '巫师3', style: '奇幻', bg: 'radial-gradient(circle at 50% 40%,#1a1206,#080502)',
      title: 'THE WITCHER 3 · 狂猎', sub: function (u) { return u + '，白狼出征' }, accent: '#cfd6e0' },
    { id: 'monsterhunter', name: '怪物猎人', style: '狩猎', bg: 'radial-gradient(circle at 50% 40%,#241405,#0a0602)',
      title: 'MONSTER HUNTER', sub: function (u) { return u + '，讨伐开始' }, accent: '#e08a2e' },
    { id: 'sekiro', name: '只狼', style: '忍者', bg: 'radial-gradient(circle at 50% 40%,#1a0606,#080202)',
      title: 'SEKIRO · 只狼：影逝二度', sub: function (u) { return u + '，龙胤在身' }, accent: '#e23b3b' },
    { id: 'league', name: '英雄联盟', style: 'MOBA', bg: 'radial-gradient(circle at 50% 40%,#0a1830,#03060d)',
      title: 'LEAGUE OF LEGENDS', sub: function (u) { return u + '，峡谷见' }, accent: '#1e90ff' },
    { id: 'wangzhe', name: '王者荣耀', style: 'MOBA', bg: 'radial-gradient(circle at 50% 40%,#241a05,#0a0702)',
      title: '王者荣耀 · HONOR OF KINGS', sub: function (u) { return u + '，荣耀竞技' }, accent: '#f5c542' },
    { id: 'cyberpunk', name: '赛博朋克2077', style: '赛博', bg: 'linear-gradient(160deg,#0c0c02,#020202)',
      title: 'CYBERPUNK 2077', sub: function (u) { return 'V · ' + u + '，夜之城属于你' }, accent: '#fcee0a' }
  ]

  GAMES.forEach(function (g) {
    var motif = MOTIFS[g.id]
    A.register({
      id: g.id,
      name: g.name,
      style: g.style,
      builtin: true,
      build: function (ctx) {
        var tl = A.makeTimeline()
        var stage = addStage(ctx, g.bg)
        var m = motif ? motif(stage) : null
        var title = center(stage, g.title,
          'font-size:30px;font-weight:800;text-shadow:0 0 20px ' + g.accent)
        var sub = center(stage, g.sub(ctx.username || '博士'),
          'top:58%;font-size:18px;color:' + g.accent)
        var hint = center(stage, '进入 ▸',
          'top:84%;font-size:13px;color:rgba(255,255,255,.6);letter-spacing:.3em')
        var ring = progressRing(stage, g.accent)

        tl.add(0, function () { if (m) m.start() })
        tl.add(200, function () { showEl(title, 800) })
        tl.add(1100, function () { showEl(sub, 700) })
        tl.add(1500, function () { ring.show(); ring.fill(2400) })
        tl.add(1700, function () { showEl(hint, 500) })
        tl.wait(4200)
        tl.add(4200, function () {
          hideEl(title, 500); hideEl(sub, 500); hideEl(hint, 400)
          if (m) m.entrance()
        })
        tl.add(5000, function () {
          // 进入后：欢迎用户名 + 光幕扫过
          var welcome = center(stage, '欢迎，' + (ctx.username || '博士'),
            'font-size:26px;font-weight:700;color:#fff;text-shadow:0 0 24px ' + g.accent)
          showEl(welcome, 700)
          var sweep = A.el('div', null,
            'position:absolute;inset:0;background:linear-gradient(120deg,transparent 40%,rgba(255,255,255,.18) 50%,transparent 60%);transform:translateX(-100%)')
          stage.appendChild(sweep)
          requestAnimationFrame(function () { sweep.style.transition = 'transform 1s ease'; sweep.style.transform = 'translateX(100%)' })
        })
        tl.wait(6800)
        tl.add(6800, function () {
          stage.style.transition = 'opacity .6s ease'; stage.style.opacity = '0'
        })
        return tl
      }
    })
  })

  // 标记内置包已就绪
  window.__ANIM233_BUILTIN_READY__ = true
})()
