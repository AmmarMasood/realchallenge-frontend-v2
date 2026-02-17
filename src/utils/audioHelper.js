// Audio files served from public/audio/ — bypasses webpack bundling issues
const BREAK_END_URL = `${process.env.PUBLIC_URL}/audio/break-end.mp3`;
const BREAK_START_URL = `${process.env.PUBLIC_URL}/audio/break-start.mp3`;

const audioElements = {
  breakEnd: null,
  breakStart: null,
};

let unlocked = false;

function ensureElements() {
  if (!audioElements.breakEnd) {
    audioElements.breakEnd = new Audio(BREAK_END_URL);
    audioElements.breakEnd.preload = "auto";
  }
  if (!audioElements.breakStart) {
    audioElements.breakStart = new Audio(BREAK_START_URL);
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
