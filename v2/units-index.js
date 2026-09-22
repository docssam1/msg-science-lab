import { taxonomy as tx41u01 } from '../data/units/s41-u01.taxonomy.js';
import { taxonomy as tx41u02 } from '../data/units/s41-u02.taxonomy.js';
import { taxonomy as tx41u03 } from '../data/units/s41-u03.taxonomy.js';
import { taxonomy as tx42u01 } from '../data/units/s42-u01.taxonomy.js';

// 탐구 지도의 정거장 = Drive `과학 단원평가` 폴더의 단원(data/source-toc.md §1). 중간·기말평가는 제외.
// ready: 5E 화면이 있는 단원. 새 단원을 만들면 v2.js UNITS와 여기 ready 둘 다 등록한다.
export const SEMS = [
  { sem: '3-1', units: ['힘과 우리 생활', '동물의 생활', '식물의 생활'] },
  { sem: '3-2', units: ['재미있는 나의 탐구', '동물의 생활', '지표의 변화', '물질의 상태', '소리의 성질'] },
  { sem: '4-1', units: ['자석의 이용', '물의 상태 변화', '땅의 변화'] },
  { sem: '4-2', units: ['식물의 생활', '물의 상태 변화', '그림자와 거울', '화산과 지진', '물의 여행'] },
  { sem: '5-1', units: ['과학자는 어떻게 탐구할까요', '온도와 열', '태양계와 별', '용해와 용액', '다양한 생물과 우리 생활'] },
  { sem: '5-2', units: ['재미있는 나의 탐구', '생물과 환경', '날씨와 우리 생활', '물체의 운동', '산과 염기'] },
  { sem: '6-1', units: ['과학자처럼 탐구해 볼까요', '지구와 달의 운동', '여러 가지 기체', '식물의 구조와 기능', '빛과 렌즈'] },
  { sem: '6-2', units: ['전기의 이용', '계절의 변화', '연소와 소화', '우리 몸의 구조와 기능', '에너지와 생활'] },
].map((s) => ({ ...s, units: s.units.map((title, i) => ({ id: `s${s.sem.replace('-', '')}-u${String(i + 1).padStart(2, '0')}`, no: i + 1, title })) }));

// subs = 소단원(교육과정 내용 요소). 소단원 화면 #/<단원>/sub/<E>
const subsOf = (tx) => tx.elements.map((e) => ({ ...e, types: tx.types.filter((t) => t.element === e.id).length }));
// lesson:false = 5단계 화면 준비 전(소단원 유형별 문제만 열림)
export const READY = {
  's41-u01': { hero: '고리 자석 탑', subs: subsOf(tx41u01) },
  's41-u02': { hero: '얼음 병 저울', subs: subsOf(tx41u02) },
  's41-u03': { hero: '흙 언덕 물길', subs: subsOf(tx41u03),
    labs: [{ id: 's41-u03', hero: '흙 언덕 물길', covers: ['E1', 'E2'] }, { id: 's41-u03b', hero: '화산 실험실', covers: ['E3', 'E4', 'E5', 'E6'] }] },
  's41-u03b': { hero: '화산 실험실', subs: subsOf(tx41u03), hidden: true },   // 땅의 변화의 두 번째 5단계 수업(지도에는 정거장 없음)
  's42-u01': { hero: '부레옥잠 연못', subs: subsOf(tx42u01) },
};
