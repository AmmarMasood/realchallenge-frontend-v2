import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FlagOutlined } from "@ant-design/icons";
import MaleBody from "../../images/Asset-514@4x-1.png";
import FemaleBody from "../../images/Group 9879.png";
// import {
//   VictoryPie,
//   VictoryChart,
//   VictoryBar,
//   VictoryLabel,
//   VictoryAxis,
// } from "victory";
// import { Scrollbars } from "react-custom-scrollbars";
import "../../assets/userDashboard.css";

import { ReactCompareSlider } from "react-compare-slider";

import useWindowDimensions from "../../helpers/useWindowDimensions";
import ForwardIcon from "../../assets/icons/forward-arrows.png";
import WhiteClock from "../../assets/icons/clock-white.svg";
import StarOrange from "../../assets/icons/star-orange.svg";
import PlayerIcon from "../../assets/icons/player-icon.svg";
import Carousel from "react-multi-carousel";
import slug from "elegant-slug";
import { getChallengeProgress } from "../../services/users";
import { T } from "../Translate";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 2,
  },
  tablet: {
    breakpoint: { max: 1024, min: 800 },
    items: 2,
  },
  tablet1: {
    breakpoint: { max: 800, min: 750 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

function Challenges({ userProfile, gender, recommandedChal }) {
  const { height, width } = useWindowDimensions();
  // eslint-disable-next-line
  const [myChallenges, setMyChallenges] = useState([]);
  // eslint-disable-next-line
  const [myBody, setMybody] = useState({});
  // eslint-disable-next-line
  const [myDevelopment, setMyDevelopment] = useState({});
  const [pics, setPics] = useState(["", ""]);
  // eslint-disable-next-line
  const [recommandedChallenges, setRecommandedChallenges] = useState([]);
  const [challengeProgress, setChallengeProgress] = useState([]);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];
  useEffect(() => {
    // -----------------------------------------------------------
    console.log("recommadnchallnge", recommandedChal.recommendedchallenge);
    console.log("user profile", userProfile);
    // -----------------------------------------------------

    setMyDevelopment({
      weightChart: userProfile.weight.map((w, i) => ({ x: months[i], y: w })),
      bodyFat: userProfile.bmir,
    });
    setPics([userProfile.beforeImageLink, userProfile.afterImageLink]);
    setMyChallenges(userProfile.challenges);

    recommandedChal &&
      setRecommandedChallenges(recommandedChal.recommendedchallenge);
    setMybody({
      gender: gender,
      waist: userProfile.waistSize,
      hip: userProfile.hipSize,
      breast: userProfile.chestSize,
      shoulders: userProfile.shoulderSize,
    });
  }, [userProfile]);

  useEffect(() => {
    async function getAllMyChallengeProgress() {
      console.log("yallah", myChallenges);
      const res = myChallenges.map(
        async (c) => await getChallengeProgress(c._id)
      );
      const progress = await Promise.all(res);
      setChallengeProgress(progress);
      console.log("yallah", progress);
      console.log(myChallenges);
      // const res = await getChallengeProgress()
    }
    getAllMyChallengeProgress();
  }, [myChallenges]);

  return (
    <div>
      <div className="dashboard-feed-container">
        <div className="dashboard-challenges-row1">
          <div className="dashboard-challenges-mychallenge">
            <div
              className="user-update-container-box-row2-heading font-card-heading-light"
              style={{ marginTop: "8px" }}
            >
              <T>userDashboard.challenges.mcc</T>
            </div>
            <div className="divider"></div>
            {/* todo do later */}
            {/* <Scrollbars style={{ height: "500px" }}>
              <div className="dashboard-challenges-mychallenge-body">
                {myChallenges && myChallenges.length > 0 ? (
                  myChallenges.map((d, i) => (
                    <Link
                      to={`/challenge/${slug(d.challengeName)}/${d._id}`}
                      key={i}
                    >
                      <div
                        className="dashboard-challenges-mychallenge-body-box"
                        style={{
                          background: `url(${process.env.REACT_APP_SERVER}/uploads/${d.thumbnailLink})`,
                          backgroundSize: "cover",
                          backgroundPosition: "50% 50%",
                          position: "relative",
                        }}
                      >
                        <div
                          className="dashboard-feed-container-card-row2-tag font-paragraph-white"
                          style={{ position: "absolute", top: "0", left: "0" }}
                        >
                          {d.difficulty && (
                            <FlagOutlined style={{ paddingRight: "2px" }} />
                          )}
                          {d.difficulty}
                        </div>
                        <div className="dashboard-challenges-mychallenge-body-box-insidebox">
                          <span className="dashboard-challenges-mychallenge-body-box-insidebox-name font-heading-white">
                            {d.challengeName}
                          </span>
                          <span className="dashboard-challenges-mychallenge-body-box-insidebox-about font-paragraph-white">
                            {d.description}
                          </span>
                          <img
                            src={ForwardIcon}
                            style={{ marginTop: "5px" }}
                            alt="forward"
                            height="15px"
                            width="40px"
                          />
                        </div>
                        <div className="dashboard-challenges-mychallenge-body-box-insidebox-info">
                          <span className="dashboard-challenges-mychallenge-body-box-insidebox-completed font-paragraph-white">
                            <img
                              src={WhiteClock}
                              style={{ marginRight: "5px" }}
                              alt=""
                            />
                            Completed{" "}
                            {challengeProgress[i]?.data?.challengeCompletionRate
                              ? challengeProgress[i]?.data
                                  ?.challengeCompletionRate
                              : 0}{" "}
                            %
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <h2 className="font-heading-white">
                    You have not enrolled in any challenges.
                  </h2>
                )}
              </div>
            </Scrollbars> */}
          </div>
          <div className="dashboard-challenges-myshape">
            <div
              className="dashboard-challenges-mychallenge-heading"
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            >
              <span className="user-update-container-box-row2-heading font-card-heading-light">
                <T>userDashboard.challenges.ms</T>
              </span>

              <div style={{ marginBottom: "10px" }}>
                <Link
                  to="/user/update"
                  className="font-paragraph-white hover-orange"
                  style={{ fontSize: "15px" }}
                >
                  <T>userDashboard.challenges.update</T>
                </Link>
              </div>
              <div className="divider"></div>
            </div>
            <div className="dashboard-challenges-myshape-container">
              <ReactCompareSlider
                itemOne={
                  <div
                    className="font-paragraph-white"
                    style={{ backgroundColor: "#2F3E50", height: "100%" }}
                  >
                    <img
                      src={`${process.env.REACT_APP_SERVER}/uploads/${pics[0]}`}
                      alt="users-before"
                    />
                  </div>
                }
                itemTwo={
                  <div
                    className="font-paragraph-white"
                    style={{ backgroundColor: "#3C618F", height: "100%" }}
                  >
                    <img
                      src={`${process.env.REACT_APP_SERVER}/uploads/${pics[1]}`}
                      alt="users-after"
                    />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-challenges-row2">
        <div className="dashboard-challenges-row2-mydevelopment">
          <div className="user-update-container-box-row2-heading font-card-heading-light">
            <T>userDashboard.challenges.mydev</T>
          </div>
          <div className="divider"></div>
          <div className="dashboard-challenges-row2-mydevelopment-insidebox-1">
            {/* <VictoryContainer style={{ width: "50%" }}> */}
            {/* <svg viewBox="0 0 200 350"> */}
            <div style={{ width: "50%" }}>
              {/* todo do later */}
              {/* <VictoryPie
                innerRadius={30}
                padding={10}
                height={200}
                width={350}
                labels={({ datum }) => ``}
                colorScale={["#F37720", "#171e27"]}
                data={[
                  { x: "Body Weight", y: myDevelopment.bodyFat },
                  { x: "", y: 100 - myDevelopment.bodyFat },
                ]}
              /> */}
            </div>
            {/* </svg> */}
            {/* </VictoryContainer> */}
            <div className="dashboard-challenges-row2-mydevelopment-insidebox-1-text">
              <span className="font-paragraph-white">
                {" "}
                <T>userDashboard.challenges.bf</T>
              </span>
              <span
                className="font-paragraph-white"
                style={{ fontSize: "4rem", paddingTop: "10px" }}
              >
                {myDevelopment.bodyFat} %
              </span>
            </div>
          </div>
          <div className="dashboard-challenges-row2-mydevelopment-insidebox-2">
            {/* todo do later */}
            {/* <VictoryChart
              // domainPadding={10}
              height={250}
            >
              <VictoryLabel
                // text="Weight Chart"
                x={225}
                y={30}
                textAnchor="middle"
                style={{ fill: "#fff", opacity: "0.8", fontSize: "1.4rem" }}
              />
              <VictoryBar
                style={{ data: { fill: "#F37720" }, labels: { fill: "white" } }}
                data={myDevelopment.weightChart}
                labels={({ datum }) => datum.y}
              />
              <VictoryAxis
                style={{
                  tickLabels: {
                    fontSize: "14px",
                    fill: "#fff",
                    opacity: "0.8",
                  },
                }}
              />
            </VictoryChart> */}
          </div>
        </div>
        <div className="dashboard-challenges-row2-mybody">
          <div className="user-update-container-box-row2-heading font-card-heading-light">
            <T>userDashboard.challenges.mybody</T>
          </div>
          <div className="divider"></div>
          <div style={{ paddingTop: "30px" }}>
            <div style={{ textAlign: "center", position: "relative" }}>
              <img
                src={gender === "male" ? MaleBody : FemaleBody}
                alt="human-body"
              />
              {console.log(gender)}
              <div className="body-line body-line1">
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.breast</T> ({myBody.breast})
                </span>{" "}
                <div></div>
              </div>
              <div className="body-line body-line2">
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.hips</T> ({myBody.hip})
                </span>{" "}
                <div></div>
              </div>
              <div className="body-line body-line3">
                <div></div>
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.shoulders</T> ({myBody.shoulders})
                </span>{" "}
              </div>
              <div className="body-line body-line4">
                <div></div>
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.waist</T> ({myBody.waist})
                </span>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-challenges-row3">
        <div
          className="dashboard-challenges-mychallenge-heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <span className="user-update-container-box-row2-heading font-card-heading-light">
            <T>userDashboard.challenges.ccfy</T>
          </span>

          {width > 700 && (
            <div style={{ marginBottom: "10px" }}>
              <Link
                to="/challenges"
                className="common-orange-button font-paragraph-white"
              >
                <T>userDashboard.challenges.vac</T>
              </Link>
              <Link
                to="/pricing"
                style={{ marginLeft: "10px" }}
                className="common-transparent-button font-paragraph-white"
              >
                <T>userDashboard.challenges.sp</T>
              </Link>
            </div>
          )}
          <div className="divider"></div>
        </div>
        <div className="dashboard-challenges-row3-inbox">
          {recommandedChallenges ? (
            <Carousel responsive={responsive}>
              {recommandedChallenges.map((challenge) => (
                <Link
                  to={`/challenge/${slug(challenge.challengeName)}/${
                    challenge._id
                  }`}
                >
                  <div
                    className="dashboard-challenges-row3-inbox-challenge"
                    style={{
                      background: `url(${process.env.REACT_APP_SERVER}/uploads/${challenge.thumbnailLink})`,
                      backgroundSize: "cover",
                      backgroundPosition: "50% 50%",
                      position: "relative",
                      height: "100%",
                    }}
                  >
                    <div className="dashboard-challenges-row3-inbox-challenge-textbox">
                      <span
                        className="font-paragraph-white"
                        style={{ fontSize: "2rem" }}
                      >
                        {challenge.challengeName}
                      </span>
                      <span
                        className="font-paragraph-white"
                        style={{
                          width: "70%",
                          height: "50px",
                          overflow: "hidden",
                        }}
                      >
                        {challenge.description}
                      </span>
                      <div>
                        <img
                          src={ForwardIcon}
                          style={{ marginTop: "5px" }}
                          alt="forward"
                          height="15px"
                          width="40px"
                        />
                      </div>
                      <div>
                        {new Array(challenge.rating).fill(0).map((c) => (
                          <img src={StarOrange} alt="" />
                        ))}
                      </div>
                    </div>
                    <img
                      src={PlayerIcon}
                      style={{
                        fontSize: "4rem",
                        color: "var(--color-gray-dark)",
                        opacity: "0.8",
                        display: "flex",
                        alignSelf: "center",
                        paddingRight: "50px",
                      }}
                      alt=""
                    />
                  </div>
                </Link>
              ))}
            </Carousel>
          ) : (
            <div
              className="font-paragraph-white"
              style={{ marginLeft: "10px" }}
            >
              No challenges found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Challenges;
