'use strict'

/*
 * 本地安装脚本（不依赖 npm registry）。
 *
 *   node scripts/install.cjs [--profile desktop] [--path <插件目录>]
 *
 * 做三件事：
 *   1. 优先用 `dsh plugin --profile <p> add link:<dir>` 把本目录链接进 profile；
 *   2. 兜底：手动在 profile 的 node_modules 建 junction，并写入 dependencies；
 *   3. 确保 package.json 的 dsh.profile.bundles 包含本包（否则 loader 不会挂载）。
 *
 * 安装完成后重启 DSH（或重开应用），再刷新 Web GUI 页面即可生效。
 */

const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { spawnSync } = require('node:child_process')

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name)
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]
  return fallback
}

const profile = arg('profile', 'desktop')
const repo = path.resolve(arg('path', path.join(__dirname, '..')))
const pkg = JSON.parse(fs.readFileSync(path.join(repo, 'package.json'), 'utf8'))
const name = pkg.name
const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
const profileDir = path.join(dshHome, 'profiles', profile)
const profilePkgPath = path.join(profileDir, 'package.json')

function log(msg) { console.log('[install] ' + msg) }

if (!fs.existsSync(profileDir)) {
  console.error(`[install] 找不到 profile 目录: ${profileDir}`)
  console.error('[install] 先启动一次该 profile（例如 `dsh web`），再重试。')
  process.exit(1)
}

/* 1. 尝试官方 CLI 链接 */
let linked = false
try {
  const isWin = process.platform === 'win32'
  const cmd = isWin ? 'dsh.cmd' : 'dsh'
  const r = spawnSync(cmd, ['plugin', '--profile', profile, 'add', 'link:' + repo], {
    stdio: 'inherit'
  })
  linked = r.status === 0
  if (!linked) log('`dsh plugin add` 未成功，改用本地 junction 兜底')
} catch (err) {
  log('未找到 dsh CLI，改用本地 junction 兜底: ' + err.message)
}

/* 2. 兜底：建 junction */
const nodeModules = path.join(profileDir, 'node_modules')
const linkPath = path.join(nodeModules, name)
if (!fs.existsSync(linkPath)) {
  fs.mkdirSync(nodeModules, { recursive: true })
  try {
    fs.symlinkSync(repo, linkPath, 'junction')
    log('已创建 junction: ' + linkPath)
  } catch (err) {
    log('创建 junction 失败: ' + err.message)
  }
}

/* 3. 写入 dependencies + dsh.profile.bundles */
const profilePkg = fs.existsSync(profilePkgPath)
  ? JSON.parse(fs.readFileSync(profilePkgPath, 'utf8'))
  : { name: 'dsh-profile-' + profile, private: true }

profilePkg.dependencies = profilePkg.dependencies || {}
const linkSpec = 'link:' + repo.replace(/\\/g, '/')
if (profilePkg.dependencies[name] !== linkSpec) {
  profilePkg.dependencies[name] = linkSpec
  log('dependencies 已写入: ' + name + ' -> ' + linkSpec)
}

profilePkg.dsh = profilePkg.dsh || {}
profilePkg.dsh.profile = profilePkg.dsh.profile || {}
const bundles = Array.isArray(profilePkg.dsh.profile.bundles) ? profilePkg.dsh.profile.bundles : []
if (!bundles.includes(name)) {
  bundles.push(name)
  log('dsh.profile.bundles 已加入: ' + name)
}
profilePkg.dsh.profile.bundles = bundles

fs.writeFileSync(profilePkgPath, JSON.stringify(profilePkg, null, 2) + '\n', 'utf8')
log('profile 清单已更新: ' + profilePkgPath)

console.log('')
log('安装完成。下一步：')
log('  1. 重启 DSH（关闭并重开应用，或重启 `dsh web` 进程）')
log('  2. 刷新 Web GUI 页面，即可看到启动动画')
log('  3. 设置 -> 「动画 233」调整动画包 / 用户名 / 背景透明度')
