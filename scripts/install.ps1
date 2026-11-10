# 本地安装 anim233 到指定 DSH profile（无需 npm registry）
param(
  [string]$Profile = "desktop",
  [string]$Path = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = "Stop"
$installer = Join-Path $PSScriptRoot "install.cjs"

if (-not (Test-Path $installer)) {
  throw "找不到 scripts/install.cjs"
}

Write-Host "安装 anim233 到 profile [$Profile]" -ForegroundColor Cyan
node $installer --profile $Profile --path $Path
if ($LASTEXITCODE -ne 0) {
  throw "安装失败（exit $LASTEXITCODE）"
}
