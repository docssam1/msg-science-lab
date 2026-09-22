@echo off
chcp 65001 >nul
REM ============================================================
REM  독샘 목소리 복제 — 선생님이 직접 읽으신 녹음으로
REM
REM  하는 일
REM   1) assets\teacher-ref-recording.* (또는 --ref 로 지정한 파일)를 참조 음성으로 씀
REM   2) CHAPTER 01(용수철저울) 실제 수업 문구 3줄을 그 목소리로 읽혀 clone-teacher\ 에 담음
REM   3) 폴더 + 듣기.html 을 연다 — 원본과 복제본을 번갈아 들어 비교하세요
REM
REM  키를 하나도 안 쓰고, 아무 데도 올리지 않습니다.
REM ============================================================
setlocal
call "%~dp0_setup-omnivoice.cmd" || (echo  [!] 준비 단계 실패 & pause & exit /b 1)

set REF=assets\teacher-ref-recording.mp4
if not "%~1"=="" set REF=%~1

if not exist "%REF%" (
  echo.
  echo  [!] 참조 음성을 찾지 못했습니다: %REF%
  echo      드래그해서 이 창에 파일을 올리거나, 아래처럼 경로를 직접 넘겨 주세요:
  echo      omnivoice-clone-teacher.cmd "C:\경로\녹음파일.mp4"
  echo.
  pause & exit /b 1
)

echo.
echo  [실행] 참조 음성 준비 + 독샘 목소리로 복제하는 중... 모델을 처음 받을 땐 오래 걸립니다.
python scripts\omnivoice-clone-teacher.py --ref "%REF%" --out clone-teacher --device auto
if errorlevel 1 (
  echo.
  echo  [!] 실패했습니다. 위 메시지를 그대로 복사해 Claude 에게 주세요.
  pause & exit /b 1
)

echo.
echo  완료. 듣기 페이지를 엽니다 - 선생님 원본과 독샘 복제본을 번갈아 눌러 비교하세요.
echo.
echo  [원격이라 소리가 안 들리면] clone-teacher\듣기.html 한 장에 소리가 전부 들어 있습니다.
echo  메일이나 메신저로 그 파일만 옮기면 휴대폰에서도 그냥 열립니다.
echo.
start "" "%cd%\clone-teacher\듣기.html"
start "" "%cd%\clone-teacher"
pause
