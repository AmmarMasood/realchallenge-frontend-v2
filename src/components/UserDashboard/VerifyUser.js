import React, { useContext, useState, useEffect } from "react";
import { Button, Modal } from "antd";
import { MailOutlined, LoadingOutlined } from "@ant-design/icons";
import { userInfoContext } from "../../contexts/UserStore";
import { withRouter } from "react-router-dom";
import ForwardArrow from "../../assets/icons/forward-arrows.png";

import "../../assets/verifyUser.css";
import {
  checkEmailVerified,
  logoutUser,
  sendEmailVerification,
} from "../../services/authentication";

function VerifyUser(props) {
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.getItem("isActive") === "true"
      ? setShowModal(false)
      : setShowModal(true);
  });
  //   if user is on dashboard and still needs to verify its email
  const onClickVeriyButton = async () => {
    const res = await sendEmailVerification(userInfo.email);
    if (res?.success) {
      logoutUser(props.history, setUserInfo);
    }
  };

  //   if user is in new welcome screen, an email as already been sent to their addresss
  // fromNewWelcomeScreen
  const onClickCheckEmailVerifiedButton = async () => {
    setLoading(true);
    const res = await checkEmailVerified(userInfo.email);

    if (res?.success) {
      localStorage.removeItem("userRecentlySignedUp");
      localStorage.setItem("isActive", true);
    }
    setLoading(false);
    // console.log(userInfo.email);
  };

  const sendEmailAgain = async () => {
    setLoading(true);
    const res = await sendEmailVerification(userInfo.email);
    localStorage.setItem("userRecentlySignedUp", true);
    setLoading(false);
    console.log("res", res);
  };
  const dashboardScreenModal = () => (
    <div className="verify-user-container">
      <MailOutlined
        style={{ fontSize: "80px", color: "#fff", marginBottom: "20px" }}
      />
      <h2 className="font-paragraph-white">
        <img src={ForwardArrow} alt="" style={{ marginRight: "10px" }} />
        Please verify your email.
      </h2>
      <p className="font-paragraph-white" style={{ letterSpacing: "0.2" }}>
        Thank you for signing up for realchallenge. Please verify your email to
        continue your access to dashboard.
      </p>
      <button
        className="font-paragraph-white common-orange-button"
        style={{ width: "50%" }}
        onClick={onClickVeriyButton}
      >
        Verify Email
      </button>
    </div>
  );

  const welcomScreenModal = () => (
    <div className="verify-user-container">
      <MailOutlined
        style={{ fontSize: "80px", color: "#fff", marginBottom: "20px" }}
      />
      <h2 className="font-paragraph-white">
        <img src={ForwardArrow} alt="" style={{ marginRight: "10px" }} />
        Please verify your email
      </h2>
      <p className="font-paragraph-white" style={{ letterSpacing: "0.2" }}>
        An email has been sent to your account, please verify your email address
        to continue access to realchallenge.
      </p>
      {!loading ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {" "}
          <button
            className="font-paragraph-white common-orange-button"
            style={{ width: "50%" }}
            onClick={onClickCheckEmailVerifiedButton}
          >
            Complete
          </button>
          <Button
            type="link"
            style={{ marginTop: "10px" }}
            onClick={sendEmailAgain}
          >
            I did not received any email
          </Button>
        </div>
      ) : (
        <LoadingOutlined style={{ color: "#ff7700", fontSize: "30px" }} />
      )}
    </div>
  );

  return (
    <Modal footer={false} visible={showModal} closable={false}>
      {props.fromNewWelcomeScreen
        ? welcomScreenModal()
        : dashboardScreenModal()}
      {/* {console.log(localStorage.getItem("isActive") === "true")} */}
    </Modal>
  );
}

export default withRouter(VerifyUser);
