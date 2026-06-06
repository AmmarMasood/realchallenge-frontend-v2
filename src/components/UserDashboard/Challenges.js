import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { FlagOutlined, HeartFilled } from "@ant-design/icons";
import NoFavsChallenge from "../../assets/challenge-man.svg";
import { userInfoContext } from "../../contexts/UserStore";
import {
  getAllFavouriteChallenges,
  unFavouriteChallengeById,
} from "../../services/customer";
import MaleBody from "../../images/Asset-514@4x-1.png";
import FemaleBody from "../../images/Group 9879.png";
import {
  VictoryPie,
  VictoryChart,
  VictoryArea,
  VictoryAxis,
  VictoryScatter,
  VictoryGroup,
  VictoryContainer,
} from "victory";
import { CaretDownOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
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
import { T, translate } from "../Translate";

const VIDEO_EXTENSIONS = [
  "m4v",
  "avi",
  "mpg",
  "mp4",
  "mov",
  "wmv",
  "flv",
  "webm",
  "mkv",
];

const isVideoFile = (file) => {
  if (!file) return false;
  const link = typeof file === "string" ? file : file.link;
  if (!link) return false;
  const ext = link.split("?")[0].split(".").pop()?.toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
};

const getThumbnailLink = (thumbnail) => {
  if (!thumbnail) return "";
  if (typeof thumbnail === "string") return thumbnail.replace(/ /g, "%20");
  if (thumbnail.link) return thumbnail.link.replace(/ /g, "%20");
  return "";
};

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
  // My-Development chart controls (mockup):
  //  - selectedMetric: which series to plot (Weight is the default like the mockup)
  //  - selectedPeriod: stub for week/month/year — data is monthly today, so
  //    all three render the same 12-month series. Hooked up so future
  //    per-day tracking just plugs the period in here.
  const [selectedMetric, setSelectedMetric] = useState("weight");
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  // Favourite challenges (parallel to favourite recipes in Nutrient.js)
  const [userInfo] = useContext(userInfoContext);
  const [favChallenges, setFavChallenges] = useState([]);
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
    if (!userProfile) return;
    // Normalize: if a measurement is still a scalar (pre-migration), expand
    // it into a 12-slot array with the value in the current month.
    const month = new Date().getMonth();
    const normalize = (v) => {
      if (Array.isArray(v)) return v;
      const arr = new Array(12).fill(0);
      if (typeof v === "number" && Number.isFinite(v)) arr[month] = v;
      return arr;
    };
    setMyDevelopment({
      weight: normalize(userProfile.weight),
      shoulders: normalize(userProfile.shoulderSize),
      waist: normalize(userProfile.waistSize),
      breast: normalize(userProfile.chestSize),
      hip: normalize(userProfile.hipSize),
      bodyFat: userProfile.bmir,
    });
    setPics([userProfile.beforeImageLink, userProfile.afterImageLink]);
    setMyChallenges(userProfile.challenges);

    if (recommandedChal) {
      setRecommandedChallenges(recommandedChal.recommendedchallenge);
    }
    setMybody({
      gender: gender,
      waist: userProfile.waistSize,
      hip: userProfile.hipSize,
      breast: userProfile.chestSize,
      shoulders: userProfile.shoulderSize,
      unit: userProfile.measureSystem === "imperial" ? "in" : "cm",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, recommandedChal, gender]);

  useEffect(() => {
    async function getAllMyChallengeProgress() {
      if (!Array.isArray(myChallenges) || myChallenges.length === 0) return;
      const res = myChallenges.map(
        async (c) => await getChallengeProgress(c._id),
      );
      const progress = await Promise.all(res);
      setChallengeProgress(progress);
    }
    getAllMyChallengeProgress();
  }, [myChallenges]);

  useEffect(() => {
    // Load the user's favourite challenges once we know who's logged in.
    if (!userInfo || !userInfo.id) return;
    let cancelled = false;
    (async () => {
      const res = await getAllFavouriteChallenges(userInfo.id);
      if (cancelled) return;
      setFavChallenges(
        res && Array.isArray(res.favChallenges) ? res.favChallenges : [],
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [userInfo && userInfo.id]);

  const unfavouriteFavChallenge = async (id) => {
    const res = await unFavouriteChallengeById({ challengeId: id }, userInfo.id);
    if (res) {
      setFavChallenges((prev) => prev.filter((c) => c._id !== id));
    }
  };

  return (
    <div>
      <div className="dashboard-feed-container" style={{ display: "grid" }}>
        <div className="dashboard-challenges-row1">
          <div className="dashboard-challenges-mychallenge">
            <div
              className="dashboard-challenges-mychallenge-heading user-update-container-box-row2-heading font-card-heading"
              style={{ marginTop: "8px" }}
            >
              <T>userDashboard.challenges.mcc</T>
            </div>
            <div className="divider"></div>
            {(!Array.isArray(myChallenges) || myChallenges.length === 0) && (
              <div
                className="font-paragraph-white"
                style={{ opacity: 0.7, padding: "20px 10px", textAlign: "center" }}
              >
                <T>userDashboard.challenges.no_my_challenges</T>
              </div>
            )}
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
                          background: `url(${d.thumbnailLink})`,
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
          {!userProfile?.hideMyShape && (
            <div className="dashboard-challenges-myshape">
              <div
                className="dashboard-challenges-mychallenge-heading"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <span className="user-update-container-box-row2-heading font-card-heading">
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
                      {pics[0] ? (
                        <img
                          src={pics[0]}
                          alt="users-before"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : null}
                    </div>
                  }
                  itemTwo={
                    <div
                      className="font-paragraph-white"
                      style={{ backgroundColor: "#3C618F", height: "100%" }}
                    >
                      {pics[1] ? (
                        <img
                          src={pics[1]}
                          alt="users-after"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : null}
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-challenges-row2">
        {(() => {
          // ── Derive everything the My-Development cards need from state ──
          const series = myDevelopment[selectedMetric] || [];
          const chartData = series.map((y, i) => ({
            x: months[i],
            y: Number(y) || 0,
          }));
          const monthIdx = new Date().getMonth();
          const currentValue = Number(series[monthIdx]) || 0;
          // Trend: compare current month vs nearest earlier non-zero month.
          // Falls back to flat if no prior data point exists.
          let trendDir = "flat";
          for (let i = monthIdx - 1; i >= 0; i--) {
            const prev = Number(series[i]) || 0;
            if (prev === 0) continue;
            if (currentValue > prev) trendDir = "up";
            else if (currentValue < prev) trendDir = "down";
            break;
          }
          const metricOptions = [
            { v: "weight", k: "weight_chart" },
            { v: "shoulders", k: "shoulders_chart" },
            { v: "waist", k: "waist_chart" },
            { v: "breast", k: "breast_chart" },
            { v: "hip", k: "hip_chart" },
          ];
          return (
            <div className="dashboard-challenges-row2-mydevelopment">
              <div className="mydev-header">
                <span className="user-update-container-box-row2-heading font-card-heading">
                  <T>userDashboard.challenges.mydev</T>
                </span>
                <div className="mydev-period-select-wrap">
                  <select
                    className="mydev-period-select"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {/* Week & Year disabled until per-day storage lands */}
                    <option value="week" disabled>
                      {translate("userDashboard.challenges.period_week")} (
                      {translate("userDashboard.challenges.coming_soon")})
                    </option>
                    <option value="month">
                      {translate("userDashboard.challenges.period_month")}
                    </option>
                    <option value="year" disabled>
                      {translate("userDashboard.challenges.period_year")} (
                      {translate("userDashboard.challenges.coming_soon")})
                    </option>
                  </select>
                  <CaretDownOutlined className="mydev-select-caret" />
                </div>
              </div>
              <div className="divider"></div>

              {/* Card 1 — Body Fat */}
              <div className="mydev-card mydev-bodyfat">
                <div className="mydev-bodyfat-chart">
                  <VictoryPie
                    innerRadius={70}
                    padding={10}
                    height={220}
                    width={220}
                    labels={() => ""}
                    /* Rest-slice contrasts with the #2B3949 card bg. */
                    colorScale={["#F37720", "#1B2531"]}
                    data={[
                      { x: "Body Fat", y: myDevelopment.bodyFat || 0 },
                      { x: "", y: 100 - (myDevelopment.bodyFat || 0) },
                    ]}
                  />
                </div>
                <div className="mydev-bodyfat-text">
                  <span className="mydev-bodyfat-value">
                    {myDevelopment.bodyFat || 0}%
                  </span>
                  <span className="mydev-bodyfat-label">
                    <T>userDashboard.challenges.body_fat_approximately</T>
                  </span>
                </div>
              </div>

              {/* Card 2 — Trend chart */}
              <div className="mydev-card mydev-trend">
                <div className="mydev-trend-header">
                  <div className="mydev-metric-select-wrap">
                    <select
                      className="mydev-metric-select"
                      value={selectedMetric}
                      onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                      {metricOptions.map((opt) => (
                        <option key={opt.v} value={opt.v}>
                          {/* Inline lookup — T not allowed inside <option> */}
                          {opt.v === "weight"
                            ? "Weight chart"
                            : opt.v === "shoulders"
                            ? "Shoulders chart"
                            : opt.v === "waist"
                            ? "Waist chart"
                            : opt.v === "breast"
                            ? "Breast chart"
                            : "Hip chart"}
                        </option>
                      ))}
                    </select>
                    <CaretDownOutlined className="mydev-select-caret" />
                  </div>
                  <div
                    className={`mydev-trend-pill mydev-trend-${trendDir}`}
                  >
                    {trendDir === "up" && <ArrowUpOutlined />}
                    {trendDir === "down" && <ArrowDownOutlined />}
                    <span>{currentValue || "—"}</span>
                  </div>
                </div>
                <VictoryChart
                  height={220}
                  width={500}
                  padding={{ top: 20, bottom: 30, left: 30, right: 20 }}
                  containerComponent={
                    <VictoryContainer
                      responsive={true}
                      style={{ width: "100%", height: "auto" }}
                    />
                  }
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: "transparent" },
                      grid: {
                        stroke: "#2A3340",
                        strokeDasharray: "2,4",
                      },
                      tickLabels: {
                        fontSize: 10,
                        fill: "#8E9BAA",
                      },
                    }}
                  />
                  <VictoryGroup>
                    <VictoryArea
                      interpolation="catmullRom"
                      data={chartData}
                      style={{
                        data: {
                          fill: "#F37720",
                          fillOpacity: 0.85,
                          stroke: "#F37720",
                          strokeWidth: 2,
                        },
                      }}
                    />
                    <VictoryScatter
                      data={[
                        {
                          x: months[monthIdx],
                          y: currentValue,
                        },
                      ]}
                      size={6}
                      style={{
                        data: {
                          fill: "#fff",
                          stroke: "#F37720",
                          strokeWidth: 3,
                        },
                      }}
                    />
                  </VictoryGroup>
                </VictoryChart>
              </div>
            </div>
          );
        })()}
        <div className="dashboard-challenges-row2-mybody">
          <div
            className="dashboard-challenges-mychallenge-heading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <span className="user-update-container-box-row2-heading font-card-heading">
              <T>userDashboard.challenges.mybody</T>
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
          <div style={{ paddingTop: "30px" }}>
            <div style={{ textAlign: "center", position: "relative" }}>
              <img
                src={gender === "female" ? FemaleBody : MaleBody}
                alt="human-body"
              />
              <div className="body-line body-line1">
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.breast</T>
                  {myBody.breast > 0 ? ` (${myBody.breast} ${myBody.unit})` : ""}
                </span>{" "}
                <div></div>
              </div>
              <div className="body-line body-line2">
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.hips</T>
                  {myBody.hip > 0 ? ` (${myBody.hip} ${myBody.unit})` : ""}
                </span>{" "}
                <div></div>
              </div>
              <div className="body-line body-line3">
                <div></div>
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.shoulders</T>
                  {myBody.shoulders > 0 ? ` (${myBody.shoulders} ${myBody.unit})` : ""}
                </span>{" "}
              </div>
              <div className="body-line body-line4">
                <div></div>
                <span className="font-paragraph-white">
                  <T>userDashboard.challenges.waist</T>
                  {myBody.waist > 0 ? ` (${myBody.waist} ${myBody.unit})` : ""}
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
          <span className="user-update-container-box-row2-heading font-card-heading">
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
          {recommandedChallenges && recommandedChallenges.length > 0 ? (
            <Carousel responsive={responsive}>
              {recommandedChallenges.map((challenge) => (
                <Link
                  key={challenge._id}
                  to={`/challenge/${slug(challenge.challengeName)}/${
                    challenge._id
                  }`}
                >
                  <div
                    className="dashboard-challenges-row3-inbox-challenge"
                    style={{
                      background: `url(${challenge.thumbnailLink})`,
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
                        {new Array(challenge.rating).fill(0).map((_, i) => (
                          <img key={i} src={StarOrange} alt="" />
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
              <T>userDashboard.challenges.nochal</T>
            </div>
          )}
        </div>
      </div>

      {/* ── My Favourite Challenges ── mirrors My Favourite Recipes pattern */}
      <div className="dashboard-challenges-row3" style={{ marginTop: "18px" }}>
        <div
          className="dashboard-challenges-mychallenge-heading"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <span className="user-update-container-box-row2-heading font-card-heading">
            <T>userDashboard.challenges.mfc</T>
          </span>
          <div className="divider"></div>
        </div>
        {favChallenges.length === 0 ? (
          <div className="dashboard-nutrient-row4-container">
            <div style={{ textAlign: "center" }}>
              <img
                src={NoFavsChallenge}
                alt="no-favourite-challenges"
                style={{ maxHeight: "180px", width: "auto" }}
              />
              <div
                className="font-paragraph-white"
                style={{
                  color: "#FFAF51",
                  fontSize: "18px",
                  fontWeight: 600,
                  paddingTop: "15px",
                  paddingBottom: "15px",
                }}
              >
                <T>userDashboard.challenges.nfc</T>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-challenges-row3-inbox">
            <Carousel responsive={responsive}>
              {favChallenges.map((challenge) => {
                const thumbSrc = getThumbnailLink(challenge.thumbnailLink);
                const isVideo = isVideoFile(challenge.thumbnailLink);
                return (
                  <Link
                    key={challenge._id}
                    to={`/challenge/${slug(challenge.challengeName || "")}/${
                      challenge._id
                    }`}
                  >
                    <div
                      className="dashboard-challenges-row3-inbox-challenge"
                      style={{
                        background: isVideo ? "#171e27" : `url(${thumbSrc})`,
                        backgroundSize: "cover",
                        backgroundPosition: "50% 50%",
                        position: "relative",
                        height: "100%",
                        overflow: "hidden",
                      }}
                    >
                      {isVideo && (
                        <video
                          src={thumbSrc}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            zIndex: 0,
                          }}
                        />
                      )}
                      <div
                        className="dashboard-challenges-row3-inbox-challenge-textbox"
                        style={{ position: "relative", zIndex: 1 }}
                      >
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
                          {new Array(challenge.rating || 0)
                            .fill(0)
                            .map((_, i) => (
                              <img key={i} src={StarOrange} alt="" />
                            ))}
                        </div>
                      </div>
                      {/* Heart — anchored to the card's own edges */}
                      <HeartFilled
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          unfavouriteFavChallenge(challenge._id);
                        }}
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontSize: "2.6rem",
                          color: "#ff7700",
                          cursor: "pointer",
                          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                          zIndex: 3,
                        }}
                        title="Remove from favourites"
                      />
                    </div>
                  </Link>
                );
              })}
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
}

export default Challenges;
