import React, { useEffect, useState, useContext } from "react";
import "../assets/newWelcome.css";
import { RightOutlined, CheckOutlined, EuroOutlined } from "@ant-design/icons";
import { get } from "lodash";

import { withRouter, Link, useHistory } from "react-router-dom";

import VerifyUser from "../components/UserDashboard/VerifyUser";
import { userInfoContext } from "../contexts/UserStore";
import { selectedChallengeContext } from "../contexts/PaymentProcessStore";
import { addFreeChallenge } from "../services/createChallenge/main";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
import { usePackageConfig } from "../contexts/PackageConfigContext";

function NewWelcome(props) {
  const { strings } = useContext(LanguageContext);
  const { getPackage } = usePackageConfig();
  const history = useHistory();
  const userInfo = useContext(userInfoContext)[0];
  const selectedChallenge = useContext(selectedChallengeContext)[0];
  const [choosePlan, setChoosenPlan] = useState("CHALLENGE_12");

  useEffect(() => {
    if (!props.onPricingPage) {
      if (!localStorage.getItem("jwtToken")) {
        props.history.push("/login");
      }
    }
  }, []);

  const checkStyle = {
    color: "#ff7700",
    fontSize: "2.5rem",
    paddingRight: "0.5rem",
  };

  const addFreeChallengeToDashboard = async () => {
    console.log(selectedChallenge, userInfo);
    if (selectedChallenge && selectedChallenge.access?.includes("FREE")) {
      await addFreeChallenge(selectedChallenge);
      history.push("/user/dashboard");
      // console.log("is free");
    } else {
      // console.log("no free");
      history.push("/user/dashboard");
    }
    // async () => {
    //   const res = await addChallengeToCustomerDetail(userInfo._id, selectedChallenge._id);
    //   if(res){
    //     history.push("/user/dashboard")
    //   }
  };
  const onChoosePlan = () => {
    console.log("here", choosePlan);
    localStorage.setItem("package-type", choosePlan);
    if (localStorage.getItem("jwtToken")) {
      if (choosePlan === "CHALLENGE_1") {
        props.history.push("/all-challenges");
      } else {
        props.history.push("/create-payment");
      }
    } else {
      props.history.push("/new");
    }
  };
  return (
    <>
      {props.onPricingPage ? "" : <VerifyUser fromNewWelcomeScreen={true} />}
      {props.onPricingPage ? (
        ""
      ) : (
        <div
          onClick={addFreeChallengeToDashboard}
          className="font-paragraph-white"
          style={{
            color: "var(--color-orange)",
            fontSize: "20px",
            backgroundColor: "var(--mirage)",
            padding: "10px ",
            float: "right",
            margin: "10px 50px 0 0",
            cursor: "pointer",
          }}
        >
          <T>newWelcome.skip</T> <RightOutlined />
        </div>
      )}

      <div
        className="new-welcome-page"
        style={{ paddingTop: props.onPricingPage ? "60px" : "10px" }}
      >
        <div className="new-welcome-container">
          <h1
            className="font-heading-white"
            style={{ fontSize: props.onPricingPage ? "25px" : "" }}
          >
            {props.onPricingPage ? <T>pricing.great</T> : <T>newWelcome.welcome</T>}
          </h1>
          <h3
            className="font-subheading-white"
            style={{ fontSize: props.onPricingPage ? "18px" : "" }}
          >
            {props.onPricingPage ? <T>pricing.p</T> : <T>newWelcome.tyfjr</T>}
          </h3>
          <p className="font-paragraph-white">
            <T>newWelcome.getAccess</T>
          </p>
          <div className="new-welcome-cards">
            {/* first card */}
            <div
              className="new-welcome-card"
              onClick={() => setChoosenPlan("CHALLENGE_1")}
              style={{
                border:
                  choosePlan === "CHALLENGE_1"
                    ? "2px solid #f37720"
                    : "2px solid #2a2f36",
              }}
            >
              <h2 className="font-paragraph-white">
                <T>newWelcome.oneTime</T> <br />
                <T>newWelcome.challenge</T>
              </h2>
              <span
                className="font-paragraph-white"
                style={{ fontWeight: "600", margin: "10px" }}
              >
                <T>newWelcome.from</T>{" "}
                <span style={{ fontSize: "30px" }}>€29</span> /{" "}
                <T>newWelcome.challenge</T>
              </span>

              <span
                className="font-paragraph-white"
                style={{ color: "#969696", textAlign: "left" }}
              >
                <T>newWelcome.ccfl</T>
              </span>
              <ul
                className="features"
                style={{ textAlign: "left", marginTop: "20px" }}
              >
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.nsn</T>
                  </span>
                </li>
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.billedOnce</T>
                  </span>
                </li>
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.unlockAll</T>
                  </span>
                </li>
              </ul>
            </div>
            {/* second card - 12 months */}
            <div
              className="new-welcome-card"
              onClick={() => setChoosenPlan("CHALLENGE_12")}
              style={{
                border:
                  choosePlan === "CHALLENGE_12"
                    ? "2px solid #f37720"
                    : "2px solid #2a2f36",
              }}
            >
              <h2 className="font-paragraph-white">
                {getPackage("CHALLENGE_12")?.displayName || "12 Months Plan"}
              </h2>
              {getPackage("CHALLENGE_12")?.savingsPercent && (
                <span
                  className="font-paragraph-white"
                  style={{
                    fontSize: "13px",
                    backgroundColor: "#f37720",
                    padding: "5px",
                    width: "120px",
                    fontWeight: "600",
                    alignSelf: "center",
                    marginBottom: "10px",
                  }}
                >
                  <T>newWelcome.saveUpTo</T> {getPackage("CHALLENGE_12")?.savingsPercent}
                </span>
              )}
              <span
                className="font-paragraph-white"
                style={{ fontWeight: "600", margin: "10px" }}
              >
                <span style={{ fontSize: "30px" }}>
                  {getPackage("CHALLENGE_12")?.priceDisplayText || `€${getPackage("CHALLENGE_12")?.price}`}
                </span>
              </span>

              <span
                className="font-paragraph-white"
                style={{ color: "#969696", textAlign: "left" }}
              >
                {getPackage("CHALLENGE_12")?.billingInterval} {get(strings, "payment.months_plan", "months plan")}
              </span>
              <ul
                className="features"
                style={{ textAlign: "left", marginTop: "20px" }}
              >
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.uac</T>
                  </span>
                </li>
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.bm</T>
                  </span>
                </li>
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.mtg</T>
                  </span>
                </li>
              </ul>
            </div>
            {/* third card - 3 months */}
            <div
              className="new-welcome-card"
              onClick={() => setChoosenPlan("CHALLENGE_3")}
              style={{
                border:
                  choosePlan === "CHALLENGE_3"
                    ? "2px solid #f37720"
                    : "2px solid #2a2f36",
              }}
            >
              <h2 className="font-paragraph-white">
                {getPackage("CHALLENGE_3")?.displayName || "3 Months Plan"}
              </h2>
              {getPackage("CHALLENGE_3")?.savingsPercent && (
                <span
                  className="font-paragraph-white"
                  style={{
                    fontSize: "13px",
                    backgroundColor: "#f37720",
                    padding: "5px",
                    width: "120px",
                    fontWeight: "600",
                    alignSelf: "center",
                    marginBottom: "10px",
                  }}
                >
                  <T>newWelcome.saveUpTo</T> {getPackage("CHALLENGE_3")?.savingsPercent}
                </span>
              )}
              <span
                className="font-paragraph-white"
                style={{ fontWeight: "600", margin: "10px" }}
              >
                <span style={{ fontSize: "30px" }}>
                  {getPackage("CHALLENGE_3")?.priceDisplayText || `€${getPackage("CHALLENGE_3")?.price}`}
                </span>
              </span>
              <span
                className="font-paragraph-white"
                style={{ color: "#969696", textAlign: "left" }}
              >
                {getPackage("CHALLENGE_3")?.billingInterval} {get(strings, "payment.months_plan", "months plan")}
              </span>
              <ul
                className="features"
                style={{ textAlign: "left", marginTop: "20px" }}
              >
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.uac</T>
                  </span>
                </li>
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.bm</T>
                  </span>
                </li>
                <li>
                  <CheckOutlined style={checkStyle} />
                  <span className="font-paragraph-white">
                    <T>newWelcome.mtg</T>
                  </span>
                </li>
              </ul>
            </div>
            {/* sadasd */}
          </div>
          <div
            style={{
              paddingBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              className="create-payment-check-out font-paragraph-white"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                width: "80%",
              }}
              onClick={onChoosePlan}
            >
              <span
                className="font-paragraph-white"
                style={{ fontWeight: "600" }}
              >
                <T>newWelcome.choose</T>
              </span>
            </button>
          </div>
          {props.onPricingPage ? (
            ""
          ) : (
            <div style={{ padding: "20px 0" }}>
              <div
                onClick={addFreeChallengeToDashboard}
                // to=
                className="font-paragraph-white"
                style={{
                  fontSize: "20px",
                  borderBottom: "1px solid #fff",
                  textDecoration: "none",
                  display: "inline-block",
                  cursor: "pointer",
                }}
              >
                <T>newWelcome.dash</T>
              </div>
            </div>
          )}
        </div>
        <div className="money-back-guarantee font-paragraph-white">
          <EuroOutlined /> <T>newWelcome.moneyBack</T>
        </div>
      </div>

      {/* cards */}
    </>
  );
}

export default withRouter(NewWelcome);

// <Link
// to={{
//   pathname: "/create-payment",
// }}
// onClick={() =>
//   localStorage.setItem("package-type", "CHALLENGE_1")
// }
// className="common-orange-button font-paragraph-white"
// style={{
//   width: "150px",
//   marginBottom: "10px",
//   textAlign: "center",
// }}
// >
// Select
// </Link>
