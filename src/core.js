export function springModel(count) {
  const n = Math.max(0, Math.min(4, Math.round(Number(count) || 0)));
  return { count: n, force: n, extension: n * 2, length: 6 + n * 2 };
}
export function mouthFor(ch) {
  const c = (ch || '').charCodeAt(0) - 0xac00;
  if (c < 0 || c > 11171 || Number.isNaN(c)) return 'closed';
  const vowel = Math.floor(c / 28) % 21;
  return [8, 12, 13, 17].includes(vowel) ? 'round' : [0, 2, 4, 6, 9, 14].includes(vowel) ? 'open' : 'half';
}
export function rms(samples) {
  if (!samples.length) return 0;
  let sum = 0;
  for (const v of samples) sum += v * v;
  return Math.sqrt(sum / samples.length);
}
export function mouthForLevel(level, time) {
  if (level < 0.018) return 'closed';
  return ['half', level > 0.06 ? 'open' : 'half', 'round', 'half'][Math.floor(time * 8) % 4];
}
export const demoLines = [
  { text: '안녕! 오늘은 용수철로 무게를 알아볼 거예요.', mood: 'welcome', seconds: 3.8 },
  { text: '추를 하나 더 달면 어떻게 될까요?', mood: 'question', seconds: 3.1 },
  { text: '무게가 커지면 용수철은 더 늘어나요.', mood: 'explain', seconds: 3.4 },
  { text: '어? 전체 길이와 늘어난 길이는 달라요!', mood: 'surprise', seconds: 3.5 },
  { text: '기준을 찾았군요. 잘 관찰했어요!', mood: 'praise', seconds: 3.0 },
  { text: '이제 직접 추를 달아 볼까요?', mood: 'listen', seconds: 2.8 },
];
export function timelineAt(time) {
  let start = 0;
  for (const line of demoLines) {
    if (time < start + line.seconds) {
      const local = Math.max(0, time - start);
      const fraction = Math.min(1, local / (line.seconds - 0.45));
      const char = line.text[Math.floor(fraction * line.text.length)] || '';
      return { ...line, mouth: local > line.seconds - 0.45 ? 'closed' : mouthFor(char) };
    }
    start += line.seconds;
  }
  return null;
}
