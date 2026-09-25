#!/usr/bin/env python3
"""
초·과·심 LIVE 소개 영상 내레이션 — 우루사쌤 목소리로 새 대사 만들기(원장 PC, OmniVoice)

- 대사: promo/msg-physics/voice-promo.json 의 lines (영상 장면과 id가 같다)
- 목소리 참조: 같은 파일의 ref — 이미 쓰고 있는 우루사쌤 클립(sample-v2/audio/l1-structure.mp3)과
  그 클립의 **실제 문장**(ref_text). 전사를 지어내지 않는다: 이 문장으로 합성한 음성이라 정확히 일치한다.
- 결과: sample-v2/audio/promo/<id>.mp3 + promo/msg-physics/voice-promo.generated.json + 듣기.html
- 이미 만든 줄은 건너뛴다(--force 로 다시). --only p01-hello,p16-end 처럼 일부만.
- 그 뒤 Claude(또는 build.mjs)가 영상을 다시 만들면 초안의 무음 자리가 이 목소리로 바뀐다.
"""
import argparse, base64, json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = os.path.join(ROOT, "promo", "msg-physics", "voice-promo.json")
OUT = os.path.join(ROOT, "sample-v2", "audio", "promo")


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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--device", default="auto")
    ap.add_argument("--model", default="k2-fsa/OmniVoice")
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    spec = json.load(open(SPEC, encoding="utf-8"))
    os.makedirs(OUT, exist_ok=True)
    only = set(filter(None, a.only.split(",")))
    todo = [l for l in spec["lines"] if (not only or l["id"] in only) and (a.force or not os.path.exists(os.path.join(OUT, l["id"] + ".mp3")))]
    print(f"대사 {len(spec['lines'])}줄 중 만들 것 {len(todo)}줄")
    if not todo:
        print("모두 이미 있습니다. 다시 만들려면 --force"); return 0

    ref_mp3 = os.path.join(ROOT, spec["ref"]["audio"]); ref_wav = os.path.join(OUT, "_ref.wav")
    conv(ref_mp3, ref_wav, ["-ac", "1", "-ar", "24000"])

    import torch, soundfile as sf
    dev = a.device
    if dev == "auto":
        dev = "cuda:0" if torch.cuda.is_available() else "cpu"
    print(f"장치: {dev}" + (f" · {torch.cuda.get_device_properties(0).name}" if dev.startswith("cuda") else " — GPU가 없으면 많이 느립니다"), flush=True)
    from omnivoice import OmniVoice
    t0 = time.time()
    model = OmniVoice.from_pretrained(a.model, device_map=dev, dtype=torch.float16 if dev.startswith("cuda") else torch.float32)
    print(f"모델 준비 {time.time()-t0:.0f}초", flush=True)

    made = []
    for l in todo:
        t = time.time()
        try:
            y = model.generate(text=l["text"], ref_audio=ref_wav, ref_text=spec["ref"]["text"])[0]
        except Exception as e:
            print(f"  ✗ {l['id']}: {e}", flush=True); continue
        wav = os.path.join(OUT, l["id"] + ".wav"); sf.write(wav, y, 24000)
        mp3 = os.path.join(OUT, l["id"] + ".mp3"); conv(wav, mp3, ["-ac", "1", "-b:a", "96k"]); os.remove(wav)
        secs = len(y) / 24000.0; made.append((l["id"], l["text"], mp3, secs))
        print(f"  ✓ {l['id']}  {secs:.1f}초 / {time.time()-t:.0f}초 걸림", flush=True)
    os.remove(ref_wav)

    gen_path = os.path.join(ROOT, "promo", "msg-physics", "voice-promo.generated.json")
    gen = json.load(open(gen_path, encoding="utf-8")) if os.path.exists(gen_path) else {"engine": "OmniVoice", "clips": {}}
    for lid, txt, mp3, secs in made:
        gen["clips"][lid] = {"text": txt, "seconds": round(secs, 2), "path": f"./audio/promo/{lid}.mp3", "made": time.strftime("%Y-%m-%d %H:%M")}
    json.dump(gen, open(gen_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

    # 듣기.html — 소리 파일을 안에 넣어 한 장으로(원격 데스크톱·휴대폰에서도 바로)
    b64 = lambda f: base64.b64encode(open(f, "rb").read()).decode("ascii")
    rows = "".join(f'<div class="c"><b>{lid}</b><audio controls preload="none" src="data:audio/mpeg;base64,{b64(mp3)}"></audio><p>{txt}</p></div>' for lid, txt, mp3, _ in made)
    page = os.path.join(OUT, "듣기.html")
    open(page, "w", encoding="utf-8").write(f'<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>초·과·심 LIVE 내레이션 듣기</title><style>body{{font:15px/1.6 system-ui,"Malgun Gothic",sans-serif;max-width:760px;margin:0 auto;padding:18px}}.c{{border:1px solid #dce8e0;border-radius:12px;padding:10px 12px;margin:10px 0}}audio{{width:100%}}p{{margin:6px 0 0;color:#445}}</style><h1>초·과·심 LIVE 소개 영상 내레이션</h1>{rows}')
    print(f"\n완료 {len(made)}줄 · {sum(m[3] for m in made):.0f}초 · 듣기: {page}")
    print("다음: 이 파일들을 GitHub에 올리면(아래 cmd가 안내) Claude가 영상을 다시 만듭니다.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
