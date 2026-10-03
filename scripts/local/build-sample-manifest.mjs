// Hash the committed blobs, not the Windows worktree bytes: Pages checks out LF files on Linux.
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const target=path.join(root,'tests/two-lesson/file-manifest.json');
const tracked=execFileSync('git',['ls-files','-z','--','sample-v2'],{cwd:root}).toString('utf8').split('\0').filter(Boolean);
const rows=tracked.map(file=>{
 const data=execFileSync('git',['show',`HEAD:${file}`],{cwd:root,maxBuffer:200*1024*1024});
 return {path:file.slice('sample-v2/'.length),size:data.length,sha256:createHash('sha256').update(data).digest('hex')};
});
if(process.argv.includes('--check')){
 const saved=JSON.parse(await readFile(target,'utf8'));
 if(JSON.stringify(saved)!==JSON.stringify(rows))throw new Error('Public sample manifest is stale: run node scripts/local/build-sample-manifest.mjs and commit it.');
 console.log(`Public sample manifest current: ${rows.length} committed files`);
}else{
 await writeFile(target,JSON.stringify(rows,null,2)+'\n');
 console.log(`Public sample manifest updated: ${rows.length} committed files`);
}
