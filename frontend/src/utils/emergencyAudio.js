export function createEmergencyAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;
  return new AudioContextConstructor();
}

export function playEmergencySiren(audioContext) {
  if (!audioContext || audioContext.state !== "running") {
    throw new Error("Emergency sound is unavailable. Check your phone's sound settings.");
  }

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const startAt = audioContext.currentTime + 0.05;
  const duration = 2;

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(650, startAt);
  oscillator.frequency.setValueAtTime(880, startAt + 0.45);
  oscillator.frequency.setValueAtTime(650, startAt + 0.9);
  oscillator.frequency.setValueAtTime(880, startAt + 1.35);
  gain.gain.setValueAtTime(0.001, startAt);
  gain.gain.linearRampToValueAtTime(0.16, startAt + 0.08);
  gain.gain.setValueAtTime(0.16, startAt + duration - 0.15);
  gain.gain.linearRampToValueAtTime(0.001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.onended = () => oscillator.disconnect();
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
}
