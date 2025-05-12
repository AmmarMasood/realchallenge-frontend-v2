import React from "react";
import { Carousel } from "antd";
import "../../assets/home-hero.css";
import { Link } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import { T } from "../Translate";

function Hero() {
  return (
    <>
      <div className="hero-container">
        <video
          src="https://realchallenge.fit/wp-content/uploads/2019/01/Hero_v2.mp4"
          autoPlay
          loop
          muted
        />
        <div className="hero-carousel">
          <Carousel autoplay>
            <div className="carouselBody">
              <h1 className="font-heading-white">
                <T>home.header.build_your_body_and_mind</T>
              </h1>
              <p className="font-subheading-white">
                <T>home.header.reach_goals</T>
              </p>
              <Link
                className="home-button font-paragraph-white"
                to="/challenges"
              >
                <span className="home-button-text">
                  <T>common.start_your_7day_free_trial</T>{" "}
                  <ArrowRightOutlined />
                </span>
              </Link>
            </div>
            <div className="carouselBody">
              <h1 className="font-heading-white">
                <T>home.header.result_with_personal</T>
              </h1>
              <p className="font-subheading-white">
                <T>home.header.workout_at_home</T>
              </p>
              <Link
                className="home-button font-paragraph-white"
                to="/challenges"
              >
                <span className="home-button-text">
                  <T>common.start_your_7day_free_trial</T>{" "}
                  <ArrowRightOutlined />
                </span>
              </Link>
            </div>
            <div className="carouselBody">
              <h1 className="font-heading-white">
                {" "}
                <T>home.header.pick_your_personal</T>
              </h1>
              <p className="font-subheading-white">
                <T>home.header.set_new</T>
              </p>
              <Link
                className="home-button font-paragraph-white"
                to="/challenges"
              >
                <span className="home-button-text">
                  <T>common.start_your_7day_free_trial</T>{" "}
                  <ArrowRightOutlined />
                </span>
              </Link>
            </div>
          </Carousel>
        </div>
      </div>
    </>
  );
}

export default Hero;
