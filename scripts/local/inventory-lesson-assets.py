"""Read-only asset audit. Writes metadata only to the explicitly supplied output file.
No checkout, extraction of branch binaries, downloads, or generation of media.
"""
import argparse
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REF = 'origin/work/urusaem-voice-expressions'

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)

def digest(data):
    return hashlib.sha256(data).hexdigest()

def normalized(text):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', text)).strip()

def asset_kind(path):
    ext = Path(path).suffix.lower()
    if ext in {'.mp3', '.wav', '.ogg'}: return 'audio'
    if ext in {'.mp4', '.webm', '.ogv'}: return 'video'
    if ext in {'.png', '.jpg', '.jpeg', '.webp', '.svg'}:
        if '/qr/' in path: return 'qr'
        if '/source/' in path: return 'source-page'
        if '/expressions/' in path: return 'expression'
        return 'image-unreviewed'
    if ext == '.json' and any(s in path for s in ('audio/', 'expressions/', 'media/')):
        return 'manifest'
    return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--output', required=True)
    args = ap.parse_args()
    output = Path(args.output).resolve()
    branch_commit = git('rev-parse', REF).decode().strip()
    branch_paths = git('ls-tree', '-r', '--name-only', branch_commit).decode().splitlines()
    current_paths = []
    for directory in ('assets', 'sample-v2'):
        current_paths += [p.relative_to(ROOT).as_posix() for p in (ROOT / directory).rglob('*') if p.is_file()]
    rows = []
    for scope, paths in [('workspace', current_paths), ('preserved-branch', branch_paths)]:
        for path in sorted(paths):
            kind = asset_kind(path)
            if not kind or not path.startswith(('assets/', 'sample-v2/')): continue
            data = (ROOT / path).read_bytes() if scope == 'workspace' else git('show', f'{branch_commit}:{path}')
            row = dict(scope=scope, path=path, kind=kind, bytes=len(data), sha256=digest(data), review='pending')
            if scope == 'preserved-branch':
                current = ROOT / path
                row['workspace_match'] = 'missing' if not current.exists() else ('identical' if digest(current.read_bytes()) == row['sha256'] else 'different')
            rows.append(row)
    library = json.loads(git('show', f'{branch_commit}:sample-v2/audio/voice-library.json'))
    clips = []
    for key, clip in library['clips'].items():
        path = 'sample-v2/' + clip['path'].removeprefix('./')
        asset = next((r for r in rows if r['scope'] == 'preserved-branch' and r['path'] == path), None)
        text = clip.get('text', '')
        computed = digest(text.encode())
        declared = clip.get('text_sha256')
        clips.append(dict(id=key, path=path, seconds=clip.get('seconds'), engine=clip.get('engine', library.get('engine')),
                          text=text, computed_text_sha256=computed, declared_text_sha256=declared,
                          declared_hash_check='absent' if not declared else ('pass' if computed == declared else 'fail'),
                          normalized_text_sha256=digest(normalized(text).encode()), binary_present=asset is not None,
                          workspace_match=asset['workspace_match'] if asset else 'missing-in-preserved-branch'))
    # Existing runtime scripts are the baseline, not an approved new script.
    js = "import {narration} from './sample-v2/content.js'; console.log(JSON.stringify(narration))"
    narration = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT))
    matches = []
    for key, scene in narration.items():
        text = scene['text']
        exact = [c['id'] for c in clips if c['computed_text_sha256'] == digest(text.encode())]
        norm = [c['id'] for c in clips if c['normalized_text_sha256'] == digest(normalized(text).encode())]
        matches.append(dict(scene=key, method='text_sha256' if exact else 'normalized-text' if norm else 'no-match', candidates=exact or norm,
                            scope='existing runtime narration only; new beat script requires review'))
    duplicates = {}
    for row in rows:
        if row['scope'] == 'preserved-branch': duplicates.setdefault(row['sha256'], []).append(row['path'])
    summary = {}
    for scope in ('workspace', 'preserved-branch'):
        summary[scope] = {k: sum(r['scope'] == scope and r['kind'] == k for r in rows) for k in sorted({r['kind'] for r in rows})}
    summary['baseline_narration'] = dict(total=len(matches), matched=sum(bool(m['candidates']) for m in matches))
    summary['new_scene_reuse_rate'] = None
    summary['new_scene_reuse_rate_reason'] = 'New scene scripts and unlock timing not approved; baseline matches are candidates, not final reuse.'
    result = dict(version=1, work_status='in-progress', evidence_status='draft', release_status='locked',
                  workspace_commit=git('rev-parse', 'HEAD').decode().strip(), preserved_commit=branch_commit,
                  scan_scope=['all files in workspace assets/ and sample-v2/', 'all tracked assets/ and sample-v2/ files at preserved commit'],
                  exclusions=['untracked files outside these directories', 'remote services and unattached original PDFs'],
                  sources=[dict(path=p, sha256=digest((ROOT/p).read_bytes())) for p in ['docs/lesson-framework/README.md','docs/lesson-framework/WORK-HANDOFF-v2.md']],
                  summary=summary, assets=rows, clips=clips, baseline_matches=matches,
                  existing_duplicate_groups=[dict(sha256=h, paths=ps) for h, ps in duplicates.items() if len(ps)>1],
                  media_generation_count=0)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=False))

if __name__ == '__main__': main()
