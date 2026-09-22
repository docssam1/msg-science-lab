@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  [1/4] git 확인 중...
where git >nul 2>&1
if errorlevel 1 (
  echo  [!] git이 설치되어 있지 않습니다. https://git-scm.com/download/win 에서 설치 후 다시 실행하세요.
  pause & exit /b 1
)

if exist ".git" (
  echo  [준비됨] 이미 git 저장소입니다 - init 건너뜀.
) else (
  echo  [2/4] git init...
  git init || (echo  [!] git init 실패 & pause & exit /b 1)
)

echo  [3/4] 커밋할 파일 추가 + 커밋...
git add -A
git commit -m "MSG 사이언스 랩 초기 커밋"
if errorlevel 1 (
  echo  [안내] 커밋할 변경 사항이 없거나, git 사용자 정보가 설정되지 않았을 수 있습니다.
  echo         사용자 정보가 없다면 아래 두 줄을 먼저 실행하세요:
  echo           git config --global user.email "you@example.com"
  echo           git config --global user.name  "Your Name"
)

echo.
echo  [4/4] GitHub 원격 저장소 연결 + 푸시
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin https://github.com/docssam1/msg-science-lab.git
  echo  origin 추가됨: https://github.com/docssam1/msg-science-lab.git
) else (
  echo  origin 이미 설정되어 있음 - 그대로 사용합니다.
)

git branch -M main
echo.
echo  푸시를 시도합니다. 로그인 창이 뜨면 GitHub 계정으로 로그인해 주세요.
git push -u origin main
if errorlevel 1 (
  echo.
  echo  [!] 푸시 실패했습니다. github.com 에 msg-science-lab 저장소를 먼저 만드셨는지,
  echo      로그인/권한 문제는 없었는지 확인하고 다시 실행해 주세요.
  echo      화면 메시지를 그대로 복사해 Claude 에게 주시면 원인을 봐 드릴게요.
) else (
  echo.
  echo  완료! https://github.com/docssam1/msg-science-lab 에서 확인해 보세요.
)
pause
