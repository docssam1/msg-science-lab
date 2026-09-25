#!/usr/bin/env python3
"""말하는 우루사쌤(전신) — 영상에 겹칠 캐릭터 트랙(30fps PNG 연속, 투명 배경)을 만든다.
승인된 표정 그림(sample-v2/art/expressions, 얼굴 합성·그려 넣기 금지)을 **통째로 바꿔 끼우기만** 한다.
  · 말하는 동안: 내레이션 소리 크기에 맞춰 explain(입 벌림) ↔ listen(입 다묾)을 번갈아 → 입이 움직인다
  · 말하지 않을 때: 장면의 표정(mood) — listen / think / surprise / praise / encourage / explain
  · 움직임: 말할 때 고개 끄덕임·기울기, 쉴 때 숨쉬기, praise는 살짝 뛰기, surprise는 흠칫
사용: python3 talker.py 출력폴더 길이초 시작초 음성.mp3|- 표정 [높이px]"""
import sys, os, math, subprocess, numpy as np
from PIL import Image, ImageFilter

out, dur, lead, mp3, mood = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5]
H = int(sys.argv[6]) if len(sys.argv) > 6 else 520
FPS = 30; N = int(round(dur * FPS))
HERE = os.path.dirname(os.path.abspath(__file__))
EXP = os.path.join(HERE, '..', '..', '..', 'sample-v2', 'art', 'expressions-full')   # 전신 표정(승인 머리 + 승인 몸)
os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    if f.endswith('.png'): os.remove(os.path.join(out, f))

# 표정 그림: 공통 테두리 상자로 잘라 같은 크기로 맞춘다(바꿔 끼울 때 머리가 튀지 않게)
names = ['listen', 'explain', 'think', 'surprise', 'praise', 'encourage']
raw = {n: Image.open(os.path.join(EXP, n + '.png')).convert('RGBA') for n in names}
box = None
for im in raw.values():
    b = im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
W0 = box[2] - box[0]; H0 = box[3] - box[1]; Wd = int(round(W0 * H / H0))
face = {n: im.crop(box).resize((Wd, H), Image.LANCZOS) for n, im in raw.items()}
PAD = 40; CW, CH = Wd + PAD * 2, H + PAD   # 기울기·들썩임 여유(아래는 화면 끝에 붙는다)

# 그림자(한 번만)
def shadowed(img):
    a = img.getchannel('A').filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.28))
    sh = Image.new('RGBA', img.size, (18, 50, 34, 0)); sh.putalpha(a)
    base = Image.new('RGBA', img.size, (0, 0, 0, 0)); base.alpha_composite(sh, (0, 0)); base.alpha_composite(img)
    return base
face = {n: shadowed(im) for n, im in face.items()}

# 내레이션 소리 크기(프레임마다)
rms = np.zeros(N)
if mp3 != '-' and os.path.exists(mp3):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '48000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    hop = 48000 // FPS; k0 = int(round(lead * FPS))
    for i in range(len(x) // hop):
        j = k0 + i
        if 0 <= j < N: rms[j] = math.sqrt(float(np.mean(x[i * hop:(i + 1) * hop] ** 2)) + 1e-12)
peak = np.percentile(rms[rms > 0], 95) if (rms > 0).any() else 1
env = rms / (peak + 1e-9)
# 말하는 구간: 소리가 있고(히스테리시스), 짧은 쉼(0.25초 이하)은 이어 준다
talk = np.zeros(N, bool); on = False
for i in range(N):
    on = env[i] > (0.16 if on else 0.24); talk[i] = on
gap = 0
for i in range(N):
    if talk[i]:
        if 0 < gap <= 8: talk[i - gap:i] = True
        gap = 0
    else: gap += 1
# 입: 음절 박자(초당 약 5.5번, 조금씩 흔들림)로 벌렸다 다물되, 소리가 약해지는 순간에는 다문다
rng = np.random.default_rng(3); mouth = np.zeros(N, bool); ph = 0.0
for i in range(N):
    if not talk[i]: ph = 0.0; continue
    ph = (ph + (5.5 + rng.uniform(-1.2, 1.2)) / FPS) % 1.0
    lo, hi = max(0, i - 2), min(N, i + 3); loc = env[lo:hi].mean()
    mouth[i] = ph < 0.6 and env[i] > 0.12 and env[i] >= loc * 0.45
last_talk = np.where(talk)[0].max() if talk.any() else -1

for i in range(N):
    t = i / FPS
    if talk[i]:
        name = 'explain' if mouth[i] else 'listen'
        dy = -abs(math.sin(2 * math.pi * 1.7 * t)) * 7 - env[i] * 4
        rot = math.sin(2 * math.pi * 0.85 * t) * 1.6
    else:
        name = mood
        dy = math.sin(2 * math.pi * 0.45 * t) * 2.5; rot = math.sin(2 * math.pi * 0.3 * t) * 0.8
        after = (i - last_talk) / FPS if last_talk >= 0 and i > last_talk else t
        if mood == 'praise': dy -= max(0.0, math.sin(min(math.pi, after * 5))) * 16    # 톡 뛰기
        if mood == 'surprise': rot += math.sin(after * 40) * 3 * math.exp(-after * 6)    # 흠칫
        if mood == 'think': rot += 2.2                                                    # 갸웃
    img = face[name].rotate(rot, resample=Image.BICUBIC, expand=False, center=(Wd / 2, H))
    c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    c.alpha_composite(img, (PAD, int(round(PAD + dy))))
    c.save(os.path.join(out, f'{i:05d}.png'), compress_level=1)
print('ok', out, N, 'frames', f'talk {talk.mean():.0%}', f'open {mouth[talk].mean() if talk.any() else 0:.0%}', f'{CW}x{CH}')
