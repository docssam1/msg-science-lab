#!/usr/bin/env python3
"""전신 표정 그림 만들기 — sample-v2/art/expressions-full/<표정>.png
승인된 전신(art/urusaem.png) 몸에 승인된 표정 그림(art/expressions/*.png)의 **머리 전체**를 올린다.
원장 결정(2026-09-26): "전신 + 표정 머리 올리기" 허용. 얼굴·입·눈을 새로 그리지는 않는다(그림은 전부 승인본).
머리 위치는 머리카락·안경·귀의 특징점(SIFT)으로 맞춘다 — 크기 약 1.48배, 기울기는 표정 그림 그대로.
사용: python3 scripts/make-full-expressions.py   (sample-v2/art 기준, opencv-python 필요)"""
import os, json, cv2, numpy as np
from PIL import Image
ART = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sample-v2', 'art')
NAMES = ['listen', 'explain', 'think', 'surprise', 'praise', 'encourage']
full0 = np.array(Image.open(os.path.join(ART, 'urusaem.png')).convert('RGBA')).astype(np.float32)
H, W = full0.shape[:2]
def gray(rgba):
    a = rgba[..., 3:4] / 255.0
    return cv2.cvtColor((rgba[..., :3] * a + 255 * (1 - a)).astype(np.uint8), cv2.COLOR_RGB2GRAY)
sift = cv2.SIFT_create(4000)
kf, df = sift.detectAndCompute(gray(full0)[:620], None)
os.makedirs(os.path.join(ART, 'expressions-full'), exist_ok=True)
record = {}
for n in NAMES:
    b = np.array(Image.open(os.path.join(ART, 'expressions', n + '.png')).convert('RGBA')).astype(np.float32)
    kb, db = sift.detectAndCompute(gray(b), None)
    good = [x for x, y in cv2.BFMatcher().knnMatch(db, df, k=2) if x.distance < 0.72 * y.distance]
    M, inl = cv2.estimateAffinePartial2D(np.float32([kb[g.queryIdx].pt for g in good]), np.float32([kf[g.trainIdx].pt for g in good]), method=cv2.RANSAC, ransacReprojThreshold=4)
    # 머리 마스크: 턱 위는 전부, 턱~옷깃은 목 폭만(어깨선이 번지지 않게), 가장자리는 부드럽게
    bh, bw = b.shape[:2]; yy, xx = np.mgrid[0:bh, 0:bw]; cx, neck = 240, 474
    mask = ((yy < neck) & (np.abs(xx - cx) < np.interp(yy, [0, 400, neck], [999, 150, 70]))).astype(np.float32)
    bm = b.copy(); bm[..., 3] *= cv2.GaussianBlur(mask, (0, 0), 3)
    warped = cv2.warpAffine(bm, M.astype(np.float32), (W, H), flags=cv2.INTER_LANCZOS4, borderValue=(0, 0, 0, 0))
    # 원래 머리(옷깃 위)는 지운다 — 새 머리 밖으로 옛 머리선이 비치지 않게. 왼쪽 들어 올린 손은 그대로.
    ny = int(M[1, 0] * cx + M[1, 1] * 400 + M[1, 2]) - 10
    full = full0.copy(); full[..., 3] = np.where((np.arange(H)[:, None] < ny) & (np.arange(W)[None, :] > 180), 0, full[..., 3])
    a = np.clip(warped[..., 3:4] / 255.0, 0, 1); ba = full[..., 3:4] / 255.0; oa = a + ba * (1 - a)
    out = full.copy(); out[..., :3] = (warped[..., :3] * a + full[..., :3] * ba * (1 - a)) / np.maximum(oa, 1e-6); out[..., 3] = oa[..., 0] * 255
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(ART, 'expressions-full', n + '.png'), optimize=True)
    record[n] = {'path': f'./art/expressions-full/{n}.png', 'affine': np.round(M, 4).tolist(), 'inliers': int(inl.sum())}
    print(n, 'inliers', int(inl.sum()))
json.dump({'source': ['./art/urusaem.png', './art/expressions/*.png'], 'policy': 'Approved expression heads placed whole on the approved full body (principal approved 2026-09-26). No generated faces, mouths or eyes.', 'expressions': record}, open(os.path.join(ART, 'expressions-full', 'manifest.json'), 'w'), ensure_ascii=False, indent=2)
