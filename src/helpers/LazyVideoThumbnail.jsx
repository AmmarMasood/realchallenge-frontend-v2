import React, { useEffect, useState } from "react";

// Replacement for react-video-thumbnail in the exercise strips.
//
// That library mounts a hidden <video> INSIDE every card and, because it was
// used with cors={true} (which skips setting crossOrigin), toDataURL() threw
// a tainted-canvas SecurityError on CDN-hosted videos — the catch swallowed
// it and the fully-downloaded, decoding <video> stayed mounted in the card
// forever. A strip of those made every scroll/drag frame expensive to paint,
// which is what made drag auto-scroll chunky on desktop and crawl on phones.
//
// This version keeps <video> out of the React tree entirely: frames are
// captured on a detached element, ONE video at a time (a phone decoding N
// videos in parallel is exactly the jank we're removing), and results —
// including failures — are cached per URL for the session so a re-render,
// drag, or tab switch never re-downloads anything.

const FAILED = "__thumb_failed__";
const cache = new Map(); // videoUrl -> dataURL | FAILED
const pending = new Map(); // videoUrl -> Promise<dataURL>
let queueTail = Promise.resolve();

const THUMB_MAX_WIDTH = 320;
const SNAPSHOT_AT_TIME = 2; // seconds — matches react-video-thumbnail's default
const TIMEOUT_MS = 20000;

function captureFrame(videoUrl) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    let settled = false;

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onseeked = null;
      video.onerror = null;
      // Detach the source so the browser stops fetching/decoding — just
      // dropping the reference leaves the fetch running.
      video.removeAttribute("src");
      try {
        video.load();
      } catch (e) {
        /* ignore */
      }
    };

    const fail = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      cleanup();
      reject(err);
    };

    const timer = setTimeout(
      () => fail(new Error("thumbnail generation timed out")),
      TIMEOUT_MS,
    );

    video.muted = true;
    video.playsInline = true;
    // Required for canvas.toDataURL on cross-origin videos. If the CDN
    // doesn't send CORS headers the load errors and we show the placeholder
    // — no worse than the old tainted-canvas failure, but without the
    // permanently-mounted video.
    video.crossOrigin = "anonymous";
    video.preload = "metadata";

    video.onerror = () => fail(new Error("video failed to load"));

    video.onloadedmetadata = () => {
      const duration = video.duration;
      const t = isFinite(duration)
        ? Math.min(SNAPSHOT_AT_TIME, Math.max(0, duration - 0.1))
        : SNAPSHOT_AT_TIME;
      try {
        video.currentTime = t;
      } catch (err) {
        fail(err);
      }
    };

    video.onseeked = () => {
      if (settled) return;
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) throw new Error("video has no dimensions");
        const scale = Math.min(1, THUMB_MAX_WIDTH / w);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas
          .getContext("2d")
          .drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        settled = true;
        clearTimeout(timer);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        fail(err);
      }
    };

    video.src = videoUrl;
  });
}

function getThumbnail(videoUrl) {
  const cached = cache.get(videoUrl);
  if (cached === FAILED) return Promise.reject(new Error("thumbnail failed"));
  if (cached) return Promise.resolve(cached);
  if (pending.has(videoUrl)) return pending.get(videoUrl);

  const p = queueTail.then(() => {
    // Re-check: an earlier queue entry for the same URL may have finished
    // while this one waited.
    const done = cache.get(videoUrl);
    if (done === FAILED) throw new Error("thumbnail failed");
    if (done) return done;
    return captureFrame(videoUrl).then(
      (dataUrl) => {
        cache.set(videoUrl, dataUrl);
        return dataUrl;
      },
      (err) => {
        cache.set(videoUrl, FAILED);
        throw err;
      },
    );
  });

  // The queue must survive failures, and one card's error shouldn't
  // propagate to the next URL's generation.
  queueTail = p.then(
    () => {},
    () => {},
  );
  pending.set(videoUrl, p);
  p.then(
    () => pending.delete(videoUrl),
    () => pending.delete(videoUrl),
  );
  return p;
}

export default function LazyVideoThumbnail({ videoUrl, alt = "thumbnail" }) {
  const [src, setSrc] = useState(() => {
    const cached = cache.get(videoUrl);
    return cached && cached !== FAILED ? cached : null;
  });

  useEffect(() => {
    if (!videoUrl) {
      setSrc(null);
      return;
    }
    let alive = true;
    getThumbnail(videoUrl).then(
      (dataUrl) => {
        if (alive) setSrc(dataUrl);
      },
      () => {
        if (alive) setSrc(null);
      },
    );
    return () => {
      alive = false;
    };
  }, [videoUrl]);

  // While generating (or after a failure) the card's imagebox just stays
  // empty — same as the old component, whose video/canvas were invisible.
  if (!src) return null;
  return <img src={src} alt={alt} />;
}
