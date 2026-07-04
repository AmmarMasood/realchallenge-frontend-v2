import React from "react";
import Navbar from "./Navbar";
import "../assets/challengeProfileSkeleton.css";

/* Loading skeleton for the RecipeProfile page. Reuses the page's real layout
 * classes (trainer-profile-container / -column1 from creatorprofile.css and
 * recipe-profile-container-column2 from recipeProfile.css, both imported by
 * the page) so the skeleton fills the same regions as the loaded page —
 * fixed hero on the left, dark content column on the right — including the
 * mobile stacking behavior. Shimmer blocks come from
 * challengeProfileSkeleton.css (shared with ChallengeProfileSkeleton). */

const Block = ({ w, h, style, light }) => (
  <span
    className={`cps-skeleton-block${light ? " cps-skeleton-block--light" : ""}`}
    style={{ width: w, height: h, ...style }}
  />
);

function RecipeProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <Navbar color="dark" />
      <div className="trainer-profile-container">
        {/* Hero: recipe photo area with name / rating / meal-type pills */}
        <div
          className="trainer-profile-container-column1"
          style={{ backgroundColor: "#1b232e" }}
        >
          <div className="profile-box">
            <Block w="55%" h={32} style={{ marginBottom: "20px" }} />
            <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Block key={i} w={20} h={20} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              <Block w={110} h={40} />
              <Block w={120} h={40} />
              <Block w={34} h={34} style={{ marginLeft: "auto" }} />
            </div>
            <div style={{ display: "flex", gap: "16px" }}>
              <Block w={120} h={20} />
              <Block w={110} h={20} />
            </div>
          </div>
        </div>

        {/* Content column: meal values, ingredients, preparation, actions.
            This column is white (recipeProfile.css), so use light blocks. */}
        <div className="recipe-profile-container-column2">
          <div style={{ marginBottom: "28px" }}>
            <Block light w={130} h={14} style={{ marginBottom: "14px" }} />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Block light w={140} h={70} />
              <Block light w={140} h={70} />
              <Block light w={140} h={70} />
              <Block light w={140} h={70} />
            </div>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <Block light w={120} h={14} style={{ marginBottom: "14px" }} />
            <Block light w="100%" h={160} />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <Block light w={140} h={14} style={{ marginBottom: "14px" }} />
            <Block light w="100%" h={14} style={{ marginBottom: "10px" }} />
            <Block light w="95%" h={14} style={{ marginBottom: "10px" }} />
            <Block light w="90%" h={14} style={{ marginBottom: "10px" }} />
            <Block light w="60%" h={14} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Block light w={150} h={44} />
            <Block light w={180} h={44} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeProfileSkeleton;
