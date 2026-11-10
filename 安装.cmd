@echo off
chcp 65001 >nul
setlocal
set PROFILE=%~1
if "%PROFILE%"=="" set PROFILE=desktop
echo 正在安装 anim233 到 DSH profile [%PROFILE%] ...
node "%~dp0scripts\install.cjs" --profile %PROFILE%
if errorlevel 1 (
  echo.
  echo 安装失败，请检查上面的错误信息。
  pause
  exit /b 1
)
echo.
echo 安装完成。重启 DSH 并刷新页面即可生效。
pause
