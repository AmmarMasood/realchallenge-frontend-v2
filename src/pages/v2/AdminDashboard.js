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
import ModalForEditList from "../../components/Admin/V2/Common/ModalForEditList";
import ExerciseCreatorPopup from "./ExerciseCreatorPopup";

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
  const [openExerciseEditListModal, setOpenExerciseEditListModal] =
    useState(false);
  const [openChallengeEditListModal, setOpenChallengeEditListModal] =
    useState(false);
  const [openExerciseCreatorPopup, setOpenExerciseCreatorPopup] =
    useState(false);
  const [selectedExerciseForEdit, setSelectedExerciseForEdit] = useState(null);

  async function fetchTrainerGoals() {
    const { goals } = await getAllTrainerGoals(language);
    setGoals(goals);
  }

  const fetchChallenges = async () => {
    const { challenges } = await getAllUserChallenges(language, true);
    setAllChallenges(challenges);
  };

  const fetchExercises = async () => {
    const { exercises } = await getAllUserExercises(language, true);
    setAllExercises(exercises);
  };
  async function fetchData(id) {
    setLoading(true);
    const { user } = await getUsersProfile();
    await fetchTrainerGoals();
    await fetchChallenges();
    await fetchExercises();
    // await fetchExercises();
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
    // props.history.push("/admin/dashboard?tab=new-exercise");
    setSelectedExerciseForEdit(null); // Clear any previously selected exercise
    setOpenExerciseCreatorPopup(true);
  };
  const goToEditExercise = (exerciseId) => {
    const exercise = exercises.find((e) => e._id === exerciseId);
    setSelectedExerciseForEdit(exercise);
    setOpenExerciseEditListModal(false);
    setOpenExerciseCreatorPopup(true);
  };

  const goToEditChallenge = (challengeId) => {
    window.open(
      `/admin/v2/challenge-studio/${challengeId}`,
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
        videoId={`${trainer.videoTrailerLink}`}
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
                  src={`${
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
            <div
              className="adminv2-selector"
              style={{ cursor: "pointer" }}
              onClick={() => setOpenExerciseEditListModal(true)}
            >
              {adminInfo.role === "admin" ? (
                <h1
                  style={{
                    fontSize: "22px",
                  }}
                >
                  All Exercises
                </h1>
              ) : (
                <h1
                  style={{
                    fontSize: "22px",
                  }}
                >
                  <T>adminv2.my_exercises</T>
                </h1>
              )}
            </div>
            <ModalForEditList
              data={exercises}
              open={openExerciseEditListModal}
              setOpen={setOpenExerciseEditListModal}
              onClickEdit={goToEditExercise}
              title={
                adminInfo.role === "admin" ? "All Exercises" : "My Exercises"
              }
              subtext="Exercise ID"
              searchPlaceholder="Search by exercise name"
              searchKeys={["title"]}
              type={"exercise"}
            />
          </div>

          <div className="adminv2-selector-container">
            <div
              className="adminv2-selector"
              style={{ cursor: "pointer" }}
              onClick={() => setOpenChallengeEditListModal(true)}
            >
              {adminInfo.role === "admin" ? (
                <h1
                  style={{
                    fontSize: "22px",
                  }}
                >
                  All Challenges
                </h1>
              ) : (
                <h1
                  style={{
                    fontSize: "22px",
                  }}
                >
                  <T>adminv2.my_challenges</T>
                </h1>
              )}
            </div>
            <ModalForEditList
              data={challenges}
              open={openChallengeEditListModal}
              setOpen={setOpenChallengeEditListModal}
              onClickEdit={goToEditChallenge}
              title={
                adminInfo.role === "admin" ? "All Challenges" : "My Challenges"
              }
              subtext="Challenge ID"
              searchPlaceholder="Search by challenge name"
              searchKeys={["challengeName"]}
              type="challenge"
            />
          </div>
        </div>
      </div>
      {/* modaks */}
      <ExerciseCreatorPopup
        open={openExerciseCreatorPopup}
        setOpen={(isOpen) => {
          setOpenExerciseCreatorPopup(isOpen);
          if (!isOpen) {
            // Clear selected exercise when modal closes
            setSelectedExerciseForEdit(null);
          }
        }}
        selectedExerciseForEdit={selectedExerciseForEdit}
        onSuccess={() => {
          setSelectedExerciseForEdit(null);
          fetchExercises();
        }}
      />
      <Footer />
    </div>
  );
}

export default withRouter(AdminDashboard);
