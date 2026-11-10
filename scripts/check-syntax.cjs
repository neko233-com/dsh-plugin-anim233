'use strict'

/* 独立语法检查：node scripts/check-syntax.cjs（CI 与本地 verify 共用）。 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')

const TARGETS = [
  { file: 'lib/index.js', inputType: 'module' },
  { file: 'lib/client.js', inputType: 'commonjs' },
  { file: 'lib/anim233.js', inputType: 'commonjs' },
  { file: 'lib/background.js', inputType: 'commonjs' },
  { file: 'lib/packs.js', inputType: 'commonjs' },
  { file: 'lib/splash.js', inputType: 'commonjs' },
  { file: 'examples/sample-pack/pack.js', inputType: 'commonjs' },
  { file: 'test/runtime.test.cjs', inputType: 'commonjs' },
  { file: 'test/static.test.cjs', inputType: 'commonjs' },
  { file: 'scripts/check-syntax.cjs', inputType: 'commonjs' }
]

let failed = 0
for (const { file, inputType } of TARGETS) {
  const abs = path.join(ROOT, file)
  if (!fs.existsSync(abs)) {
    console.error('✗ 缺少文件: ' + file)
    failed++
    continue
  }
  const code = fs.readFileSync(abs, 'utf8')
  const r = spawnSync(process.execPath, ['--check', '--input-type=' + inputType, '-'], {
    input: code,
    encoding: 'utf8'
  })
  if (r.status === 0) {
    console.log('✓ ' + file)
  } else {
    console.error('✗ ' + file + '\n' + (r.stderr || ''))
    failed++
  }
}

if (failed > 0) {
  console.error(`\n语法检查失败：${failed} 个文件`)
  process.exit(1)
}
console.log('\n全部通过。')
