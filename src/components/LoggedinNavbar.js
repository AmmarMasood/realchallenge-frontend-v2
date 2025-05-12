import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../assets/navbar.css";
import {
  UserOutlined,
  BellOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { Badge, Avatar, Popover, Divider } from "antd";
import { userInfoContext, userPointsContext } from "../contexts/UserStore";
import Logo from "../images/logo_orange.png";

import Coins from "../assets/icons/coins.svg";
import { logoutUser } from "../services/authentication";

import { withRouter } from "react-router-dom";
import { T } from "./Translate";
import { markNotificationsAsRead } from "../services/users";

function LoggedinNavbar(props) {
  const { notifications, unreadNotifications } = props.notifications || {};
  // eslint-disable-next-line
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const userPoints = useContext(userPointsContext)[0];

  const readNotification = async (id, notification) => {
    try {
      await markNotificationsAsRead(id);
      props.markNotificationAsRead(id, notification);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const content = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link to="/user/dashboard" className="font-paragraph-white hover-orange">
        <T>navbar.success_overview</T>
      </Link>
      <Link to="/user/update" className="font-paragraph-white hover-orange">
        <T>navbar.update</T>
      </Link>
      <Link to="/user/settings" className="font-paragraph-white hover-orange">
        <T>navbar.setting</T>
      </Link>
      <Link
        className="font-paragraphw-white hover-orange"
        onClick={() => logoutUser(props.history, setUserInfo)}
      >
        <T>navbar.logout</T>
      </Link>
    </div>
  );

  const notificationContent = (
    <div className="notification-container">
      {notifications?.map((v, key) => (
        <>
          <span
            className={`font-paragraph-white notification-row ${
              v.read ? "notification-row-read" : "notification-row-unread"
            }`}
            onClick={() => readNotification(v._id, v)}
          >
            {v.title}
          </span>
          {key !== notifications.length - 1 && <div className="divider"></div>}
        </>
      ))}
    </div>
  );

  return (
    <>
      <nav className="loggedin-nav-container">
        <div>
          <Link to="/" className="navbar-logo">
            <img src={Logo} alt="logo" className="logo small-screenlogo" />
          </Link>
        </div>
        <div className="loggedin-nav-userinfo">
          <Popover
            placement="bottom"
            content={notificationContent}
            trigger="click"
          >
            <Badge
              count={unreadNotifications}
              style={{
                backgroundColor: "var(--color-orange)",
                marginRight: "20px",
              }}
            >
              <BellOutlined
                style={{
                  fontSize: "2.5rem",
                  color: "#677182",
                  cursor: "pointer",
                  backgroundColor: "#171E27",
                  padding: "5px",
                  marginRight: "20px",
                }}
              />
            </Badge>
          </Popover>
          <Avatar
            shape="square"
            src={userInfo.avatar}
            icon={<UserOutlined />}
            style={{
              marginRight: "20px",
            }}
          />
          <Popover placement="bottom" content={content} trigger="click">
            <div className="loggedin-nav-name font-paragraph-white">
              <span>
                {userInfo.username} <CaretDownOutlined />
              </span>
              <span style={{ color: "#677182", fontSize: "1.6rem" }}>
                <img src={Coins} /> {userPoints}
                {console.log("ammar", userPoints)}
              </span>
            </div>
          </Popover>
        </div>
      </nav>
    </>
  );
}

export default withRouter(LoggedinNavbar);
