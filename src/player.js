import { rms, mouthForLevel, timelineAt } from './core.js';

export class CharacterPlayer {
  constructor(avatar, { onState, onLine, onProgress, onMood = () => {} }) {
    Object.assign(this, { avatar, onState, onLine, onProgress, onMood });
    this.audio = new Audio(); this.audio.preload = 'metadata'; this.kind = 'demo'; this.state = 'idle'; this.offset = 0; this.raf = 0; this.audioUrl = null; this.token = 0;
    this.audio.addEventListener('ended', () => this.stop());
    this.audio.addEventListener('pause', () => this.avatar.close());
    this.audio.addEventListener('error', () => { this.stop(); this.onState('error', '음성 파일을 읽지 못했어요. WAV 또는 MP3 파일을 다시 선택해 주세요.'); });
    this.onVisibility = () => { if (document.hidden && this.state === 'playing') this.pause(); };
    document.addEventListener('visibilitychange', this.onVisibility);
  }
  announce(state, text) { this.state = state; this.onState(state, text); }
  async loadFile(file) {
    if (file.size > 60 * 1024 * 1024) throw new Error('60MB 이하의 음성 파일을 선택해 주세요.');
    if (!/\.(mp3|wav|ogg|m4a|webm)$/i.test(file.name) && !file.type.startsWith('audio/')) throw new Error('음성 파일을 선택해 주세요.');
    this.stop();
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.audioUrl = URL.createObjectURL(file); this.audio.src = this.audioUrl; this.audio.load(); this.kind = 'audio';
    this.onLine('연결한 음성 파일에 맞춰 입을 움직입니다.');
    this.announce('idle', '음성 연결됨 · 이 기기에서만 재생');
  }
  useDemo() { this.stop(); this.kind = 'demo'; this.onLine('안녕! 용수철로 무게를 알아볼까요?'); this.announce('idle', '무음 동작 시연 · 실제 목소리 연결 전'); }
  async play() {
    if (this.state === 'playing') return;
    const token = ++this.token;
    try {
      if (this.kind === 'audio') {
        if (!this.context) {
          this.context = new AudioContext(); this.source = this.context.createMediaElementSource(this.audio); this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 512;
          this.source.connect(this.analyser); this.analyser.connect(this.context.destination); this.samples = new Float32Array(this.analyser.fftSize);
        }
        await this.context.resume();
        if (token !== this.token) return;
        await this.audio.play();
        if (token !== this.token) { this.audio.pause(); return; }
      }
      this.started = performance.now() - this.offset * 1000;
      this.announce('playing', this.kind === 'demo' ? '무음 동작 시연 중' : '음성 재생 중 · 음량 기반 입 움직임');
      this.tick();
    } catch { if (token === this.token) { this.stop(); this.announce('error', '재생하지 못했어요. 음성 파일과 재생 버튼을 확인해 주세요.'); } }
  }
  tick = () => {
    if (this.state !== 'playing') return;
    if (this.kind === 'demo') {
      this.offset = (performance.now() - this.started) / 1000;
      const cue = timelineAt(this.offset);
      if (!cue) { this.stop(); return; }
      this.avatar.setMood(cue.mood); this.avatar.setMouth(cue.mouth); this.onMood(cue.mood); this.onLine(cue.text); this.onProgress(this.offset / 19.6);
    } else {
      this.analyser.getFloatTimeDomainData(this.samples);
      this.avatar.setMouth(mouthForLevel(rms(this.samples), this.audio.currentTime));
      this.onProgress(this.audio.duration ? this.audio.currentTime / this.audio.duration : 0);
    }
    this.raf = requestAnimationFrame(this.tick);
  };
  pause() { ++this.token; cancelAnimationFrame(this.raf); this.audio.pause(); this.avatar.close(); this.announce('paused', '일시정지 · 입 움직임 멈춤'); }
  stop() { ++this.token; cancelAnimationFrame(this.raf); this.audio.pause(); if (this.audio.src) this.audio.currentTime = 0; this.offset = 0; this.avatar.close(); this.onProgress(0); this.announce('idle', this.kind === 'audio' ? '음성 연결됨 · 재생 대기' : '무음 동작 시연 · 실제 목소리 연결 전'); }
  destroy() { this.stop(); document.removeEventListener('visibilitychange', this.onVisibility); if (this.audioUrl) URL.revokeObjectURL(this.audioUrl); this.context?.close(); this.avatar.destroy(); }
}
