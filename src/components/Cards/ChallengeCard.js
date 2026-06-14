import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import star from "../../assets/icons/star-orange.svg";
import forward from "../../assets/icons/forward-white.png";
import {
  LoadingOutlined,
  ClockCircleOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { LanguageContext } from "../../contexts/LanguageContext";
import { get } from "lodash";

import ChallengeDifficulty from "../Common/ChallengeDifficulty";
import "../../assets/challengecard.css";

const INTENSITY_KEYS = {
  easy: "adminv2.intensity_easy",
  medium: "adminv2.intensity_medium",
  hard: "adminv2.intensity_hard",
};

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

const isVideoFile = (src) => {
  if (!src) return false;
  const ext = src.split(".").pop()?.toLowerCase().split("?")[0];
  return VIDEO_EXTENSIONS.includes(ext);
};

function ChallengeCard({
  picture,
  rating,
  name,
  location,
  newc,
  preprationTime,
  recipe,
  hasIntensityGroup,
  intensityLevels,
  intensity,
  // Landscape layout — same content, wide card. Defaults to the original
  // portrait card so every existing usage is unchanged.
  horizontal = false,
  // Optional description line under the name (used by dashboard carousels).
  description,
  // Show the difficulty as orange arrows in the body instead of the small
  // top-left text badge. Keeps the existing grid cards unchanged by default.
  showDifficultyIcon = false,
  // Dashboard "active challenge" extras (all optional):
  //   to          — wraps the title/description in a Link (use when the card
  //                 isn't already inside a parent <Link>)
  //   active      — green "Active" badge (bottom-right)
  //   daysLeft    — clock "X days left" (bottom-right, under Active)
  //   continueTo  — orange Continue button linking to the player
  //   borderColor — accent border around the card
  to,
  active = false,
  daysLeft,
  continueTo,
  borderColor,
}) {
  const [videoLoading, setVideoLoading] = useState(true);
  const isVideo = isVideoFile(picture);
  const { strings } = useContext(LanguageContext);

  const translatedIntensity = intensity
    ? get(strings, INTENSITY_KEYS[intensity.toLowerCase()], intensity)
    : null;

  const daysLeftLabel = get(
    strings,
    daysLeft === 1
      ? "userDashboard.challenges.day_left"
      : "userDashboard.challenges.days_left",
    daysLeft === 1 ? "day left" : "days left",
  );
  const titleBlock = (
    <>
      <h3
        className="challenge-card-basic-textbox-name  font-paragraph-white"
        style={{ lineHeight: "25px" }}
      >
        {name}
      </h3>
      {description && (
        <p className="challenge-card-basic-textbox-desc font-paragraph-white">
          {description}
        </p>
      )}
    </>
  );

  const showLevelsBadge = hasIntensityGroup && intensityLevels > 1;
  // When showing the difficulty arrows in the body, drop the redundant
  // top-left text badge (the "X Levels" group badge still shows).
  const showIntensityBadge =
    !showLevelsBadge && translatedIntensity && !showDifficultyIcon;

  // The portrait card is clipped (clip-path), which slices a normal border.
  // A stacked drop-shadow follows the clipped silhouette, so the accent edge
  // traces the slanted shape correctly. The horizontal card has no clip-path,
  // so a plain border is crisper there.
  const outlineFilter = borderColor
    ? `drop-shadow(2px 0 0 ${borderColor}) drop-shadow(-2px 0 0 ${borderColor}) drop-shadow(0 2px 0 ${borderColor}) drop-shadow(0 -2px 0 ${borderColor})`
    : undefined;

  const card = (
    <div
      className={`challenge-card-basic${
        horizontal ? " challenge-card-basic--horizontal" : ""
      }`}
      style={{
        backgroundColor: isVideo ? "#171e27" : undefined,
        backgroundImage: isVideo
          ? "none"
          : `linear-gradient(180deg, rgba(255, 255, 255, 0) 17.71%, rgba(43, 57, 73, 0.85) 96.88%), url(${picture})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflow: "hidden",
        // Horizontal card: crisp border. Portrait card gets its outline from a
        // wrapper's drop-shadow (below) since the clip-path would slice a
        // real border.
        border:
          horizontal && borderColor ? `2px solid ${borderColor}` : undefined,
      }}
    >
      {isVideo && (
        <>
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
                zIndex: 1,
              }}
            >
              <LoadingOutlined style={{ fontSize: "30px", color: "#ff7700" }} />
            </div>
          )}
          <video
            src={picture}
            autoPlay
            muted
            loop
            playsInline
            onCanPlay={() => setVideoLoading(false)}
            onLoadStart={() => setVideoLoading(true)}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: 0,
              opacity: videoLoading ? 0 : 1,
              transition: "opacity 0.3s ease",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0) 17.71%, rgba(43, 57, 73, 0.85) 96.88%)",
              zIndex: 1,
            }}
          />
        </>
      )}
      <div className="challenge-card-basic-overlay"></div>
      {newc && (
        <div className="challenge-card-new-tag font-paragraph-white">New</div>
      )}
      {(showLevelsBadge || showIntensityBadge) && (
        <div
          style={{
            position: "absolute",
            top: newc ? "36px" : "8px",
            left: "8px",
            backgroundColor: "#ff7700",
            color: "#fff",
            fontSize: "10px",
            fontWeight: "bold",
            padding: "2px 8px",
            borderRadius: "4px",
            zIndex: 3,
          }}
          className="font-paragraph-white"
        >
          {showLevelsBadge ? `${intensityLevels} Levels` : translatedIntensity}
        </div>
      )}
      <div
        className="challenge-card-basic-textbox"
        style={{ position: "relative", zIndex: 2 }}
      >
        {to ? (
          <Link to={to} style={{ textDecoration: "none" }}>
            {titleBlock}
          </Link>
        ) : (
          titleBlock
        )}
        <div style={{ paddingRight: "5px", width: "fit-content" }}>
          {rating > 0 &&
            new Array(rating)
              .fill(0)
              .map((_, i) => <img key={i} src={star} alt="" />)}
        </div>

        <p className="challenge-card-basic-textbox-location font-paragraph-white">
          {location}
        </p>
        {preprationTime && (
          <p
            className="challenge-card-basic-textbox-location font-paragraph-white"
            style={{
              fontSize: "12px",
              marginTop: "2px",
              opacity: "0.8",
              textTransform: "lowercase",
            }}
          >
            {preprationTime} mins.
          </p>
        )}
        {showDifficultyIcon ? (
          <ChallengeDifficulty
            difficulty={intensity}
            height={16}
            style={{ marginTop: "5px" }}
          />
        ) : (
          !recipe && (
            <div style={{ width: "fit-content" }}>
              <img
                src={forward}
                alt=""
                style={{ color: "#fff", height: "12px" }}
                className="challenge-carousel-body-textbox-icons"
              />
            </div>
          )
        )}
      </div>

      {/* Dashboard active-challenge extras */}
      {(active || daysLeft != null) && (
        <div
          className={`cc-status${
            continueTo ? " cc-status--with-continue" : ""
          }`}
        >
          {active && (
            <span className="cc-active">
              <span className="cc-active-dot" />
              {get(strings, "userDashboard.challenges.active", "Active")}
            </span>
          )}
          {daysLeft != null && (
            <span className="cc-days">
              <ClockCircleOutlined />
              {daysLeft} {daysLeftLabel}
            </span>
          )}
        </div>
      )}
      {continueTo && (
        <Link to={continueTo} className="cc-continue">
          <CaretRightOutlined />
          {get(strings, "userDashboard.challenges.continue_playing", "Continue")}
        </Link>
      )}
    </div>
  );

  // Portrait (clipped) card: wrap in a filter layer so the drop-shadow follows
  // the clipped silhouette (a filter on the card itself gets clipped away).
  if (!horizontal && outlineFilter) {
    return (
      <div className="challenge-card-outline" style={{ filter: outlineFilter }}>
        {card}
      </div>
    );
  }
  return card;
}

export default ChallengeCard;
