import React, { useState, useContext } from "react";
import { CheckOutlined, EuroOutlined } from "@ant-design/icons";
import "../../assets/packageSelector.css";
import { usePackageConfig } from "../../contexts/PackageConfigContext";
import { LanguageContext } from "../../contexts/LanguageContext";
import { get } from "lodash";

const checkStyle = {
  color: "#ff7700",
  fontSize: "2.5rem",
  paddingRight: "0.5rem",
};

function PackageSelector({ onChoosePlan }) {
  const { strings } = useContext(LanguageContext);
  const { getPackage } = usePackageConfig();
  const [pack, setPack] = useState("CHALLENGE_12");

  const pkg1 = getPackage("CHALLENGE_1");
  const pkg12 = getPackage("CHALLENGE_12");
  const pkg3 = getPackage("CHALLENGE_3");

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
          {pkg1?.displayName || "Challenge"}
        </label>
        <label
          for="tab-2"
          className="tab-2 font-paragraph-white"
          onClick={() => setPack("CHALLENGE_12")}
        >
          {pkg12?.displayName || "12 Months Plan"}
        </label>
        <label
          for="tab-3"
          className="tab-3 font-paragraph-white"
          onClick={() => setPack("CHALLENGE_3")}
        >
          {pkg3?.displayName || "3 Months Plan"}
        </label>
        <div className="slider"></div>
      </header>
      <div className="card-area">
        <div className="cards">
          <div className="row row-1">
            <div className="price-details">
              <span className="price font-heading-white">
                {pkg1?.displayName || "One-Time Challenge"}
              </span>
              <p className="font-subheading-white">
                {" "}
                {get(strings, "payment.starting_from", "Starting from €29 / Challenge")}
              </p>
              <span className="font-paragraph-white">
                {get(strings, "payment.choose_from_library", "Choose your challenge from our library.")}
              </span>
            </div>
            <ul className="features">
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.no_subscription_needed", "No subscription needed")}
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.billed_once", "Billed once")}
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.unlock_all_features", "Unlock all features")}
                </span>
              </li>
            </ul>
          </div>
          <div className="row">
            <div className="price-details">
              <span className="price font-heading-white">
                {pkg12?.displayName || "12 Months Plan"}
              </span>
              <p className="font-subheading-white" style={{ fontSize: "16px" }}>
                <span style={{ fontSize: "35px" }}>
                  {pkg12?.priceDisplayText || `€${pkg12?.price}`}
                </span>
              </p>
              {pkg12?.savingsPercent && (
                <span
                  className="font-paragraph-white"
                  style={{
                    fontSize: "16px",
                    backgroundColor: "#ff8b07",
                    padding: "5px",
                  }}
                >
                  {get(strings, "payment.save_up_to", "Save up to")} {pkg12?.savingsPercent}
                </span>
              )}
            </div>
            <ul className="features">
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.unlock_any_challenge", "Unlock any challenge")}
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.billed_monthly", "Billed monthly")}
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.menu_tailored", "Menu tailored to your goals")}
                </span>
              </li>
            </ul>
          </div>
          <div className="row">
            <div className="price-details">
              <span className="price font-heading-white">
                {pkg3?.displayName || "3 Months Plan"}
              </span>
              <p className="font-subheading-white" style={{ fontSize: "16px" }}>
                <span style={{ fontSize: "35px" }}>
                  {pkg3?.priceDisplayText || `€${pkg3?.price}`}
                </span>
              </p>
              {pkg3?.savingsPercent && (
                <span
                  className="font-paragraph-white"
                  style={{
                    fontSize: "16px",
                    backgroundColor: "#ff8b07",
                    padding: "5px",
                  }}
                >
                  {get(strings, "payment.save_up_to", "Save up to")} {pkg3?.savingsPercent}
                </span>
              )}
            </div>
            <ul className="features">
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.unlock_any_challenge", "Unlock any challenge")}
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.billed_monthly", "Billed monthly")}
                </span>
              </li>
              <li>
                <CheckOutlined style={checkStyle} />
                <span className="font-paragraph-white">
                  {get(strings, "payment.menu_tailored", "Menu tailored to your goals")}
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
        {get(strings, "payment.choose_plan", "Choose plan")}
      </button>
      <div className="money-back-guarantee font-paragraph-white">
        <EuroOutlined /> {get(strings, "payment.money_back_guarantee", "7 days money back guarantee")}
      </div>
    </div>
  );
}

export default PackageSelector;
