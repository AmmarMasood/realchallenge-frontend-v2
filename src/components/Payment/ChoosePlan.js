import React, { useEffect, useContext } from "react";
import "../../assets/newWelcome.css";
import { withRouter, Link } from "react-router-dom";

import { userInfoContext } from "../../contexts/UserStore";
import PackageSelector from "./PackageSelector";

function ChoosePlan(props) {
  const [userInfo, setUserInfo] = useContext(userInfoContext);

  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) {
      props.history.push("/login");
    }
  }, []);

  const onChoosePlan = (pack) => {
    console.log("here", pack);
    localStorage.setItem("package-type", pack);
    props.history.push("/create-payment");
  };
  return (
    <>
      <div className="new-welcome-page choose-plan-page">
        <div className="new-welcome-container">
          <h1 className="font-heading-white">Our Plans</h1>
          <p className="font-paragraph-white">
            Our plans are created by expert trainers that helps you achive your
            goals.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <PackageSelector onChoosePlan={onChoosePlan} />
        </div>
      </div>
    </>
  );
}

export default withRouter(ChoosePlan);
