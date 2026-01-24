import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../assets/navbar.css";
import {
  MenuOutlined,
  CloseOutlined,
  CaretDownOutlined,
  UserOutlined,
  BellOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import Logo from "../images/logo.png";
import { userInfoContext, userPointsContext } from "../contexts/UserStore";
import { Avatar, Popover, Badge, Spin, Button } from "antd";
import { logoutUser } from "../services/authentication";
import { withRouter } from "react-router-dom";
import Coins from "../assets/icons/coins.svg";
import LanguageSelector from "./LanguageSelector/LanguageSelector";
import { T } from "./Translate";
import { hasRole } from "../helpers/roleHelpers";
import { useNotifications } from "../contexts/NotificationContext";

function Navbar({ color, history }) {
  const [click, setClick] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [button, setButton] = useState(true);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const userPoints = useContext(userPointsContext)[0];
  const {
    notifications,
    unreadCount,
    loading,
    loadingMore,
    pagination,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotifications();

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    if (notification.onClick) {
      history.push(notification.onClick);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleLoadMore = (e) => {
    e.stopPropagation();
    loadMore();
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Helper function to strip HTML tags from text
  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const notificationContent = (
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-header">
        <span className="notification-title">
          <T>notifications.title</T>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            icon={<CheckOutlined />}
          >
            <T>notifications.mark_all_read</T>
          </Button>
        )}
      </div>

      {/* Notification List */}
      <div className="notification-list">
        {loading && notifications.length === 0 ? (
          <div className="notification-loading">
            <Spin size="small" />
          </div>
        ) : notifications?.length === 0 ? (
          <div className="notification-empty">
            <T>notifications.no_notifications</T>
          </div>
        ) : (
          <>
            {notifications?.map((v, key) => (
              <div
                key={v._id || key}
                className={`notification-item ${
                  v.read ? "notification-read" : "notification-unread"
                }`}
                onClick={() => handleNotificationClick(v)}
              >
                <div className="notification-content">
                  <span className="notification-item-title">
                    <T params={v.params}>{v.titleKey || v.title}</T>
                  </span>
                  {(v.bodyKey || v.body) && (
                    <span className="notification-item-body">
                      <T params={v.params}>{v.bodyKey || v.body}</T>
                    </span>
                  )}
                  <span className="notification-time">
                    {v.createdAt && formatTimeAgo(v.createdAt)}
                  </span>
                </div>
                {!v.read && <div className="notification-dot" />}
              </div>
            ))}

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="notification-load-more">
                <Button
                  type="link"
                  size="small"
                  onClick={handleLoadMore}
                  loading={loadingMore}
                >
                  <T>notifications.load_more</T>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
  const content = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link to="/user/dashboard" className="font-paragraph-white nav-links">
        <T>navbar.success_overview</T>
      </Link>
      <Link to="/user/update" className="font-paragraph-white nav-links">
        <T>navbar.update</T>
      </Link>

      <Link to="/user/settings" className="font-paragraph-white nav-links">
        <T>navbar.setting</T>
      </Link>
      <Link
        className="font-paragraphw-white nav-links"
        onClick={() => logoutUser(history, setUserInfo)}
      >
        <T>navbar.logout</T>
      </Link>
    </div>
  );
  const contentAdmin = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link to="/admin/dashboard" className="font-paragraph-white nav-links">
        <T>navbar.admin_dashboard</T>
      </Link>
      <Link
        className="font-paragraphw-white nav-links"
        onClick={() => logoutUser(history, setUserInfo)}
      >
        {" "}
        <T>navbar.logout</T>
      </Link>
    </div>
  );

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
  }, []);

  window.addEventListener("resize", showButton);
  const changeBackground = () => {
    if (window.scrollY >= 85) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };
  window.addEventListener("scroll", changeBackground);
  return (
    <>
      <nav
        className={
          navbar
            ? `navbar active ${
                color === "dark" && "navbar-for-white-background"
              }`
            : `navbar  ${color === "dark" && "navbar-for-white-background"}`
        }
      >
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <img src={Logo} alt="logo" className="logo" />
          </Link>

          <div className="menu-icon" onClick={handleClick}>
            {click ? (
              <CloseOutlined style={{ color: "#fff", fontSize: "2rem" }} />
            ) : (
              <MenuOutlined style={{ color: "#fff", fontSize: "2rem" }} />
            )}
          </div>
          <div style={{ position: "absolute", right: "60px", top: "30px" }}>
            {!userInfo.authenticated && !button && (
              <Link to="/new" className="nav-button font-paragraph-white">
                <T>navbar.start_now</T>
              </Link>
            )}
            {!userInfo.authenticated && !button && (
              <Link
                to="/login"
                className="nav-button-login font-paragraph-white"
              >
                <T>navbar.log_in</T>
              </Link>
            )}
          </div>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item font-paragraph-white">
              <Link
                to="/challenges"
                style={{ fontWeight: "600" }}
                className="nav-links"
                onClick={closeMobileMenu}
              >
                <T>navbar.challenges</T>
              </Link>
              {/* </li> */}
              {/* <li className="nav-item font-paragraph-white"> */}
              <Link
                style={{ fontWeight: "600" }}
                to="/trainers"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                <T>navbar.trainers</T>
              </Link>
              {/* </li> */}
              {/* <li className="nav-item font-paragraph-white"> */}
              <Link
                style={{ fontWeight: "600" }}
                to="/nutrition"
                className="nav-links"
                onClick={closeMobileMenu}
              >
                <T>navbar.nutrient</T>
              </Link>
            </li>
            <li
              className="nav-item font-paragraph-white"
              style={{ justifyContent: !click && "flex-end" }}
            >
              <Link
                to="/how-it-works"
                style={{ fontWeight: "400", fontSize: "13px" }}
                className="nav-links"
                onClick={closeMobileMenu}
              >
                <T>navbar.how_it_works</T>
              </Link>
              {/* </li>
            <li className="nav-item font-paragraph-white"> */}
              <Link
                to="/pricing"
                className="nav-links"
                style={{ fontWeight: "400", fontSize: "13px" }}
                onClick={closeMobileMenu}
              >
                <T>navbar.pricing</T>
              </Link>
              {/* </li>
            <li className="nav-item font-paragraph-white"> */}
              <Link
                to="/magazine"
                className="nav-links"
                style={{ fontWeight: "400", fontSize: "13px" }}
                onClick={closeMobileMenu}
              >
                <T>navbar.magazine</T>
              </Link>
              <div className="loggedin-nav-userinfo">
                <LanguageSelector />
              </div>
            </li>
          </ul>
          {userInfo.authenticated ? (
            <div className="loggedin-nav-userinfo">
              <Popover
                placement="bottom"
                content={notificationContent}
                trigger="click"
              >
                <Badge
                  count={unreadCount}
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

              <Popover
                placement="bottom"
                content={hasRole(userInfo, "customer") ? content : contentAdmin}
                trigger="click"
              >
                <div className="loggedin-nav-name font-paragraph-white">
                  <span className="username-row">
                    <span className="username-text">{userInfo.username}</span>
                    <CaretDownOutlined className="dropdown-arrow" />
                  </span>
                  <span className="points-row">
                    <img src={Coins} alt="coins" /> {userPoints}
                  </span>
                </div>
              </Popover>
            </div>
          ) : (
            <div style={{ width: "200px" }}>
              {button && (
                <Link to="/new" className="nav-button font-paragraph-white">
                  <T>navbar.start_now</T>
                </Link>
              )}
              {button && (
                <Link
                  to="/login"
                  className="nav-button-login font-paragraph-white"
                >
                  <T>navbar.log_in</T>
                </Link>
              )}
            </div>
          )}

          {/* <div
            className="loggedin-nav-userinfo"
            style={{ width: "fit-content" }}
          >
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
                <span>
                  <RocketOutlined style={{ color: "var(--color-orange)" }} />{" "}
                  {userInfo.points}
                </span>
              </div>
            </Popover>
          </div> */}
        </div>
      </nav>
    </>
  );
}

export default withRouter(Navbar);
