/* ============================================================================
 * anim233 — 背景层
 * ----------------------------------------------------------------------------
 * 一个独立、常驻、可调透明度的背景层框架。支持多种来源：
 *   - preset（内置渐变/动态预设）
 *   - image（本地图片路径，经 Host 路由 /anim233/asset?name=... 下发）
 *   - gradient / video / url
 * 通过 ANIM233.background.mount(root, cfg) 挂载；ANIM233.background.apply(cfg) 实时改样式。
 * 启动动画结束后不卸载本层，进入主界面后背景仍在（除非用户在设置里关掉）。
 * ========================================================================== */
(function () {
  'use strict'

  var layer = null
  var current = null
  var hiddenBySettings = false

  var PRESETS = {
    none: { label: '无', css: '' },
    aurora: {
      label: '极光',
      css: 'background:' +
        'radial-gradient(120% 80% at 20% 10%, rgba(124,92,255,.55), transparent 60%),' +
        'radial-gradient(120% 90% at 80% 20%, rgba(0,212,255,.45), transparent 55%),' +
        'radial-gradient(100% 100% at 50% 100%, rgba(255,110,196,.35), transparent 60%),' +
        'linear-gradient(160deg,#0b0e1a,#141a33)'
    },
    ember: {
      label: '暖焰',
      css: 'background:' +
        'radial-gradient(100% 80% at 50% 0%, rgba(255,160,70,.5), transparent 55%),' +
        'radial-gradient(120% 100% at 50% 100%, rgba(255,80,60,.35), transparent 60%),' +
        'linear-gradient(180deg,#1a0e0a,#2a1410)'
    },
    ocean: {
      label: '深海',
      css: 'background:' +
        'radial-gradient(120% 90% at 30% 20%, rgba(0,140,200,.5), transparent 55%),' +
        'radial-gradient(120% 100% at 70% 90%, rgba(20,80,160,.45), transparent 60%),' +
        'linear-gradient(160deg,#04111f,#0a2236)'
    },
    forest: {
      label: '幽林',
      css: 'background:' +
        'radial-gradient(120% 90% at 50% 10%, rgba(70,200,120,.4), transparent 55%),' +
        'radial-gradient(120% 100% at 50% 100%, rgba(20,120,70,.4), transparent 60%),' +
        'linear-gradient(160deg,#06140d,#0c2418)'
    },
    mono: {
      label: '纯色',
      css: 'background:linear-gradient(160deg,#121212,#1c1c1c)'
    }
  }

  function ensureLayer(root) {
    if (layer && layer.parentNode) return layer
    layer = document.createElement('div')
    layer.className = 'a233-bg'
    layer.style.cssText =
      'position:fixed;inset:0;z-index:2147482000;pointer-events:none;transition:opacity .6s ease;'
    if (root && root.parentNode) root.parentNode.insertBefore(layer, root)
    else document.body.appendChild(layer)
    return layer
  }

  function apply(cfg) {
    if (!layer) return
    cfg = cfg || {}
    var op = Number(cfg.backgroundOpacity)
    if (!isFinite(op)) op = 1
    if (hiddenBySettings) op = 0
    layer.style.opacity = String(op)

    var type = cfg.backgroundType || 'preset'
    var css = ''
    if (type === 'preset') {
      var preset = PRESETS[cfg.backgroundPreset] || PRESETS.aurora
      css = preset.css
      layer.innerHTML = ''
    } else if (type === 'image' && cfg.backgroundImage) {
      css = 'background:transparent'
      layer.innerHTML = ''
      var img = document.createElement('div')
      img.style.cssText = 'position:absolute;inset:0;background-size:cover;background-position:center;' +
        'background-image:url("/anim233/asset?name=' + encodeURIComponent(cfg.backgroundImage) + '")'
      layer.appendChild(img)
    } else if (type === 'gradient' && cfg.backgroundGradient) {
      css = 'background:' + cfg.backgroundGradient
      layer.innerHTML = ''
    } else if (type === 'url' && cfg.backgroundUrl) {
      css = 'background:transparent'
      layer.innerHTML = ''
      var u = document.createElement('div')
      u.style.cssText = 'position:absolute;inset:0;background-size:cover;background-position:center;' +
        'background-image:url("' + encodeURI(cfg.backgroundUrl) + '")'
      layer.appendChild(u)
    } else {
      css = PRESETS.aurora.css
      layer.innerHTML = ''
    }
    layer.style.cssText = layer.style.cssText.replace(/background:[^;]+;?/g, '')
    layer.style.cssText += css + ';opacity:' + op + ';'
  }

  function mount(root, cfg) {
    cfg = cfg || {}
    if (cfg.backgroundEnabled === false) return
    ensureLayer(root)
    apply(cfg)
    current = cfg
  }

  function unmount() {
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer)
    layer = null
  }

  function setHidden(v) {
    hiddenBySettings = !!v
    if (layer) layer.style.opacity = hiddenBySettings ? '0' : String((current && Number(current.backgroundOpacity)) || 1)
  }

  function listPresets() {
    return Object.keys(PRESETS).map(function (k) {
      return { id: k, label: PRESETS[k].label }
    })
  }

  window.__ANIM233_BG_PRESETS__ = listPresets()
  window.ANIM233.background = {
    mount: mount,
    apply: apply,
    unmount: unmount,
    setHidden: setHidden,
    listPresets: listPresets,
    PRESETS: PRESETS
  }
})()
