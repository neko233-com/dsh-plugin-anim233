# 贡献指南

## 环境

- Node.js >= 20
- 无需 npm registry；所有脚本均为 Node 内置模块

## 开发流程

```bash
# 1. 语法检查
node scripts/check-syntax.cjs

# 2. 单元测试（运行时 + 静态契约）
node --test test/

# 3. 本地安装到 DSH profile
node scripts/install.cjs --profile desktop

# 4. 浏览器自测（可选）
python -m http.server 8899 --bind 127.0.0.1
# 打开 http://127.0.0.1:8899/preview-test.html
```

## 目录约定

| 目录 | 内容 |
|---|---|
| `lib/` | 插件源码：Host（index.js）、浏览器（client.js 等） |
| `test/` | `node:test` 测试 |
| `scripts/` | 安装 / 语法检查等工程脚本 |
| `docs/` | 架构与动画包规范 |
| `examples/` | 可导入的示例动画包 |

## 代码风格

- 纯 ESM（`lib/index.js`）与浏览器 IIFE 两种形态并存，改动时注意 `package.json` 的 `"type": "module"` 会让 `.js` 默认按 ESM 解析；浏览器侧脚本用 `--input-type=commonjs` 检查。
- 不新增运行时依赖。
- 动画包必须通过 `ANIM233.register` 注册，不能有副作用。

## 提交前

- [ ] `node scripts/check-syntax.cjs` 通过
- [ ] `node --test test/` 通过
- [ ] 更新 `CHANGELOG.md`
- [ ] 若改动了包 API，同步 `docs/PACK-SPEC.md`
