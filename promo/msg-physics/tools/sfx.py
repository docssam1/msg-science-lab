#!/usr/bin/env python3
"""쇼릴 효과음 트랙 — 전부 코드로 합성(녹음·샘플 없음, 저작권 걱정 없음). 48kHz 스테레오.
사용: python3 sfx.py out.wav 전체초 events.json
events.json = [[초, 종류, (배율)], ...]  종류: whoosh pop tick clank spring ding buzz stamp sparkle impact swell"""
import sys, json, wave, numpy as np

SR = 48000
total = float(sys.argv[2])
events = json.load(open(sys.argv[3]))
N = int(SR * (total + 2))
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)

def tt(sec): return np.arange(int(sec * SR)) / SR
def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for k in range(len(x)): p = (1 - a) * x[k] + a * p; y[k] = p
    return y
def sweep_lp(x, f0, f1):   # 시간에 따라 차단 주파수가 움직이는 저역 통과
    fc = np.geomspace(f0, f1, len(x)); a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); p = 0.0
    for k in range(len(x)): p = (1 - a[k]) * x[k] + a[k] * p; y[k] = p
    return y
def tone(f, t, phase=0.0): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, t.shape)) / SR + phase)

def whoosh():
    t = tt(0.55); x = rng.standard_normal(len(t))
    half = len(t) // 2
    y = np.concatenate([sweep_lp(x[:half], 300, 5000), sweep_lp(x[half:], 5000, 500)])
    env = np.sin(np.pi * t / t[-1]) ** 2
    return y * env * 0.9, np.linspace(-0.7, 0.7, len(t))   # 왼쪽 → 오른쪽으로 지나간다
def pop():
    t = tt(0.09); f = 520 + 900 * (t / t[-1])
    return tone(f, t) * np.exp(-t * 38) * 0.8, 0.0
def tick():
    t = tt(0.05); x = lowpass(rng.standard_normal(len(t)), 7000) * np.exp(-t * 400)
    return (x * 0.5 + tone(1900, t) * np.exp(-t * 90) * 0.5), 0.1
def clank():   # 쇠고리에 물체가 걸리는 소리: 비정수배 배음 + 낮은 쿵
    t = tt(0.6); y = np.zeros(len(t))
    for f, g, d in [(610, 1, 7), (1480, .6, 9), (2390, .4, 12), (3310, .25, 16)]: y += g * tone(f, t) * np.exp(-t * d)
    y += 1.4 * tone(95 + 60 * np.exp(-t * 30), t) * np.exp(-t * 22)
    return y * 0.35, -0.05
def spring():   # 용수철 '뾰잉'
    t = tt(0.55); f = 170 * (1 + 0.9 * np.exp(-t * 7)) * (1 + 0.06 * np.sin(2 * np.pi * 22 * t) * np.exp(-t * 3))
    return tone(f, t) * np.exp(-t * 5.5) * 0.75 + 0.2 * tone(f * 2.01, t) * np.exp(-t * 8), 0.0
def ding():     # 맞았어요: 종소리 두 음
    y = np.zeros(int(1.4 * SR))
    for st, f in [(0, 1318.5), (0.09, 1975.5)]:
        t = tt(1.3); s = (tone(f, t) + .35 * tone(f * 2.76, t) * np.exp(-t * 4) + .15 * tone(f * 5.4, t) * np.exp(-t * 8)) * np.exp(-t * 3.2)
        i = int(st * SR); y[i:i + len(s)] += s[: len(y) - i]
    return y * 0.32, 0.0
def buzz():     # 다시 생각해요: 부드러운 낮은 두 음(경고음처럼 날카롭지 않게)
    y = np.zeros(int(0.5 * SR))
    for st, f in [(0, 330), (0.13, 262)]:
        t = tt(0.3); s = lowpass(np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + tone(f, t) * 0.5, 1600) * np.exp(-t * 9)
        i = int(st * SR); y[i:i + len(s)] += s
    return y * 0.4, 0.0
def stamp():    # 도장 쾅
    t = tt(0.35); body = tone(58 + 90 * np.exp(-t * 40), t) * np.exp(-t * 16)
    hit = lowpass(rng.standard_normal(len(t)), 2200) * np.exp(-t * 45)
    return (1.2 * body + 0.8 * hit) * 0.6, 0.0
def sparkle():  # 축하: 위로 올라가는 반짝임
    y = np.zeros(int(1.3 * SR)); notes = [1046.5, 1318.5, 1568, 2093, 2637]
    for k, f in enumerate(notes):
        t = tt(0.7); s = (tone(f, t) + .3 * tone(f * 2, t)) * np.exp(-t * 7)
        i = int(k * 0.065 * SR); y[i:i + len(s)] += s
    t = tt(1.3); sh = (rng.standard_normal(len(t)) - lowpass(rng.standard_normal(len(t)), 6000)) * np.exp(-t * 3) * 0.12
    return (y * 0.22 + sh), 0.0
def impact():   # 로고가 들어올 때
    t = tt(1.4); sub = tone(38 + 70 * np.exp(-t * 9), t) * np.exp(-t * 2.6)
    air = lowpass(rng.standard_normal(len(t)), 3000) * np.exp(-t * 9)
    return (1.1 * sub + 0.5 * air) * 0.7, 0.0
def swell():    # 화면이 다가갈 때 살짝 부푸는 바람
    t = tt(0.8); x = sweep_lp(rng.standard_normal(len(t)), 200, 2500)
    return x * (t / t[-1]) ** 2 * np.exp(-np.maximum(0, t - 0.7) * 30) * 0.5, 0.0

KINDS = dict(whoosh=whoosh, pop=pop, tick=tick, clank=clank, spring=spring, ding=ding, buzz=buzz, stamp=stamp, sparkle=sparkle, impact=impact, swell=swell)
for ev in events:
    at, kind = float(ev[0]), ev[1]; g = float(ev[2]) if len(ev) > 2 else 1.0
    sig, pan = KINDS[kind]()
    i = int(max(0, at) * SR); j = min(N, i + len(sig))
    if j <= i: continue
    s = sig[: j - i] * g; pn = pan[: j - i] if isinstance(pan, np.ndarray) else pan
    L[i:j] += s * (1 - np.maximum(0, pn)); R[i:j] += s * (1 + np.minimum(0, pn))

# 가벼운 잔향(방 소리) — 효과음이 음악 위에서 따로 놀지 않게
for B in (L, R):
    wet = np.zeros_like(B)
    for d, g in [(0.029, .22), (0.041, .18), (0.067, .14), (0.097, .1), (0.131, .07)]:
        k = int(d * SR); wet[k:] += B[:-k] * g
    B += lowpass(wet, 5000)
end = int(total * SR)
mix = np.stack([L[:end], R[:end]], 1)
peak = np.max(np.abs(mix)) + 1e-9
if peak > 0.95: mix *= 0.95 / peak
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok", sys.argv[1], len(events), "events")
