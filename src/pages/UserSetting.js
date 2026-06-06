import React, { useState, useEffect, useContext } from "react";
import LoggedinNavbar from "../components/LoggedinNavbar";
import "../assets/userSetting.css";
import {
  UserOutlined,
  MailOutlined,
  LoadingOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Input, notification } from "antd";
import moment from "moment";
import { getUserProfileInfo } from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
import { getSubscribtionInformation } from "../services/payment";
import { logoutUser, resetPassword } from "../services/authentication";
import { useHistory } from "react-router";
import { T, translate } from "../components/Translate";
import { usePackageConfig } from "../contexts/PackageConfigContext";

const emailIconStyle = {
  fontSize: "5rem",
  color: "var(--color-white)",
  padding: "8px",
  backgroundColor: "var(--color-orange-light)",
};


function UserSetting() {
  const { getPackage } = usePackageConfig();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  // const [confirmPassword, setConfirmPassword] = useState("");
  const [membershipDetails, setMembershipDetails] = useState({
    name: "",
    isValid: true,
    startTime: new Date(),
    endTime: new Date(),
    total: null,
    status: null,
    methods: null,
    date: null,
  });
  const [userInfo, setUserInfo] = useContext(userInfoContext);

  const fetchData = async () => {
    try {
      const res = await getUserProfileInfo(userInfo.id);
      if (!res || !res.customer) return;

      setUserEmail(res.customer.email);

      if (res.customer.mollieId) {
        const subInfo = await getSubscribtionInformation(res.customer.mollieId);
        if (subInfo && subInfo.response) {
          const parsed = JSON.parse(subInfo.response);
          const subscriptions = parsed?._embedded?.subscriptions;
          if (subscriptions && subscriptions.length > 0) {
            const f = subscriptions[0];
            const membership = res.customer.customerDetails?.membership?.[0];
            if (membership) {
              setMembershipDetails({
                name: membership.name,
                isValid: membership.isValid,
                startTime: membership.startTime,
                endTime: membership.endTime,
                total: f.amount?.value,
                status: f.status,
                methods: f.method,
                date: f.createdAt,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch user settings data:", error);
    }
  };

  const updatePasswordButtonClick = async () => {
    if (email === userEmail) {
      setLoading(true);
      await resetPassword(email);
      setLoading(false);
      logoutUser(history, setUserInfo);
    } else {
      notification.error({
        message: translate("user_setting.error"),
        description: translate("user_setting.invalid_email"),
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo.id]);

  return (
    <>
      <LoggedinNavbar />
      <div className="user-setting-container">
        <div className="user-setting-inner">
        <div className="user-setting-container-heading font-paragraph-white">
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <UserOutlined style={{ paddingRight: "10px" }} />
            <T>user_setting.account_setting</T>
          </span>
          <button
            type="button"
            className="user-setting-close"
            onClick={() => history.goBack()}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>
        <div className="user-setting-container-body">
          <div className="user-setting-container-body1">
            <div className="user-setting-container-body1-box">
              <MailOutlined style={emailIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">
                  <T>user_setting.enter_email_to_reset</T>
                </span>
                <Input
                  className="user-setting-container-body1-box-field font-paragraph-white"
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* <div className="user-setting-container-body1-box">
              <LockOutlined style={passwordIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">New Password</span>
                <Input
                  className="user-setting-container-body1-box-field font-paragraph-white"
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="user-setting-container-body1-box">
              <LockOutlined style={passwordIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">
                  Confirm New Password
                </span>
                <Input
                  className="user-setting-container-body1-box-field font-paragraph-white"
                  value={confirmPassword}
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div> */}
            {/* </div> */}
            <div className="user-setting-body1-button-container">
              {/* <button
                className="green-button font-paragraph-white"
                style={{ marginLeft: "10px" }}
              >
                {t("user_setting.save_email")}
              </button> */}
              {loading ? (
                <p className="font-paragraph-white">
                  <LoadingOutlined
                    style={{ color: "#fff", marginRight: "10px" }}
                  />{" "}
                  <T>user_setting.sending_reset_link</T>
                </p>
              ) : (
                <button
                  className="gray-button font-paragraph-white"
                  style={{ marginLeft: "10px" }}
                  onClick={updatePasswordButtonClick}
                >
                  <T>user_setting.update_password</T>
                </button>
              )}
            </div>
          </div>
          <div className="user-setting-container-body2">
            <div className="user-setting-container-body2-row1">
              <div className="user-setting-container-body2-row1-column1">
                <div className="font-paragraph-white">
                  <T>user_setting.membership</T>
                </div>
              </div>
              <div className="user-setting-container-body2-row1-column2">
                <div>
                  <span
                    className="font-paragraph-white"
                    style={{ fontSize: "1.8rem" }}
                  >
                    <T>user_setting.subscription</T>
                  </span>
                  <span className="font-paragraph-white">
                    {membershipDetails.name && getPackage(membershipDetails.name)
                      ? getPackage(membershipDetails.name).displayName
                      : <T>user_setting.no_subscription</T>}
                  </span>
                </div>
                <div>
                  <span
                    className="font-paragraph-white"
                    style={{ fontSize: "1.8rem" }}
                  >
                    <T>user_setting.active</T>
                  </span>
                  <span className="font-paragraph-white">
                    {membershipDetails.isValid === "active" ||
                    membershipDetails.name !== "CHALLENGE_1"
                      ? <T>user_setting.yes</T>
                      : <T>user_setting.no</T>}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "start",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      className="font-paragraph-white"
                      style={{ fontSize: "1.8rem" }}
                    >
                      <T>user_setting.created</T>
                    </span>
                    <span className="font-paragraph-white">
                      {membershipDetails.name === "CHALLENGE_1"
                        ? ""
                        : moment(membershipDetails.startTime).format(
                            "DD/MM/YYYY"
                          )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginLeft: "60px",
                    }}
                  >
                    <span
                      className="font-paragraph-white"
                      style={{ fontSize: "1.8rem" }}
                    >
                      <T>user_setting.expires_on</T>
                    </span>
                    <span className="font-paragraph-white">
                      {membershipDetails.name === "CHALLENGE_1"
                        ? ""
                        : moment(membershipDetails.endTime).format(
                            "DD/MM/YYYY"
                          )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="user-setting-container-body2-row2">
              <div className="font-paragraph-white">
                <span style={{ fontSize: "1.8rem" }}>
                  {" "}
                  <T>user_setting.date</T>{" "}
                </span>
                <span>{moment(new Date()).format("DD/MM/YYYY")}</span>
              </div>
              <div className="font-paragraph-white">
                <span style={{ fontSize: "1.8rem" }}>
                  {" "}
                  <T>user_setting.methods</T>{" "}
                </span>
                <span>{membershipDetails.methods}</span>
              </div>
              <div className="font-paragraph-white">
                <span style={{ fontSize: "1.8rem" }}>
                  <T>user_setting.total</T>{" "}
                </span>
                <span>{membershipDetails.total}</span>
              </div>
              <div className="font-paragraph-white">
                <span style={{ fontSize: "1.8rem" }}>
                  <T>user_setting.status</T>
                </span>
                <span>{membershipDetails.status}</span>
              </div>
              <div className="font-paragraph-white">
                <span style={{ fontSize: "1.8rem" }}>
                  <T>user_setting.membership</T>
                </span>
                <span>
                  {moment(membershipDetails.date).format("DD/MM/YYYY")}
                </span>
              </div>
              {/* <div className="font-paragraph-white">
                <span style={{ fontSize: "1.8rem" }}>
                  {t("user_setting.invoice")}
                </span>
                <span>test</span>
              </div> */}
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

export default UserSetting;
