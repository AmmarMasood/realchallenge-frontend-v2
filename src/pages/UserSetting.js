import React, { useState, useEffect, useContext } from "react";
import LoggedinNavbar from "../components/LoggedinNavbar";
import "../assets/userSetting.css";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Input } from "antd";
import moment from "moment";
import { getNotifications, getUserProfileInfo } from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
import { getSubscribtionInformation } from "../services/payment";
import { logoutUser, resetPassword } from "../services/authentication";
import { useHistory } from "react-router";
import { T } from "../components/Translate";

const emailIconStyle = {
  fontSize: "5rem",
  color: "var(--color-white)",
  padding: "8px",
  backgroundColor: "var(--color-orange-light)",
};

const passwordIconStyle = {
  fontSize: "5rem",
  color: "var(--color-orange-light)",
  padding: "8px",
  border: "1px solid var(--color-orange-light)",
};

function UserSetting() {
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
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await getNotifications();
        setNotifications(res);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    }

    // Fetch notifications immediately and then every 1 minute
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [userInfo.id]);

  const fetchData = async () => {
    const res = await getUserProfileInfo(userInfo.id);
    const subInfo =
      res.customer.mollieId &&
      (await getSubscribtionInformation(res.customer.mollieId));
    setUserEmail(res.customer.email);
    if (res && subInfo && subInfo.response) {
      const f = JSON.parse(subInfo.response)._embedded.subscriptions[0];
      setMembershipDetails({
        name: res.customer.customerDetails.membership[0].name,
        isValid: res.customer.customerDetails.membership[0].isValid,
        startTime: res.customer.customerDetails.membership[0].startTime,
        endTime: res.customer.customerDetails.membership[0].endTime,
        total: f.amount.value,
        status: f.status,
        methods: f.method,
        date: f.createdAt,
      });
    }
  };

  const updatePasswordButtonClick = async () => {
    if (email === userEmail) {
      setLoading(true);
      const res = await resetPassword(email);
      console.log(res);

      setLoading(false);
      logoutUser(history, setUserInfo);
    } else {
      alert("Please enter valid email address");
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo]);

  const markNotificationAsRead = (id, notification) => {
    history.push(notification.onClick);
    if (!notifications.notifications) return;
    // notification is already read
    if (
      notifications.notifications.find(
        (notification) => notification._id === id
      ).read
    )
      return;
    setNotifications({
      notifications: notifications.notifications.map((notification) => {
        if (notification._id === id) {
          return { ...notification, read: true };
        }
        return notification;
      }),
      unreadNotifications: notifications.unreadNotifications - 1,
    });
    console.log("markNotificationAsRead", id);
  };

  return (
    <>
      <LoggedinNavbar
        notifications={notifications}
        markNotificationAsRead={markNotificationAsRead}
      />
      <div className="user-setting-container">
        <div className="user-setting-container-heading font-paragraph-white">
          <UserOutlined style={{ paddingRight: "10px" }} />

          <T>user_setting.account_setting</T>
        </div>
        <div className="user-setting-container-body">
          <div className="user-setting-container-body1">
            <div className="user-setting-container-body1-box">
              <MailOutlined style={emailIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">
                  Enter Your Email To Update Password
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
                  Sending an password reset link to your email, please wait..
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
                    {membershipDetails.name === "CHALLENGE_12"
                      ? "12 Months Subscribtion Plan"
                      : membershipDetails.name === "CHALLENGE_3"
                      ? "3 Months Subscribtion Plan"
                      : "None"}
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
                      ? "Yes"
                      : "No"}
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
    </>
  );
}

export default UserSetting;
