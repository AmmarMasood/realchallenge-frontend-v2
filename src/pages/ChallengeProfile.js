import React, { useState, useEffect, useContext } from "react";
import "../assets/trainerprofile.css";
import "../assets/home.css";
import "../assets/challengeProfile.css";
import Navbar from "../components/Navbar";
import {
  ArrowRightOutlined,
  LoadingOutlined,
  DownOutlined,
  UpOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import Attachment from "../assets/icons/attachement-symbol.png";
import Ellipse from "../assets/icons/ellipse.svg";
import { addComment, getChallengeById } from "../services/createChallenge/main";
import { Link, withRouter } from "react-router-dom";
// import ModalVideo from "react-modal-video";
import { Tooltip, Collapse, Input, Avatar, Progress } from "antd";

import { userInfoContext } from "../contexts/UserStore";
import { checkUserPackage } from "../services/payment";
import { selectedChallengeContext } from "../contexts/PaymentProcessStore";
import { getChallengeProgress, getUserProfileInfo } from "../services/users";
import { addChallengeToCustomerDetail } from "../services/customer";
import { checkUser } from "../services/authentication";
import moment from "moment";
import HelpIcon from "../assets/icons/Help-icon.png";
import ShoopingIcon from "../assets/icons/shopping-symbol.png";
import ChallengeProfileSubtract from "../assets/icons/challenge-profile-subtract.svg";
import StarFilled from "../assets/icons/star-orange.svg";
import StartTransparent from "../assets/icons/star-transparent.svg";
import ForwardWhite from "../assets/icons/forward-white.png";
import ChallengeCompleteModal from "../components/Challenge/ChallengeCompleteModal";
import ReplaceFreeChallengePopup from "../components/Challenge/ReplaceFreeChallengePopup";
import ChallengeReviewModal from "../components/Challenge/ChallengeReviewModal";
import { set } from "lodash";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
import PopupPlayer from "../components/PopupPlayer/PopupPlayer";

const tooltipText = `
If you don’t choose any plan and hit start now, you can go through the wizard, get your free intake, make a free account and enjoy our free challenges collection and one week meal plan. 
`;
function ChallengeProfile(props) {
  const { language, updateLanguage } = useContext(LanguageContext);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [openPopupPlayer, setOpenPopupPlayer] = useState(false);
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line

  const [challenge, setChallenge] = useState({});
  const [usereDtails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [pack, setPack] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useContext(
    selectedChallengeContext
  );
  const [commentText, setCommentText] = useState("");
  const [commentButtonLoading, setCommentButtomLoading] = useState(false);
  const [showChangePanel, setShowChangePanel] = useState([]);
  const [allComments, setAllComments] = useState([]);
  const [challengeProgress, setChallengeProgress] = useState(null);

  // flag if user owns this challenge or not
  const [userOwnsThisChallenge, setUserOwnsThisChallenge] = useState("");
  const [finishChallengePopupVisible, setFinishChallengePopupVisible] =
    useState(false);
  const [
    replaceFreeChallengePopupVisible,
    setReplaceFreeChallengePopupVisible,
  ] = useState(false);

  const fetchChallengeData = async () => {
    setLoading(true);
    const res = await getChallengeById(props.match.params.id);
    if (res) {
      setChallenge(res);
      setAllComments(res.comments);
      updateLanguage(res.language);
    }

    if (localStorage.getItem("jwtToken") && userInfo.id) {
      const uInfo = await getUserProfileInfo(userInfo.id);
      uInfo && setUserDetails(uInfo.customer);
      let check =
        uInfo &&
        uInfo.customer &&
        uInfo.customer.customerDetails &&
        uInfo.customer.customerDetails.challenges.find(
          (f) => f._id === res._id
        );
      // console.log("check", check, uInfo, res);
      // if user is admin or trainer and creater of his own callenge
      if (uInfo && uInfo.customer && uInfo.customer.role === "admin") {
        check = true;
      }
      if (uInfo && uInfo.customer && uInfo.customer.role === "trainer") {
        // check = true;
        const isChallengeTrainer = res.trainers.find(
          (t) => t._id === uInfo.customer._id
        );
        if (isChallengeTrainer) {
          check = true;
        }
      }

      setUserOwnsThisChallenge(check);
      // if users the challenge
      if (check) {
        let challengeProgress = await getChallengeProgress(
          props.match.params.id
        );
        if (challengeProgress.data) {
          setChallengeProgress(challengeProgress.data);
          console.log("ammar", challengeProgress, challenge);
          if (
            challengeProgress.data &&
            challengeProgress.data.challengeCompletionRate === 100 &&
            !challengeProgress.data.challengeReview
          ) {
            setFinishChallengePopupVisible(true);
          }
        }
        console.log("challengeProgress", challengeProgress);
      }
      console.log("uInfo", uInfo);
    }
    setLoading(false);
    console.log(res, "res");
  };
  useEffect(() => {
    fetchData();
  }, [userInfo, language]);

  const fetchData = async () => {
    if (challenge && Object.keys(challenge).length > 0) {
      if (challenge.language === language) {
      } else {
        if (challenge.alternativeLanguage) {
          window.location.href = `${
            process.env.REACT_APP_FRONTEND_SERVER
          }/challenge/${slug(challenge.alternativeLanguage.challengeName)}/${
            challenge.alternativeLanguage._id
          }`;
        }
      }
    } else {
      fetchChallengeData();
    }
  };

  const postCommentToBackend = async () => {
    setCommentButtomLoading(true);
    const res = await addComment(challenge._id, commentText);

    if (res) {
      setAllComments(res.comments);
    }
    setCommentButtomLoading(false);
    setCommentText("");
    // console.log(res);
  };

  function isWorkoutLocked(workoutId, i, j) {
    // when is workout locked.
    // if there is no challenge progress in backend so we only show first workout unlocked everything else is locked.
    // if therer is a challenge progress, we only unlock a workout with the following 3 cases:
    //workout is completed
    // workout is in progress
    // workout is next one to the one completed
    var flag = true;
    const isPrevWorkoutCompleted =
      challenge &&
      challengeProgress &&
      j > 0 &&
      challengeProgress.completedWorkouts.includes(
        challenge.weeks[i].workouts[j - 1]._id
      );

    const isPrevWeekCompleted =
      challenge &&
      challengeProgress &&
      i >= 1 &&
      challenge.weeks[i - 1].workouts.every((r) =>
        challengeProgress.completedWorkouts.includes(r._id)
      );

    console.log(
      "hahshasd",
      i >= 1 &&
        challengeProgress &&
        challenge.weeks[i - 1].workouts.every((r) =>
          challengeProgress.completedWorkouts.includes(r._id)
        )
    );
    if (challengeProgress === null && (i !== 0 || j !== 0)) {
      flag = true;
    }

    if (challengeProgress) {
      if (
        challengeProgress.completedWorkouts.includes(workoutId) ||
        challengeProgress.currentWorkout === workoutId ||
        isPrevWorkoutCompleted ||
        isPrevWeekCompleted
      ) {
        flag = false;
      }
    }

    console.log(
      "flagggggggggggg",
      flag,
      isPrevWorkoutCompleted,
      isPrevWeekCompleted
    );

    return flag;
  }

  function getEquipmentsFromWorkouts(weeks) {
    const workouts =
      weeks &&
      weeks.map((w) => {
        return w.workouts;
      });
    const merged = [].concat.apply([], workouts);
    const relatedEquipments = merged.map((m) => m.relatedEquipments);
    const eg = [].concat.apply([], relatedEquipments);
    return eg.length > 0 ? (
      <div className="trainer-profile-goals">
        <div
          className="trainer-profile-goals-heading font-paragraph-white"
          style={{ color: "#72777B", textTransform: "uppercase" }}
        >
          <T>challenge_profile.equipments</T>
        </div>
        <div className="trainer-profile-goals-container">
          {/* {getEquipmentsFromWorkouts(challenge.weeks)} */}
          {eg.map((body) => (
            <div
              className="trainer-profile-goal font-paragraph-white"
              style={{ marginRight: "1px", background: "#283443" }}
            >
              {body.name}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <></>
    );
  }

  const pushCustomerOnConditions = async () => {
    // console.log("YAAAAAAAAS");
    // check if user is logged in
    if (userInfo.id) {
      //this check wheater the customer is subscribed or not
      //TODO: if customer is susbcribed and he doest not already have access to 3 challenges, I need to add this challenge to his challenge array(make sure he is not subscirbed to package 1)
      console.log("ammar", usereDtails, userInfo);
      const ch = checkUserPackage(
        usereDtails,
        challenge,
        pack,
        props.history,
        setSelectedChallenge,
        setReplaceFreeChallengePopupVisible
      );
      // console.log("chhhhhh", ch);
      // return;
      if (ch) {
        if (ch.success && ch.message === "SUBSCRIBE") {
          const res = await addChallengeToCustomerDetail(
            userInfo.id,
            challenge._id
          );
          if (res && res.success) {
            fetchData();
          }
          console.log("res", res);
          console.log("complete this part", ch);
          // return;
        }
      }
    } else {
      console.log(userInfo.id);
      setSelectedChallenge(challenge);
      localStorage.setItem("package-type", pack);
      props.history.push("/new");
    }
  };

  const getWeeksComponent = () => {
    if (userOwnsThisChallenge) {
      return <div></div>;
    } else {
      if (challenge && challenge.access && challenge.access.includes("FREE")) {
        return (
          <>
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>challenge_profile.sub</T>
              <Tooltip placement="top" title={tooltipText}>
                <img src={HelpIcon} alt="" style={{ marginLeft: "5px" }} />
              </Tooltip>
            </div>
            <div className="font-paragraph-white">
              <T>challenge_profile.gataf</T>
            </div>

            <div className="unlock-challenge-div font-paragraph-white">
              <span style={{ fontSize: "20px", fontWeight: "600" }}>
                <T>challenge_profile.ofc</T>
              </span>
              <span style={{ fontSize: "26px", fontWeight: "600" }}>€0</span>
              <span className="font-paragraph-white">
                <T>challenge_profile.nosub</T>
              </span>
              <span
                className="font-paragraph-white"
                style={{ color: "#9F9F9F" }}
              >
                <T>challenge_profile.hsn</T>
              </span>
            </div>
          </>
        );
      } else {
        if (
          usereDtails &&
          usereDtails.customerDetails &&
          usereDtails.customerDetails.membership &&
          usereDtails.customerDetails.membership.length > 0
        ) {
          <div></div>;
        } else {
          return (
            <>
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>player.related</T>
                <T>challenge_profile.sub</T>
                <Tooltip placement="top" title={tooltipText}>
                  <img src={HelpIcon} alt="" style={{ marginLeft: "5px" }} />
                </Tooltip>
              </div>
              <div className="font-paragraph-white">
                <T>challenge_profile.gataf</T>
              </div>
              <div className="unlock-challenge-packages">
                <div
                  className="unlock-challenge-pack font-paragraph-white"
                  onClick={() => {
                    if (pack === "CHALLENGE_1") {
                      setPack("");
                    } else {
                      setPack("CHALLENGE_1");
                    }
                  }}
                  style={{
                    border:
                      pack === "CHALLENGE_1"
                        ? "2px solid #f37720"
                        : "2px solid #2a2f36",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "400",
                      marginBottom: "30px",
                    }}
                  >
                    One-Time <br /> Challenge
                  </span>
                  <span
                    style={{ fontSize: "26px", fontWeight: "600" }}
                  >{`${challenge.currency}${challenge.price}`}</span>
                  <span style={{ margin: "15px 0" }}>No subscription</span>
                  <span style={{ fontSize: "14px", color: "#7e7c79" }}>
                    Billed Once
                  </span>
                </div>
                <div
                  className="unlock-challenge-pack font-paragraph-white"
                  onClick={() => {
                    if (pack === "CHALLENGE_12") {
                      setPack("");
                    } else {
                      setPack("CHALLENGE_12");
                    }
                  }}
                  style={{
                    border:
                      pack === "CHALLENGE_12"
                        ? "2px solid #f37720"
                        : "2px solid #2a2f36",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "400",
                      marginBottom: "10px",
                    }}
                  >
                    Repeat & Save
                  </span>
                  <span
                    className="font-paragraph-white"
                    style={{
                      fontSize: "13px",
                      backgroundColor: "#f37720",
                      padding: "5px",
                      width: "120px",
                      fontWeight: "600",
                      alignSelf: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Save up to 60%
                  </span>
                  <span style={{ fontSize: "26px", fontWeight: "600" }}>
                    €4.5 <span style={{ fontSize: "14px" }}>/Week</span>
                  </span>
                  <span style={{ margin: "15px 0" }}>12 months plan</span>
                  <span style={{ fontSize: "14px", color: "#7e7c79" }}>
                    Billed Monthly
                  </span>
                </div>
                <div
                  className="unlock-challenge-pack font-paragraph-white"
                  onClick={() => {
                    if (pack === "CHALLENGE_3") {
                      setPack("");
                    } else {
                      setPack("CHALLENGE_3");
                    }
                  }}
                  style={{
                    border:
                      pack === "CHALLENGE_3"
                        ? "2px solid #f37720"
                        : "2px solid #2a2f36",
                  }}
                >
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "400",
                      marginBottom: "10px",
                    }}
                  >
                    Repeat & Save
                  </span>
                  <span
                    className="font-paragraph-white"
                    style={{
                      fontSize: "13px",
                      backgroundColor: "#f37720",
                      padding: "5px",
                      width: "120px",
                      fontWeight: "600",
                      alignSelf: "center",
                      marginBottom: "10px",
                    }}
                  >
                    Save up to 30%
                  </span>
                  <span style={{ fontSize: "26px", fontWeight: "600" }}>
                    €6 <span style={{ fontSize: "14px" }}>/Week</span>
                  </span>
                  <span style={{ margin: "15px 0" }}>3 months plan</span>
                  <span style={{ fontSize: "14px", color: "#7e7c79" }}>
                    Billed Monthly
                  </span>
                </div>
              </div>
            </>
          );
        }
      }
    }
  };

  function openChallengePlayer(address, workout, i, j) {
    if (isWorkoutLocked(workout._id, i, j) && (i !== 0 || j !== 0)) {
    } else {
      props.history.push(address);
    }
  }
  const getWeeks = () => {
    // if user has that specific challenge in its details
    console.log("usereDtails asdasdasd", usereDtails);
    if (userOwnsThisChallenge) {
      return (
        <div style={{ marginTop: "20px" }}>
          {challenge.weeks &&
            challenge.weeks.map((w, i) => (
              <>
                <h3
                  className="font-paragraph-white"
                  style={{ margin: "10px 0" }}
                >
                  {w.weekName}
                </h3>
                <div
                  className="trainer-profile-goals-container"
                  // style={{ backgroundColor: "#2D3239" }}
                >
                  {w.workouts &&
                    w.workouts.map((workout, j) => (
                      <div
                        onClick={() =>
                          openChallengePlayer(
                            `/play-challenge/${props.match.params.challengeName}/${challenge._id}/${workout._id}`,
                            workout,
                            i,
                            j
                          )
                        }
                        className={`challenge-profile-comment font-paragraph-white`}
                        key={workout._id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexDirection: "row",
                          alignItems: "center",
                          cursor: "pointer",
                          backgroundColor: "#2D3239",
                          position: "relative",
                        }}
                      >
                        {isWorkoutLocked(workout._id, i, j) &&
                          (i !== 0 || j !== 0) && (
                            <div className="workout-card-disabled"></div>
                          )}
                        <div style={{ display: "flex" }}>
                          <img
                            src={Ellipse}
                            alt=""
                            style={{
                              marginRight: "5px",
                            }}
                          />
                          <div
                            className="font-paragraph-white"
                            style={{
                              margin: "0 5px",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <span>{workout.title}</span>
                            <span
                              style={{ color: "#BABCBF", fontSize: "14px" }}
                            >
                              {workout.subtitle}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {workout.introVideoLink && (
                            <span
                              className="font-paragraph-white"
                              style={{
                                backgroundColor: "#354c63",
                                padding: "3px 10px",
                                margin: "0 2px",
                              }}
                            >
                              Intro
                            </span>
                          )}
                          {workout.relatedEquipments &&
                            workout.relatedEquipments.map((w) => (
                              <span
                                className="font-paragraph-white"
                                style={{
                                  backgroundColor: "#354c63",
                                  padding: "5px 10px",
                                  margin: "0 2px",
                                }}
                              >
                                {w.name}
                              </span>
                            ))}
                          {workout.infoFile && (
                            <img
                              src={Attachment}
                              alt=""
                              style={{
                                margin: "0 2px",
                              }}
                            />
                          )}

                          {workout.relatedProducts &&
                            workout.relatedProducts.length > 0 && (
                              <img
                                src={ShoopingIcon}
                                alt=""
                                style={{
                                  margin: "0 2px",
                                }}
                              />
                            )}

                          {challengeProgress &&
                          challengeProgress.completedWorkouts.includes(
                            workout._id
                          ) ? (
                            <UndoOutlined
                              style={{
                                margin: "0 5px",
                              }}
                            />
                          ) : (
                            <ArrowRightOutlined
                              style={{
                                margin: "0 5px",
                              }}
                            />
                          )}
                        </div>
                        {challengeProgress &&
                          (challengeProgress.completedWorkouts.includes(
                            workout._id
                          ) ||
                            challengeProgress.currentWorkout ===
                              workout._id) && (
                            <span
                              className="workout-bottom-border"
                              style={{
                                width:
                                  challengeProgress &&
                                  challengeProgress.currentWorkout ===
                                    workout._id
                                    ? `${challengeProgress.currentWorkoutCompletionRate}%`
                                    : "100%",
                              }}
                            ></span>
                          )}
                      </div>
                    ))}
                </div>
              </>
            ))}
        </div>
      );
    } else {
      return (
        <Collapse
          defaultActiveKey={[]}
          onChange={(e) => setShowChangePanel(e)}
          style={{
            backgroundColor: "#171e27",
            marginTop: "10px",
            padding: "10px",
          }}
        >
          {challenge.weeks &&
            challenge.weeks.map((w, i) => (
              <Collapse.Panel
                showArrow={false}
                style={{ backgroundColor: "#1b2632", marginBottom: "5px" }}
                header={
                  <>
                    {console.log("week", w)}
                    <span
                      className="font-paragraph-white"
                      style={{
                        fontSize: "13px",
                        backgroundColor: "#f37720",
                        padding: "5px",
                        width: "120px",
                        textTransform: "uppercase",
                        margin: "0 0 12px 5px",
                      }}
                    >
                      {w.weekName}
                    </span>
                    <div
                      style={{
                        fontWeight: "500",
                        fontSize: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px",
                        textTransform: "uppercase",
                      }}
                      className="font-paragraph-white"
                    >
                      <span> {w.weekSubtitle}</span>
                      <span>
                        {showChangePanel.includes(`${i + 1}`) ? (
                          <UpOutlined style={{ color: "#ff7700" }} />
                        ) : (
                          <DownOutlined style={{ color: "#ff7700" }} />
                        )}
                      </span>
                    </div>
                  </>
                }
                key={i + 1}
              >
                <div
                  className="trainer-profile-goals-container"
                  style={{ backgroundColor: "#1b2632" }}
                >
                  {w.workouts &&
                    w.workouts.map((workout) => (
                      <div
                        className="challenge-profile-comment font-paragraph-white"
                        key={workout._id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          backgroundColor: "transparent",
                        }}
                      >
                        <span>{workout.title}</span>
                        <span
                          className="font-paragraph-white"
                          style={{ fontSize: "13px" }}
                        >
                          {workout.subtitle}
                        </span>
                      </div>
                    ))}
                </div>
              </Collapse.Panel>
            ))}
        </Collapse>
      );
    }
  };

  const openTailerPlayer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (challenge.videoThumbnailLink) {
      // show video player
      setOpenPopupPlayer(true);
    }
  };

  return loading ? (
    <div className="center-inpage">
      <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
    </div>
  ) : (
    <div>
      <Helmet>
        <title>{`Realchallenge: ${challenge.challengeName}`}</title>
        <meta name="description" content={challenge.description} />
        <meta property="og:title" content={challenge.challengeName} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={challenge.description} />
        <meta
          property="og:url"
          content={`http://localhost:3001/${slug(challenge.challengeName)}/${
            challenge._id
          }`}
        />
        <meta name="author" content="Realchallenge" />
      </Helmet>
      <Navbar />
      {/* video modal */}
      {/* todo do later */}
      {/* <ModalVideo
        channel="custom"
        autoplay
        isOpen={open}
        controlsList="nodownload"
        url={`${challenge.videoThumbnailLink}`}
        onClose={() => setOpen(false)}
      /> */}
      <ChallengeReviewModal
        visible={reviewOpen}
        setVisible={setReviewOpen}
        challenge={challenge}
      />
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{
            background: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${challenge.thumbnailLink})`,
            backgroundSize: "100% 100vh",
            backgroundPosition: "10% 10%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="profile-box">
            <div className="challenge-profile-box-1">
              {challenge?.videoThumbnailLink && (
                <img
                  src={ChallengeProfileSubtract}
                  alt=""
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={openTailerPlayer}
                />
              )}
              <h1 className="font-heading-white" style={{ fontSize: "4rem" }}>
                {challenge.challengeName ? challenge.challengeName : ""}
              </h1>
              <Progress
                percent={
                  challengeProgress && challengeProgress.challengeCompletionRate
                    ? challengeProgress.challengeCompletionRate
                    : 0
                }
                style={{ height: "4px" }}
                trailColor="rgb(79, 90, 104)"
                showInfo={false}
              />
            </div>
            <div className="challenge-profile-box-2">
              <div className="challenge-profile-box-2-rating">
                <div style={{ padding: "5px" }}>
                  {new Array(challenge.rating).fill(0).map(() => (
                    <img
                      src={StarFilled}
                      alt=""
                      style={{ height: "20px", margin: "2px" }}
                    />
                  ))}
                  {new Array(challenge.rating ? 5 - challenge.rating : 5)
                    .fill(0)
                    .map(() => (
                      <img
                        src={StartTransparent}
                        alt=""
                        style={{ height: "20px", margin: "2px" }}
                      />
                    ))}
                </div>
                {challenge.reviews && challenge.reviews.length > 0 && (
                  <span onClick={() => setReviewOpen(true)}>
                    <T>challenge_profile.reviews</T>
                  </span>
                )}
              </div>
              <div className="challenge-profile-box-2-info">
                <div className="challenge-profile-box-2-container">
                  <img src={ForwardWhite} alt="" />{" "}
                  {challenge.difficulty ? challenge.difficulty : ""}
                </div>
                <div className="challenge-profile-box-2-container">
                  {challenge.duration ? `${challenge.duration} mins` : ""}
                </div>
              </div>
              <div
                className="font-paragraph-white"
                style={{ fontSize: "18px", marginTop: "10px" }}
              >
                {challenge.description}
              </div>
            </div>
          </div>
        </div>
        <div className="trainer-profile-container-column2">
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>challenge_profile.trainers</T>
            </div>
            <div className="challenge-trainers-container">
              {challenge.trainers &&
                challenge.trainers.map((trainer) => (
                  <div
                    className="challenge-trainer-box"
                    style={{ background: "#283443" }}
                  >
                    <span
                      style={{
                        backgroundImage: `url(${trainer.avatarLink})`,
                        backgroundPosition: "center center",
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        height: "50px",
                        width: "60px",
                      }}
                    ></span>
                    {/* <img
                      // src={}
                      alt={trainer.firstName}
                    /> */}
                    <Link
                      to={`/trainer/${slug(trainer.firstName)}/${trainer._id}`}
                      className="challenge-trainer-box-text font-paragraph-white"
                    >
                      {trainer.firstName + " " + trainer.lastName}
                    </Link>
                  </div>
                ))}
            </div>
          </div>
          {challenge.trainersFitnessInterest && (
            <div className="trainer-profile-goals">
              <div
                className="trainer-profile-goals-heading font-paragraph-white"
                style={{ color: "#72777B", textTransform: "uppercase" }}
              >
                <T>challenge_profile.fitnessInterests</T>
              </div>
              <div className="trainer-profile-goals-container">
                {challenge.trainersFitnessInterest &&
                  challenge.trainersFitnessInterest.map((goal) => (
                    <div
                      className="trainer-profile-goal font-paragraph-white"
                      style={{ marginRight: "1px", background: "#283443" }}
                    >
                      {goal.name}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>challenge_profile.body_focus</T>
            </div>
            <div className="trainer-profile-goals-container">
              {challenge.body &&
                challenge.body.map((body) => (
                  <div
                    className="trainer-profile-goal font-paragraph-white"
                    style={{ marginRight: "1px", background: "#283443" }}
                  >
                    {body.name}
                  </div>
                ))}
            </div>
          </div>

          {getEquipmentsFromWorkouts(challenge.weeks)}

          <div
            className="trainer-profile-goals"
            style={{ position: "relative" }}
          >
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>challenge_profile.yourPersonalJourney</T>
            </div>
            {getWeeks()}
          </div>
          <div
            className="trainer-profile-goals"
            style={{
              position: "relative",
              borderBottom: "1px solid transparent",
            }}
          >
            {getWeeksComponent()}
          </div>

          <div
            className="trainer-profile-goals"
            style={{ textAlign: "center", paddingTop: "10px" }}
          >
            {userOwnsThisChallenge ? (
              ""
            ) : (
              <button
                className="create-payment-check-out font-paragraph-white"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={pushCustomerOnConditions}
              >
                <span
                  className="font-paragraph-white"
                  style={{ fontWeight: "600" }}
                >
                  <T>challenge_profile.start_today</T> <ArrowRightOutlined />
                </span>
              </button>
            )}
          </div>

          <div
            className="trainer-profile-goals"
            style={{ borderBottom: "1px solid transparent" }}
          >
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{
                color: "#72777B",
                textTransform: "uppercase",
              }}
            >
              <T>challenge_profile.comments</T>
            </div>
            {allComments.map((c) => (
              <div className="comment-container">
                <div className="comment-container-c1 font-paragraph-white">
                  <Avatar src={c.user.avatarLink} shape="square" />{" "}
                  <span style={{ marginLeft: "5px" }}>{c.user.username}</span>
                  <div className="comment-container-c2 font-paragraph-white">
                    {c.text}
                  </div>
                </div>

                <div
                  className="font-paragraph-white comment-container-c3"
                  style={{ color: "#82868b" }}
                >
                  {moment(c.createdAt).format("MMM, Do YY")}
                </div>
              </div>
            ))}
            {localStorage.getItem("jwtToken") && (
              <>
                <div
                  className="trainer-profile-goals-container"
                  style={{ marginTop: "10px" }}
                >
                  <Input.TextArea
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                {commentButtonLoading ? (
                  <LoadingOutlined
                    style={{
                      color: "#ff7700",
                      fontSize: "30px",
                      marginTop: "10px",
                    }}
                  />
                ) : (
                  <button
                    className="common-transparent-button font-paragraph-white"
                    onClick={postCommentToBackend}
                    style={{
                      color: "#ff7700",
                      borderColor: "#ff7700",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <T>common.postComment</T>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <ChallengeCompleteModal
        visible={finishChallengePopupVisible}
        setVisible={setFinishChallengePopupVisible}
        challengeId={props.match.params.id}
        challenge={challenge}
        points={50}
        fetchData={fetchData}
      />
      <ReplaceFreeChallengePopup
        challenge={challenge}
        visible={replaceFreeChallengePopupVisible}
        setVisible={setReplaceFreeChallengePopupVisible}
        fetchData={fetchData}
      />
      {console.log("challenge.thumbnailLink", challenge.thumbnailLink)}
      <PopupPlayer
        open={openPopupPlayer}
        onCancel={() => setOpenPopupPlayer(false)}
        video={challenge.videoThumbnailLink}
      />

      {/* <Footer /> */}
    </div>
  );
}

export default withRouter(ChallengeProfile);
