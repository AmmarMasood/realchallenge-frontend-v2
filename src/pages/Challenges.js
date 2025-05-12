import React, { useState, useEffect, useRef, useContext } from "react";
import "../assets/home.css";
import "../assets/trainers.css";
import "../assets/challenge.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import {
  ArrowRightOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Carousel } from "antd";
import ChallengeCard from "../components/Cards/ChallengeCard";
import forward from "../assets/icons/forward-white.png";
import { getAllChallenges } from "../services/createChallenge/main";
import slug from "elegant-slug";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";

function Challenges() {
  // eslint-disable-next-line
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const [challenges, setChallenges] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    fetchData();
  }, [language]);

  const scroll = (scrollOffset) => {
    ref.current.scrollLeft += scrollOffset;
  };

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllChallenges(language);
    setLoading(false);
    const chal = data.challenges;
    console.log(chal);
    setChallenges(chal ? chal.reverse().slice(0, 8) : []);
  };
  return (
    <div>
      <Navbar />
      {/* <Hero /> */}
      <div className="page-header challenge-background">
        <div className="page-header-textbox" style={{ padding: "50px" }}>
          <h1 className="font-heading-white">
            <T>challenges.your_goals</T> <br /> <T>challenges.your_cha</T>
          </h1>
          <p className="font-paragraph-white">
            <T>challenges.regard</T>
          </p>
          <Link className="home-button" to="/new">
            <span className="home-button-text font-paragraph-white">
              <T>challenges.start</T> <ArrowRightOutlined />
            </span>
          </Link>
        </div>
      </div>
      {/* 2rd row */}
      <div style={{ backgroundColor: "#222932" }}>
        <div className="challenges-2-row">
          <Carousel autoplay>
            {loading ? (
              <LoadingOutlined
                style={{
                  color: "#ff7700 !important",
                  fontSize: "30px !important",
                  margin: "0 auto",
                }}
              />
            ) : (
              challenges.map((challenge) => (
                <Link
                  key={challenge._id}
                  to={`challenge/${slug(challenge.challengeName)}/${
                    challenge._id
                  }`}
                >
                  <div
                    className="challenge-carousel-body"
                    style={{
                      zIndex: 1000000,
                      background: `url(${
                        process.env.REACT_APP_SERVER
                      }/uploads/${
                        challenge.thumbnailLink
                          ? challenge.thumbnailLink.replaceAll(" ", "%20")
                          : ""
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "50% 50%",
                    }}
                  >
                    <div className="challenge-carousel-body-overcolor"></div>
                    <div className="challenge-carousel-body-abstext for-650px-screen-nodisplay">
                      <h1
                        className="font-subheading-white"
                        style={{ fontSize: "4rem" }}
                      >
                        <T>challenges.new_cha</T>
                      </h1>
                      <p className="challenge-carousel-body-abstext-paragraph font-subheading-white">
                        <T>challenges.tp</T>
                      </p>
                    </div>
                    <div
                      className="challenge-carousel-body-textbox font-subheading-white"
                      style={{ fontSize: "3rem" }}
                    >
                      <h1>{challenge.challengeName}</h1>
                      <p className="challenge-carousel-body-abstext-paragraph  font-paragraph-white">
                        {challenge.description}
                      </p>
                      <div>
                        <img
                          src={forward}
                          alt=""
                          style={{
                            height: "20px",
                            margin: "5px 0",
                          }}
                        />
                      </div>

                      <div>
                        {new Array(challenge.rating ? challenge.rating : 1)
                          .fill(0)
                          .map((e, index) => (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              key={index}
                            >
                              <path
                                d="M11.3925 6.71722L9.77427 1.43049C9.45503 0.3928 7.97995 0.3928 7.67173 1.43049L6.04253 6.71722H1.14394C0.0761601 6.71722 -0.364163 8.0826 0.505475 8.69429L4.51241 11.5343L2.93826 16.5698C2.61902 17.5856 3.8079 18.4048 4.65552 17.7604L8.71749 14.7019L12.7795 17.7713C13.6271 18.4158 14.816 17.5965 14.4967 16.5807L12.9226 11.5452L16.9295 8.70521C17.7991 8.0826 17.3588 6.72814 16.291 6.72814H11.3925V6.71722Z"
                                fill="#FDA136"
                              />
                            </svg>
                          ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </Carousel>
        </div>
      </div>
      {/* 2rd row */}
      {/* 3rd row */}

      <div style={{ backgroundColor: "#171e27" }}>
        <div className="trainers-3-row challenge-3-background">
          <h1
            style={{ fontSize: "3rem", paddingLeft: "20px" }}
            className="font-subheading-white"
          >
            <T>challenges.lt</T>
          </h1>
          <p className="font-paragraph-white" style={{ paddingLeft: "20px" }}>
            <T>challenges.basic_challenge</T>
          </p>
          <div
            className="trainers-3-row-cards"
            ref={ref}
            style={{
              overflow: "hidden",
              flexWrap: "nowrap",
            }}
          >
            {loading ? (
              <LoadingOutlined
                style={{ color: "#ff7700", fontSize: "30px", margin: "0 auto" }}
              />
            ) : (
              challenges.map((challenge) => (
                <Link
                  to={`/challenge/${slug(challenge.challengeName)}/${
                    challenge._id
                  }`}
                >
                  <ChallengeCard
                    picture={`${process.env.REACT_APP_SERVER}/uploads/${
                      challenge.thumbnailLink
                        ? challenge.thumbnailLink.replaceAll(" ", "%20")
                        : ""
                    }`}
                    rating={challenge.rating}
                    name={challenge.challengeName}
                    newc={true}
                    key={challenge._id}
                  />
                </Link>
              ))
            )}
          </div>
          <div style={{ paddingTop: "10px" }}>
            <Link
              className="view-all-button"
              to="/all-challenges"
              style={{
                marginLeft: "20px",
                width: "150px",
              }}
            >
              <span className="font-paragraph-white">
                <T>challenges.view_all</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
          <div style={{ float: "right", marginTop: "-25px" }}>
            <span
              className="font-paragraph-white view-all-button"
              style={{
                fontSize: "20px",
                padding: "8px 8px",
                marginRight: "5px",
                cursor: "pointer",
              }}
              onClick={() => scroll(-150)}
            >
              <CaretLeftOutlined />
            </span>

            <span
              className="font-paragraph-white  view-all-button"
              style={{
                fontSize: "20px",
                padding: "8px 8px",
                cursor: "pointer",
              }}
              onClick={() => scroll(350)}
            >
              <CaretRightOutlined />
            </span>
          </div>
        </div>
      </div>
      {/* 3th row */}
      {/* 4th row */}
      <div style={{ backgroundColor: "#222932" }}>
        <div className="challenge-row-4 color-grey">
          <h1 className="font-heading-white">
            <T>challenges.healthy</T>
          </h1>
          <p className="font-paragraph-white">
            <T>challenges.basic</T>
          </p>
          <div style={{ paddingTop: "10px" }}>
            <Link
              className="view-all-button"
              to="/all-challenges"
              style={{
                marginLeft: "20px",
                width: "150px",
              }}
            >
              <span className="font-paragraph-white">
                <T>challenges.view_all</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 4th row */}
      {/* 5th row */}
      <div style={{ backgroundColor: "#171e27" }}>
        <div className="challenge-row-4 color-grey-dark">
          <h1 className="font-heading-white">
            <T>challenges.tk</T>
          </h1>
          <p className="font-paragraph-white">
            <T>challenges.challenge_yourself</T>
          </p>
          <div style={{ paddingTop: "10px" }}>
            <Link
              className="view-all-button"
              to="/all-challenges"
              style={{
                marginLeft: "20px",
                width: "150px",
              }}
            >
              <span className="font-paragraph-white">
                <T>challenges.view_all</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 5th row */}
      {/* 6th row */}
      <div style={{ backgroundColor: "#222932" }}>
        <div className="challenge-row-4 color-grey">
          <h1 className="font-heading-white">
            <T>challenges.mindset</T>
          </h1>
          <p className="font-paragraph-white">
            <T>challenges.think_fit</T>
          </p>
          <div style={{ paddingTop: "10px" }}>
            <Link
              className="view-all-button"
              to="/all-challenges"
              style={{
                marginLeft: "20px",
                width: "150px",
              }}
            >
              <span className="font-paragraph-white">
                <T>challenges.view_all</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 6th row */}
      {/* 7th row */}
      <div style={{ backgroundColor: "#171e27" }}>
        <div className="challenge-row-4 color-grey-dark">
          <h1 className="font-heading-white">
            <T>challenges.gain_muscle</T>
          </h1>
          <p className="font-paragraph-white">
            <T>challenges.let_the_gains</T>
          </p>
          <div style={{ paddingTop: "10px" }}>
            <Link
              className="view-all-button"
              to="/all-challenges"
              style={{
                marginLeft: "20px",
                width: "150px",
              }}
            >
              <span className="font-paragraph-white">
                <T>challenges.view_all</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 7th row */}
      {/* 8th row */}
      <div className="challenge-row-8 color-grey" style={{ height: "300px" }}>
        <h1 className="font-heading-white">
          <T>challenges.want</T>
        </h1>
        <Link className="home-button" to="/all-challenges">
          <span className="home-button-text font-paragraph-white">
            <T>challenges.our</T> <ArrowRightOutlined />
          </span>
        </Link>
      </div>
      {/* 8th row */}
      <div className="home-row-7 background-challenge">
        <div className="home-row-7-container">
          <div className="home-row-7-container-text">
            <h2 style={{ fontSize: "2rem" }} className="font-subheading-black">
              <T>challenges.start_today</T>
            </h2>
            <h1 style={{ fontSize: "4.5rem" }} className="font-heading-black">
              <T>challenges.optimal</T>
            </h1>
            <p
              style={{ fontSize: "1.8rem", paddingBottom: "10px" }}
              className="font-paragraph-black"
            >
              <T>challenges.a_personal</T>
            </p>
            <Link className="home-button" to="/new">
              <span className="home-button-text font-paragraph-white">
                <T>common.start_now</T> <ArrowRightOutlined />
              </span>
            </Link>
          </div>
        </div>
      </div>
      {/* 7th row */}

      {/* 4th row */}
      <Footer />
    </div>
  );
}

export default Challenges;
