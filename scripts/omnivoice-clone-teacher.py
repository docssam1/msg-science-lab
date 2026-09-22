#!/usr/bin/env python3
"""
OmniVoice 목소리 복제 — 선생님이 직접 읽어 주신 음성으로 독샘(MSG 캐릭터) 목소리 만들기

배경
---------------------------------------------------------------------------
docs/HANDOFF.md 의 남은 차단 지점: "실제 목소리... OmniVoice 설치/모델 다운로드/
음성 생성 미실행." lete-on 프로젝트(number_magic 누미)에서 이미 검증한 결론과 같은
길을 그대로 따른다 — 목소리 **설계(instruct)**는 중국어·영어로만 학습돼 한국어에서
불안정하고, **복제(clone)**가 문서상 가장 안정적이다. 그리고 여기서는 그 복제 참조가
이미 가장 깨끗한 형태로 있다 — **선생님이 직접 읽으신 녹음**(다른 TTS 업체 음성이
아니라 원권리자 본인 목소리이므로 약관 문제도 없다).

하는 일
---------------------------------------------------------------------------
1) 참조 음성(선생님 녹음, mp4/m4a 등)을 24kHz 모노 wav 로 바꾼다.
   ffmpeg 이 시스템에 없어도 되도록 pip 패키지 imageio-ffmpeg 의 바이너리를 쓴다.
2) CHAPTER 01(용수철저울) 실제 수업 문구 몇 줄(src/ch01-model.js 의 stages)을
   그 목소리로 읽혀 out/ 에 담는다. ref_text 는 넘기지 않는다 — 녹음 속 실제 발화를
   전사해 적어 넣는 것은 이 스크립트가 지어낼 수 없는 일이라, OmniVoice 의 zero-shot
   경로(ref_audio 만으로 복제)를 그대로 쓴다.
3) 듣기.html 한 장을 만든다 — 원격 데스크톱이라 소리가 안 넘어와도 이 파일 하나면
   휴대폰에서도 바로 들린다(base64 내장, 서버·인터넷 불필요).

쓰는 법 (원장 PC: scripts\\local\\omnivoice-clone-teacher.cmd 더블클릭)
  python scripts/omnivoice-clone-teacher.py --ref <녹음파일> --out clone-teacher
"""
import argparse, base64, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# CHAPTER 01 실제 수업 문구 — 지어내지 않고 src/ch01-model.js 의 stages 에서 그대로 가져옴
LINES = [
    ("predict", "손으로 어림한 무게, 같을까요? 같은 물체를 들어도 사람마다 다르게 느낄까요?"),
    ("parts",   "저울의 각 부분은 어떤 일을 할까요? 부품을 하나 선택하고, 그 부품이 없다면 어떻게 될지 말해 보세요."),
    ("zero",    "아무것도 달지 않았는데 0이 아니네요. 영점조절나사를 움직여 표시자의 윗부분을 0에 맞춰 보세요."),
]


def to_wav(src, out_wav):
    """mp4/m4a → 24kHz mono wav. 시스템 ffmpeg 이 없어도 되도록 imageio-ffmpeg 바이너리를 쓴다."""
    import imageio_ffmpeg
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, "-y", "-i", src, "-ac", "1", "-ar", "24000", out_wav]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(out_wav):
        sys.exit(f"참조 음성 변환 실패:\n{r.stderr[-2000:]}")
    return out_wav


def write_listen_page(out_dir, ref_wav, clips, path):
    def b64(f):
        return base64.b64encode(open(f, "rb").read()).decode("ascii")
    items = "".join(
        f'<div class="clip"><b>{lid}</b><audio controls preload="none" '
        f'src="data:audio/wav;base64,{b64(f)}"></audio><p>{txt}</p></div>'
        for lid, txt, f in clips)
    html = f"""<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>독샘 목소리 복제 듣기</title>
<style>
 body{{font:15px/1.7 system-ui,-apple-system,"Malgun Gothic",sans-serif;
   background:#fdfaf3;color:#1A2233;margin:0;padding:20px 16px;max-width:760px;margin:0 auto}}
 h1{{font-size:20px;color:#0E2C57;margin:0 0 4px}}
 .lede{{color:#4a5468;font-size:13.5px;margin:0 0 20px}}
 section{{border:1px solid #e0d6bd;border-radius:14px;background:#fff;padding:14px 16px;margin-bottom:16px}}
 .row{{display:grid;gap:10px;margin-bottom:10px}}
 @media(min-width:620px){{.row{{grid-template-columns:1fr 1fr}}}}
 .clip{{border:1px solid #eee7d8;border-radius:10px;padding:10px 12px;background:#fdfaf3}}
 .clip.orig{{background:#FBF6E8;border-color:#E4D9BC}}
 .clip b{{display:block;font-size:13px;color:#0E2C57;margin-bottom:6px}}
 audio{{width:100%}}
 .clip p{{margin:7px 0 0;font-size:12.5px;color:#4a5468;word-break:keep-all}}
 .tip{{font-size:12.5px;color:#4a5468;background:#fff;border:1px dashed #e0d6bd;
   border-radius:10px;padding:12px 14px}}
</style>
<h1>독샘 목소리 복제 — 들어 보기</h1>
<p class="lede">위가 <b>선생님 원본 녹음</b>, 아래가 <b>독샘 복제본</b>(CHAPTER 01 문구)입니다.
번갈아 눌러서 같은 사람 목소리로 들리면 성공입니다.</p>
<section>
  <div class="row">
    <div class="clip orig"><b>원본(선생님 녹음)</b>
      <audio controls preload="none" src="data:audio/wav;base64,{b64(ref_wav)}"></audio></div>
  </div>
  <div class="row">{items}</div>
</section>
<p class="tip">이 파일 한 장에 소리가 전부 들어 있습니다. 메일·메신저·USB 무엇으로든
옮기면 휴대폰에서도 그냥 열립니다 — 인터넷도, 다른 파일도 필요 없습니다.</p>
</html>"""
    open(path, "w", encoding="utf-8").write(html)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", required=True, help="선생님 목소리 녹음 파일 경로(mp4/m4a/mp3/wav)")
    ap.add_argument("--out", default="clone-teacher")
    ap.add_argument("--device", default="auto")
    ap.add_argument("--model", default="k2-fsa/OmniVoice")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    print(f"참조 음성: {a.ref}")
    ref_wav = a.ref
    if not a.ref.lower().endswith(".wav"):
        print("wav 로 변환하는 중...")
        ref_wav = to_wav(a.ref, os.path.join(a.out, "teacher-ref.wav"))
    else:
        import shutil
        dst = os.path.join(a.out, "teacher-ref.wav")
        if os.path.abspath(a.ref) != os.path.abspath(dst):
            shutil.copy(a.ref, dst)
        ref_wav = dst

    import torch, soundfile as sf
    dev = a.device
    if dev == "auto":
        dev = "cuda:0" if torch.cuda.is_available() else "cpu"
    if dev.startswith("cuda"):
        p = torch.cuda.get_device_properties(0)
        print(f"🎮 GPU: {p.name} · VRAM {p.total_memory/1024**3:.1f} GB", flush=True)
    else:
        print("🖥  GPU 를 못 찾았습니다 — CPU 로 돌면 많이 느립니다", flush=True)

    from omnivoice import OmniVoice
    dtype = torch.float16 if dev.startswith("cuda") else torch.float32
    t0 = time.time()
    print(f"모델 준비 중… ({a.model}) — 처음 한 번만 오래 걸립니다", flush=True)
    model = OmniVoice.from_pretrained(a.model, device_map=dev, dtype=dtype)
    print(f"준비 {time.time()-t0:.0f}초\n", flush=True)

    clips = []
    total = 0.0
    for lid, text in LINES:
        t = time.time()
        try:
            audio = model.generate(text=text, ref_audio=ref_wav)
        except Exception as e:
            print(f"  ✗ {lid}: {e}", flush=True)
            continue
        y = audio[0]
        secs = len(y) / 24000.0
        total += secs
        f = os.path.join(a.out, f"docssam-{lid}.wav")
        sf.write(f, y, 24000)
        clips.append((lid, text, f))
        took = time.time() - t
        print(f"  ✓ {lid}  {secs:.1f}초 음성 / {took:.0f}초 걸림 · RTF {took/max(secs,0.01):.2f}", flush=True)

    page = ""
    if clips:
        page = write_listen_page(a.out, ref_wav, clips, os.path.join(a.out, "듣기.html"))

    print(f"\n합계 음성 {total:.0f}초 · 전체 {time.time()-t0:.0f}초 · 장치 {dev}")
    print(f"결과: {os.path.abspath(a.out)}")
    if page:
        print(f"\n듣기 페이지: {os.path.abspath(page)}")
        print("메일·메신저·USB 무엇으로든 옮기면 휴대폰에서도 바로 열립니다.")
    print("RTF 는 '음성 1초를 만드는 데 몇 초 걸렸나'. 1 보다 작으면 실시간보다 빠릅니다.")


if __name__ == "__main__":
    sys.exit(main())
