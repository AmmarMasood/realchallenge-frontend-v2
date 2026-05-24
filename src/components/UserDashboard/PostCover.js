import React, { useMemo, useRef, useState } from "react";
import { LoadingOutlined, CaretRightFilled } from "@ant-design/icons";
import "./FeedCard.css";
import ChallengeIconWhite from "../../assets/icons/challenge-icon-white.svg";
import AvacadoWhite from "../../assets/icons/avacado-white.svg";

// Map a post to a small icon shown inside the type tag chip. We first
// check the `type` string (the canonical source) and fall back to the
// post `url` pattern so older posts with missing/mismatched `type`
// values still get the right icon. Anything outside this map renders
// with text only (no icon).
function getTagIcon(type, url) {
  const t = type ? String(type).toLowerCase().trim() : "";
  if (t.startsWith("challenge")) return ChallengeIconWhite;
  if (t.startsWith("recipe")) return AvacadoWhite;
  if (typeof url === "string") {
    if (url.startsWith("/challenge/")) return ChallengeIconWhite;
    if (url.startsWith("/recipe/")) return AvacadoWhite;
  }
  return null;
}

// Mirrors the video-vs-image detection used in Admin/V2/{Recipe,Challenge}
// BasicInformation pages.
const VIDEO_EXTENSIONS = [
  "m4v",
  "avi",
  "mpg",
  "mp4",
  "mov",
  "wmv",
  "flv",
  "webm",
  "mkv",
];

function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const noQuery = url.split("?")[0];
  const ext = noQuery.split(".").pop()?.toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

/**
 * Renders a post / community-post card cover.
 *  - If `image` is a video URL → muted-autoplay-loop <video> with a
 *    LoadingOutlined overlay until canplay fires.
 *  - Otherwise → background-image div (legacy behavior).
 * Keeps the existing `.dashboard-feed-container-card-row2` outer class
 * so CSS sizing / aspect ratio is unchanged.
 */
export default function PostCover({ image, tag, url }) {
  const [videoLoading, setVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const isVideo = useMemo(() => isVideoUrl(image), [image]);
  const safeImage = image ? image.replaceAll(" ", "%20") : "";
  const tagIcon = getTagIcon(tag, url);

  const handlePlayClick = (e) => {
    // Don't let the click bubble to the parent <Link> wrapping the cover.
    e.preventDefault();
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  };

  if (isVideo) {
    return (
      <div
        className="dashboard-feed-container-card-row2"
        style={{
          position: "relative",
          overflow: "hidden",
          cursor: "pointer",
          background: "#171e27",
        }}
      >
        {videoLoading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#171e27",
              zIndex: 3,
            }}
          >
            <LoadingOutlined style={{ fontSize: "40px", color: "#ff7700" }} />
          </div>
        )}
        <video
          ref={videoRef}
          src={safeImage}
          preload="metadata"
          playsInline
          onLoadedMetadata={() => setVideoLoading(false)}
          onLoadStart={() => setVideoLoading(true)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: videoLoading ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        {!videoLoading && !isPlaying && (
          <div className="dashboard-feed-cover-play">
            <div
              className="dashboard-feed-cover-play-circle"
              onClick={handlePlayClick}
              role="button"
              aria-label="Play video"
            >
              <CaretRightFilled
                style={{ fontSize: "28px", color: "#fff", marginLeft: "3px" }}
              />
            </div>
          </div>
        )}
        {tag && (
          <div
            className="dashboard-feed-container-card-row2-tag font-paragraph-white"
            style={{ position: "absolute", top: 0, right: 0 }}
          >
            {tagIcon && <img src={tagIcon} alt="" />}
            <span>{tag}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="dashboard-feed-container-card-row2"
      style={{
        background: `url(${safeImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: "pointer",
      }}
    >
      {tag && (
        <div
          className="dashboard-feed-container-card-row2-tag font-paragraph-white"
          style={{ position: "absolute", top: 0, right: 0 }}
        >
          {tagIcon && <img src={tagIcon} alt="" />}
          <span>{tag}</span>
        </div>
      )}
    </div>
  );
}
