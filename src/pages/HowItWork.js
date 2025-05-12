import React, { useState } from "react";
import "../assets/home.css";
import "../assets/trainers.css";
import "../assets/challenge.css";
import "../assets/howitworks.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { ArrowRightOutlined, PlayCircleOutlined } from "@ant-design/icons";
// import ModalVideo from "react-modal-video";
// import "react-modal-video/scss/modal-video.scss";
import { T } from "../components/Translate";

function HowItWork() {
  const [link, setLink] = useState("");
  const [isOpen, setOpen] = useState(false);

  return (
    <div>
      <Navbar />
      {/* modal video */}
      {/* todo do later */}
      {/* <ModalVideo
        channel="youtube"
        autoplay
        isOpen={isOpen}
        videoId={link}
        onClose={() => setOpen(false)}
      /> */}
      {/* <Hero /> */}
      <div className="page-header howitworks-background">
        <div className="page-header-textbox" style={{ padding: "50px" }}>
          <h1 className="font-heading-white">
            <T>how_it_works.workout</T> <br /> <T>how_it_works.start</T>
          </h1>
          <p className="font-paragraph-white">
            <T>how_it_works.month</T>
          </p>
          <Link className="home-button" to="/new">
            <span className="home-button-text font-paragraph-white">
              <T>how_it_works.start_d</T> <ArrowRightOutlined />
            </span>
          </Link>
        </div>
      </div>
      {/* pick your first goal starts */}
      <div style={{ backgroundColor: "#171e27" }}>
        <div className="home-row-2" style={{ backgroundColor: "#171e27" }}>
          <div className="home-row-2-col-1">
            <h3 className="home-row-2-col-1-heading font-subheading-white">
              <T>how_it_works.all</T>
            </h3>
            <h2 className="home-row-2-col-1-subheading font-heading-white">
              <T>how_it_works.all_tools</T>
            </h2>
            <p className="home-text font-paragraph-white">
              <T>how_it_works.rc</T>
            </p>
            <Link className="home-button" to="/new">
              <span className="home-button-text font-paragraph-white">
                <T>how_it_works.accept</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
          <div className="home-row-2-col-2">
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.we</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.choose</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.gt</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.ad</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.start_over</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.start_first</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.update_your</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.track_your</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.fc</T>
              </span>
            </div>
            <div className="home-row-2-col-2-box">
              <ArrowRightOutlined
                style={{
                  color: "#ff7700",
                  fontSize: "2.8rem",
                  paddingRight: "0.5rem",
                }}
              />
              <span
                className="home-text font-heading-white"
                style={{ lineHeight: "20px" }}
              >
                <T>how_it_works.psm</T>
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* pick your first goa ends */}
      {/* 6th row */}
      <div className="home-row-6" style={{ padding: "30px 50px" }}>
        <h1 className="home-row-6-heading font-heading-black">
          <T>how_it_works.we_share_exp</T>
        </h1>
        <p style={{ fontSize: "18px" }} className="font-paragraph-black">
          <T>how_it_works.this_is</T>
        </p>
        <div
          className="home-row-6-video-container"
          style={{ justifyItems: "center" }}
        >
          <div
            className="home-row-6-video-container-box home-6-box-1"
            onClick={() => {
              setLink("https://www.youtube.com/embed/jVfuTFgUQEo");
              setOpen(true);
            }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div
              className="home-row-6-text font-paragraph-white"
              style={{ textAlign: "left" }}
            >
              <PlayCircleOutlined className="play-icon" />
              <T>how_it_works.find_the</T>
            </div>
          </div>
          <div
            className="home-row-6-video-container-box home-6-box-2"
            onClick={() => {
              setLink("https://youtu.be/dakFOeZGbO4");
              setOpen(true);
            }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div
              className="home-row-6-text font-paragraph-white"
              style={{ textAlign: "left" }}
            >
              <PlayCircleOutlined className="play-icon" />
              <T>how_it_works.cnp</T>
              <br />
            </div>
          </div>
          <div
            className="home-row-6-video-container-box home-6-box-3"
            onClick={() => {
              setLink("https://youtu.be/0e_0sSkH_dQ");
              setOpen(true);
            }}
          >
            <div className="pricing-video-box-overlay"></div>
            <div
              className="home-row-6-text font-paragraph-white"
              style={{ textAlign: "left" }}
            >
              <PlayCircleOutlined className="play-icon" />
              <T>how_it_works.exercise_when_and</T>
            </div>
          </div>
        </div>
      </div>
      {/* 6th row */}
      {/* 8th row */}
      <div className="home-row-7 howitworks-challenge-background">
        <div className="home-row-7-container">
          <div className="home-row-7-container-text">
            <h2 style={{ fontSize: "2rem" }} className="font-subheading-black">
              <T>how_it_works.start_today</T>
            </h2>
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              <T>how_it_works.optimal</T>
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              <T>how_it_works.a_personal</T>
            </p>
            <Link className="home-button" to="/new">
              <span className="home-button-text font-paragraph-white">
                <T>how_it_works.start_now</T> <ArrowRightOutlined />
              </span>
            </Link>
            <p style={{ paddingTop: "10px" }} className="font-paragraph-black">
              <T>how_it_works.less</T>{" "}
              <Link to="/pricing" style={{ color: "#ff7700" }}>
                <T>how_it_works.see_all</T>
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HowItWork;
