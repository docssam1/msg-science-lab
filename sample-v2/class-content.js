// Adapt the same textbook data to landscape teaching/self-study scenes.
// Interaction pattern follows the user-supplied lete-on v2/deck.js reference.
import {pages,questions,questionHTML} from './content.js';
const el=(h)=>{const t=document.createElement('template');t.innerHTML=h;return t.content;};
const copy=e=>e.outerHTML;
function readingParts(node,max=340){
 const text=node.textContent; if(text.length<=max)return [copy(node)];
 const sentences=text.match(/[^.!?。]+[.!?。]?[\s]*/g)||[text];let chunks=[],buf='';
 for(const s of sentences){if(buf&&buf.length+s.length>max){chunks.push(buf);buf='';}buf+=s;}if(buf)chunks.push(buf);
 return chunks.map(t=>{const d=document.createElement('div');d.className='source-prose';const p=document.createElement('p');p.textContent=t;d.append(p);return d.outerHTML;});
}
function blockUnits(p){
 const root=el(p.body),blocks=[];
 for(const node of [...root.children]){
  if(node.matches('button,.page-actions,.teacher-answer,.teacher-graphic'))continue;
  if(node.matches('.scale-types')){for(const n of node.children)blocks.push({html:'<div class="scale-types">'+copy(n)+'</div>',large:true});continue;}
  if(node.matches('.source-prose')&&node.textContent.length>360){for(const s of readingParts(node))blocks.push({html:s,large:true});continue;}
  if(node.matches('.tools-grid')){const c=[...node.children];for(let i=0;i<c.length;i+=3)blocks.push({html:'<div class="tools-grid">'+c.slice(i,i+3).map(copy).join('')+'</div>',large:true});continue;}
  blocks.push({html:copy(node),large:node.matches('.split,.trio-art,.inquiry-log,.film-poster,.student-graphic,.art')||!!node.querySelector('.book-table')||!!node.querySelector('.write-lines')||!!node.querySelector('.process')||!!node.querySelector('svg')||node.textContent.length>180});
 }
 return blocks;
}
export function buildClassSlides(){
 const result=[];
 for(const p of pages){
  if(p.assessment){
   const node=el(p.body);const qs=[...node.querySelectorAll('[data-q]')];
   for(const n of qs){const q=questions.find(q=>q.id===n.dataset.q);result.push({id:p.id+'-'+q.id,page:p.id,lesson:p.lesson,title:p.lesson+'차시 · 확인 문제 '+q.n,kicker:'생각하고 답하기',html:questionHTML(q),question:q,action:q.kind==='graph'?'assessment-graph':null,notes:p.teacher});}
   continue;
  }
  const units=blockUnits(p), groups=[];let group=[];
  for(const u of units){if(group.length&&(u.large||group.some(b=>b.large)||group.length>=2)){groups.push(group);group=[];}group.push(u);}if(group.length)groups.push(group);
  groups.forEach((g,i)=>result.push({id:p.id+'-'+i,page:p.id,lesson:p.lesson,title:p.title.replace(/\n/g,' '),kicker:p.kicker.split('·').at(-1).trim()+(groups.length>1?' · '+(i+1)+'/'+groups.length:''),html:g.map(b=>b.html).join(''),question:null,action:p.action,notes:p.teacher,lead:p.lead}));
 }
 return result;
}
