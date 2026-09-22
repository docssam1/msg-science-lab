import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const finalPath=path.join(root,'output','MSG-초과심_물리-CH01-강의용-v1.pptx');
const outputDir=path.join(root,'.proofs','ch01-ppt','final-render');
const expectedSha256='68dd63f22d52032c8495b2d1eacb02f5c0877583860302e09a5d857714a192de';
const hash=buffer=>crypto.createHash('sha256').update(buffer).digest('hex');
const initialHash=hash(await fs.readFile(finalPath));
if(initialHash!==expectedSha256)throw new Error('Final PPTX differs from assigned verified artifact');
const runtime='C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies';
const {FileBlob,PresentationFile}=await import(pathToFileURL(runtime+'/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'));
const presentation=await PresentationFile.importPptx(await FileBlob.load(finalPath));
if(presentation.slides.items.length!==13)throw new Error('Expected 13 final slides');
await fs.mkdir(outputDir,{recursive:true});
const renders=[];
for(let index=0;index<presentation.slides.items.length;index++){
  const slide=presentation.slides.items[index];
  const blob=await presentation.export({slide,format:'png',scale:1});
  const buffer=new Uint8Array(await blob.arrayBuffer());
  const filename=`slide-${String(index+1).padStart(2,'0')}.png`;
  await fs.writeFile(path.join(outputDir,filename),buffer);
  renders.push({slide:index+1,filename,bytes:buffer.byteLength,sha256:hash(buffer)});
  console.log(`Rendered final slide ${index+1}/13`);
}
const snapshot=await presentation.inspect({kind:'slide,textbox,image,notes',maxChars:200000});
await fs.writeFile(path.join(outputDir,'final-inspection.ndjson'),snapshot.ndjson);
const finalHash=hash(await fs.readFile(finalPath));
if(finalHash!==initialHash)throw new Error('Final PPTX changed during read-only rendering');
await fs.writeFile(path.join(outputDir,'render-report.json'),JSON.stringify({finalPath,sha256:finalHash,slideCount:renders.length,renderTool:'Artifact Tool final PPTX import and PNG export',nativePowerPointInspected:false,renders},null,2));
console.log(JSON.stringify({finalPath,sha256:finalHash,slides:renders.length,outputDir}));
