# 安装 anim233

anim233 **不需要发布到 npm registry**。DSH 直接从本地目录 / git 仓库 link 安装即可。

## 方式一：脚本（推荐）

```bash
# Windows：双击 安装.cmd，或
node scripts/install.cjs --profile desktop
```

脚本会：
1. 用 `dsh plugin add link:<本目录>` 链接包；
2. 兜底在 profile 的 `node_modules` 建 junction；
3. 把包写入 profile `package.json` 的 `dependencies` 与 `dsh.profile.bundles`。

## 方式二：DSH 插件页

打开 DSH →「插件」→ 从本地目录 / git 地址安装 → 选择本目录。

## 方式三：手动

```bash
dsh plugin --profile desktop add link:D:\Code\neko233-Projects\dsh-plugin-anim233
```

> 注意：仅 `dsh plugin add` 可能不会写入 `dsh.profile.bundles`；若插件页看不到「动画 233」，用方式一或检查 profile 的 `package.json`。

## 重启生效

安装后**重启 DSH**（关闭并重开应用，或重启 `dsh web` 进程），再刷新 Web GUI 页面。

## 验证

1. 刷新 DSH Web GUI，应看到启动动画。
2. 打开设置 →「动画 233」。
3. 选择一款内置动画（如「原神」），点「保存」→「立即预览」。
4. 调整背景层透明度、用户名，再次预览确认生效。
5. 填一个含 `pack.js` 的 git 仓库地址，点「导入」。

## 卸载

```bash
dsh plugin --profile desktop remove dsh-plugin-anim233
```

并从 profile `package.json` 的 `dsh.profile.bundles` 中移除 `dsh-plugin-anim233`。
