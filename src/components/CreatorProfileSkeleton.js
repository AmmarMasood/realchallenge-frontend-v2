import React from "react";
import Navbar from "./Navbar";
import "../assets/challengeProfileSkeleton.css";

/* Loading skeleton for the CreatorProfile page. Reuses the page's real
 * layout classes (trainer-profile-container / -column1 / -column2 and the
 * profile-box grid from creatorprofile.css, imported by the page) so the
 * skeleton fills the same regions as the loaded page, including the mobile
 * stacking behavior. Shimmer blocks come from challengeProfileSkeleton.css
 * (shared with the challenge/recipe profile skeletons). */

const Block = ({ w, h, style }) => (
  <span
    className="cps-skeleton-block"
    style={{ width: w, height: h, ...style }}
  />
);

function CreatorProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <Navbar />
      <div className="trainer-profile-container">
        {/* Hero: avatar / name / rating / quote */}
        <div
          className="trainer-profile-container-column1"
          style={{ backgroundColor: "#1b232e" }}
        >
          <div className="profile-box">
            <div className="profile-box-row1">
              <Block w={130} h={130} style={{ borderRadius: "50%" }} />
              <div>
                <Block w="60%" h={28} style={{ marginBottom: "20px" }} />
                <Block w={120} h={16} style={{ marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Block key={i} w={20} h={20} />
                  ))}
                </div>
              </div>
              <Block w={48} h={48} style={{ borderRadius: "50%" }} />
            </div>
            <div className="profile-box-row2" style={{ marginTop: "24px" }}>
              <Block w="85%" h={16} style={{ marginBottom: "8px" }} />
              <Block w="60%" h={16} />
            </div>
          </div>
        </div>

        {/* Content column: interests, challenge/recipe cards */}
        <div className="trainer-profile-container-column2">
          <div className="trainer-profile-goals" style={{ marginBottom: "24px" }}>
            <Block w={150} h={14} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingBottom: "10px" }}>
              <Block w={110} h={32} />
              <Block w={95} h={32} />
              <Block w={130} h={32} />
              <Block w={100} h={32} />
            </div>
          </div>

          <div>
            <Block w={130} h={14} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Block w={300} h={200} />
              <Block w={300} h={200} />
              <Block w={300} h={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatorProfileSkeleton;
