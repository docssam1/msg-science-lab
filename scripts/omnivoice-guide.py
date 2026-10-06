#!/usr/bin/env python3
"""
스스로 공부하기 안내 문장에 우루사쌤 음성 붙이기 (원장 PC, OmniVoice, GPU)

- 대사: --spec 의 lines [{text, spoken?}]. text 는 화면에 나오는 문장 그대로(앱이 문장 일치로 음성을 찾는다),
  spoken 이 있으면 그 글자로 읽는다(→ 같은 기호가 화면 글자와 다를 때).
- 목소리 참조: promo/msg-physics/voice-promo.json 의 ref — 이미 쓰고 있는 우루사쌤 클립(sample-v2/audio/l1-structure.mp3)과
  그 클립의 실제 문장. 전사를 지어내지 않는다. 기존 승인 음성 파일은 건드리지 않는다.
- 결과: sample-v2/audio/guide/<id>.mp3 + voice-library.json 에 clips 추가(이미 있는 id 는 그대로) + 듣기.html(--listen)
- 이미 만든 줄은 건너뛴다(--force 로 다시). --limit N 으로 앞 N줄만.
"""
import argparse, base64, hashlib, json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMO = os.path.join(ROOT, "promo", "msg-physics", "voice-promo.json")
OUT = os.path.join(ROOT, "sample-v2", "audio", "guide")
LIB = os.path.join(ROOT, "sample-v2", "audio", "voice-library.json")


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def conv(src, dst, args):
    r = subprocess.run([ffmpeg(), "-y", "-i", src, *args, dst], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"변환 실패 {src}:\n{r.stderr[-1500:]}")


def clip_id(text):
    return "guide-" + hashlib.sha1(" ".join(text.split()).encode("utf-8")).hexdigest()[:8]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--device", default="auto")
    ap.add_argument("--model", default="k2-fsa/OmniVoice")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--listen", default="", help="듣기.html 을 쓸 경로")
    a = ap.parse_args()
    lines = json.load(open(a.spec, encoding="utf-8"))
    ref = json.load(open(PROMO, encoding="utf-8"))["ref"]
    os.makedirs(OUT, exist_ok=True)
    for l in lines:
        l["text"] = " ".join(l["text"].split()); l["id"] = clip_id(l["text"])
    todo = [l for l in lines if a.force or not os.path.exists(os.path.join(OUT, l["id"] + ".mp3"))]
    if a.limit: todo = todo[:a.limit]
    print(f"대사 {len(lines)}줄 중 만들 것 {len(todo)}줄", flush=True)

    made = []
    if todo:
        import torch, soundfile as sf
        dev = a.device
        if dev == "auto":
            dev = "cuda:0" if torch.cuda.is_available() else "cpu"
        print(f"장치: {dev}" + (f" · {torch.cuda.get_device_properties(0).name}" if dev.startswith("cuda") else " — GPU가 없으면 많이 느립니다"), flush=True)
        ref_wav = os.path.join(OUT, "_ref.wav")
        conv(os.path.join(ROOT, ref["audio"]), ref_wav, ["-ac", "1", "-ar", "24000"])
        from omnivoice import OmniVoice
        t0 = time.time()
        model = OmniVoice.from_pretrained(a.model, device_map=dev, dtype=torch.float16 if dev.startswith("cuda") else torch.float32)
        print(f"모델 준비 {time.time()-t0:.0f}초", flush=True)
        lib = json.load(open(LIB, encoding="utf-8"))
        for l in todo:
            t = time.time()
            try:
                y = model.generate(text=l.get("spoken") or l["text"], ref_audio=ref_wav, ref_text=ref["text"], num_step=16)[0]
            except Exception as e:
                print(f"  ✗ {l['id']}: {e}", flush=True); continue
            wav = os.path.join(OUT, l["id"] + ".wav"); sf.write(wav, y, 24000)
            mp3 = os.path.join(OUT, l["id"] + ".mp3"); conv(wav, mp3, ["-ac", "1", "-b:a", "96k"]); os.remove(wav)
            secs = len(y) / 24000.0
            lib["clips"].setdefault(l["id"], {"id": l["id"], "text": l["text"], "seconds": round(secs, 2),
                "generation_seconds": round(time.time() - t, 2), "engine": "OmniVoice 0.2.1", "num_step": 16,
                "path": f"./audio/guide/{l['id']}.mp3", "made": time.strftime("%Y-%m-%d %H:%M")})
            json.dump(lib, open(LIB, "w", encoding="utf-8"), ensure_ascii=False, indent=2)   # 줄마다 저장: 중간에 멈춰도 이어서
            made.append(l); print(f"  ✓ {l['id']}  {secs:.1f}초 / {time.time()-t:.0f}초 걸림  {l['text'][:30]}", flush=True)
        os.remove(ref_wav)

    if a.listen:
        b64 = lambda f: base64.b64encode(open(f, "rb").read()).decode("ascii")
        rows = "".join(f'<div class="c"><b>{l["id"]}</b><audio controls preload="none" src="data:audio/mpeg;base64,{b64(os.path.join(OUT, l["id"] + ".mp3"))}"></audio><p>{l["text"]}</p></div>'
                       for l in lines if os.path.exists(os.path.join(OUT, l["id"] + ".mp3")))
        open(a.listen, "w", encoding="utf-8").write('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>우루사쌤 안내 음성 듣기</title><style>body{font:15px/1.6 system-ui,"Malgun Gothic",sans-serif;max-width:760px;margin:0 auto;padding:16px}.c{border:1px solid #ccd;border-radius:10px;padding:10px 12px;margin:10px 0}.c b{font-size:12px;color:#456}audio{width:100%}p{margin:6px 0 0}</style><h1>우루사쌤 안내 음성</h1>' + rows)
        print("듣기:", a.listen)
    print(f"\n완료 {len(made)}줄")
    return 0


if __name__ == "__main__":
    sys.exit(main())
