import React from "react";
import "../assets/challengeProfileSkeleton.css";
import "../assets/challengePlayer.css";
import "../assets/player.css";
import useWindowDimensions from "../helpers/useWindowDimensions";

/* Loading skeleton for the ChallengePlayer page. It reuses the page's real
 * layout classes — fullplayer-container, challenge-player-container-nav,
 * v2challenge-player-container, challenge-player-container-exercies,
 * video-browser-container, custom-carousel-wrapper/track and
 * exercise-browser-card — so all spacing, paddings and card sizes are the
 * exact ones the loaded player gets from challengePlayer.css on every
 * breakpoint. Shimmer blocks come from the shared cps-skeleton-block style
 * used by the profile skeletons. */

const Block = ({ w, h, style }) => (
  <span
    className="cps-skeleton-block"
    style={{ width: w, height: h, ...style }}
  />
);

function ChallengePlayerSkeleton() {
  const { width } = useWindowDimensions();
  return (
    <div
      className="challenge-player-container"
      style={{ width: "100%", display: "flex", justifyContent: "center" }}
      aria-hidden="true"
    >
      <div className="fullplayer-container">
        {/* Header: back button + workout title/subtitle (desktop only,
            same width check as the real page) */}
        {width > 830 && (
          <div
            className="challenge-player-container-exercies challenge-player-container-nav"
            style={{ marginTop: "0" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <Block
                w={30}
                h={30}
                style={{ borderRadius: "50%", marginRight: "20px" }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Block w={240} h={25} style={{ marginBottom: "8px" }} />
                <Block w={150} h={14} />
              </div>
            </div>
          </div>
        )}

        <div className="v2challenge-player-container">
          <div className="v2workout-studio-middle">
            {/* Video player area — the real .player-wrapper supplies the
                exact sizing on every screen (16:9 capped on desktop, 60svh
                tall on phones, 55svh below 550px) and the shimmer fills it */}
            <div className="player-wrapper">
              <Block w="100%" h="100%" style={{ borderRadius: 0 }} />
            </div>

            {/* Exercise browser carousel — same wrapper chain as
                PlayerVideoBrowser, including the 36px arrow gutters */}
            <div className="challenge-player-container-exercies">
              <div className="video-browser-container">
                <div className="custom-carousel-wrapper">
                  <div style={{ width: "36px", flexShrink: 0 }} />
                  <div
                    className="custom-carousel-track"
                    style={{ overflow: "hidden" }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="exercise-browser-card">
                        <div
                          className="challenge-player-container-exercies-box"
                          style={{ cursor: "default" }}
                        >
                          <Block
                            w="100%"
                            h="auto"
                            style={{
                              aspectRatio: "4 / 3",
                              marginBottom: "10px",
                            }}
                          />
                          <div className="challenge-player-container-exercies-box-details">
                            <Block
                              w="85%"
                              h={13}
                              style={{ marginBottom: "8px" }}
                            />
                            <Block w="55%" h={11} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: "36px", flexShrink: 0 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Attachment / equipment section, same wrapper as the real page */}
          <div className="v2workout-studio-bottom player-download-stuff">
            <div className="workout-info">
              <Block w={180} h={14} style={{ marginBottom: "10px" }} />
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Block w={170} h={38} />
                <Block w={140} h={38} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengePlayerSkeleton;
