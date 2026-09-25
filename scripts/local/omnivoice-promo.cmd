@echo off
chcp 65001 >nul
REM ============================================================
REM  초·과·심 LIVE 소개 영상 — 우루사쌤 목소리로 새 대사 16줄 만들기
REM   대사: promo\msg-physics\voice-promo.json   결과: sample-v2\audio\promo\*.mp3
REM   이미 만든 줄은 건너뜁니다. 키를 쓰지 않고, 아무 데도 올리지 않습니다.
REM ============================================================
setlocal
call "%~dp0_setup-omnivoice.cmd" || (echo  [!] 준비 단계 실패 & pause & exit /b 1)
echo.
echo  [실행] 우루사쌤 목소리로 소개 대사를 만드는 중... 모델을 처음 받을 땐 오래 걸립니다.
python scripts\omnivoice-promo.py --device auto %*
if errorlevel 1 ( echo. & echo  [!] 실패했습니다. 위 메시지를 그대로 복사해 Claude 에게 주세요. & pause & exit /b 1 )
echo.
echo  완료. 듣기 페이지를 엽니다. 괜찮으면 아래 두 곳을 GitHub에 올려 주세요:
echo    sample-v2\audio\promo\   promo\msg-physics\voice-promo.generated.json
echo  (GitHub Desktop 이면 커밋 후 Push. 그다음 Claude 에게 "음성 올렸어" 라고만 말하면 됩니다.)
start "" "%cd%\sample-v2\audio\promo\듣기.html"
pause
