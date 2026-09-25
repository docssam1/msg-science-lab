"""Build the P1-P20 QR artwork from the active lesson page plan.

Requires qrcode[pil]. The existing source-scene QR files are left intact.
"""

import json
import subprocess
from pathlib import Path
from urllib.parse import quote

import qrcode
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
TARGET = ROOT / "sample-v2" / "qr"
SITE = "https://docssam1.github.io/msg-science-lab/sample-v2/index.html"
JS = (
    "import {studentPrintPages} from './sample-v2/lesson-print-pages.js';"
    "console.log(JSON.stringify(studentPrintPages.map(p=>({id:p.printId,action:p.action}))));"
)


def main():
    raw = subprocess.check_output(
        ["node", "--input-type=module", "-e", JS], cwd=ROOT, text=True
    )
    pages = json.loads(raw)
    assert [p["id"] for p in pages] == [f"P{i}" for i in range(1, 21)]
    for page in pages:
        number = int(page["id"][1:])
        action = quote(page["action"] or "source", safe="")
        url = f"{SITE}?edition=student&page={number}&activity={action}"
        qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=4)
        qr.add_data(url)
        qr.make(fit=True)
        image = qr.make_image(fill_color="black", back_color="white").convert("1")
        image = image.resize((450, 450), Image.Resampling.NEAREST)
        image.save(TARGET / f"{page['id']}.png", optimize=True)
    print(f"built {len(pages)} page-specific QR images in {TARGET}")


if __name__ == "__main__":
    main()
