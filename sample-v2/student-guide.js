import {sourceLessons} from './source-lessons.js';
// Student guidance describes the next available action without completing it for the learner.
export function studentGuideFor(page, index, lastIndex, activityVisited = false) {
  if (page.printId === 'P0') return {
    text: '책을 열어 볼까요? 다음 페이지를 눌러보세요.', action: 'next', label: '다음 페이지', kind: null
  };
  if (page.assessment) return {
    text: '일일 테스트예요. 말해서 나온 글을 읽고 고치거나 직접 답을 쓴 뒤, 답 확인·셀프 체크를 눌러보세요.',
    action: 'assessment', label: '문제 크게 보기', kind: null
  };
  const kind = page.action || /data-action="([^"]+)"/.exec(page.body || '')?.[1] || null;
  const cue=sourceLessons[page.printId]?.student;
  if (kind && !activityVisited) return {
    text: `${cue?cue+' ':''}실험을 해볼까요? 반짝이는 실험 버튼을 눌러보세요.`,
    action: 'activity', label: '실험 열기', kind
  };
  if (index < lastIndex) return {
    text: activityVisited ? '직접 해보았어요. 다음 페이지를 눌러보세요.' : `${cue?cue+' ':''}다음 페이지를 눌러보세요.`,
    action: 'next', label: '다음 페이지', kind: null
  };
  return {text: '여기까지 공부했어요. 읽은 내용을 다시 살펴보세요.', action: 'none', label: '', kind: null};
}

const activityPrompts={
  parts:'용수철저울의 부분을 하나씩 눌러 보세요. 어떤 일을 할까요?',
  zero:'물체를 걸기 전에 빈 저울의 표시자가 0인지 확인해 보세요.',
  inquiry:'먼저 다섯 물건의 무게를 예상하고, 직접 재서 비교해 보세요.',
  eye:'눈높이를 바꿔 보고 표시자의 윗부분을 따라 눈금을 읽어 보세요.',
  graph:'표의 값을 그래프에 직접 찍어 보세요.',
  watch:'영상을 보고 태엽이 어떻게 움직이는지 살펴보세요.',
  balance:'작은 용수철의 반복 움직임을 살펴보세요.',
  'spring-film':'영상을 보고 용수철이 늘었다 돌아오는 모습을 살펴보세요.',
  assessment:'채점 결과를 읽고 다시 살펴볼 문제를 확인해 보세요.',
  reading:'책의 글과 그림을 크게 살펴보세요.'
};
export function studentActivityPrompt(kind){
  return activityPrompts[kind]||'직접 움직이며 관찰해 보세요. 끝나면 교재로 돌아가요.';
}
