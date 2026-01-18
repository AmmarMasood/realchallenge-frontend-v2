import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "../assets/navbar.css";
import {
  UserOutlined,
  BellOutlined,
  CaretDownOutlined,
  CheckOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Badge, Avatar, Popover, Spin, Button } from "antd";
import { userInfoContext, userPointsContext } from "../contexts/UserStore";
import Logo from "../images/logo_orange.png";

import Coins from "../assets/icons/coins.svg";
import { logoutUser } from "../services/authentication";

import { withRouter } from "react-router-dom";
import { T } from "./Translate";
import { useNotifications } from "../contexts/NotificationContext";

function LoggedinNavbar(props) {
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
  // eslint-disable-next-line
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const userPoints = useContext(userPointsContext)[0];

  const readNotification = async (id, notification) => {
    await markAsRead(id);
    // Navigate if onClick is specified
    if (notification.onClick && props.history) {
      props.history.push(notification.onClick);
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
                onClick={() => readNotification(v._id, v)}
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

// Helper function to format time ago
function formatTimeAgo(dateString) {
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
}

// Helper function to strip HTML tags from text
function stripHtml(html) {
  if (!html) return "";
  // Create a temporary div to parse HTML and extract text
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

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
