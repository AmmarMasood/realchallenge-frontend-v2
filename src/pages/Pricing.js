import React, { useState } from "react";
import "../assets/home.css";
import "../assets/trainers.css";
import "../assets/pricing.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// import { Link } from "react-router-dom";
// import {
//   ArrowRightOutlined,
//   CheckOutlined,
//   EuroOutlined,
//   DoubleRightOutlined,
//   PlayCircleOutlined,
// } from "@ant-design/icons";
// import ModalVideo from "react-modal-video";

import NewWelcome from "./NewWelcome";
// import "react-modal-video/scss/modal-video.scss";
function Pricing() {
  // const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Navbar />
      <NewWelcome onPricingPage={true} />
      {/* video modal */}
      {/* <ModalVideo
        channel="youtube"
        autoplay
        isOpen={isOpen}
        videoId="https://youtu.be/HMApf8yWUtg"
        onClose={() => setIsOpen(false)}
      />
      <div className="pricing-row-1">
        <h1 className="font-heading-white">{t("pricing.great")}</h1>
        <h2 className="font-subheading-white">{t("pricing.p")}</h2>
        <div className="pricing-row-1-cards-containers"> */}
      {/* card 1 */}
      {/* <div className="two-cards">
            <div className="pricing-row-1-card">
              <h1 className="font-subheading-black"> {t("pricing.c3")}</h1>
              <div className="home-row-2-col-2-box">
                <CheckOutlined
                  style={{
                    color: "#ff7700",
                    fontSize: "2.5rem",
                    paddingRight: "0.5rem",
                  }}
                />
                <span className="home-text font-paragraph-black">
                  {t("pricing.c3_months")}
                </span>
              </div>
              <div className="home-row-2-col-2-box">
                <CheckOutlined
                  style={{
                    color: "#ff7700",
                    fontSize: "2.5rem",
                    paddingRight: "0.5rem",
                  }}
                />
                <span className="home-text font-paragraph-black">
                  {t("pricing.save")} 20%
                </span>
              </div>
              <div className="pricing-card-price ">
                <h1 className="font-heading-black">€6 / {t("pricing.week")}</h1>
                <p className="font-subheading-black">
                  {t("pricing.c3_billed")}
                </p>
              </div>
            </div> */}
      {/* card 2 */}
      {/* <div className="pricing-row-1-card most-popular-card">
              <div className="most-popular-tag">{t("pricing.most")}</div>
              <h1 className="font-subheading-black">{t("pricing.c12")}</h1>
              <div className="home-row-2-col-2-box">
                <CheckOutlined
                  style={{
                    color: "#ff7700",
                    fontSize: "2.5rem",
                    paddingRight: "0.5rem",
                  }}
                />
                <span className="home-text font-paragraph-black">
                  {t("pricing.c12_months")}
                </span>
              </div>
              <div className="home-row-2-col-2-box">
                <CheckOutlined
                  style={{
                    color: "#ff7700",
                    fontSize: "2.5rem",
                    paddingRight: "0.5rem",
                  }}
                />
                <span className="home-text font-paragraph-black">
                  {t("pricing.save")} 40%
                </span>
              </div>
              <div className="pricing-card-price">
                <h1 className="font-heading-black">
                  €4.5 / {t("pricing.week")}
                </h1>
                <p className="font-subheading-black">
                  {t("pricing.c12_billed")}
                </p>
              </div>
            </div>
          </div> */}
      {/* card 3 */}
      {/* <div className="pricing-row-1-card">
            <h1 className="font-subheading-black">{t("pricing.c1")}</h1>
            <div className="home-row-2-col-2-box">
              <CheckOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.5rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span className="home-text font-paragraph-black">
                {t("pricing.c1_months")}
              </span>
            </div>
            <div className="pricing-card-price">
              <h1 className="font-heading-black">€7.5 / {t("pricing.week")}</h1>
              <p className="font-subheading-black">{t("pricing.c1_billed")}</p>
            </div>
          </div>
        </div>
        <div className="money-back-guarantee font-paragraph-white">
          <EuroOutlined /> {t("pricing.money_back")}
        </div>
        <div style={{ marginTop: "50px" }}>
          {localStorage.getItem("jwtToken") ? (
            <Link className="home-button" to="/choose-plan">
              <span className="home-button-text font-paragraph-white">
                Choose Plan <ArrowRightOutlined />
              </span>
            </Link>
          ) : (
            <Link className="home-button" to="/new">
              <span className="home-button-text font-paragraph-white">
                {t("pricing.start_now")} <ArrowRightOutlined />
              </span>
            </Link>
          )}
        </div>
      </div> */}
      {/* row 3 */}
      {/* <div className="pricing-row-3-container">
        <div className="pricing-row-3">
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.free")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.free_week")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.keep_track")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.choose")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.adapts")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.for_starters")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.motivating")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.choose_right")}
          </div>
          <div className="pricing-row-3-box font-paragraph-white">
            <DoubleRightOutlined
              style={{ fontSize: "2.5rem", color: "#ff7700" }}
            />{" "}
            {t("pricing.earn_points")}
          </div>
        </div>
      </div> */}
      {/* row 3 ends */}
      {/* 6th row */}
      {/* <div className="home-row-6">
        <h1 className="home-row-6-heading font-heading-black">
          {t("pricing.get_motivated")}
        </h1>
        <p style={{ fontSize: "18px" }} className="font-paragraph-black">
          {t("pricing.start_today_with")}
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className="home-row-6-video-container-box pricing-video-box"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div
              className="home-row-6-text font-paragraph-white"
              style={{ textAlign: "left" }}
            >
              <PlayCircleOutlined className="play-icon" /> Waarom werkt Real
              Challenge zo goed voor Remko?
            </div>
          </div>
        </div>
      </div> */}
      {/* 6th row */}
      {/* 7th row */}
      {/* <div className="home-row-7 pricing-background">
        <div className="home-row-7-container">
          <div className="home-row-7-container-text">
            <h2 style={{ fontSize: "2rem" }} className="font-subheading-black">
              {t("pricing.start_today")}
            </h2>
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              {t("pricing.your_set")}
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              {t("pricing.where_and_whenever_you")}
            </p>
            <Link className="home-button" to="/new">
              <span className="home-button-text font-paragraph-white">
                {t("pricing.set_your_goal")}
                <ArrowRightOutlined />
              </span>
            </Link>
            <p style={{ paddingTop: "10px" }} className="font-paragraph-black">
              {t("pricing.less_than")}{" "}
              <Link to="/all-challenges" style={{ color: "#ff7700" }}>
                {t("pricing.see_all")}
              </Link>
            </p>
          </div>
        </div>
      </div> */}
      {/* 7th row */}
      {/* <div className="pricing-faqs">
        <h1 className="pricing-faqs-heading font-subheading-white">FAQS</h1>
        <div className="pricing-faqs-container">
          <div className="pricing-faqs-box">
            <h1 className="font-paragraph-white">
              Excepteur sint occaecat cupidatat non proident
            </h1>
            <p className="font-paragraph-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
          <div className="pricing-faqs-box">
            <h1 className="font-paragraph-white">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
            </h1>
            <p className="font-paragraph-white">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </div>
          <div className="pricing-faqs-box">
            <h1 className="font-paragraph-white">
              Duis aute irure dolor in reprehenderit
            </h1>
            <p className="font-paragraph-white">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </p>
          </div>
          <div className="pricing-faqs-box">
            <h1 className="font-paragraph-white">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            </h1>
            <p className="font-paragraph-white">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        </div>
      </div>

      9th row */}
      <Footer />
    </div>
  );
}

export default Pricing;
