/* Node 端最小 DOM 垫片，验证 anim233.js + packs.js 在浏览器侧不抛错。 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const elements = []
function makeEl(tag) {
  const e = {
    tagName: tag, children: [], style: {}, _text: '',
    appendChild(c) { this.children.push(c); return c },
    setAttribute(k, v) { (this._attrs || (this._attrs = {}))[k] = v },
    set textContent(v) { this._text = v }, get textContent() { return this._text },
    set innerHTML(v) { this._html = v }, get innerHTML() { return this._html },
    addEventListener() {}, remove() {},
  }
  elements.push(e); return e
}
const styleTags = []
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
    addEventListener() {},
  },
  window: null,
  fetch: () => Promise.reject(new Error('no fetch in smoke')),
}
sandbox.window = sandbox
sandbox.globalThis = sandbox
vm.createContext(sandbox)

function run(file) {
  const code = fs.readFileSync(path.join(__dirname, file), 'utf8')
  vm.runInContext(code, sandbox, { filename: file })
}
run('lib/anim233.js')
run('lib/background.js')
run('lib/packs.js')

const ANIM233 = sandbox.window.ANIM233
if (!ANIM233) throw new Error('ANIM233 未挂载')
const packs = ANIM233.listPacks()
console.log('注册包数量:', packs.length)
const names = packs.map(p => p.id)
const expected = ['genshin','arknights','starrail','honkai3','zzz','eldenring','zelda','witcher3','monsterhunter','sekiro','league','wangzhe','cyberpunk']
for (const id of expected) if (!names.includes(id)) throw new Error('缺少内置包: ' + id)
console.log('内置 13 款全部注册:', names.join(', '))

/* 逐个构造 build(ctx) 的 ctx，确保不抛错（不跑动画，只建节点） */
for (const meta of packs) {
  const p = ANIM233.getPack(meta.id)
  const tl = { steps: [], add(at,fn){ this.steps.push(fn); return this }, at(n){ return this }, call(f){ this.steps.push(f); return this }, wait(){ return this }, run(){ return Promise.resolve() } }
  const ctx = {
    root: makeEl('div'),
    username: '博士',
    timeline: () => tl,
    el: (t, id, css) => { const e = makeEl(t); if (css) e.style.cssText = css; return e },
    injectStyle: () => {},
  }
  const built = p.build(ctx)
  if (!built || typeof built.run !== 'function') throw new Error('包 ' + p.id + ' 的 build 未返回时间线')
  console.log('  ✓', p.id, '(', p.name, '/', p.style, ') build OK')
}
console.log('背景层 API:', Object.keys(sandbox.window.ANIM233.background).join(', '))
console.log('SMOKE_OK')
