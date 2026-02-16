import breakEndSound from "../assets/music/break-end.wav";
import breakStartSound from "../assets/music/break-start.wav";

const audioElements = {
  breakEnd: null,
  breakStart: null,
};

let unlocked = false;

function ensureElements() {
  if (!audioElements.breakEnd) {
    audioElements.breakEnd = new Audio(breakEndSound);
    audioElements.breakEnd.preload = "auto";
  }
  if (!audioElements.breakStart) {
    audioElements.breakStart = new Audio(breakStartSound);
    audioElements.breakStart.preload = "auto";
  }
}

/**
 * Call this on the first user gesture (e.g. "Start Workout" tap)
 * to unlock audio playback on mobile/production browsers.
 */
export function unlockAudio() {
  if (unlocked) return;
  ensureElements();
  // Play and immediately pause to unlock the audio elements
  Object.values(audioElements).forEach((audio) => {
    audio.muted = true;
    audio.play().then(() => {
      audio.pause();
      audio.muted = false;
      audio.currentTime = 0;
    }).catch(() => {});
  });
  unlocked = true;
}

export function playBreakEnd() {
  ensureElements();
  const audio = audioElements.breakEnd;
  audio.currentTime = 0;
  audio.play().catch((err) => console.warn("breakEnd audio play failed:", err));
}

export function playBreakStart() {
  ensureElements();
  const audio = audioElements.breakStart;
  audio.currentTime = 0;
  audio.play().catch((err) => console.warn("breakStart audio play failed:", err));
}
