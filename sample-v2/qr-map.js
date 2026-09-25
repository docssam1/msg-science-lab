export const qrById={
  "l1-inquiry": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-inquiry&lab=1",
    "action": "inquiry"
  },
  "l1-inquiry-record": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-inquiry-record&lab=1",
    "action": "inquiry"
  },
  "l1-structure": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-structure&lab=1",
    "action": "parts"
  },
  "l1-use": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-use&lab=1",
    "action": "zero"
  },
  "l1-eye": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-eye&lab=1",
    "action": "eye"
  },
  "l1-scales": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-scales&lab=1",
    "action": "types"
  },
  "l1-name": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-name&lab=1",
    "action": "history"
  },
  "l1-past": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-past&lab=1",
    "action": "watch"
  },
  "l1-watch": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-watch&lab=1",
    "action": "watch"
  },
  "l1-future": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-future&lab=1",
    "action": "spring-film"
  },
  "l1-test-a": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-test-a&lab=1",
    "action": "assessment"
  },
  "l1-test-b": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l1-test-b&lab=1",
    "action": "assessment"
  },
  "l2-elastic": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-elastic&lab=1",
    "action": "elastic"
  },
  "l2-compress": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-compress&lab=1",
    "action": "compression"
  },
  "l2-measure": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-measure&lab=1",
    "action": "measure"
  },
  "l2-graph": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-graph&lab=1",
    "action": "graph"
  },
  "l2-tools": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-tools&lab=1",
    "action": "tools"
  },
  "l2-test-a": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-test-a&lab=1",
    "action": "assessment"
  },
  "l2-test-b": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-test-b&lab=1",
    "action": "assessment"
  },
  "l2-test-graph": {
    "url": "https://docssam1.github.io/msg-science-lab/sample-v2/?s=l2-test-graph&lab=1",
    "action": "assessment-graph"
  }
};

// Page-specific links keep repeated source scenes on the printed page scanned.
export function qrForPage(page){
 const number=Number(page.printId?.slice(1));
 if(!Number.isInteger(number)||number<1||number>20)throw new Error('Invalid lesson QR page');
 return `https://docssam1.github.io/msg-science-lab/sample-v2/index.html?edition=student&page=${number}&activity=${encodeURIComponent(page.action||'source')}`;
}
