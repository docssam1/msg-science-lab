"""단원평가 스캔 PDF → 문항 블록 PNG (문항 번호·묶음 번호 지움)
사용: python crop_blocks.py <PDF 폴더> <출력 폴더>
  PDF 폴더에 '최다빈출 단원평가 세트{n}.pdf'(n=1..4)가 있어야 한다.
출력: s{세트}-q{번호}.png(문항) · s{세트}-g{시작번호}.png(묶음 공통 지문) · blocks.json
  파일 이름의 세트·번호는 작업용이다. 저장소에 올릴 때는 분류 체계로 바꾼다(TASK 문서 참조).
원리: 2단 조판. 각 단 왼쪽 여백의 파란 번호 글자(높이 20~28px@200dpi)를 찾아 블록을 나눈다.
  폭 80px 초과 = 묶음 번호 [04~06]. 폭이 넓고 속이 찬 파란 영역(그림 속 자석)은 제외.
"""
import sys, os, json, pymupdf, numpy as np, cv2

def blue_mask(im):
    r, g, b = [im[:, :, i].astype(int) for i in range(3)]
    return (b > 170) & (r < 120) & (g < 150) & (b - r > 80)

def main(src, out):
    os.makedirs(out, exist_ok=True); meta = {}
    for s in range(1, 5):
        path = os.path.join(src, f"최다빈출 단원평가 세트{s}.pdf")
        if not os.path.exists(path): continue
        n = 0
        for pi, p in enumerate(pymupdf.open(path)):
            pm = p.get_pixmap(dpi=200)
            im = np.frombuffer(pm.samples, np.uint8).reshape(pm.h, pm.w, pm.n)[:, :, :3].copy()
            H, W = im.shape[:2]; blue = blue_mask(im)
            top = 320 if pi == 0 else 120; bot = H - 150
            for cx0, cx1, colL, colR in [(int(W*.10), int(W*.17), int(W*.09), int(W*.495)),
                                         (int(W*.515), int(W*.585), int(W*.505), int(W*.94))]:
                rows = blue[top:bot, cx0:cx1].sum(1) > 3
                labels, y = [], 0
                while y < len(rows):
                    if rows[y]:
                        y0 = y
                        while y < len(rows) and rows[y:y+6].any(): y += 1
                        seg = blue[y0+top:y+top, cx0-10:cx0+260]; xs = np.where(seg.any(0))[0]
                        if 20 <= y - y0 <= 28 and len(xs):
                            wide = xs[-1] - xs[0] > 80
                            solid = seg.sum() / (seg.shape[0] * (xs[-1] - xs[0] + 1)) >= .45
                            if not (wide and solid):
                                labels.append((y0 + top, 'G' if wide else 'Q', cx0 - 10 + xs[-1]))
                    y += 1
                for k, (ly, kind, lx1) in enumerate(labels):
                    y2 = labels[k+1][0] - 12 if k + 1 < len(labels) else bot
                    im2 = im.copy()
                    # 번호 지우기: 번호 글자 상자 + 뒤 여백을 흰색으로
                    im2[ly-4:ly+32, colL:lx1+10] = 255
                    crop = im2[ly-14:y2, colL:colR]
                    nz = np.where((crop < 235).any(2).any(1))[0]
                    if len(nz): crop = crop[:nz[-1] + 10]
                    if kind == 'Q': n += 1; key = f"s{s}-q{n:02d}"
                    else: key = f"s{s}-g{n+1:02d}"
                    cv2.imwrite(os.path.join(out, key + ".png"), cv2.cvtColor(crop, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_PNG_COMPRESSION, 9])
                    meta[key] = {"set": s, "page": pi + 1, "kind": kind}
        print(f"세트{s}: 문항 {n}")
    json.dump(meta, open(os.path.join(out, "blocks.json"), "w"), ensure_ascii=False, indent=1)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
