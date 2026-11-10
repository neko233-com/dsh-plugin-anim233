'use strict'

/* 兼容入口：等价于 `node --test test/`。 */
const { execFileSync } = require('node:child_process')
const path = require('node:path')

execFileSync(process.execPath, ['--test', path.join(__dirname, 'test', '*.test.cjs')], { stdio: 'inherit' })
