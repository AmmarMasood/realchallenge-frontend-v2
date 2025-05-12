import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import "../assets/navbar.css";
import {
  MenuOutlined,
  CloseOutlined,
  CaretDownOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Logo from "../images/logo.png";
import { userInfoContext, userPointsContext } from "../contexts/UserStore";
import { Avatar, Popover, Badge } from "antd";
import { logoutUser } from "../services/authentication";
import { withRouter } from "react-router-dom";
import Coins from "../assets/icons/coins.svg";
import LanguageSelector from "./LanguageSelector/LanguageSelector";
import { T } from "./Translate";

function Navbar({ color, history }) {
  const [click, setClick] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [button, setButton] = useState(true);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const userPoints = useContext(userPointsContext)[0];

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);
  const notificationContent = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {userInfo.notifications.map((v) => (
        <span className="font-paragraph-white">{v.value}</span>
      ))}
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
                  count={userInfo.notifications.length}
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
                content={userInfo.role === "customer" ? content : contentAdmin}
                trigger="click"
              >
                <div className="loggedin-nav-name font-paragraph-white">
                  <span>
                    {userInfo.username} <CaretDownOutlined />
                  </span>
                  <span style={{ color: "#677182", fontSize: "1.6rem" }}>
                    <img src={Coins} /> {userPoints}
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
