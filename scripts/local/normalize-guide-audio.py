#!/usr/bin/env python3
"""omnivoice-guide.py로 만든 안내 음성(sample-v2/audio/guide/<id>.mp3)의 음량을 기존 승인 음성 수준(평균 약 -21 dB, 최고 -1 dB 이하)으로 맞춘다.

사용: python scripts/local/normalize-guide-audio.py --spec <lesson-spec.json> [--target -21]
- spec의 각 줄 text로 clip id(guide-<sha1 앞 8자>)를 구해 해당 mp3만 고친다. 기존 승인 음성은 건드리지 않는다.
- ffmpeg는 OmniVoice 가상환경의 imageio_ffmpeg를 쓴다(없으면 PATH의 ffmpeg).
- 이 스크립트는 음성을 만들지 않는다. 듣고 승인하기 전에는 커밋하지 않는다(docs/lesson-framework/VOICE-RUNBOOK.md).
"""
import argparse, hashlib, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
GUIDE = os.path.join(ROOT, "sample-v2", "audio", "guide")
LIB = os.path.join(ROOT, "sample-v2", "audio", "voice-library.json")


def ffmpeg():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return "ffmpeg"


def clip_id(text):
    return "guide-" + hashlib.sha1(" ".join(text.split()).encode("utf-8")).hexdigest()[:8]


def level(ff, path):
    out = subprocess.run([ff, "-hide_banner", "-i", path, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    mean = float(re.search(r"mean_volume: (-?[\d.]+)", out).group(1))
    peak = float(re.search(r"max_volume: (-?[\d.]+)", out).group(1))
    return mean, peak


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--target", type=float, default=-21.0)
    a = ap.parse_args()
    ff = ffmpeg()
    spec = json.load(open(a.spec, encoding="utf-8"))
    ids = [clip_id(line["text"]) for line in spec]
    rows = []
    for i in ids:
        path = os.path.join(GUIDE, i + ".mp3")
        if not os.path.exists(path):
            sys.exit(f"없는 파일: {i}.mp3 — 먼저 omnivoice-guide.py로 만드세요.")
        mean, peak = level(ff, path)
        gain = min(a.target - mean, -1.0 - peak)
        tmp = path + ".norm.mp3"
        subprocess.run([ff, "-hide_banner", "-v", "error", "-y", "-i", path, "-af", f"volume={gain:.1f}dB", "-ac", "1", "-b:a", "96k", tmp], check=True)
        os.replace(tmp, path)
        rows.append(level(ff, path))
    lib = json.load(open(LIB, encoding="utf-8"))["clips"]
    missing = [i for i in ids if i not in lib]
    print(f"정규화 {len(rows)}개 | 평균 {sum(r[0] for r in rows)/len(rows):.1f} dB | 최고음 {max(r[1] for r in rows):.1f} dB | voice-library 미등록 {len(missing)}개")


if __name__ == "__main__":
    main()
