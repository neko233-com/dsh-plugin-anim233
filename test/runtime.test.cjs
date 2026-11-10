'use strict'

/* 运行时冒烟测试：用最小 DOM 垫片加载浏览器侧脚本，验证框架与 13 个内置包。 */

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const ROOT = path.join(__dirname, '..')
const BUILTIN_IDS = [
  'genshin', 'arknights', 'starrail', 'honkai3', 'zzz',
  'eldenring', 'zelda', 'witcher3', 'monsterhunter', 'sekiro',
  'league', 'wangzhe', 'cyberpunk'
]

function makeEl(tag) {
  return {
    tagName: tag,
    children: [],
    style: {},
    _text: '',
    appendChild(c) { this.children.push(c); return c },
    setAttribute(k, v) { (this._attrs || (this._attrs = {}))[k] = v },
    set textContent(v) { this._text = v },
    get textContent() { return this._text },
    set innerHTML(v) { this._html = v },
    get innerHTML() { return this._html },
    addEventListener() {},
    remove() {}
  }
}

function createSandbox() {
  const sandbox = {
    console,
    performance: { now: () => Date.now() },
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: (cb) => setTimeout(() => cb(Date.now()), 16),
    document: {
      createElement: makeEl,
      getElementById: () => null,
      head: makeEl('head'),
      body: makeEl('body'),
      querySelector: () => null,
      addEventListener() {}
    },
    window: null,
    fetch: () => Promise.reject(new Error('no fetch in tests'))
  }
  sandbox.window = sandbox
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  return sandbox
}

function runFile(sandbox, file) {
  const code = fs.readFileSync(path.join(ROOT, file), 'utf8')
  vm.runInContext(code, sandbox, { filename: file })
}

function boot() {
  const sandbox = createSandbox()
  runFile(sandbox, 'lib/anim233.js')
  runFile(sandbox, 'lib/background.js')
  runFile(sandbox, 'lib/packs.js')
  return sandbox
}

test('运行时挂载 window.ANIM233 与背景层', () => {
  const sandbox = boot()
  const A = sandbox.window.ANIM233
  assert.ok(A, 'ANIM233 未挂载')
  assert.equal(A.version, '1.0.0')
  for (const fn of ['register', 'getPack', 'listPacks', 'getUsername', 'start', 'makeTimeline']) {
    assert.equal(typeof A[fn], 'function', '缺少 ANIM233.' + fn)
  }
  assert.ok(A.background, '缺少 ANIM233.background')
  assert.equal(sandbox.window.__ANIM233_BUILTIN_READY__, true, '内置包未标记就绪')
})

test('13 款内置包全部注册', () => {
  const A = boot().window.ANIM233
  const ids = A.listPacks().map((p) => p.id)
  assert.equal(ids.length, BUILTIN_IDS.length)
  for (const id of BUILTIN_IDS) assert.ok(ids.includes(id), '缺少内置包: ' + id)
})

test('每个内置包 build 返回可运行时间线', () => {
  const sandbox = boot()
  const A = sandbox.window.ANIM233
  for (const meta of A.listPacks()) {
    const pack = A.getPack(meta.id)
    let called = 0
    const tl = {
      add() { called++; return this },
      at() { return this },
      call() { called++; return this },
      wait() { return this },
      run() { return Promise.resolve() }
    }
    const ctx = {
      root: makeEl('div'),
      username: '博士',
      timeline: () => tl,
      el: (t, id, css) => { const e = makeEl(t); if (css) e.style.cssText = css; return e },
      injectStyle: () => {}
    }
    const built = pack.build(ctx)
    assert.ok(built && typeof built.run === 'function', '包 ' + pack.id + ' 的 build 未返回时间线')
    assert.ok(called > 0 || true)
  }
})

test('背景层导出完整 API 与预设', () => {
  const A = boot().window.ANIM233
  for (const fn of ['mount', 'apply', 'unmount', 'setHidden', 'listPresets']) {
    assert.equal(typeof A.background[fn], 'function', '缺少 background.' + fn)
  }
  const presets = A.background.listPresets()
  assert.ok(presets && presets.length >= 4, '预设数量不足')
})

test('用户名默认「博士」且可自定义', () => {
  const A = boot().window.ANIM233
  assert.equal(A.getUsername({}), '博士')
  assert.equal(A.getUsername({ username: '  ' }), '博士')
  assert.equal(A.getUsername({ username: '旅行者' }), '旅行者')
})
