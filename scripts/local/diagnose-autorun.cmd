@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===== HKCU AutoRun ===== > autorun-check.txt
reg query "HKCU\Software\Microsoft\Command Processor" /v AutoRun >> autorun-check.txt 2>&1
echo. >> autorun-check.txt
echo ===== HKLM AutoRun ===== >> autorun-check.txt
reg query "HKLM\Software\Microsoft\Command Processor" /v AutoRun >> autorun-check.txt 2>&1
echo. >> autorun-check.txt
echo 완료. autorun-check.txt 파일이 이 폴더에 생겼습니다.
type autorun-check.txt
pause
