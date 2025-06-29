import React, { useState, useEffect, useContext } from "react";
import "../../assets/trainerprofile.css";
import "../../assets/adminDashboardV2.css";
import "../../assets/home.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { EditFilled, LoadingOutlined } from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
// import ModalVideo from "react-modal-video";
// import "react-modal-video/scss/modal-video.scss";
import ChallengeCard from "../../components/Cards/ChallengeCard";
import {
  addCommentToTrainer,
  createTrainerGoal,
  deleteTrainerGoals,
  getAllTrainerGoals,
  getTrainerById,
} from "../../services/trainers";
import QuoteIcon from "../../assets/icons/quote-icon.png";
import ChallengeProfileSubtract from "../../assets/icons/challenge-profile-subtract.svg";
import { Avatar, Button, Input } from "antd";
import StarFilled from "../../assets/icons/star-orange.svg";
import StartTransparent from "../../assets/icons/star-transparent.svg";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../../components/Translate";
import { userInfoContext } from "../../contexts/UserStore";
import { getUsersProfile } from "../../services/users";
import { LanguageContext } from "../../contexts/LanguageContext";
import HeartIcon from "../../assets/icons/heart-icon.svg";
import UploadIcon from "../../assets/icons/upload-icon.svg";
import DumbBellIcon from "../../assets/icons/dumb-bell-icon.svg";
import CreateGoalsModal from "../../components/Admin/V2/Trainer/CreateGoalsModal";
import MediaManager from "../../components/Admin/V2/MediaManager/MediaManager";
import {
  getAllChallenges,
  getAllUserChallenges,
  getAllUserExercises,
} from "../../services/createChallenge/main";

function AdminDashboard(props) {
  const { language } = useContext(LanguageContext);
  const [open, setOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useContext(userInfoContext);
  const [loading, setLoading] = useState(false);
  const [trainer, setTrainer] = useState({});
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [goals, setGoals] = useState([]);
  const [showTrainerGoalModal, setShowTrainerGoalModal] = useState(false);
  const [openMediaManager, setOpenMediaManager] = useState(false);
  const [challenges, setAllChallenges] = useState([]);
  const [exercises, setAllExercises] = useState([]);

  async function fetchTrainerGoals() {
    const { goals } = await getAllTrainerGoals(language);
    setGoals(goals);
  }

  const fetchChallenges = async () => {
    const { challenges } = await getAllChallenges(language);
    setAllChallenges(challenges);
  };

  const fetchExercises = async () => {
    const { exercises } = await getAllUserExercises(language);
    setAllExercises(exercises);
  };
  async function fetchData(id) {
    setLoading(true);
    const { user } = await getUsersProfile();
    await fetchTrainerGoals();
    await fetchChallenges();
    await fetchExercises();
    await fetchExercises();
    setTrainer(user);
    setLoading(false);
  }

  useEffect(() => {
    fetchData(adminInfo.id);
  }, [language]);

  const createNewTrainerGoal = async (body) => {
    await createTrainerGoal(body);
    await fetchTrainerGoals();
  };

  const deleteMyTrainerGoals = async (id) => {
    await deleteTrainerGoals(id);
  };

  const openNewInterestModal = () => {
    setShowTrainerGoalModal(true);
  };

  const goToChallengeCreator = () => {
    props.history.push("/admin/v2/challenge-studio");
  };
  const goToNewExercise = () => {
    props.history.push("/admin/dashboard?tab=new-exercise");
  };
  const goToEditExercise = (exerciseId) => {
    window.open(
      `/admin/dashboard?tab=update-exercise&exerciseId=${exerciseId}`,
      "_blank",
      "noopener,noreferrer"
    );
  };
  return loading ? (
    <div className="center-inpage">
      <LoadingOutlined style={{ fontSize: "50px", color: "#ff7700" }} />
    </div>
  ) : (
    <div>
      <Helmet>
        <title>{`Realchallenge: ${trainer.firstName}`}</title>
        <meta name="description" content={trainer.motto} />
        <meta property="og:title" content={trainer.name} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={trainer.motto} />
        <meta
          property="og:url"
          content={`http://localhost:3001/trainer/${slug(trainer.firstName)}/${
            trainer._id
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
        videoId={`${process.env.REACT_APP_SERVER}/uploads/${trainer.videoTrailerLink}`}
        onClose={() => setOpen(false)}
      /> */}
      <CreateGoalsModal
        showTrainerGoalModal={showTrainerGoalModal}
        setShowTrainerGoalModal={setShowTrainerGoalModal}
        createTrainerGoal={createNewTrainerGoal}
        allTrainerGoals={goals}
        deleteTrainerGoals={deleteMyTrainerGoals}
        fetchData={fetchTrainerGoals}
      />
      <MediaManager open={openMediaManager} setOpen={setOpenMediaManager} />
      <div className="trainer-profile-container">
        <div
          className="trainer-profile-container-column1"
          style={{
            background: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${
              process.env.REACT_APP_SERVER
            }/uploads/${
              trainer.heroBanner
                ? trainer.heroBanner.replaceAll(" ", "%20")
                : ""
            })`,
            backgroundSize: "100% 100vh",
            backgroundPosition: "10% 10%",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="profile-box">
            <div className="profile-box-row1">
              <div className="profile-box-row1-avatar">
                <img
                  src={`${process.env.REACT_APP_SERVER}/uploads/${
                    trainer.avatarLink
                      ? trainer.avatarLink.replaceAll(" ", "%20")
                      : ""
                  }`}
                  alt="trainer-profile"
                />
              </div>
              <div className="profile-box-row1-information">
                <h2
                  className="font-heading-white"
                  style={{ margin: "0", padding: "0" }}
                >
                  {trainer.firstName ? trainer.firstName : ""}{" "}
                  {trainer.lastName ? trainer.lastName : ""}
                </h2>

                <div style={{ paddingTop: "20px" }}>
                  <p
                    className="font-paragraph-white"
                    style={{ margin: "0", padding: "0" }}
                  >
                    {trainer.country ? trainer.country : ""}
                  </p>
                  {new Array(calculatedRating ? calculatedRating : 0)
                    .fill(0)
                    .map(() => (
                      <img
                        src={StarFilled}
                        alt=""
                        style={{ height: "20px", margin: "2px" }}
                      />
                    ))}
                  {new Array(calculatedRating ? 5 - calculatedRating : 5)
                    .fill(0)
                    .map(() => (
                      <img
                        src={StartTransparent}
                        alt=""
                        style={{ height: "20px", margin: "2px" }}
                      />
                    ))}
                </div>
                <div>
                  {/* {new Array(trainer.rating).fill(0).map((e) => (
                    <StarOutlined
                      style={{ color: "#ff7700", textTransform: "uppercase" }}
                      className="challenge-carousel-body-textbox-icons"
                    />
                  ))} */}
                </div>
              </div>
              <div className="profile-box-row1-playericon">
                <img
                  src={ChallengeProfileSubtract}
                  onClick={() => setOpen(true)}
                />
              </div>
            </div>
            <div className="profile-box-row2">
              <div className="profile-box-row2-quote font-paragraph-white">
                <img src={QuoteIcon} alt="" />
                <span style={{ marginLeft: "10px" }}>
                  {trainer.motto ? trainer.motto : ""}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="trainer-profile-container-column2"
          style={{
            background: "#2a2f37",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // justifyContent: "center",
          }}
        >
          <div className="trainer-profile-aboutme">
            <div
              className="trainer-profile-aboutme-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>trainer_profile.about_me</T>
            </div>
            <div className="trainer-profile-aboutme-container font-paragraph-white">
              {trainer.bio ? trainer.bio : ""}
            </div>
          </div>

          <div className="adminv2-selector-container">
            <div className="adminv2-selector">
              <h1>
                <T>adminv2.welcome_trainer</T>
              </h1>
              <p>
                <T>adminv2.create</T>
              </p>
              <div
                className="adminv2-select"
                onClick={() => setOpenMediaManager(true)}
              >
                <img src={HeartIcon} alt="heart-icon" />
                <p>
                  <T>adminv2.upload_media</T>
                </p>
              </div>
              <div className="adminv2-select" onClick={goToNewExercise}>
                <img src={DumbBellIcon} alt="upload-icon" />
                <p>
                  <T>adminv2.new_exercise</T>
                </p>
              </div>
              <div className="adminv2-select" onClick={goToChallengeCreator}>
                <img src={UploadIcon} alt="upload-icon" />
                <p>
                  <T>adminv2.create_challenge</T>
                </p>
              </div>
            </div>

            <div className="adminv2-selector">
              <h1
                style={{
                  margin: "50px 0 40px 0",
                }}
              >
                <T>adminv2.interests</T>
              </h1>
              <div className="adminv2-selector-interests">
                {goals.map((goal, i) => (
                  <div className="adminv2-selector-interests-interest" key={i}>
                    {goal.name}
                  </div>
                ))}
                <Button
                  className="adminv2-interest-button"
                  onClick={openNewInterestModal}
                >
                  + Add New
                </Button>
              </div>
            </div>
          </div>

          <div className="adminv2-selector-container">
            <div className="adminv2-selector">
              <h1
                style={{
                  fontSize: "22px",
                }}
              >
                <T>adminv2.my_exercises</T>
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "32px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {exercises.map((exercise, index) => (
                <div
                  key={index}
                  style={{
                    background: "#222935",
                    padding: "16px",
                    textAlign: "left",

                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 500,
                        fontSize: "15px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        padding: 0,
                        margin: 0,
                        color: "#ffffff",
                      }}
                    >
                      {exercise.title || "Unnamed Exercise"}
                    </p>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        verticalAlign: "middle",
                        color: "#465060",
                      }}
                    >
                      Exercise ID: {exercise._id}
                    </span>
                  </div>

                  <EditFilled
                    style={{
                      cursor: "pointer",
                      color: "white",
                      fontSize: "18px",
                    }}
                    onClick={() => goToEditExercise(exercise._id)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="adminv2-selector-container">
            <div className="adminv2-selector">
              <h1
                style={{
                  fontSize: "22px",
                }}
              >
                <T>adminv2.my_challenges</T>
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "32px",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {challenges.map((exercise, index) => (
                <div
                  key={index}
                  style={{
                    background: "#222935",
                    padding: "16px",
                    textAlign: "left",

                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 500,
                        fontSize: "15px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        padding: 0,
                        margin: 0,
                        color: "#ffffff",
                      }}
                    >
                      {exercise.challengeName || "Unnamed Challenge"}
                    </p>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: "12px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        verticalAlign: "middle",
                        color: "#465060",
                      }}
                    >
                      Challenge ID: {exercise._id}
                    </span>
                  </div>

                  <a
                    href={`/admin/v2/challenge-studio/${exercise._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <EditFilled
                      style={{
                        cursor: "pointer",
                        color: "white",
                        fontSize: "18px",
                      }}
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withRouter(AdminDashboard);
