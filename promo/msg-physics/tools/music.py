#!/usr/bin/env python3
"""쇼릴 배경음악 — 코드로 직접 합성한 원곡(저작권 걱정 없음). 96 BPM, C–G–Am–F, 48kHz 스테레오.
구성: 인트로(패드+상승음) → 드롭(킥·박수·하이햇·베이스·플럭) → 마지막 두 마디 패드로 마무리.
사용: python3 music.py out.wav 초 [드롭시각초] [soft]
soft: 내레이션 밑에 까는 잔잔한 판(북·베이스 없이 패드 + 느린 뜯는 소리)"""
import sys, numpy as np

SR = 48000
BPM = 96
BEAT = 60 / BPM
dur = float(sys.argv[2]) if len(sys.argv) > 2 else 56
SOFT = len(sys.argv) > 4 and sys.argv[4] == 'soft'
drop = float(sys.argv[3]) if len(sys.argv) > 3 else BEAT * 8
if SOFT: drop = 1e9   # 리듬 없이
N = int(SR * (dur + 2))
L = np.zeros(N); R = np.zeros(N)
t_all = np.arange(N) / SR
rng = np.random.default_rng(7)

def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def env(n, a=0.005, d=0.1, s=0.6, r=0.2, hold=None):
    hold = hold if hold is not None else n / SR
    t = np.arange(n) / SR
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    rel = np.clip((t - hold) / r, 0, 1)
    return e * (1 - rel)
def add(buf, start, sig, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(N, i + len(sig))
    if i >= N or j <= i: return
    s = sig[: j - i] * gain
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for k in range(len(x)): p = (1 - a) * x[k] + a * p; y[k] = p
    return y

# 코드 진행: C, G, Am, F (한 마디씩)
chords = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]
bass = [36, 43, 45, 41]
bar = BEAT * 4
nbars = int(np.ceil(dur / bar)) + 1

# 패드: 디튠 톱니 여러 겹 + 저역 통과, 마디마다
for b in range(nbars):
    t0 = b * bar; n = int(bar * SR * 1.05); t = np.arange(n) / SR
    sig = np.zeros(n)
    for m in chords[b % 4]:
        for det in (-0.12, 0.0, 0.11):
            f = note(m) * 2 ** (det / 12)
            sig += 2 * ((t * f) % 1) - 1
    sig = lowpass(sig / 12, 1400 if t0 >= drop else 900) * env(n, a=0.35, d=0.4, s=0.8, r=0.5, hold=bar)
    add(L, t0, sig, gain=0.34)

# 상승음(인트로 → 드롭)
n = 0 if SOFT else int(drop * SR); t = np.arange(n) / SR
noise = rng.standard_normal(n); rise = lowpass(noise, 3000) * (t / drop) ** 2 * 0.25
add(L, 0, rise)

# 드롭 이후 리듬
def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR; f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def clap():
    n = int(0.25 * SR); t = np.arange(n) / SR
    return lowpass(rng.standard_normal(n), 2600) * np.exp(-t * 22) * 0.9
def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n); x = x - lowpass(x, 6000)
    return x * np.exp(-t * (14 if open_ else 70)) * 0.5
def pluck(m, length=0.28):
    n = int(length * SR); t = np.arange(n) / SR; f = note(m)
    x = (2 * ((t * f) % 1) - 1) * 0.6 + np.sin(2 * np.pi * f * 2 * t) * 0.3
    return lowpass(x, 3500) * np.exp(-t * 11)
def bassn(m, length):
    n = int(length * SR); t = np.arange(n) / SR; f = note(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2 * t)
    return x * env(n, a=0.01, d=0.15, s=0.7, r=0.08, hold=length - 0.08)

end_rhythm = dur - bar * 1.5
kick_times = []
beat = 0
while True:
    tb = drop + beat * BEAT
    if tb >= end_rhythm: break
    b = int((tb) // bar)
    kick_times.append(tb); add(L, tb, kick(), gain=0.9)
    if beat % 2 == 1: add(L, tb, clap(), pan=0.05, gain=0.55)
    add(L, tb + BEAT / 2, hat(beat % 4 == 3), pan=-0.3, gain=0.5)
    add(L, tb, hat(), pan=0.3, gain=0.28)
    # 베이스(8분 음표 두 번), 플럭 아르페지오(16분)
    add(L, tb, bassn(bass[b % 4], BEAT * 0.45), gain=0.5)
    add(L, tb + BEAT / 2, bassn(bass[b % 4] + (12 if beat % 4 == 3 else 0), BEAT * 0.4), gain=0.42)
    ch = chords[b % 4]
    for k in range(4):
        add(L, tb + k * BEAT / 4, pluck(ch[(beat * 4 + k) % 4] + 12), pan=(-0.4 if k % 2 else 0.4), gain=0.16)
    beat += 1

# 잔잔한 판: 두 박마다 코드음 하나씩 부드럽게 뜯는다
if SOFT:
    k = 0; tb = BEAT * 2
    while tb < dur - bar:
        b = int(tb // bar); ch = chords[b % 4]
        add(L, tb, lowpass(pluck(ch[(k * 3) % 4] + 12, 0.9), 1800), pan=(-0.3 if k % 2 else 0.3), gain=0.10)
        k += 1; tb += BEAT * 2

# 킥에 맞춘 사이드체인(패드·베이스가 숨쉬듯)
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR); n = int(0.28 * SR); t = np.arange(n) / SR
    j = min(N, i + n); duck[i:j] = np.minimum(duck[i:j], 1 - 0.35 * np.exp(-t[: j - i] * 12))
L *= duck; R *= duck
# 끝 페이드
fo = int(1.5 * SR); end = int(dur * SR)
for B in (L, R):
    B[end - fo:end] *= np.linspace(1, 0, fo); B[end:] = 0
mix = np.stack([L[:end], R[:end]], 1)
mix /= np.max(np.abs(mix)) + 1e-9; mix *= 0.89
pcm = (mix * 32767).astype(np.int16)
import wave
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("ok", sys.argv[1], f"{dur:.1f}s")
