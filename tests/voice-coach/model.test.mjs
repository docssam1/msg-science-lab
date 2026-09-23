import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
import {pages,questions} from '../../sample-v2/content.js';
import {checkMethod} from '../../sample-v2/inquiry.js';
const root=new URL('../../sample-v2/',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const lib=JSON.parse(read('audio/voice-library.json'));
assert.equal(lib.engine,'OmniVoice');assert.equal(lib.device_voice_fallback,false);assert.equal(pages.length,20);assert.equal(questions.length,18);
for(const p of pages){assert.ok(lib.clips[p.id]);assert.ok(lib.playlists['full:'+p.id].clips.length);for(const id of lib.playlists['full:'+p.id].clips)assert.ok(lib.clips[id]);}
for(const [id,c] of Object.entries(lib.clips)){assert.ok(c.engine.startsWith('OmniVoice'));const bytes=fs.readFileSync(new URL(c.path,root));assert.ok(bytes.length>1000);if(c.sha256)assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),c.sha256);}
for(const p of ['app.js','coach.js','class.js'])assert.ok(!/new\s+SpeechSynthesisUtterance|speechSynthesis\.speak\(/.test(read(p)));
assert.ok(!/face-overlay|class="mouth"|class="tongue"/.test(read('index.html')));
const exp=JSON.parse(read('art/expressions/manifest.json'));assert.equal(exp.source_sha256,'430e545e4c9c1e49ad3a418d4928f37a8008e04b1bb5d0fd5e88c7a6c992ae7e');
for(const m of ['listen','explain','think','surprise','praise','encourage'])assert.ok(fs.statSync(new URL('art/expressions/'+m+'.png',root)).size>10000);
assert.equal(checkMethod({zeroAtLoad:.3,zero:.3,adjustedLoaded:false,settled:true,viewMoving:false,expectedEye:2.3,reading:2.3,entered:2.3}).valid,false);
assert.equal(lib.clips['method-error'].text,'실험 방법에 오류가 있어요. 어떤 과정을 다시 살펴봐야 할까요?');
console.log(JSON.stringify({pages:pages.length,originalQuestions:questions.length,clips:Object.keys(lib.clips).length,fullReadingPlaylists:Object.keys(lib.playlists).length,noDeviceVoiceFallback:true,approvedExpressions:6}));
