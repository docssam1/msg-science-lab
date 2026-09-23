import fs from 'node:fs';
import {pages,narration,lessonNames} from '../../sample-v2/content.js';
import {introPages} from '../../sample-v2/inquiry-pages.js';
import {qrLinks} from '../../sample-v2/qr-map.js';
const all=[...introPages,...pages];
const app=fs.readFileSync(new URL('../../sample-v2/app.js',import.meta.url),'utf8');
const section=app.slice(app.indexOf('let paperSerial=0;'),app.indexOf('function printBuild'));
const build = new Function('pages','lessonNames','qrLinks','isTeacher',section+'return pages.map(paper).join(\'\');');
for(const teacher of [false,true]){
 const body=build(all,lessonNames,qrLinks,teacher);
 fs.writeFileSync(new URL(`../../print-${teacher?'teacher':'student'}.html`,import.meta.url),`<!doctype html><html lang="ko"><head><meta charset="UTF-8"><title>Science Lab · 추가 탐구와 QR</title></head><body class="${teacher?'teacher-mode':''}"><div id="print-root">${body}</div></body></html>`);
}
