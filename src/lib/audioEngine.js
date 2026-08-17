let audioContext = null;

export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

export function playTone(frequency, duration = 0.5, type = 'sine', volume = 0.5) {
  const ctx = initAudio();
  
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  const now = ctx.currentTime;
  
  // Envelope to prevent clicking
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
  gainNode.gain.setValueAtTime(volume, now + duration - 0.05);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
}
