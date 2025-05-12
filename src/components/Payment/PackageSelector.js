import React, { useState } from "react";
import { CheckOutlined, EuroOutlined } from "@ant-design/icons";
import "../../assets/packageSelector.css";

const checkStyle = {
  color: "#ff7700",
  fontSize: "2.5rem",
  paddingRight: "0.5rem",
};

function PackageSelector({ onChoosePlan }) {
  const [pack, setPack] = useState("CHALLENGE_12");
  return (
    <div className="package-selector-wrapper">
      <input
        type="radio"
        name="slider"
        id="tab-1"
        checked={pack === "CHALLENGE_1" ? true : false}
      />
      <input
        type="radio"
        name="slider"
        id="tab-2"
        checked={pack === "CHALLENGE_12" ? true : false}
      />
      <input
        type="radio"
        name="slider"
        id="tab-3"
        checked={pack === "CHALLENGE_3" ? true : false}
      />
      <header className="package-selector-header">
        <label
          for="tab-1"
          className="tab-1 font-paragraph-white"
          onClick={() => setPack("CHALLENGE_1")}
        >
          Challenge
        </label>
        <label
          for="tab-2"
          className="tab-2 font-paragraph-white"
          onClick={() => setPack("CHALLENGE_12")}
        >
          12 Months Plan
        </label>
        <label
          for="tab-3"
          className="tab-3 font-paragraph-white"
          onClick={() => setPack("CHALLENGE_3")}
        >
          3 Months Plan
        </label>
        <div className="slider"></div>
      </header>
      <div className="card-area">
        <div className="cards">
          <div className="row row-1">
            <div className="price-details">
              <span className="price font-heading-white">
                One-Time Challenge
              </span>
              <p className="font-subheading-white">
                {" "}
                Starting from €29 / Challenge
              </p>
              <span className="font-paragraph-white">
                Choose your challenge from our library.
              </span>
            </div>
            <ul className="features">
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  No subscription needed
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">Billed once</span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  Unlock all features
                </span>
              </li>
            </ul>
          </div>
          <div className="row">
            <div className="price-details">
              <span className="price font-heading-white">Repeat & Save</span>
              <p className="font-subheading-white" style={{ fontSize: "16px" }}>
                <span style={{ fontSize: "35px" }}>€4.5</span> / Week
              </p>
              <span
                className="font-paragraph-white"
                style={{
                  fontSize: "16px",
                  backgroundColor: "#ff8b07",
                  padding: "5px",
                }}
              >
                Save up to 60%
              </span>
            </div>
            <ul className="features">
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  Unlock any challenge
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">Billed monthly</span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  Menu tailored to your goals
                </span>
              </li>
            </ul>
          </div>
          <div className="row">
            <div className="price-details">
              <span className="price font-heading-white">Repeat & Save</span>
              <p className="font-subheading-white" style={{ fontSize: "16px" }}>
                <span style={{ fontSize: "35px" }}>€6</span> / Week
              </p>
              <span
                className="font-paragraph-white"
                style={{
                  fontSize: "16px",
                  backgroundColor: "#ff8b07",
                  padding: "5px",
                }}
              >
                Save up to 30%
              </span>
            </div>
            <ul className="features">
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  Unlock any challenge
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">Billed monthly</span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  Menu tailored to your goals
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <button
        className="package-selector-button"
        onClick={() => onChoosePlan(pack)}
      >
        Choose plan
      </button>
      <div className="money-back-guarantee font-paragraph-white">
        <EuroOutlined /> 7 days money back guarantee
      </div>
    </div>
  );
}

export default PackageSelector;
