@echo off
REM 本机安装 anim233 到当前 DSH profile
dsh plugin --profile web add link:%~dp0
echo.
echo 安装完成，刷新 DSH Web GUI 即可看到启动动画与设置页「动画 233」。
pause
