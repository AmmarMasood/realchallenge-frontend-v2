import React from "react";
import ArrowOneActive from "../../assets/icons/arrow-one-active.png";
import ArrowForward from "../../assets/icons/forward-arrows.png";
import ArrowThreeActive from "../../assets/icons/arrow-three-active.png";

// Canonical challenge difficulty indicator used across the app.
// Renders the arrow icons by difficulty/intensity, matching the fitness-level
// arrows used elsewhere:
//   Easy   → arrow-one-active
//   Medium → forward-arrows
//   Hard   → arrow-three-active
// Fed by a challenge's `intensity` value (passed as `difficulty`).
//
// Props:
//   difficulty — "Easy" | "Medium" | "Hard"
//   height     — icon height (number → px, or any CSS size string). Default 18.
//   width      — icon width  (number → px, or any CSS size string). Default
//                "auto" so it scales with height; pass to size explicitly.
//   imgStyle   — extra styles merged onto the icon <img> for full control
//   showLabel  — also render the difficulty text next to the icon
//   style      — extra styles merged onto the wrapper
const ICON_BY_DIFFICULTY = {
  Easy: ArrowOneActive,
  Medium: ArrowForward,
  Hard: ArrowThreeActive,
};

const ChallengeDifficulty = ({
  difficulty,
  height = 18,
  width = "auto",
  imgStyle = {},
  showLabel = false,
  style = {},
}) => {
  const icon = ICON_BY_DIFFICULTY[difficulty];
  if (!icon) return null;

  return (
    <span
      className="challenge-difficulty"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ...style,
      }}
    >
      <img
        src={icon}
        alt={difficulty}
        style={{ height, width, objectFit: "contain", ...imgStyle }}
      />
      {showLabel && (
        <span style={{ fontSize: "1.3rem", fontWeight: 600 }}>
          {difficulty}
        </span>
      )}
    </span>
  );
};

export default ChallengeDifficulty;
