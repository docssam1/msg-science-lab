// Ideal Hooke-law teaching model. Rendering and measured quantities remain separate.
// References: myPhysicsLab Spring / damped spring documentation (see credits).
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
export class SpringMotion {
 constructor(value=0){this.value=value;this.velocity=0;this.target=value;this.age=2;}
 set(value,instant=false){this.target=finite(value);this.age=0;if(instant){this.value=this.target;this.velocity=0;this.age=2;}}
 update(dt){let remaining=Math.min(.06,Math.max(0,dt));while(remaining>0){const h=Math.min(remaining,1/150);const a=110*(this.target-this.value)-7.6*this.velocity;this.velocity+=a*h;this.value+=this.velocity*h;remaining-=h;this.age+=h;}if(this.settled){this.value=this.target;this.velocity=0;}return this.value;}
 get settled(){return this.age>.6&&Math.abs(this.value-this.target)<.03&&Math.abs(this.velocity)<.08;}
}
export function apparentReading({force,zero=0,cameraY,cameraZ,pointerZ=.38,scaleZ=.04,y0=1.2,pitch=.07}){
 const pointerY=y0-(force+zero)*pitch;
 const t=(scaleZ-cameraZ)/(pointerZ-cameraZ);
 const scaleY=cameraY+t*(pointerY-cameraY);
 return {pointerY,scaleY,value:(y0-scaleY)/pitch};
}
export const dataLesson=[[10,3],[20,6],[30,9]];
export const dataAssessment=[[10,4],[20,8],[30,12]];
export function gradePoints(got,expected){return Array.isArray(got)&&got.length===expected.length&&expected.every(([x,y])=>got.some(p=>p[0]===x&&p[1]===y));}
export function normalize(s){return String(s??'').normalize('NFKC').replace(/[\s.,·()]/g,'').toLowerCase();}
export function gradeQuestion(q,values){
 if(q.kind==='graph')return gradePoints(values,q.answer);
 if(Array.isArray(q.answer))return q.answer.every((v,i)=>normalize(values?.[i])===normalize(v));
 return normalize(values)===normalize(q.answer);
}
