import React from "react";
import star from "../../assets/icons/star-orange.svg";
import forward from "../../assets/icons/forward-white.png";

import "../../assets/challengecard.css";
function ChallengeCard({
  picture,
  rating,
  name,
  location,
  newc,
  preprationTime,
  recipe,
}) {
  return (
    <div
      className="challenge-card-basic"
      style={{
        background: `linear-gradient(180deg, rgba(255, 255, 255, 0) 17.71%, rgba(43, 57, 73, 0.85) 96.88%),
                url(${picture})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
      }}
    >
      {/* <img src={picture} alt="" /> */}
      <div className="challenge-card-basic-overlay"></div>
      {newc && (
        <div className="challenge-card-new-tag font-paragraph-white">New</div>
      )}
      <div className="challenge-card-basic-textbox">
        <h3
          className="challenge-card-basic-textbox-name  font-paragraph-white"
          style={{ lineHeight: "25px" }}
        >
          {name}
        </h3>
        {console.log(picture)}
        <div style={{ paddingRight: "5px" }}>
          {rating > 0 &&
            new Array(rating).fill(0).map(() => <img src={star} alt="" />)}
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
