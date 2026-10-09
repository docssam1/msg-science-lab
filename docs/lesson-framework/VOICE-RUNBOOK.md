# 안내 음성(우루사쌤) 제작 런북 — 환경만 준비, 음성은 나중에

상태(2026-10-09): **도구와 환경 확인까지 끝, 음성은 아직 만들지 않음**(사용자 결정: 음성은 환경만 만들고 나중에). 3차시 음성은 만들어 두었지만 사용자가 듣고 승인하기 전이라 커밋·병합하지 않았습니다.

## 규칙

- 음성은 **로컬 OmniVoice(GPU)** 로만 만듭니다. 클라우드 TTS는 쓰지 않습니다.
- 만든 음성은 **사용자가 듣고 승인한 뒤에만** 커밋·병합합니다. 승인 전에는 해당 차시 안내가 자막만 나옵니다.
- 기존 승인 음성(`sample-v2/audio/*.mp3`, `voice-library.json`의 기존 clip)은 바꾸지 않습니다.
- 목소리 참조는 이미 쓰는 우루사쌤 클립(`sample-v2/audio/l1-structure.mp3`)과 그 클립의 실제 문장(`promo/msg-physics/voice-promo.json`의 `ref`)입니다. 전사를 지어내지 않습니다.

## 환경 (확인함)

- 가상환경: `E:\Codex\tools\science-lab-omnivoice-cuda\Scripts\python.exe` (torch 2.8.0+cu128, omnivoice 0.2.1, GTX 1660 SUPER, `torch.cuda.is_available()` = True)
- 환경 변수: `PYTHONIOENCODING=utf-8`, `HF_HUB_CACHE=E:/Codex/model-cache/fields-omnivoice/hub`, `HF_HUB_OFFLINE=1` (모델 캐시는 E:에 있음)
- 도구(모두 저장소 안):
  - `scripts/local/enumerate-guide-lines.mjs` — 한 차시에서 음성이 없는 안내 문장을 모아 spec(JSON)으로 저장. 음성은 만들지 않음.
  - `scripts/omnivoice-guide.py` — spec의 줄마다 `sample-v2/audio/guide/guide-<sha1 앞 8자>.mp3`를 만들고 `voice-library.json`에 등록, `--listen`으로 듣기용 HTML 생성. 이미 있는 줄은 건너뜀(`--force`로 다시, `--limit N`으로 앞 N줄만).
  - `scripts/local/normalize-guide-audio.py` — 음량을 기존 승인 음성 수준(평균 약 -21 dB, 최고음 -1 dB 이하)으로 맞춤.

## 순서 (나중에 음성을 만들 때)

```powershell
cd <작업본>          # origin/main에서 새 worktree
$env:PYTHONIOENCODING='utf-8'; $env:HF_HUB_CACHE='E:/Codex/model-cache/fields-omnivoice/hub'; $env:HF_HUB_OFFLINE='1'
node scripts/local/enumerate-guide-lines.mjs --lesson 4 --out E:/Codex/visualizations/msg-lecture-04/voice/lesson4-spec.json
E:\Codex\tools\science-lab-omnivoice-cuda\Scripts\python.exe scripts/omnivoice-guide.py --spec E:/Codex/visualizations/msg-lecture-04/voice/lesson4-spec.json --listen E:/Codex/visualizations/msg-lecture-04/voice/lesson4-listen.html
python scripts/local/normalize-guide-audio.py --spec E:/Codex/visualizations/msg-lecture-04/voice/lesson4-spec.json
```

1. 듣기 HTML을 사용자에게 보내 승인받습니다(어색한 문장은 그 문장만 `--force`로 다시).
2. 승인 뒤에만 커밋 → `node scripts/local/build-sample-manifest.mjs` 후 `--check` → PR(`--body-file`) → 병합 → 배포 확인(공개 mp3 해시 비교).
3. 장면 해설은 `narration` 문장과 정확히 같은 줄로 찾고, 말풍선 문장은 `speakGuideLine`이 화면 문장과 같은 줄로 찾습니다. 문장 하나를 고치면 그 줄 음성을 다시 만들어야 합니다.

## 대기 중인 차시

| 차시 | 만들 줄 | 상태 |
| --- | --- | --- |
| 3차시(P21~P32) | 32줄(장면 해설 12 + 말풍선·실험 안내 20) | **생성·음량 정리 완료, 사용자 승인 대기.** 작업본 `E:\Codex\worktrees\msg-lecture-03-20261008`(브랜치 `work/lecture-03-voice-20261009`, 미커밋: `app.js`의 `pageVoice` 문장 매칭 수정, `source-lessons.js`의 P26·P30 안내 문장, `voice-library.json` 187개, mp3 32개). 듣기 페이지 `E:\Codex\visualizations\msg-lecture-03\lesson3-listen.html`. |
| 4차시(P33~P40) | 21줄 | 대사 목록(`lesson4-spec.json`)만 만들었고 **음성은 만들지 않음**. 3차시 체험이 3D로 바뀌면 3차시 안내 문장도 바뀔 수 있어, 바뀐 뒤 `--lesson 3`으로 다시 목록을 만들어 비교해야 합니다. |

> `app.js`의 `pageVoice` 수정(장면 해설을 문장으로 찾도록 `id`를 `files[p.id]?p.id:null`로 돌려줌)은 3차시 음성 브랜치에만 있고 `main`에는 없습니다. 4차시 음성도 이 수정이 있어야 장면 해설이 재생되므로, 어느 차시 음성이든 먼저 병합하는 쪽에 이 수정을 함께 넣어야 합니다.
