import React from "react";
import Navbar from "./Navbar";
import "../assets/challengeProfileSkeleton.css";

/* Loading skeleton for the ChallengeProfile page. Reuses the page's real
 * layout classes (trainer-profile-container / -column1 / -column2 from
 * creatorprofile.css, imported by the page) so the skeleton occupies the
 * exact same regions as the loaded page — fixed hero on the left, dark
 * content column on the right — including the mobile stacking behavior. */

const Block = ({ w, h, style }) => (
  <span
    className="cps-skeleton-block"
    style={{ width: w, height: h, ...style }}
  />
);

function ChallengeProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <Navbar />
      <div className="trainer-profile-container">
        {/* Hero: cover area with title / progress / rating / info pills */}
        <div
          className="trainer-profile-container-column1"
          style={{ backgroundColor: "#1b232e" }}
        >
          <div className="profile-box">
            <Block
              w={48}
              h={48}
              style={{ borderRadius: "50%", marginBottom: "20px" }}
            />
            <Block w="65%" h={44} style={{ marginBottom: "16px" }} />
            <Block w="100%" h={4} style={{ marginBottom: "20px" }} />
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Block key={i} w={20} h={20} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
              <Block w={130} h={40} />
              <Block w={110} h={40} />
              <Block w={34} h={34} style={{ marginLeft: "auto" }} />
            </div>
            <Block w="100%" h={14} style={{ marginBottom: "8px" }} />
            <Block w="80%" h={14} />
          </div>
        </div>

        {/* Content column: trainers, tags, weeks */}
        <div className="trainer-profile-container-column2">
          <div className="trainer-profile-goals" style={{ marginBottom: "24px" }}>
            <Block w={110} h={14} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", paddingBottom: "10px" }}>
              <Block w={190} h={50} />
              <Block w={190} h={50} />
            </div>
          </div>

          <div className="trainer-profile-goals" style={{ marginBottom: "24px" }}>
            <Block w={150} h={14} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingBottom: "10px" }}>
              <Block w={100} h={32} />
              <Block w={120} h={32} />
              <Block w={90} h={32} />
              <Block w={110} h={32} />
            </div>
          </div>

          <div className="trainer-profile-goals" style={{ marginBottom: "24px" }}>
            <Block w={120} h={14} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingBottom: "10px" }}>
              <Block w={110} h={32} />
              <Block w={95} h={32} />
              <Block w={130} h={32} />
            </div>
          </div>

          <div>
            <Block w={170} h={14} style={{ marginBottom: "14px" }} />
            <Block w="100%" h={90} style={{ marginBottom: "10px" }} />
            <Block w="100%" h={90} style={{ marginBottom: "10px" }} />
            <Block w="100%" h={90} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeProfileSkeleton;
