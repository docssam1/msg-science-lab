// 공용 도우미. 교재 그림은 모두 3D 렌더 그림(art3d.js · stills3d.js · lab3d.js · balance3d.js)으로 바꿨다(2026-10-12).
export const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// 오른쪽(무게 × 거리)이 크면 양수(시계 방향 = 오른쪽이 내려감). 한 칸 차이당 2도, 최대 8도.
export const leverAngle=(left,right)=>Math.max(-8,Math.min(8,(right.n*right.b-left.n*left.a)*2));
