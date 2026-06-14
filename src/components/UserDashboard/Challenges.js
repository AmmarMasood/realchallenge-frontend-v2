import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { Link } from "react-router-dom";
import { HeartFilled, AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
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
  VictoryLine,
  VictoryVoronoiContainer,
  VictoryTooltip,
} from "victory";
import {
  calculateBodyFat,
  calculateBMI,
  toMetric,
} from "../../helpers/fitnessCalculations";
import {
  CaretDownOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
// import { Scrollbars } from "react-custom-scrollbars";
import "../../assets/userDashboard.css";

import { ReactCompareSlider } from "react-compare-slider";

import useWindowDimensions from "../../helpers/useWindowDimensions";
import Carousel from "react-multi-carousel";
import slug from "elegant-slug";
import { getChallengeProgress } from "../../services/users";
import ChallengeCard from "../Cards/ChallengeCard";
import LeftArrow from "../../assets/icons/scroll-left-arrow.svg";
import RightArrow from "../../assets/icons/scroll-right-arrow.svg";
import { T, translate } from "../Translate";
import HorizontalListIcon from "../../assets/icons/horizontal-list-icon.svg";
import ListIcon from "../../assets/icons/list-icon.svg";

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
  // My Challenges card layout: "horizontal" (full-width rows) | "vertical"
  // (portrait grid). Toggled from the section header and remembered across
  // sessions via localStorage.
  const [myChallengesLayout, setMyChallengesLayout] = useState(
    () => localStorage.getItem("myChallengesLayout") || "horizontal",
  );
  // Portrait carousel — native scroll track + arrow buttons (same pattern as
  // PlayerVideoBrowser). Arrows dim when there's nothing more to scroll.
  const mcTrackRef = useRef(null);
  const [mcCanScrollLeft, setMcCanScrollLeft] = useState(false);
  const [mcCanScrollRight, setMcCanScrollRight] = useState(false);
  const updateMcArrows = useCallback(() => {
    const el = mcTrackRef.current;
    if (!el) return;
    setMcCanScrollLeft(el.scrollLeft > 0);
    setMcCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);
  const scrollMyChallenges = (dir) => {
    const el = mcTrackRef.current;
    if (!el) return;
    const firstCard = el.querySelector(".challenge-card-basic");
    const cardWidth = firstCard ? firstCard.offsetWidth : 300;
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };
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
    // Body fat: prefer the stored value; fall back to deriving it so profiles
    // with a missing/zeroed bmir (older accounts, or saves made in a month
    // with no weight entry) still show a value instead of 0%.
    let bodyFat = userProfile.bmir;
    if (!bodyFat && userProfile.age && gender) {
      let bmi = userProfile.bmi;
      if (!bmi) {
        // Derive BMI from the latest recorded weight + stored height
        const weights = Array.isArray(userProfile.weight)
          ? userProfile.weight
          : [userProfile.weight];
        const latestWeight =
          [...weights].reverse().find((v) => Number(v) > 0) || 0;
        const { weightKg, heightCm } = toMetric(
          latestWeight,
          userProfile.height,
          userProfile.measureSystem !== "imperial",
        );
        bmi = calculateBMI(weightKg, heightCm);
      }
      if (bmi) {
        bodyFat = parseFloat(
          calculateBodyFat(bmi, userProfile.age, gender).toFixed(2),
        );
      }
    }
    setMyDevelopment({
      weight: normalize(userProfile.weight),
      shoulders: normalize(userProfile.shoulderSize),
      waist: normalize(userProfile.waistSize),
      breast: normalize(userProfile.chestSize),
      hip: normalize(userProfile.hipSize),
      bodyFat: bodyFat || 0,
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

  // Remember the chosen card layout across sessions
  useEffect(() => {
    localStorage.setItem("myChallengesLayout", myChallengesLayout);
  }, [myChallengesLayout]);

  // Keep the portrait carousel arrows in sync with scroll position
  useEffect(() => {
    const el = mcTrackRef.current;
    if (!el) return;
    updateMcArrows();
    el.addEventListener("scroll", updateMcArrows);
    window.addEventListener("resize", updateMcArrows);
    return () => {
      el.removeEventListener("scroll", updateMcArrows);
      window.removeEventListener("resize", updateMcArrows);
    };
  }, [updateMcArrows, myChallenges, myChallengesLayout, challengeProgress]);

  // Per-challenge active-card data derived from progress: the workout to
  // resume on and how many workouts (days) remain. No extra fetch needed —
  // everything comes from the populated challenge + its progress entry.
  const getActiveCardData = (challenge, progressEntry) => {
    const flat = (challenge.weeks || [])
      .flatMap((w) => w.workouts || [])
      .map(String);
    const prog = progressEntry?.data;
    const completed = new Set((prog?.completedWorkouts || []).map(String));
    const nextId =
      (prog?.currentWorkout && !completed.has(String(prog.currentWorkout))
        ? String(prog.currentWorkout)
        : flat.find((id) => !completed.has(id))) ||
      flat[0] ||
      null;
    const daysLeft = Math.max(0, flat.length - completed.size);
    return { nextId, daysLeft, totalDays: flat.length };
  };

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
    const res = await unFavouriteChallengeById(
      { challengeId: id },
      userInfo.id,
    );
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
              className="dashboard-challenges-mychallenge-heading"
              style={{
                marginTop: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <span className="user-update-container-box-row2-heading font-card-heading">
                <T>userDashboard.challenges.mcc</T>
              </span>
              <div className="cards-view-toggle">
                <button
                  type="button"
                  className={`cards-view-btn${
                    myChallengesLayout === "vertical" ? " active" : ""
                  }`}
                  onClick={() => setMyChallengesLayout("vertical")}
                  aria-label="Grid view"
                >
                  <img src={ListIcon} alt="list-icon" />
                </button>
                <button
                  type="button"
                  className={`cards-view-btn${
                    myChallengesLayout === "horizontal" ? " active" : ""
                  }`}
                  onClick={() => setMyChallengesLayout("horizontal")}
                  aria-label="List view"
                >
                  <img src={HorizontalListIcon} alt="horizontal-list-icon" />
                </button>
              </div>
            </div>
            <div className="divider"></div>
            {(!Array.isArray(myChallenges) || myChallenges.length === 0) && (
              <div
                className="font-paragraph-white"
                style={{
                  opacity: 0.7,
                  padding: "20px 10px",
                  textAlign: "center",
                }}
              >
                <T>userDashboard.challenges.no_my_challenges</T>
              </div>
            )}
            {Array.isArray(myChallenges) &&
              myChallenges.length > 0 &&
              (() => {
                const cards = myChallenges.map((d, i) => {
                  const { nextId, daysLeft } = getActiveCardData(
                    d,
                    challengeProgress[i],
                  );
                  const isLastPlayed =
                    String(userProfile?.lastPlayedChallenge) === String(d._id);
                  const detailLink = `/challenge/${slug(d.challengeName)}/${
                    d._id
                  }`;
                  const playerLink = nextId
                    ? `/play-challenge/${slug(d.challengeName)}/${
                        d._id
                      }/${nextId}`
                    : detailLink;
                  return (
                    <ChallengeCard
                      key={d._id}
                      horizontal={myChallengesLayout === "horizontal"}
                      showDifficultyIcon
                      active
                      borderColor="#FFAE42"
                      picture={getThumbnailLink(d.thumbnailLink)}
                      name={d.challengeName}
                      description={d.description}
                      intensity={d.intensity}
                      to={detailLink}
                      daysLeft={daysLeft}
                      continueTo={isLastPlayed ? playerLink : undefined}
                    />
                  );
                });
                return myChallengesLayout === "horizontal" ? (
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    <div className="dashboard-challenges-mychallenge-body">
                      {cards}
                    </div>
                  </div>
                ) : (
                  <div className="mychallenges-carousel-wrapper">
                    <button
                      type="button"
                      className="mychallenges-carousel-arrow"
                      onClick={() => scrollMyChallenges(-1)}
                      style={{ opacity: mcCanScrollLeft ? 1 : 0.3 }}
                      aria-label="Scroll left"
                    >
                      <img src={LeftArrow} alt="left" />
                    </button>
                    <div className="mychallenges-carousel-track" ref={mcTrackRef}>
                      {cards}
                    </div>
                    <button
                      type="button"
                      className="mychallenges-carousel-arrow"
                      onClick={() => scrollMyChallenges(1)}
                      style={{ opacity: mcCanScrollRight ? 1 : 0.3 }}
                      aria-label="Scroll right"
                    >
                      <img src={RightArrow} alt="right" />
                    </button>
                  </div>
                );
              })()}
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
                  /* Per the design: plain orange dot with a translucent halo,
                     no arrows or divider line. The wrapper spans the slider's
                     full height so the dot centers vertically. */
                  handle={
                    <div className="myshape-handle-wrap">
                      <div className="myshape-handle" />
                    </div>
                  }
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
                <span className="myshape-label myshape-label-before">
                  <T>user_update.before</T>
                </span>
                <span className="myshape-label myshape-label-after">
                  <T>user_update.after</T>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="dashboard-challenges-row2">
        {(() => {
          // ── Derive everything the My-Development cards need from state ──
          const series = myDevelopment[selectedMetric] || [];
          const monthIdx = new Date().getMonth();
          // Actual measurements only — months with no entry are stored as 0.
          const known = series
            .map((y, i) => ({ i, y: Number(y) || 0 }))
            .filter((p) => p.y > 0);
          // Plot only the measured range: first recorded month through the
          // current month. Gaps between measurements carry the previous
          // reading forward (the user's weight didn't stop existing); months
          // outside the range are never drawn — no fabricated data.
          const rangeStart = known.length ? known[0].i : monthIdx;
          const rangeEnd = known.length
            ? Math.max(known[known.length - 1].i, monthIdx)
            : monthIdx;
          const chartData = [];
          let carried = 0;
          for (let i = rangeStart; i <= rangeEnd; i++) {
            const k = known.find((p) => p.i === i);
            if (k) carried = k.y;
            chartData.push({ x: months[i], y: carried });
          }
          const dotIdx = Math.min(Math.max(monthIdx, rangeStart), rangeEnd);
          const currentValue = known.length
            ? chartData[dotIdx - rangeStart].y
            : 0;
          const maxY = Math.max(...chartData.map((d) => d.y), 1);
          const imperial = userProfile?.measureSystem === "imperial";
          const unit =
            selectedMetric === "weight"
              ? imperial
                ? "lb"
                : "kg"
              : imperial
                ? "in"
                : "cm";
          // Trend: direction between the two most recent measurements.
          let trendDir = "flat";
          if (known.length >= 2) {
            const prev = known[known.length - 2].y;
            const latest = known[known.length - 1].y;
            if (latest > prev) trendDir = "up";
            else if (latest < prev) trendDir = "down";
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
                  {/* Latest real measurement. Colors follow the design:
                      green = down arrow, red = up arrow, grey = no direction
                      yet (single measurement). Hidden when no data at all. */}
                  {known.length > 0 && (
                    <div
                      className={`mydev-trend-pill${
                        trendDir === "up"
                          ? " mydev-trend-up"
                          : trendDir === "flat"
                            ? " mydev-trend-flat"
                            : ""
                      }`}
                    >
                      {trendDir === "up" && <ArrowUpOutlined />}
                      {trendDir === "down" && <ArrowDownOutlined />}
                      <span>{currentValue}</span>
                    </div>
                  )}
                </div>
                <VictoryChart
                  height={220}
                  width={500}
                  padding={{ top: 35, bottom: 15, left: 30, right: 20 }}
                  /* Headroom above the ribbon so the top labels/droplines read
                     like the design instead of the area touching the axis. */
                  domain={{ y: [0, maxY * 1.35] }}
                  containerComponent={
                    <VictoryVoronoiContainer
                      responsive={true}
                      style={{ width: "100%", height: "auto" }}
                      /* Hover anywhere on a month column shows that month's
                         value; dropline/dot are excluded so they don't steal
                         the tooltip from the ribbon. */
                      voronoiDimension="x"
                      voronoiBlacklist={["dropline", "dot"]}
                      labels={({ datum }) => `${datum.y} ${unit}`}
                      labelComponent={
                        <VictoryTooltip
                          cornerRadius={4}
                          pointerLength={6}
                          flyoutStyle={{
                            fill: "#1B2531",
                            stroke: "#F37720",
                            strokeWidth: 1,
                          }}
                          style={{ fill: "#fff", fontSize: 11 }}
                        />
                      }
                    />
                  }
                >
                  {/* Month labels sit on top with droplines, per the design.
                      tickValues pins all 12 months so the axis stays full-year
                      even though data only spans the measured range. */}
                  <VictoryAxis
                    orientation="top"
                    tickValues={months}
                    style={{
                      axis: { stroke: "transparent" },
                      grid: {
                        stroke: "#2A3340",
                        strokeWidth: 1,
                      },
                      tickLabels: {
                        fontSize: 10,
                        fill: "#8E9BAA",
                      },
                    }}
                  />
                  {known.length > 0 && (
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
                      {/* Current-month highlight: dropline from the top axis
                          to a white dot sitting on the curve */}
                      <VictoryLine
                        name="dropline"
                        data={[
                          { x: months[dotIdx], y: currentValue },
                          { x: months[dotIdx], y: maxY * 1.35 },
                        ]}
                        style={{
                          data: { stroke: "#F37720", strokeWidth: 2 },
                        }}
                      />
                      <VictoryScatter
                        name="dot"
                        data={[
                          {
                            x: months[dotIdx],
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
                  )}
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
            <div style={{ textAlign: "center" }}>
              {/* Lines are positioned against this wrapper, which hugs the
                  image — they stay pinned to the body at any screen width */}
              <div className="body-figure">
                <img
                  src={gender === "female" ? FemaleBody : MaleBody}
                  alt="human-body"
                />
                {/* Per the design: left side shows "(value) Label", right side
                  "Label (value)"; Waist sits left, Hips right. Values render
                  only when the user has actually recorded them. */}
                <div className="body-line body-line1">
                  <span className="font-paragraph-white">
                    {myBody.breast > 0
                      ? `(${myBody.breast} ${myBody.unit}) `
                      : ""}
                    <T>userDashboard.challenges.breast</T>
                  </span>{" "}
                  <div></div>
                </div>
                <div className="body-line body-line2">
                  <span className="font-paragraph-white">
                    {myBody.waist > 0
                      ? `(${myBody.waist} ${myBody.unit}) `
                      : ""}
                    <T>userDashboard.challenges.waist</T>
                  </span>{" "}
                  <div></div>
                </div>
                <div className="body-line body-line3">
                  <div></div>
                  <span className="font-paragraph-white">
                    <T>userDashboard.challenges.shoulders</T>
                    {myBody.shoulders > 0
                      ? ` (${myBody.shoulders} ${myBody.unit})`
                      : ""}
                  </span>{" "}
                </div>
                <div className="body-line body-line4">
                  <div></div>
                  <span className="font-paragraph-white">
                    <T>userDashboard.challenges.hips</T>
                    {myBody.hip > 0 ? ` (${myBody.hip} ${myBody.unit})` : ""}
                  </span>{" "}
                </div>
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
                  <ChallengeCard
                    horizontal
                    showDifficultyIcon
                    picture={getThumbnailLink(challenge.thumbnailLink)}
                    name={challenge.challengeName}
                    description={challenge.description}
                    rating={challenge.rating}
                    intensity={challenge.intensity}
                  />
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
              {favChallenges.map((challenge) => (
                <Link
                  key={challenge._id}
                  to={`/challenge/${slug(challenge.challengeName || "")}/${
                    challenge._id
                  }`}
                >
                  <div style={{ position: "relative" }}>
                    <ChallengeCard
                      horizontal
                      showDifficultyIcon
                      picture={getThumbnailLink(challenge.thumbnailLink)}
                      name={challenge.challengeName}
                      description={challenge.description}
                      rating={challenge.rating || 0}
                      intensity={challenge.intensity}
                    />
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
              ))}
            </Carousel>
          </div>
        )}
      </div>
    </div>
  );
}

export default Challenges;
