import React, { useState } from "react";
import star from "../../assets/icons/star-orange.svg";
import forward from "../../assets/icons/forward-white.png";
import { LoadingOutlined } from "@ant-design/icons";

import "../../assets/challengecard.css";

const VIDEO_EXTENSIONS = [
  "m4v", "avi", "mpg", "mp4", "mov", "wmv", "flv", "webm", "mkv",
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
}) {
  const [videoLoading, setVideoLoading] = useState(true);
  const isVideo = isVideoFile(picture);

  return (
    <div
      className="challenge-card-basic"
      style={{
        background: isVideo
          ? "#171e27"
          : `linear-gradient(180deg, rgba(255, 255, 255, 0) 17.71%, rgba(43, 57, 73, 0.85) 96.88%),
                url(${picture})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
        position: "relative",
        overflow: "hidden",
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
      <div className="challenge-card-basic-textbox" style={{ position: "relative", zIndex: 2 }}>
        <h3
          className="challenge-card-basic-textbox-name  font-paragraph-white"
          style={{ lineHeight: "25px" }}
        >
          {name}
        </h3>
        <div style={{ paddingRight: "5px" }}>
          {rating > 0 &&
            new Array(rating).fill(0).map((_, i) => <img key={i} src={star} alt="" />)}
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
        {!recipe && (
          <div>
            <img
              src={forward}
              alt=""
              style={{ color: "#fff", height: "12px" }}
              className="challenge-carousel-body-textbox-icons"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ChallengeCard;
