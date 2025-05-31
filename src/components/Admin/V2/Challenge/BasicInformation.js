import React, { useState, useEffect, useContext } from "react";
import "../../../../assets/trainerprofile.css";
import "../../../../assets/home.css";
import "../../../../assets/challengeProfile.css";
import Navbar from "../../../../components/Navbar";
import {
  LoadingOutlined,
  DeleteFilled,
  DownOutlined,
  UpOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { withRouter, Link } from "react-router-dom";
import {
  Tooltip,
  Select,
  Modal,
  Input,
  Button,
  List,
  Collapse,
  Checkbox,
} from "antd";

import { userInfoContext } from "../../../../contexts/UserStore";
import { selectedChallengeContext } from "../../../../contexts/PaymentProcessStore";
import { getUserProfileInfo } from "../../../../services/users";
import HelpIcon from "../../../../assets/icons/Help-icon.png";
import ChallengeProfileSubtract from "../../../../assets/icons/challenge-profile-subtract.svg";
import { T } from "../../../../components/Translate";
import { LanguageContext } from "../../../../contexts/LanguageContext";
import "../../../../assets/adminDashboardV2.css";
import RemoteMediaManager from "../../MediaManager/RemoteMediaManager";
import PopupPlayer from "../../../PopupPlayer/PopupPlayer";
import AddNewButton from "./AddNewButton";
import {
  createBodyFocus,
  deleteChallengeBodyfocus,
  getAllBodyFocus,
} from "../../../../services/createChallenge/bodyFocus";
import { getAllChallengeGoals } from "../../../../services/createChallenge/goals";
import {
  createTrainerGoal,
  deleteTrainerGoals,
  getAllTrainerGoals,
  getAllTrainers,
} from "../../../../services/trainers";
import { getAllChallengeTags } from "../../../../services/createChallenge/tags";
import EditTypeName from "../../ChallengeManager/EditTypeName";
import slug from "elegant-slug";
import WorkoutStudioIcon from "../../../../assets/icons/workout-studio.svg";
import { useChallenge } from "../../../../contexts/ChallengeCreatorV2";
import { v4 } from "uuid";
import {
  createChallenge,
  createWorkout,
  getAllExercises,
  getAllUserExercises,
  getChallengeById,
  updateChallenge,
  updateWorkoutOnBackend,
} from "../../../../services/createChallenge/main";

const tooltipText = `
If you don’t choose any plan and hit start now, you can go through the wizard, get your free intake, make a free account and enjoy our free challenges collection and one week meal plan. 
`;
function BasicInformation(props) {
  const { language, updateLanguage } = useContext(LanguageContext);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [isUpdate, setIsUpdate] = useState(false);
  const {
    showVideoCreator,
    setShowVideoCreator,
    usereDtails,
    setUserDetails,
    loading,
    setLoading,
    thumbnail,
    setThumbnail,
    videoThumbnail,
    setVideoThumbnail,
    challengeName,
    setChallengeName,
    challengeDescription,
    setChallengeDescription,
    difficulty,
    setDifficulty,
    duration,
    setDuration,
    openPopupPlayer,
    setOpenPopupPlayer,
    pack,
    setPack,
    customPrice,
    setCustomPrice,
    challengeInfo,
    setChallengeInfo,
    result,
    setResult,
    selectedFitnessInterest,
    setSelectedFitnessInterest,
    selectedBodyFocus,
    setSelectedBodyFocus,
    selectedGoals,
    setSelectedGoals,
    seletedTrainers,
    setSelectedTrainers,
    allTrainers,
    setAllTrainers,
    allFitnessInterests,
    setAllFitnessInterests,
    allBodyFocus,
    setAllBodyFocus,
    showChangePanel,
    setShowChangePanel,
    allGoals,
    setAllGoals,
    weeks,
    setWeeks,
    selectedWorkoutForStudioId,
    setSelectedWorkoutForStudioId,
    allExercises,
    setAllExercises,
    populateChallengeInfo,
    isFirstRender,
    setIsFirstRender,
  } = useChallenge();
  const [dataLoaded, setDataLoaded] = useState(false); // Track when all setters are done

  // media manager
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  // update
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");
  // manage
  const [fitnessInterestModal, setFitnessInterestModal] = useState(false);
  const [newTrainerFitnessInterest, setNewTrainerFitnessInterest] =
    useState("");
  const [bodyFocusModal, setBodyfocusModal] = useState(false);
  const [newBodyFocus, setNewBodyFocus] = useState("");
  const [goalsModal, setGoalsModal] = useState(false);
  const [trainerModal, setTrainerModal] = useState(false);

  const fetchDataV2 = async () => {
    setLoading(true);
    // if user is trainer we need to get his info
    if (userInfo.role === "trainer") {
      const uInfo = await getUserProfileInfo(userInfo.id);
      uInfo &&
        seletedTrainers.length <= 0 &&
        setSelectedTrainers((prev) => [...prev, uInfo.customer]);
      setUserDetails(uInfo.customer);
    }
    const bodyFocus = await getAllBodyFocus(language);
    const trainers = await getAllTrainers(language);
    const res = await getAllTrainerGoals(language);
    const allExercises = await getAllExercises(language);
    setAllBodyFocus(bodyFocus.body);
    setAllTrainers(trainers.trainers);
    setAllFitnessInterests(res.goals);
    setAllExercises(allExercises.exercises);

    setDataLoaded(true); // Set dataLoaded to true after all setters are done

    setLoading(false);
  };

  useEffect(() => {
    // Call populateChallengeInfo only when data is loaded
    if (dataLoaded && props.match.params.challengeId && !isFirstRender) {
      const fetchChallenge = async () => {
        setLoading(true);
        const challenge = await getChallengeById(
          props.match.params.challengeId,
          language
        );
        setIsUpdate(true);
        populateChallengeInfo(challenge);
        setLoading(false);
        setIsFirstRender(true);
      };
      fetchChallenge();
    }
  }, [dataLoaded, props.match.params.challengeId, language]);

  useEffect(() => {
    if (userInfo) {
      fetchDataV2();
    }
  }, [userInfo, language]);

  const openForThumbnail = () => {
    setMediaManagerVisible(true);
    setMediaManagerType("images");
    setMediaManagerActions([thumbnail, setThumbnail]);
  };

  const openForTrailer = () => {
    setMediaManagerVisible(true);
    setMediaManagerType("videos");
    setMediaManagerActions([videoThumbnail, setVideoThumbnail]);
  };
  const openTailerPlayer = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoThumbnail) {
      // show video player
      setOpenPopupPlayer(true);
    }
  };

  const onAddTrainer = () => {
    setTrainerModal(true);
  };

  const onAddBodyFocus = () => {
    setBodyfocusModal(true);
  };

  const onAddGoals = () => {
    setGoalsModal(true);
  };

  const onAddFitnessInterests = () => {
    setFitnessInterestModal(true);
  };

  const onAddInfo = () => {
    const newChallengeInfo = challengeInfo ? [...challengeInfo] : [];
    newChallengeInfo.push("");
    setChallengeInfo(newChallengeInfo);
  };

  const onAddWeek = () => {
    const newWeeks = weeks ? [...weeks] : [];
    newWeeks.push({
      id: v4(),
      weekName: "",
      weekSubtitle: "",
      workouts: [],
    });
    setWeeks(newWeeks);
  };

  const onAddWorkout = (weekId) => {
    const newWeeks = [...weeks];
    const weekIndex = newWeeks.findIndex(
      (week) => week.id === weekId || week._id === weekId
    );
    if (weekIndex !== -1) {
      newWeeks[weekIndex].workouts.push({
        id: v4(),
        title: "",
        subtitle: "",
        renderWorkout: false,
        exercises: [
          {
            break: 5,
            createdAt: "",
            exerciseGroupName: "Introduction",
            exerciseLength: 0,
            title: "Introduction to workout",
            videoURL: "",
            voiceOverLink: "",
            id: v4(),
          },
        ],
        equipments: [],
        infoFile: null,
      });
      setWeeks(newWeeks);
    }
  };

  const handleSaveChallenge = async () => {
    setLoading(true);
    try {
      setLoading(true);
      const obj = {
        language: language,
        challengeName: challengeName,
        description: challengeDescription,
        price: customPrice,
        points: 100,
        currency: "€",
        thumbnailLink: typeof thumbnail === "object" ? thumbnail.link : "",
        videoThumbnailLink:
          typeof videoThumbnail === "object" ? videoThumbnail.link : "",
        trainers: seletedTrainers,
        trainersFitnessInterest: selectedFitnessInterest,
        challengeGoals: selectedGoals.map((s) => {
          if (typeof s === "object") {
            return s.name;
          } else {
            return s;
          }
        }),
        difficulty: difficulty,
        body: selectedBodyFocus,
        access: pack,
        duration: duration,
        videoLink:
          typeof videoThumbnail === "object"
            ? videoThumbnail.link
            : videoThumbnail,
        weeks: await handleWeeksForUpdate(weeks, isUpdate),
        music: [],
        additionalProducts: [],
        results: result,
        informationList: challengeInfo
          ? challengeInfo.map((i) => ({
              info: i,
              icon: "",
            }))
          : [],
        allowComments: true,
        allowReviews: true,
        isPublic: true,
      };
      if (isUpdate) {
        await updateChallenge(obj, props.match.params.challengeId);

        window.location.reload();
      } else {
        const res = await createChallenge(obj);
        props.history.push(`/admin/v2/challenge-studio/${res.weeks._id}`);
      }
    } catch (err) {
      console.log("Error saving challenge:", err);
      setLoading(false);
    }
    setLoading(false);
  };

  const handleWeeksForUpdate = async (weeks, isUpdate) => {
    // Helper function to transform workout data to be consistent format for both create and update
    const transformWorkout = (workout) => {
      // Extract intro exercise if it exists
      const introExercise = workout.exercises[0];
      const remainingExercises = introExercise
        ? workout.exercises.slice(1)
        : workout.exercises;

      return {
        // Include _id only when updating existing workout
        ...(workout._id && { _id: workout._id }),
        title: workout.title,
        subtitle: workout.subtitle,
        infotitle: "Workout info file",
        infoFile:
          workout.infoFile && typeof workout.infoFile === "object"
            ? workout.infoFile.link
            : "",
        relatedEquipments: workout.equipments
          ? workout.equipments.map((eq) => eq._id)
          : [],
        relatedProducts: [],
        introVideoLink: introExercise ? introExercise.videoURL : "",
        introVideoLength: introExercise ? introExercise.exerciseLength : "",
        isRendered: workout.renderWorkout,
        exercises: workout.renderWorkout
          ? remainingExercises.map((e) => ({
              exerciseId: e.exerciseId,
              exerciseLength: e.exerciseLength,
              break: e.break,
              groupName: e.exerciseGroupName,
            }))
          : remainingExercises.map((e) => ({
              renderedWorkoutExerciseName: e.title,
              renderedWorkoutExerciseVideo: e.videoURL,
            })),
      };
    };

    // Helper function to transform week data into desired format
    const transformWeek = (week) => {
      const { id, weekId, weekTitle, workouts, ...weekData } = week;
      return weekData;
    };

    if (isUpdate) {
      const weekPromises = weeks.map(async (week) => {
        // Process each workout inside this week
        const workoutPromises = week.workouts.map(async (workout) => {
          const transformedWorkout = transformWorkout(workout);

          if (workout._id) {
            await updateWorkoutOnBackend([transformedWorkout]);
            return workout._id;
          } else {
            const newWorkout = await updateWorkoutOnBackend([
              transformedWorkout,
            ]);
            const ids = newWorkout.map((w) => w.data.data);
            return ids[0];
          }
        });

        // Wait for all workouts to be processed
        const workoutIds = await Promise.all(workoutPromises);
        console.log("workoutIds", workoutIds, workoutPromises);

        // Return transformed week data with workout IDs
        const transformedWeek = transformWeek(week);
        transformedWeek.workouts = workoutIds;

        return transformedWeek;
      });

      // Wait for all weeks to be processed
      return Promise.all(weekPromises);
    } else {
      // For non-update mode, transform without API calls
      return weeks.map((week) => {
        const transformedWeek = transformWeek(week);
        transformedWeek.workout = week.workouts.map((workout) =>
          transformWorkout(workout)
        );
        return transformedWeek;
      });
    }
  };

  const duplicateWeek = (week) => {
    const duplicateWeek = {
      id: v4(),
      weekName: week.weekName,
      weekSubtitle: week.weekSubtitle,
      workouts: week.workouts.map((workout) => ({
        title: workout.title,
        subtitle: workout.subtitle,
        renderWorkout: workout.renderWorkout,
        equipments: [],
        infoFile: workout.infoFile,
        exercises: workout.exercises.map((exercise) => ({
          ...exercise,
          id: v4(),
        })),
        id: v4(),
      })),
    };

    setWeeks((prevWeeks) => [...prevWeeks, duplicateWeek]);
  };
  return (
    <div>
      {loading && (
        <div
          style={{
            background: "traceparent",
            height: "100vh",
            zIndex: "9999",
            position: "fixed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            width: "100%",
          }}
        >
          <LoadingOutlined style={{ fontSize: "80px", color: "#ff7700" }} />
        </div>
      )}
      <Navbar />
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fetchDataV2}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />

      <PopupPlayer
        open={openPopupPlayer}
        onCancel={() => setOpenPopupPlayer(false)}
        video={videoThumbnail?.link}
      />

      {/* modal to create a new trainer goal */}
      <Modal
        onCancel={() => setFitnessInterestModal(false)}
        footer={false}
        visible={fitnessInterestModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white"> Create A New Fitness Interest</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newTrainerFitnessInterest}
            onChange={(e) => setNewTrainerFitnessInterest(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newTrainerFitnessInterest.length > 0) {
                await createTrainerGoal({
                  name: newTrainerFitnessInterest,
                  language: language,
                });
                // setShowBodyfocusModal(false);
                fetchDataV2();
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Fitness Interests</span>
          <List
            size="small"
            bordered
            dataSource={allFitnessInterests}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      setSelectedFitnessInterest((prev) => {
                        const isExist = prev.find((item) => item._id === g._id);
                        if (isExist) {
                          return prev.filter((item) => item._id !== g._id);
                        } else {
                          return [...prev, g];
                        }
                      });
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                  >
                    {selectedFitnessInterest.find((item) => item._id === g._id)
                      ? "Unselect"
                      : "Select"}
                  </Button>

                  <Button
                    onClick={async () => {
                      await deleteTrainerGoals(g._id);
                      setSelectedFitnessInterest((prev) =>
                        prev.filter((item) => item._id !== g._id)
                      );
                      fetchDataV2();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    Delete
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle("Update Fitness Interest");
                      setSelectedItemForUpdate(g);
                      setEditItemNameModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        onCancel={() => setBodyfocusModal(false)}
        footer={false}
        visible={bodyFocusModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white"> Create A New Body focus</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newBodyFocus}
            onChange={(e) => setNewBodyFocus(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
            onClick={async () => {
              if (newBodyFocus.length > 0) {
                await createBodyFocus(newBodyFocus);

                fetchDataV2();
              }
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Body Focus</span>
          <List
            size="small"
            bordered
            dataSource={allBodyFocus}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      setSelectedBodyFocus((prev) => {
                        const isExist = prev.find((item) => item._id === g._id);
                        if (isExist) {
                          return prev.filter((item) => item._id !== g._id);
                        } else {
                          return [...prev, g];
                        }
                      });
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                  >
                    {selectedBodyFocus.find((item) => item._id === g._id)
                      ? "Unselect"
                      : "Select"}
                  </Button>

                  <Button
                    onClick={async () => {
                      await deleteChallengeBodyfocus(g._id);
                      setSelectedBodyFocus((prev) =>
                        prev.filter((item) => item._id !== g._id)
                      );
                      fetchDataV2();
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                    danger
                  >
                    Delete
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle("Update Body Focus");
                      setSelectedItemForUpdate(g);
                      setEditItemNameModalVisible(true);
                    }}
                  >
                    Edit
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        onCancel={() => setGoalsModal(false)}
        footer={false}
        visible={goalsModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">All Body Focus</p>
        <div style={{ height: "200px", overflow: "auto", marginTop: "10px" }}>
          <List
            size="small"
            bordered
            dataSource={allGoals}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{g.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      setSelectedGoals((prev) => {
                        const isExist = prev.find((item) => item._id === g._id);
                        if (isExist) {
                          return prev.filter((item) => item._id !== g._id);
                        } else {
                          return [...prev, g];
                        }
                      });
                    }}
                    style={{ marginRight: "10px" }}
                    type="primary"
                  >
                    {selectedGoals.find((item) => item._id === g._id)
                      ? "Unselect"
                      : "Select"}
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      <Modal
        onCancel={() => setTrainerModal(false)}
        footer={false}
        visible={trainerModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">All Trainers</p>
        <div style={{ height: "200px", overflow: "auto", marginTop: "10px" }}>
          <List
            size="small"
            bordered
            dataSource={allTrainers}
            renderItem={(g) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {g.firstName} {g.lastName}
                </span>

                <span>
                  {g._id !== usereDtails._id && (
                    <Button
                      onClick={() => {
                        setSelectedTrainers((prev) => {
                          const isExist = prev.find(
                            (item) => item._id === g._id
                          );
                          if (isExist) {
                            return prev.filter((item) => item._id !== g._id);
                          } else {
                            return [...prev, g];
                          }
                        });
                      }}
                      style={{ marginRight: "10px" }}
                      type="primary"
                    >
                      {seletedTrainers.find((item) => item._id === g._id)
                        ? "Unselect"
                        : "Select"}
                    </Button>
                  )}
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>

      {/* end */}

      {/* main page starts now */}
      <div
        className="trainer-profile-container"
        style={{ background: "#2a2f37" }}
      >
        <div
          className="trainer-profile-container-column1 adminV2-bi-trainer-profile-container-column1"
          onClick={openForThumbnail}
          style={{
            background: `linear-gradient(rgba(23, 30, 39, 0), rgb(23, 30, 39)), url(${process.env.REACT_APP_SERVER}/uploads/${thumbnail?.link})`,
          }}
        >
          <div
            className="profile-box adminV2-bi-profile-box"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="challenge-profile-box-1 adminV2-bi-challenge-profile-box-1">
              <div onClick={openForTrailer}>
                <p className="font-paragraph-white adminV2-bi-trailername">
                  {videoThumbnail ? videoThumbnail.link : "Add Trailer"}
                </p>
                <img
                  src={ChallengeProfileSubtract}
                  alt=""
                  onClick={openTailerPlayer}
                  style={{ cursor: "pointer" }}
                />
              </div>
              <input
                placeholder="Challenge Name"
                className="font-heading-white adminV2-bi-input"
                onChange={(e) => setChallengeName(e.target.value)}
                value={challengeName}
              />
            </div>
            <div className="challenge-profile-box-2 adminV2-bi-challenge-profile-box-2">
              <div className="challenge-profile-box-2-info">
                <Select
                  defaultValue="high"
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e)}
                  className="font-paragraph-white adminV2-bi-input"
                >
                  <Select.Option value="high">High</Select.Option>
                  <Select.Option value="medium">Medium</Select.Option>
                  <Select.Option value="low">Low</Select.Option>
                </Select>

                <input
                  placeholder="Duration in minutes"
                  className="font-paragraph-white adminV2-bi-input"
                  onChange={(e) => setDuration(e.target.value)}
                  value={duration}
                  type="number"
                />
              </div>

              <textarea
                rows={4}
                placeholder="Add challenge description"
                className="font-paragraph-white adminV2-bi-input"
                onChange={(e) => setChallengeDescription(e.target.value)}
                value={challengeDescription}
                style={{ height: "auto", width: "100%", resize: "vertical" }} // Optional: Allow resizing vertically
              />
            </div>
          </div>
        </div>
        <div className="trainer-profile-container-column2">
          {/* trainers */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              <T>challenge_profile.trainers</T>
            </div>

            <div className="challenge-trainers-container">
              {seletedTrainers.map((trainer) => (
                <div
                  className="challenge-trainer-box"
                  style={{ background: "#283443", position: "relative" }}
                >
                  <span
                    style={{
                      backgroundImage: `url(${process.env.REACT_APP_SERVER}/uploads/${trainer.avatarLink})`,
                      backgroundPosition: "center center",
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      height: "50px",
                      width: "60px",
                    }}
                  ></span>

                  <a
                    href={`/trainer/${slug(trainer.firstName)}/${trainer._id}`}
                    target="_blank"
                    rel="noopener noreferrer" // For security reasons
                    className="challenge-trainer-box-text font-paragraph-white"
                  >
                    {trainer.firstName + " " + trainer.lastName}
                  </a>
                  {trainer._id !== usereDtails._id && (
                    <DeleteFilled
                      onClick={() => {
                        const newSelectedFitnessInterest =
                          seletedTrainers.filter(
                            (item) => item._id !== trainer._id
                          );
                        setSelectedTrainers(newSelectedFitnessInterest);
                      }}
                      style={{
                        color: "#ff7700",
                        fontSize: "16px",
                        position: "absolute",
                        right: "20px",
                        cursor: "pointer",
                        zIndex: "9999",
                      }}
                    />
                  )}
                </div>
              ))}

              <AddNewButton style={{ margin: "5px" }} onClick={onAddTrainer} />
            </div>
          </div>
          {/* fitness interest */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              FITNESS INTERESTS
            </div>
            <div className="trainer-profile-goals-container">
              {selectedFitnessInterest.map((interest) => (
                <div
                  className="trainer-profile-goal font-paragraph-white"
                  style={{
                    marginRight: "1px",
                    background: "#283443",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  key={interest._id}
                >
                  <span>{interest.name}</span>
                  <DeleteFilled
                    onClick={() => {
                      const newSelectedFitnessInterest =
                        selectedFitnessInterest.filter(
                          (item) => item !== interest
                        );
                      setSelectedFitnessInterest(newSelectedFitnessInterest);
                    }}
                    style={{
                      color: "#ff7700",
                      fontSize: "14px",
                      marginLeft: "5px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}

              <AddNewButton
                onClick={onAddFitnessInterests}
                type="small"
                style={{
                  marginLeft: "10px",
                  height: "36px",
                  marginTop: "5px",
                }}
              />
            </div>
          </div>
          {/* body focus */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              BODY FOCUS
            </div>
            <div className="trainer-profile-goals-container">
              {selectedBodyFocus.map((interest) => (
                <div
                  className="trainer-profile-goal font-paragraph-white"
                  style={{
                    marginRight: "1px",
                    background: "#283443",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  key={interest._id}
                >
                  <span>{interest.name}</span>
                  <DeleteFilled
                    onClick={() => {
                      const newSelectedFitnessInterest =
                        selectedBodyFocus.filter(
                          (item) => item._id !== interest._id
                        );
                      setSelectedBodyFocus(newSelectedFitnessInterest);
                    }}
                    style={{
                      color: "#ff7700",
                      fontSize: "14px",
                      marginLeft: "5px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}

              <AddNewButton
                onClick={onAddBodyFocus}
                type="small"
                style={{
                  marginLeft: "10px",
                  height: "36px",
                  marginTop: "5px",
                }}
              />
            </div>
          </div>
          {/* goals */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              GOALS
            </div>
            <div className="trainer-profile-goals-container">
              {selectedGoals.map((interest) => (
                <div
                  className="trainer-profile-goal font-paragraph-white"
                  style={{
                    marginRight: "1px",
                    background: "#283443",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  key={interest._id}
                >
                  <span>{interest.name}</span>
                  <DeleteFilled
                    onClick={() => {
                      const newSelectedFitnessInterest =
                        selectedBodyFocus.filter(
                          (item) => item._id !== interest._id
                        );
                      setSelectedGoals(newSelectedFitnessInterest);
                    }}
                    style={{
                      color: "#ff7700",
                      fontSize: "14px",
                      marginLeft: "5px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              ))}

              <AddNewButton
                onClick={onAddGoals}
                type="small"
                style={{
                  marginLeft: "10px",
                  height: "36px",
                  marginTop: "5px",
                }}
              />
            </div>
          </div>
          {/* results */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              RESULTS
            </div>
            <div>
              <textarea
                rows={3}
                placeholder="Enter challenge result"
                className="font-paragraph-white adminV2-bi-input"
                onChange={(e) => setResult(e.target.value)}
                value={result}
                style={{ height: "auto", width: "100%", resize: "vertical" }} // Optional: Allow resizing vertically
              />
            </div>
          </div>
          {/* info */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              INFO
            </div>

            {challengeInfo &&
              challengeInfo.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="trainer-profile-goals-container"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "nowrap",
                    }}
                  >
                    <input
                      style={{
                        marginTop: "10px",
                      }}
                      className="font-paragraph-white adminV2-bi-input"
                      placeholder="Add info"
                      onChange={(e) => {
                        const newChallengeInfo = [...challengeInfo];
                        newChallengeInfo[index] = e.target.value;
                        setChallengeInfo(newChallengeInfo);
                      }}
                      value={item}
                    />
                    <DeleteFilled
                      onClick={() => {
                        const newChallengeInfo = [...challengeInfo];
                        newChallengeInfo.splice(index, 1);
                        setChallengeInfo(newChallengeInfo);
                      }}
                      style={{
                        color: "#ff7700",
                        fontSize: "20px",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                );
              })}
            <div>
              {/* add body focus here */}
              <AddNewButton
                onClick={onAddInfo}
                type="big"
                style={{
                  marginTop: "10px",
                }}
              />
            </div>
          </div>
          {/* personal journey */}
          <div className="trainer-profile-goals">
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              YOUR PERSONAL JOURNEY
            </div>
            <div>
              <Collapse
                defaultActiveKey={[]}
                onChange={(e) => setShowChangePanel(e)}
                style={{
                  backgroundColor: "#171e27",
                  marginTop: "10px",
                  padding: "10px",
                }}
              >
                {weeks &&
                  weeks.map((w, i) => (
                    <Collapse.Panel
                      showArrow={false}
                      style={{
                        backgroundColor: "#1b2632",
                        marginBottom: "5px",
                      }}
                      header={
                        <>
                          <input
                            style={{
                              fontSize: "13px",
                              backgroundColor: "#f37720",
                              padding: "0px",
                              width: "120px",
                              margin: "0 0 12px 5px",
                            }}
                            className="adminV2-bi-input font-paragraph-white"
                            value={w.weekName}
                            placeholder="Name Group"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onChange={(e) => {
                              const newWeeks = [...weeks];
                              newWeeks[i].weekName = e.target.value;
                              setWeeks(newWeeks);
                            }}
                          />

                          <div
                            style={{
                              fontWeight: "500",
                              fontSize: "16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",

                              textTransform: "uppercase",
                            }}
                            className="font-paragraph-white"
                          >
                            <input
                              style={{
                                fontSize: "13px",
                                maxWidth: "300px",
                                margin: "0 0 12px 5px",
                              }}
                              className="adminV2-bi-input font-paragraph-white"
                              value={w.weekSubtitle}
                              placeholder="Add Description"
                              onChange={(e) => {
                                const newWeeks = [...weeks];
                                newWeeks[i].weekSubtitle = e.target.value;
                                setWeeks(newWeeks);
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            />
                            <span>
                              {showChangePanel.includes(`${i + 1}`) ? (
                                <UpOutlined style={{ color: "#ff7700" }} />
                              ) : (
                                <DownOutlined style={{ color: "#ff7700" }} />
                              )}
                            </span>
                          </div>
                          <div
                            style={{
                              position: "absolute",
                              right: "20px",
                              top: "10px",
                            }}
                          >
                            <DeleteFilled
                              onClick={() => {
                                const newWeek = weeks.filter(
                                  (item) => item.id !== w.id
                                );
                                setWeeks(newWeek);
                              }}
                              style={{
                                color: "#ff7700",
                                fontSize: "20px",
                                cursor: "pointer",
                              }}
                            />
                            <CopyOutlined
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateWeek(w);
                              }}
                              style={{
                                color: "#fff",
                                fontSize: "20px",
                                cursor: "pointer",
                                marginLeft: "10px",
                              }}
                            />
                          </div>
                        </>
                      }
                      key={i + 1}
                    >
                      <div className="trainer-profile-goals-container">
                        {w.workouts &&
                          w.workouts.map((workout) => (
                            <div
                              className="challenge-profile-comment font-paragraph-white"
                              key={workout.id}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                backgroundColor: "#2A2F368C",
                                position: "relative",
                              }}
                            >
                              <input
                                style={{
                                  fontSize: "13px",
                                  padding: "5px",
                                  width: "200px",
                                  margin: "0 0 12px 5px",
                                }}
                                className="adminV2-bi-input font-paragraph-white"
                                value={workout.title}
                                placeholder="Add Workout Title"
                                onChange={(e) => {
                                  const newWeeks = [...weeks];
                                  const weekIndex = newWeeks.findIndex(
                                    (week) => week.id === w.id
                                  );
                                  if (weekIndex !== -1) {
                                    const workoutIndex = newWeeks[
                                      weekIndex
                                    ].workouts.findIndex(
                                      (item) => item.id === workout.id
                                    );
                                    if (workoutIndex !== -1) {
                                      newWeeks[weekIndex].workouts[
                                        workoutIndex
                                      ].title = e.target.value;
                                      setWeeks(newWeeks);
                                    }
                                  }
                                }}
                              />
                              <input
                                style={{
                                  fontSize: "13px",
                                  padding: "5px",
                                  width: "250px",
                                  margin: "0 0 12px 5px",
                                }}
                                className="adminV2-bi-input font-paragraph-white"
                                value={workout.subtitle}
                                placeholder="Add More Info"
                                onChange={(e) => {
                                  const newWeeks = [...weeks];
                                  const weekIndex = newWeeks.findIndex(
                                    (week) => week.id === w.id
                                  );
                                  if (weekIndex !== -1) {
                                    const workoutIndex = newWeeks[
                                      weekIndex
                                    ].workouts.findIndex(
                                      (item) => item.id === workout.id
                                    );
                                    if (workoutIndex !== -1) {
                                      newWeeks[weekIndex].workouts[
                                        workoutIndex
                                      ].subtitle = e.target.value;
                                      setWeeks(newWeeks);
                                    }
                                  }
                                }}
                              />

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <Checkbox
                                  style={{
                                    color: "#fff",
                                    fontSize: "13px",
                                    margin: "0 0 12px 5px",
                                  }}
                                  checked={workout.renderWorkout}
                                  onChange={(e) => {
                                    const newWeeks = [...weeks];
                                    const weekIndex = newWeeks.findIndex(
                                      (week) => week.id === w.id
                                    );
                                    if (weekIndex !== -1) {
                                      const workoutIndex = newWeeks[
                                        weekIndex
                                      ].workouts.findIndex(
                                        (item) => item.id === workout.id
                                      );
                                      if (workoutIndex !== -1) {
                                        newWeeks[weekIndex].workouts[
                                          workoutIndex
                                        ].renderWorkout = e.target.checked;
                                        setWeeks(newWeeks);
                                      }
                                    }
                                  }}
                                >
                                  Render Workout
                                </Checkbox>

                                <div
                                  style={{
                                    background: "#344150B0",
                                    padding: "10px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    setShowVideoCreator(true);
                                    setSelectedWorkoutForStudioId({
                                      workoutId: workout.id,
                                      weekId: w.id,
                                    });
                                  }}
                                >
                                  <img src={WorkoutStudioIcon} alt="" />
                                </div>
                              </div>
                              <DeleteFilled
                                onClick={() => {
                                  const newWeeks = [...weeks];
                                  const weekIndex = newWeeks.findIndex(
                                    (week) => week._id === w._id
                                  );
                                  if (weekIndex !== -1) {
                                    const workoutIndex = newWeeks[
                                      weekIndex
                                    ].workouts.findIndex(
                                      (item) => item._id === workout._id
                                    );
                                    if (workoutIndex !== -1) {
                                      newWeeks[weekIndex].workouts.splice(
                                        workoutIndex,
                                        1
                                      );
                                      setWeeks(newWeeks);
                                    }
                                  }
                                }}
                                style={{
                                  color: "#ff7700",
                                  fontSize: "20px",
                                  cursor: "pointer",
                                  position: "absolute",
                                  right: "20px",
                                  top: "10px",
                                }}
                              />
                            </div>
                          ))}
                        <AddNewButton
                          style={{
                            margin: "5px",
                            backgroundColor: "#2A2F368C",
                            padding: "5px",
                            width: "100%",
                          }}
                          onClick={() => onAddWorkout(w._id || w.id)}
                          type="big"
                        />
                      </div>
                    </Collapse.Panel>
                  ))}
              </Collapse>

              <AddNewButton onClick={onAddWeek} type="big" />
            </div>
          </div>
          {/* subscription */}
          <>
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{ color: "#72777B", textTransform: "uppercase" }}
            >
              SUBSCRIPTION
              <Tooltip placement="top" title={tooltipText}>
                <img src={HelpIcon} alt="" style={{ marginLeft: "5px" }} />
              </Tooltip>
            </div>
            <div className="font-paragraph-white">Choose your prices</div>
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
                <span>
                  <input
                    placeholder="€00"
                    style={{
                      width: "100%",
                      textAlign: "center",
                      margin: "0px auto",
                      height: "40px",
                      marginTop: "-5px",
                      fontSize: "20px",
                    }}
                    prefix={"€"}
                    className="adminV2-bi-input"
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(`${e.target.value}`)}
                  />
                </span>
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
          <button
            style={{
              background: "#f37720",
              color: "white",
              border: "none",
              padding: "10px 20px",
              fontSize: "16px",
              cursor: "pointer",
              marginTop: "20px",
              width: "99%",
              borderRadius: "5px",
              margin: "20px 10px",
            }}
            onClick={() => {
              handleSaveChallenge();
            }}
          >
            Save Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

export default withRouter(BasicInformation);
