# 지필드 과학 탐구 랩 (`/science-lab/`)

초등 과학탐구토론 지도자료의 차례 순서로 **개념 → 3D 애니메이션 실험 → 탐구 활동 → 토론 → 확인 문제**를 밟는 정적 사이트. 빌드 도구 없음(ES 모듈, GitHub Pages 그대로 배포).

## 구조

```
science-lab/
  index.html        진입점
  app.js            해시 라우터(#/ 홈, #/u/<id> 유닛), 진도 저장(localStorage sciLab.v1)
  engine.js         Stage(Three.js 무대·조명·궤도 카메라) + Player(비트 재생기·자막·음성 토글)
  styles.css
  data/curriculum.js  PARTS·UNITS — 개념·용어·활동·변인표·토론·퀴즈
  scenes/_kit.js      공용 도형·라벨(한글 캔버스 스프라이트)·화살표·막대차트·입자
  scenes/<scene>.js   유닛당 하나
```

Three.js는 `../world-explorer/vendor/three.module.js`(r184)를 재사용한다.

## 장면 모듈 규약

```js
export default {
  view: { theta, phi, dist, target: [x, y, z] },     // 시작 카메라
  build(kit, world) {                                 // world.add(id, obj) 로 등록 → 처음엔 숨김
    ...; return { update(dt, t) {} };                 // (선택) 매 프레임 idle 애니메이션
  },
  beats: [                                            // 자막이 원본. 한 비트에 새로 보이는 것은 하나
    { text: '…', show: ['id'], hide: ['id'], dur: 5, anim(p, o, t) { /* p: 0→1 */ } },
  ],
};
```

- `goto(i)`는 항상 처음 상태로 되돌린 뒤 i 이전 비트의 최종 상태를 다시 적용한다 → 되감기가 "그때 그 화면".
- 비트 진행은 벽시계 시간으로 잰다(느린 기기에서도 자막 길이가 늘어지지 않음).
- `prefers-reduced-motion`이면 애니메이션 없이 최종 상태만 보여 준다.
- 음성은 Web Speech(ko-KR) 2단계 폴백이며 끄고도 학습에 지장이 없어야 한다.

## 유닛 추가

1. `data/curriculum.js`의 `UNITS`에 항목 추가(퀴즈 정답 letter는 쓰기 전에 분산해 둘 것).
2. `scenes/<scene>.js` 작성, 유닛의 `scene` 필드와 파일명을 맞춘다.
3. 로컬 서버(`python3 -m http.server`)로 `/science-lab/#/u/<id>` 열어 재생·이전·다음·처음, 모바일 폭 확인.

## 출처

서울특별시과학전시관, 『2009 초등학교 과학탐구토론 지도자료』. 개념 설명은 그 내용을 바탕으로 다시 썼고, 3D 장면은 원본 도형만 사용한다.
