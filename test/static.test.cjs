'use strict'

/* 静态契约测试：包元数据、必需文件、路由声明、语法检查（无需浏览器）。 */

const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

const LIB_FILES = [
  'lib/index.js',
  'lib/client.js',
  'lib/anim233.js',
  'lib/background.js',
  'lib/packs.js',
  'lib/splash.js'
]

test('package.json 元数据与 DSH 声明完整', () => {
  const pkg = JSON.parse(read('package.json'))
  assert.equal(pkg.name, 'dsh-plugin-anim233')
  assert.ok(pkg.version)
  assert.equal(pkg.type, 'module')
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml')
  assert.ok(Array.isArray(pkg.dsh.client.inject) && pkg.dsh.client.inject.length > 0)
  assert.equal(pkg.exports['.'], './lib/index.js')
  assert.equal(pkg.exports['./client'], './lib/client.js')
})

test('cordis.patch.yml 声明了正确的挂载 id', () => {
  const text = read('cordis.patch.yml')
  assert.match(text, /id:\s*dsh-plugin-anim233/)
  assert.match(text, /name:\s*dsh-plugin-anim233/)
})

test('必需文件齐全', () => {
  for (const f of [
    ...LIB_FILES,
    'README.md', 'INSTALL.md', 'LICENSE', 'icon.svg',
    'examples/sample-pack/pack.js',
    'examples/sample-pack/manifest.json',
    'examples/sample-pack/README.md',
    'scripts/check-syntax.cjs'
  ]) {
    assert.ok(fs.existsSync(path.join(ROOT, f)), '缺少文件: ' + f)
  }
})

test('Host 半侧声明了全部路由', () => {
  const host = read('lib/index.js')
  for (const route of [
    '/anim233.js', '/background.js', '/packs.js', '/splash.js',
    '/asset', '/packs', '/config'
  ]) {
    assert.ok(host.includes(route), '缺少路由声明: ' + route)
  }
  assert.match(host, /tapIndex/, '缺少 tapIndex 首屏注入')
  assert.match(host, /__ANIM233__/, '缺少 bootstrap 配置注入')
})

test('浏览器半侧注册设置页 slot', () => {
  const client = read('lib/client.js')
  assert.match(client, /__ModuleLoader__\.load/)
  assert.match(client, /settings\.section/)
  assert.match(client, /id:\s*['"]anim233['"]/)
})

test('所有源码通过 node --check 语法检查', () => {
  for (const f of [...LIB_FILES, 'examples/sample-pack/pack.js']) {
    const code = fs.readFileSync(path.join(ROOT, f), 'utf8')
    const inputType = f === 'lib/index.js' ? 'module' : 'commonjs'
    const r = spawnSync(process.execPath, ['--check', '--input-type=' + inputType, '-'], {
      input: code,
      encoding: 'utf8'
    })
    assert.equal(r.status, 0, '语法错误: ' + f + '\n' + (r.stderr || ''))
  }
})
