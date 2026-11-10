/* ============================================================================
 * anim233 — Host 半侧
 * ----------------------------------------------------------------------------
 * 职责：
 *   1) 往 index.html 注入首屏兜底黑幕 + 启动动画脚本（anim233.js/background.js/
 *      packs.js/splash.js），支持第三方/用户导入的 pack 脚本一并加载
 *   2) 提供 /anim233/* 路由：
 *        /anim233/config           GET/POST 配置读写（用户名、背景、包选择…）
 *        /anim233/asset            GET 背景图片/音效（白名单，防穿越）
 *        /anim233/packs            GET 已扫描到的 pack 列表（内置 + 导入）
 *        /anim233/packs/:id.js     GET 单个导入 pack 的脚本
 *        /anim233/import           POST git 克隆/拉取别人的动画包到本地库
 *   3) 配置持久化到 ~/.dsh/anim233.json
 *   4) 扫描 PACKS_DIR 下导入的 pack（每个目录一个 pack.js + manifest.json）
 * ========================================================================== */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileP = promisify(execFile)

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DSH_HOME = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const CONFIG_FILE = path.join(DSH_HOME, 'anim233.json')
const PACKS_DIR = path.join(DSH_HOME, 'anim233-packs')

const NS = 'anim233'
const ROUTE_BASE = '/anim233'

/* ── 默认配置 ─────────────────────────────────────────────────────────────── */
const DEFAULTS = {
  enabled: true,
  mode: 'session',            // always | session | daily
  pack: 'genshin',            // 当前启动动画包 id
  allowSkip: true,
  entranceEnabled: true,      // 进入后 UI/UX 动画
  speed: 1,
  /* 用户名：默认「博士」，可在设置页改 */
  username: '博士',
  /* 背景层（可调透明度，常驻） */
  backgroundEnabled: true,
  backgroundOpacity: 0.55,
  backgroundType: 'preset',   // preset | image | gradient | url
  backgroundPreset: 'aurora',
  backgroundImage: '',
  backgroundGradient: '',
  backgroundUrl: ''
}

const ENUMS = {
  mode: ['always', 'session', 'daily'],
  pack: [],                // 运行时由扫描结果填充
  backgroundType: ['preset', 'image', 'gradient', 'url'],
  backgroundPreset: ['aurora', 'ember', 'ocean', 'forest', 'mono', 'none']
}
const BOOL_KEYS = ['enabled', 'allowSkip', 'entranceEnabled', 'backgroundEnabled']
const RANGES = { speed: [0.35, 3], backgroundOpacity: [0, 1] }
const TEXT_KEYS = ['pack', 'username', 'backgroundImage', 'backgroundGradient', 'backgroundUrl', 'backgroundPreset']

function normalize(input) {
  const out = { ...DEFAULTS }
  const src = input && typeof input === 'object' ? input : {}
  for (const key of Object.keys(DEFAULTS)) {
    if (!(key in src) || src[key] === undefined || src[key] === null) continue
    const value = src[key]
    if (BOOL_KEYS.includes(key)) {
      out[key] = value === true || value === 'true' || value === 1 || value === '1'
    } else if (ENUMS[key] && ENUMS[key].length) {
      out[key] = ENUMS[key].includes(value) ? value : DEFAULTS[key]
    } else if (key === 'speed' || RANGES[key]) {
      const [lo, hi] = RANGES[key] || RANGES.speed
      const n = Number(value)
      out[key] = Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : DEFAULTS[key]
    } else if (TEXT_KEYS.includes(key)) {
      out[key] = String(value).slice(0, 128)
    } else {
      out[key] = value
    }
  }
  if (!String(out.username).trim()) out.username = DEFAULTS.username
  return out
}

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf8')
    return normalize(JSON.parse(raw))
  } catch (err) {
    return { ...DEFAULTS }
  }
}

function writeConfig(next) {
  const cfg = normalize(next)
  fs.mkdirSync(path.dirname(CONFIG_FILE), { recursive: true })
  const tmp = CONFIG_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(cfg, null, 2), 'utf8')
  fs.renameSync(tmp, CONFIG_FILE)
  return cfg
}

function makeReader(rel) {
  let cache = null
  return function read() {
    const file = path.join(PACKAGE_ROOT, rel)
    try {
      const st = fs.statSync(file)
      if (!cache || cache.mtimeMs !== st.mtimeMs) {
        cache = { mtimeMs: st.mtimeMs, text: fs.readFileSync(file, 'utf8') }
      }
      return cache.text
    } catch (err) {
      return ''
    }
  }
}

const readAnim233 = makeReader('lib/anim233.js')
const readBackground = makeReader('lib/background.js')
const readPacks = makeReader('lib/packs.js')
const readSplash = makeReader('lib/splash.js')

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '')
}

/* ── 扫描导入的 pack ──────────────────────────────────────────────────────── */
function scanPacks() {
  const list = []
  try {
    fs.mkdirSync(PACKS_DIR, { recursive: true })
    const dirs = fs.readdirSync(PACKS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
    for (const d of dirs) {
      const dir = path.join(PACKS_DIR, d.name)
      const manifestPath = path.join(dir, 'manifest.json')
      const scriptPath = path.join(dir, 'pack.js')
      if (!fs.existsSync(scriptPath)) continue
      let meta = {}
      try { meta = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) } catch (e) {}
      list.push({
        id: 'imported:' + d.name,
        dir: d.name,
        name: meta.name || d.name,
        style: meta.style || 'imported',
        builtin: false,
        hasManifest: fs.existsSync(manifestPath)
      })
    }
  } catch (e) { /* noop */ }
  return list
}

/* 维护 ENUMS.pack，供 normalize 使用 */
function refreshPackEnum() {
  const builtin = ['genshin', 'arknights', 'starrail', 'honkai3', 'zzz', 'eldenring',
    'zelda', 'witcher3', 'monsterhunter', 'sekiro', 'league', 'wangzhe', 'cyberpunk']
  const imported = scanPacks().map(p => p.id)
  ENUMS.pack = builtin.concat(imported)
}

/* ── 首屏注入 ─────────────────────────────────────────────────────────────── */
const CRITICAL_CSS = [
  'html.a233-lock,html.a233-lock body{overflow:hidden!important}',
  'html.a233-lock body{background-color:#000!important}',
  ':root{--a233-boot-bg:#000}',
  '#anim233-root.a233-boot{position:fixed;inset:0;z-index:2147483000;background:#000}'
].join('')

const BOOTSTRAP_JS = `(function(){try{
var c=window.__ANIM233__||{};
var root=document.getElementById('anim233-root');
var off=!c.enabled;
if(!off&&c.mode==='session'&&sessionStorage.getItem('anim233:shown')==='1')off=true;
if(!off&&c.mode==='daily'&&localStorage.getItem('anim233:day')===new Date().toISOString().slice(0,10))off=true;
if(off){window.__ANIM233_SKIP__=true;if(root&&root.parentNode)root.parentNode.removeChild(root);}
else{document.documentElement.classList.add('a233-lock');setTimeout(function(){try{if(window.__ANIM233_RUNNING__===true)return;var r=document.getElementById('anim233-root');if(r&&r.parentNode)r.parentNode.removeChild(r);document.documentElement.classList.remove('a233-lock');if(document.body)document.body.style.overflow='';window.__ANIM233_FAILED__=true;}catch(e){}},9000);}
}catch(e){} })()`

const name = NS
const inject = ['webServer', 'connection']

function resolveWebServer(ctx) {
  try {
    const viaGet = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
    if (viaGet) return viaGet
  } catch (err) { /* noop */ }
  return ctx.webServer
}

function hasRoutes(server) {
  return !!server && typeof server.register === 'function' && typeof server.tapIndex === 'function'
}

/* 把导入的 pack 脚本列表拼成 <script> 标签 */
function importedPackScripts() {
  return scanPacks().map(p =>
    '<script defer src="' + ROUTE_BASE + '/packs/' + encodeURIComponent(p.dir) + '.js"></script>'
  ).join('')
}

function apply(ctx) {
  const disposers = []
  const webServer = resolveWebServer(ctx)

  if (!hasRoutes(webServer)) {
    try {
      ctx.logger?.warn?.('[' + NS + '] 当前 profile 没有可用的 webServer（桌面端可能用 file:// + IPC）；' +
        'Host 半侧跳过路由与首屏注入，改由客户端半侧自举。')
    } catch (e) {}
    return
  }

  function rejected(req, res) {
    try {
      const conn = (typeof ctx.get === 'function' ? ctx.get('connection') : undefined) || ctx.connection
      if (!conn || typeof conn.requestRejection !== 'function') return false
      const code = conn.requestRejection(req)
      if (code === undefined || code === null || code === false) return false
      res.statusCode = typeof code === 'number' ? code : 403
      res.end()
      return true
    } catch (err) {
      return false
    }
  }

  function registerRoute(route) {
    const inner = route && route.handler
    const wrapped = Object.assign({}, route, {
      handler: async (req, res) => {
        if (rejected(req, res)) return
        return inner(req, res)
      }
    })
    return webServer.register(wrapped)
  }

  function sendJson(res, code, payload) {
    const body = Buffer.from(JSON.stringify(payload), 'utf8')
    res.writeHead(code, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': String(body.length)
    })
    res.end(body)
  }

  function sendText(res, type, text) {
    const body = Buffer.from(text, 'utf8')
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Content-Length': String(body.length)
    })
    res.end(body)
  }

  refreshPackEnum()

  /* 核心脚本 */
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/anim233.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readAnim233())
  }))
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/background.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readBackground())
  }))
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/packs.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readPacks())
  }))
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/splash.js',
    handler: (req, res) => sendText(res, 'application/javascript; charset=utf-8', readSplash())
  }))

  /* 背景图片 / 音效：白名单，防目录穿越 */
  disposers.push(registerRoute({
    kind: 'prefix', path: ROUTE_BASE + '/asset',
    handler: (req, res) => {
      const name = path.basename(decodeURIComponent((req.url || '').split('?')[0]))
      if (!/^[a-z0-9._-]+\.(mp3|png|jpg|jpeg|webp|gif|svg)$/i.test(name) || name.includes('..')) {
        res.writeHead(404); res.end(); return
      }
      const file = path.join(DSH_HOME, 'anim233-assets', name)
      let bytes
      try { bytes = fs.readFileSync(file) } catch (err) { res.writeHead(404); res.end(); return }
      const ct = /\.mp3$/i.test(name) ? 'audio/mpeg'
        : /\.png$/i.test(name) ? 'image/png'
          : /\.svg$/i.test(name) ? 'image/svg+xml' : 'image/jpeg'
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400', 'Content-Length': String(bytes.length) })
      res.end(bytes)
    }
  }))

  /* pack 列表 */
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/packs',
    handler: (req, res) => {
      const builtin = ['genshin', 'arknights', 'starrail', 'honkai3', 'zzz', 'eldenring',
        'zelda', 'witcher3', 'monsterhunter', 'sekiro', 'league', 'wangzhe', 'cyberpunk']
      const imported = scanPacks()
      sendJson(res, 200, {
        ok: true,
        builtin: builtin.map(id => ({ id, builtin: true })),
        imported
      })
    }
  }))

  /* 单个导入 pack 脚本 */
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/packs/:dir.js',
    handler: (req, res) => {
      const dir = path.basename(String(req.params?.dir || '').replace(/\.js$/, ''))
      const file = path.join(PACKS_DIR, dir, 'pack.js')
      let text
      try { text = fs.readFileSync(file, 'utf8') } catch (e) { res.writeHead(404); res.end(); return }
      sendText(res, 'application/javascript; charset=utf-8', text)
    }
  }))

  /* 配置读写 */
  disposers.push(registerRoute({
    kind: 'exact', path: ROUTE_BASE + '/config',
    handler: async (req, res) => {
      const method = (req.method || 'GET').toUpperCase()
      if (method === 'GET') {
        refreshPackEnum()
        sendJson(res, 200, { ok: true, config: readConfig(), defaults: DEFAULTS, file: CONFIG_FILE, packsDir: PACKS_DIR })
        return
      }
      if (method !== 'POST') { sendJson(res, 405, { ok: false, error: 'method not allowed' }); return }
      const text = await readBody(req)
      let payload = {}
      try { payload = text ? JSON.parse(text) : {} } catch (err) { sendJson(res, 400, { ok: false, error: 'invalid json' }); return }
      try {
        if (payload && payload.action === 'reset') {
          const cfgNow = writeConfig(DEFAULTS)
          sendJson(res, 200, { ok: true, config: cfgNow, defaults: DEFAULTS })
          return
        }
        if (payload && payload.action === 'import') {
          const result = await importPack(payload.url, payload.dir)
          refreshPackEnum()
          sendJson(res, result.ok ? 200 : 500, result)
          return
        }
        refreshPackEnum()
        const current = readConfig()
        const patch = payload && typeof payload.patch === 'object' && payload.patch ? payload.patch : payload
        const cfgNow = writeConfig({ ...current, ...patch })
        sendJson(res, 200, { ok: true, config: cfgNow, defaults: DEFAULTS })
      } catch (err) {
        sendJson(res, 500, { ok: false, error: String((err && err.message) || err) })
      }
    }
  }))

  async function readBody(req, limit = 256 * 1024) {
    return new Promise((resolve) => {
      let size = 0
      const chunks = []
      req.on('data', (c) => {
        size += c.length
        if (size > limit) { req.destroy(); resolve(''); return }
        chunks.push(c)
      })
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      req.on('error', () => resolve(''))
    })
  }

  /* git 导入别人的动画包 */
  async function importPack(url, dir) {
    if (!url || typeof url !== 'string' || !/^https?:\/\//.test(url)) {
      return { ok: false, error: 'invalid git url' }
    }
    const safeDir = (dir && typeof dir === 'string' && /^[a-z0-9._-]+$/i.test(dir))
      ? dir : path.basename(url).replace(/\.git$/, '').replace(/[^a-z0-9._-]/gi, '_')
    const target = path.join(PACKS_DIR, safeDir)
    try {
      fs.mkdirSync(PACKS_DIR, { recursive: true })
      if (fs.existsSync(target)) {
        // 已存在：尝试 git pull
        await execFileP('git', ['-C', target, 'pull', '--ff-only'], { timeout: 60000 })
      } else {
        await execFileP('git', ['clone', '--depth', '1', url, target], { timeout: 120000 })
      }
      const hasScript = fs.existsSync(path.join(target, 'pack.js'))
      if (!hasScript) {
        return { ok: false, error: '该仓库缺少 pack.js（动画包需含 pack.js + 可选 manifest.json）' }
      }
      // 校验 pack.js 仅调用 window.ANIM233.register，避免执行任意代码
      const code = fs.readFileSync(path.join(target, 'pack.js'), 'utf8')
      if (!/window\.ANIM233\.register\s*\(/.test(code) && !/ANIM233\.register\s*\(/.test(code)) {
        return { ok: false, error: 'pack.js 未调用 ANIM233.register，已拒绝加载' }
      }
      return { ok: true, dir: safeDir, name: safeDir }
    } catch (err) {
      return { ok: false, error: String((err && err.message) || err) }
    }
  }

  /* 首屏注入 */
  disposers.push(webServer.tapIndex((html) => {
    if (!html || html.includes(ROUTE_BASE + '/splash.js')) return html
    const cfg = readConfig()
    const head =
      '<style id="anim233-critical">' + CRITICAL_CSS + '</style>'
    const body =
      '<div id="anim233-root" class="a233-root a233-boot"></div>' +
      '<script>window.__ANIM233__=' + safeJson(cfg) + ';' + BOOTSTRAP_JS + '</script>' +
      '<script defer src="' + ROUTE_BASE + '/anim233.js"></script>' +
      '<script defer src="' + ROUTE_BASE + '/background.js"></script>' +
      '<script defer src="' + ROUTE_BASE + '/packs.js"></script>' +
      importedPackScripts() +
      '<script defer src="' + ROUTE_BASE + '/splash.js"></script>'

    let out = html
    if (out.includes('</head>')) out = out.replace('</head>', head + '</head>')
    else out = head + out
    if (out.includes('<body>')) out = out.replace('<body>', '<body>' + body)
    else if (out.includes('</body>')) out = out.replace('</body>', body + '</body>')
    else out = out + body
    return out
  }))

  ctx.effect(() => () => {
    for (const dispose of disposers) {
      try { dispose() } catch (err) { /* noop */ }
    }
  })
}

export { apply, inject, name }
