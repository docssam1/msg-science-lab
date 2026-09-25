const DB_NAME='msg-science-lab-assessment-photos';
const STORE='photos';
const MAX_BYTES=12*1024*1024;
let database;

function openDatabase(){
 if(!('indexedDB' in window))return Promise.reject(new Error('사진 보관을 사용할 수 없어요.'));
 if(database)return database;
 database=new Promise((resolve,reject)=>{
  const request=indexedDB.open(DB_NAME,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(STORE);
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error||new Error('사진 보관을 열 수 없어요.'));
 });
 return database;
}
async function photoRecord(key,operation,value){
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const transaction=db.transaction(STORE,operation==='get'?'readonly':'readwrite');
  const request=transaction.objectStore(STORE)[operation](...(operation==='get'||operation==='delete'?[key]:[value,key]));
  transaction.oncomplete=()=>resolve(request.result);
  transaction.onerror=()=>reject(transaction.error||new Error('사진을 보관하지 못했어요.'));
  transaction.onabort=()=>reject(transaction.error||new Error('사진 보관이 중단됐어요.'));
 });
}

export function mountAssessmentPhoto(root,printId){
 const page=root.querySelector(`.paper.assessment[data-print-id="${printId}"]`);
 if(!page)return ()=>{};
 const area=document.createElement('section');
 area.className='assessment-photo';
 area.setAttribute('aria-label','종이에 쓴 답안 사진');
 area.innerHTML='<h2>종이에 쓴 답도 남겨요</h2><p>답안을 찍거나 사진을 골라 이 쪽에 붙여 두세요.</p><div class="photo-controls"><label class="photo-pick">📷 사진 찍어 첨부<input type="file" accept="image/*" capture="environment" aria-label="답안 사진 선택 또는 촬영"></label><button type="button" class="photo-remove" hidden>사진 삭제</button></div><div class="photo-preview" hidden><img alt="첨부한 답안 사진 미리보기"><span class="photo-name"></span></div><p class="photo-status" role="status" aria-live="polite">사진은 이 기기에만 보관돼요. 선생님께 자동 전송되지 않아요.</p>';
 page.querySelector('.page-body').after(area);
 const input=area.querySelector('input');
 const preview=area.querySelector('.photo-preview');
 const img=area.querySelector('img');
 const name=area.querySelector('.photo-name');
 const remove=area.querySelector('.photo-remove');
 const status=area.querySelector('.photo-status');
 const key='assessment:'+printId;
 let active=true,url='';
 function show(record){
  if(url)URL.revokeObjectURL(url);
  url=record?URL.createObjectURL(record.blob):'';
  img.removeAttribute('src');
  if(record){img.src=url;name.textContent=record.name||'답안 사진';}
  preview.hidden=!record;remove.hidden=!record;
 }
 photoRecord(key,'get').then(record=>{if(active&&record)show(record);}).catch(()=>{if(active)status.textContent='이 브라우저에서는 사진을 보관할 수 없어요. 답은 글자로 적어 주세요.';});
 input.onchange=async()=>{
  const file=input.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){status.textContent='사진 파일을 골라 주세요.';input.value='';return;}
  if(file.size>MAX_BYTES){status.textContent='사진이 너무 커요. 12 MB 이하로 다시 골라 주세요.';input.value='';return;}
  try{await photoRecord(key,'put',{blob:file,name:file.name,time:Date.now()});if(active){show({blob:file,name:file.name});status.textContent='이 기기에 사진을 보관했어요. 선생님께 자동 전송되지는 않아요.';}}
  catch{if(active)status.textContent='사진을 보관하지 못했어요. 다른 사진을 고르거나 글자로 답해 주세요.';}
  input.value='';
 };
 remove.onclick=async()=>{
  try{await photoRecord(key,'delete');if(active){show(null);status.textContent='사진을 삭제했어요.';}}
  catch{if(active)status.textContent='사진을 삭제하지 못했어요. 다시 시도해 주세요.';}
 };
 return ()=>{active=false;if(url)URL.revokeObjectURL(url);};
}
