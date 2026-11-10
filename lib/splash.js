/* ============================================================================
 * anim233 — 启动编排（splash）
 * ----------------------------------------------------------------------------
 * 由 Host 注入：先加载 anim233.js / background.js / 各 pack 脚本，最后加载本文件。
 * 本文件负责：建根、读取配置、处理跳过、调用 ANIM233.start、向设置页暴露重播 API。
 * ========================================================================== */
(function () {
  'use strict'

  var NS = 'anim233'
  var ROUTE = '/anim233'

  function cfg() {
    try { return window.__ANIM233__ || {} } catch (e) { return {} }
  }

  function ensureRoot() {
    var r = document.getElementById('anim233-root') || document.getElementById('dsh-startup-root')
    if (!r) {
      r = document.createElement('div')
      r.id = 'anim233-root'
      r.className = 'a233-root a233-boot'
      r.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:transparent'
      if (document.body) document.body.appendChild(r)
    }
    if (ANIM233) ANIM233.setRoot(r)
    return r
  }

  function flag(store, key) {
    try { return window[store] ? window[store].getItem(key) : null } catch (e) { return null }
  }
  function writeFlag(store, key, v) {
    try { if (window[store]) window[store].setItem(key, v) } catch (e) {}
  }

  function shouldPlay(c) {
    if (c.enabled === false) return false
    var today = new Date().toISOString().slice(0, 10)
    if (c.mode === 'session' && flag('sessionStorage', 'anim233:shown') === '1') return false
    if (c.mode === 'daily' && flag('localStorage', 'anim233:day') === today) return false
    return true
  }

  function finish(c) {
    try {
      var r = document.getElementById('anim233-root') || document.getElementById('dsh-startup-root')
      if (r && r.parentNode) {
        // 启动动画节点淡出；背景层（.a233-bg）归 background.js 管，不删
        r.style.transition = 'opacity .5s ease'
        r.style.opacity = '0'
        setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r) }, 520)
      }
      if (document.documentElement.classList) document.documentElement.classList.remove('a233-lock')
      if (document.body && document.body.style) document.body.style.overflow = ''
      if (c.mode === 'session') writeFlag('sessionStorage', 'anim233:shown', '1')
      if (c.mode === 'daily') writeFlag('localStorage', 'anim233:day', today())
    } catch (e) {}
    function today() { return new Date().toISOString().slice(0, 10) }
  }

  function buildSkip(c) {
    if (c.allowSkip === false) return
    var r = document.getElementById('anim233-root')
    if (!r) return
    var skip = document.createElement('button')
    skip.className = 'a233-skip'
    skip.textContent = '跳过 ▸'
    skip.style.cssText =
      'position:fixed;top:16px;right:18px;z-index:2147483100;cursor:pointer;' +
      'font:600 13px/1 system-ui,sans-serif;color:rgba(255,255,255,.85);' +
      'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.25);' +
      'border-radius:999px;padding:8px 14px;backdrop-filter:blur(6px)'
    skip.addEventListener('click', function () {
      window.__ANIM233_SKIP__ = true
      finish(c)
    })
    document.body.appendChild(skip)
    var killer = setInterval(function () {
      if (!document.getElementById('anim233-root')) {
        if (skip.parentNode) skip.parentNode.removeChild(skip)
        clearInterval(killer)
      }
    }, 400)
  }

  async function boot() {
    var c = cfg()
    if (!shouldPlay(c)) {
      var dead = document.getElementById('anim233-root')
      if (dead && dead.parentNode) dead.parentNode.removeChild(dead)
      return
    }
    if (document.documentElement.classList) document.documentElement.classList.add('a233-lock')
    if (document.body && document.body.style) document.body.style.overflow = 'hidden'

    var root = ensureRoot()
    window.__ANIM233_RUNNING__ = true
    buildSkip(c)

    try {
      await ANIM233.start({ config: c })
    } catch (e) {
      // 启动动画失败绝不允许黑屏
      if (typeof console !== 'undefined' && console.warn) console.warn('[anim233] start failed:', e)
    }
    window.__ANIM233_RUNNING__ = false
    finish(c)
  }

  // 暴露给设置页的预览/重播 API（始终可用，不受「已播放」标记影响）
  window.__ANIM233_API__ = {
    replay: function () {
      // 清掉 session/daily 标记，强制重播
      try { if (window.sessionStorage) sessionStorage.removeItem('anim233:shown') } catch (e) {}
      try { if (window.localStorage) localStorage.removeItem('anim233:day') } catch (e) {}
      var old = document.getElementById('anim233-root')
      if (old && old.parentNode) old.parentNode.removeChild(old)
      var bg = document.querySelector('.a233-bg')
      if (bg && bg.parentNode) bg.parentNode.removeChild(bg)
      window.__ANIM233__ = cfg()
      boot()
    }
  }

  // 兜底：9 秒内没跑起来就放行，绝不锁屏
  setTimeout(function () {
    try {
      if (window.__ANIM233_RUNNING__ === true) return
      var r = document.getElementById('anim233-root')
      if (r && r.className && r.className.indexOf('a233-boot') !== -1) {
        if (r.parentNode) r.parentNode.removeChild(r)
        if (document.documentElement.classList) document.documentElement.classList.remove('a233-lock')
        if (document.body && document.body.style) document.body.style.overflow = ''
      }
    } catch (e) {}
  }, 9000)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot)
  } else {
    boot()
  }
})()
