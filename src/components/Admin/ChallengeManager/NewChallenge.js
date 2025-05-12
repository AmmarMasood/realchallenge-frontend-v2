import React, { useState, useEffect, useContext } from "react";
import { Tabs, Modal, Button } from "antd";
import NewChallengeMainTab from "./NewChallengeMainTab";
import NewChallengeWorkoutTab from "./NewChallengeWorkoutTab";
import NewChallengeMusicTab from "./NewChallengeMusicTab";
import NewChallengeAdditionalTab from "./NewChallengeAdditionalTab";

import { v4 } from "uuid";

// services
import { getAllChallengeGoals } from "../../../services/createChallenge/goals";
import { getAllChallengeTags } from "../../../services/createChallenge/tags";
import { getAllChallengeEquipments } from "../../../services/createChallenge/equipments";
import { getAllBodyFocus } from "../../../services/createChallenge/bodyFocus";
import { getAllTrainers } from "../../../services/trainers";
import { getAllChallengeProducts } from "../../../services/createChallenge/products";
import {
  createChallenge,
  getAllUserChallenges,
  updateChallenge,
} from "../../../services/createChallenge/main";
import setAuthToken from "../../../helpers/setAuthToken";
import { userInfoContext } from "../../../contexts/UserStore";
import { createPost } from "../../../services/posts";
import slug from "elegant-slug";
import { addChallengeToCustomerDetail } from "../../../services/customer";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

function NewChallenge() {
  // state of main tab strats
  const [name, setName] = useState("");
  const [access, setAccess] = useState([]);
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState(0);
  const [currency, setCurrency] = useState("$");
  const [thumbnail, setThumbnail] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoTrailer, setVideoTrailer] = useState("");
  const [trainers, setTrainers] = useState([]);
  const [allTrainers, setAllTrainers] = useState([]);
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [goals, setGoals] = useState([]);
  const [bodyFocus, setBodyFocus] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [duration, setDuration] = useState("");
  // we get all goals from backend
  const [allGoals, setAllGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  // we get all bodyfocus from backend
  const [allBodyfocus, setAllBodyfocus] = useState([]);

  const [newBodyfocusName, setNewBodyfocusName] = useState("");
  const [showBodyfocusModal, setShowBodyfocusModal] = useState(false);
  //fitness interest
  const [selectedFitnessInterest, setSelectedFitnessInterest] = useState([]);
  // we get all equipments from backend
  const [allEquipments, setAllEquipments] = useState([]);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [equipmentModal, setEquipmentModal] = useState(false);
  const [newDurationName, setNewDurationName] = useState("");
  const [showDurationModal, setShowDurationModal] = useState(false);
  // we get all tags from backend
  const [tags, setTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [newTagName, setNewTagName] = useState("");
  const [showTagModal, setShowTagModal] = useState(false);
  // state of main tab ends

  // state pf the new challenge tab starts
  const [weeks, setWeeks] = useState([]);
  const [addWorkoutModalVisible, setAddWorkoutModalVisible] = useState(false);
  const [workoutModalFullscreen, setWorkoutModalFullscreen] = useState(false);
  const [allProducts, setAllProducts] = useState([
    { id: 1, name: "Carpet" },
    { id: 2, name: "Mat" },
    { id: 3, name: "Dumbell" },
  ]);
  const [products, setProducts] = useState([]);
  //   this is for new workout creation process
  const [workoutToUpdate, setWorkoutToUpdate] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [currentWeek, setCurrentWeek] = useState("");
  const [workoutTitle, setWorkoutTile] = useState("");
  const [workoutSubtitle, setWorkoutSubtile] = useState("");
  const [workoutIntroVideoLength, setWorkoutIntroVideoLength] = useState("");
  const [groupName, setGroupName] = useState("");
  const [infoTitle, setInfoTile] = useState("");
  const [infoFile, setInfoFile] = useState("");
  // const [points, setPoints] = useState(0);
  const [workoutIntroVideoFile, setWorkoutIntroVideoFile] = useState("");
  const [relatedEquipments, setRelatedEquipments] = useState([]);
  const [renderWorkout, setRenderWorkout] = useState(false);
  // this is a rendered workout exercise it wonly takes in full video of the exercise
  const [renderedWorkoutExercises, setRenderWorkoutExercises] = useState([
    {
      exerciseId: v4(),
      exerciseName: "",
      exerciseVideo: "",
    },
  ]);
  // this is a non-rendered workout exercise it will take multiple videos and voiceeover
  const [nonRenderedWorkoutExercises, setNonRenderedWorkoutExercises] =
    useState([
      {
        exerciseId: v4(),
        exerciseName: "",
        exerciseVideo: "",
        videoLength: "",
        voiceOverFile: "",
        breakAfterExercise: "",
        exerciseGroupName: "",
      },
    ]);
  const [musics, setMusics] = useState([]);
  // state of the new cha;llenge ends

  // state for additional inform
  const [results, setResults] = useState("");
  // const [info, setInfo] = useState("");
  const [makePublic, setMakePublic] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [allowReviews, setAllowReviews] = useState(false);
  const [additionalProducts, setAdditionalProducts] = useState([]);
  const [informationList, setInformationList] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  // --------------------
  const [userCreatePost, setUserCreatePost] = useState(false);

  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const { language } = useContext(LanguageContext);
  const [allChallenges, setAllChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState("");

  async function fethData() {
    const bodyFocus = await getAllBodyFocus(language);
    const goals = await getAllChallengeGoals(language);
    const tags = await getAllChallengeTags(language);
    const equipments = await getAllChallengeEquipments(language);
    const trainers = await getAllTrainers(language);
    const products = await getAllChallengeProducts(language);
    const challenges = await getAllUserChallenges(
      language === "dutch" ? "english" : "dutch"
    );

    setAllBodyfocus(bodyFocus.body);
    setAllEquipments(equipments.equipments);
    setAllGoals(goals.challengeGoals);
    setAllTags(tags.tags);
    // console.log("trainers", trainers);
    setAllTrainers(trainers.trainers);
    setAllProducts(products.products);
    setAllChallenges(challenges.challenges);
  }

  useEffect(() => {
    setAuthToken(localStorage.getItem("jwtToken"));
    fethData();
  }, [language]);

  const createChallengeButton = async () => {
    console.log("isRendered", renderWorkout);
    console.log("weeks", weeks);

    const obj = {
      language: language,
      challengeName: name,
      description: description,
      price: price,
      points: points,
      currency: currency,
      thumbnailLink: typeof thumbnail === "object" ? thumbnail.link : "",
      videoThumbnailLink:
        typeof videoThumbnail === "object" ? videoThumbnail.link : "",
      trainers: trainers,
      trainersFitnessInterest: selectedFitnessInterest,
      challengeGoals: goals,
      tags: tags,
      difficulty: difficulty,
      body: bodyFocus,
      access: access,
      duration: duration,
      videoLink: typeof videoTrailer === "object" ? videoTrailer.link : "",
      weeks: weeks.map((week) => {
        var w = { ...week };
        w["weekName"] = week.weekTitle;
        w["weekSubtitle"] = week.weekSubtitle;
        w["workout"] = w.workouts.map((workout) => {
          return {
            title: workout.workoutTitle,
            subtitle: workout.workoutSubtitle,
            infotitle: workout.infoTitle,
            infoFile:
              typeof workout.infoFile === "object" ? workout.infoFile.link : "",
            equipment: workout.relatedEquipments,
            relatedProducts: workout.relatedProducts,
            introVideoLink: workout.workoutIntroVideoFile
              ? workout.workoutIntroVideoFile.link
              : "",
            introVideoLength: workout.workoutIntroVideoLength
              ? workout.workoutIntroVideoLength
              : "",
            isRendered: workout.renderWorkout,
            exercises: workout.renderWorkout
              ? workout.exercises.map((e) => ({
                  exerciseId: e._id,
                  exerciseLength: e.videoLength,
                  break: e.breakAfterExercise,
                  groupName: e.exerciseGroupName,
                }))
              : workout.exercises.map((e) => ({
                  renderedWorkoutExerciseName: e.exerciseName,
                  renderedWorkoutExerciseVideo: e.exerciseVideo,
                })),
          };
        });
        delete w.id;
        delete w.weekId;
        delete w.weekTitle;
        delete w.workouts;
        return w;
      }),
      music: musics.map((m) => ({
        name: m.name,
        url: typeof m.file === "object" ? m.file.link : m.file,
      })),
      additionalProducts: additionalProducts,
      results: results,
      informationList: informationList
        ? informationList.map((i) => ({
            info: i.text,
            icon: i.file ? i.file.link : "",
          }))
        : [],
      allowComments,
      allowReviews,
      isPublic: makePublic,
    };
    console.log("create object", obj);
    if (selectedChallenge) {
      obj.alternativeLanguage = selectedChallenge;
    }
    // return;
    // return;
    const res = await createChallenge(obj);
    console.log("opp===========>", res);

    // console.log(error.response.data);
    // console.log(error.response.status);
    // console.log(error.response.headers);
    if (res && res.weeks) {
      await addChallengeToCustomerDetail(userInfo.id, res.weeks._id);
      userCreatePost && createAPost(res.weeks._id);
      selectedChallenge && updateSelectedChallenge(res.weeks._id);
    }
    console.log("create response", res);
    console.log("userCreatePost", userCreatePost);
  };

  const createAPost = async (id) => {
    const values = {
      title: name,
      text: description,
      image: typeof thumbnail === "object" ? thumbnail.link : "",
      type: "Challenge",
      url: `/challenge/${slug(name)}/${id}`,
      language: language,
    };
    await createPost(values);
    // setCreatePostModalVisible(false);
    // console.log(values);
  };

  const updateSelectedChallenge = async (id) => {
    await updateChallenge({ alternativeLanguage: id }, selectedChallenge);
  };

  return (
    <div>
      {/* ask user to if they want to post challenge */}
      {/* <Modal
        onCancel={() => setCreatePostModalVisible(false)}
        visible={createPostModalVisible}
        footer={false}
        style={{ textAlign: "center" }}
      >
        <h1 className="font-heading-white">
          Create a post about your challenge?
        </h1>
        <Button
          className="common-orange-button font-paragraph-white"
          onClick={() => createAPost()}
          style={{ padding: "5px 10px" }}
        >
          Create a Post
        </Button>
      </Modal> */}
      <h2 className="font-heading-black">
        <T>adminDashboard.challenges.new</T>
      </h2>
      <div className="newchallenge-creator-container">
        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Main" key="1">
            <NewChallengeMainTab
              allChallenges={allChallenges}
              selectedChallenge={selectedChallenge}
              setSelectedChallenge={setSelectedChallenge}
              name={name}
              setName={setName}
              access={access}
              setAccess={setAccess}
              price={price}
              points={points}
              setPrice={setPrice}
              selectedFitnessInterest={selectedFitnessInterest}
              setSelectedFitnessInterest={setSelectedFitnessInterest}
              setPoints={setPoints}
              currency={currency}
              setCurrency={setCurrency}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              videoThumbnail={videoThumbnail}
              setVideoThumbnail={setVideoThumbnail}
              videoTrailer={videoTrailer}
              setVideoTrailer={setVideoTrailer}
              trainers={trainers}
              setTrainers={setTrainers}
              allTrainers={allTrainers}
              setAllTrainers={setAllTrainers}
              description={description}
              setDescription={setDescription}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              goals={goals}
              setGoals={setGoals}
              bodyFocus={bodyFocus}
              setBodyFocus={setBodyFocus}
              equipments={equipments}
              setEquipments={setEquipments}
              duration={duration}
              setDuration={setDuration}
              allGoals={allGoals}
              setAllGoals={setAllGoals}
              newGoalName={newGoalName}
              setNewGoalName={setNewGoalName}
              showGoalModal={showGoalModal}
              setShowGoalModal={setShowGoalModal}
              allBodyfocus={allBodyfocus}
              setAllBodyfocus={setAllBodyfocus}
              newBodyfocusName={newBodyfocusName}
              setNewBodyfocusName={setNewBodyfocusName}
              showBodyfocusModal={showBodyfocusModal}
              setShowBodyfocusModal={setShowBodyfocusModal}
              allEquipments={allEquipments}
              setAllEquipments={setAllEquipments}
              newEquipmentName={newEquipmentName}
              setNewEquipmentName={setNewEquipmentName}
              equipmentModal={equipmentModal}
              setEquipmentModal={setEquipmentModal}
              newDurationName={newDurationName}
              setNewDurationName={setNewDurationName}
              showDurationModal={showDurationModal}
              setShowDurationModal={setShowDurationModal}
              tags={tags}
              setTags={setTags}
              allTags={allTags}
              setAllTags={setAllTags}
              newTagName={newTagName}
              setNewTagName={setNewTagName}
              showTagModal={showTagModal}
              setShowTagModal={setShowTagModal}
            />
          </TabPane>
          <TabPane tab="Workouts" key="2">
            <NewChallengeWorkoutTab
              weeks={weeks}
              setWeeks={setWeeks}
              addWorkoutModalVisible={addWorkoutModalVisible}
              setAddWorkoutModalVisible={setAddWorkoutModalVisible}
              workoutModalFullscreen={workoutModalFullscreen}
              setWorkoutModalFullscreen={setWorkoutModalFullscreen}
              allProducts={allProducts}
              setAllProducts={setAllProducts}
              setProducts={setProducts}
              allEquipments={allEquipments}
              setAllEquipments={setAllEquipments}
              workoutToUpdate={workoutToUpdate}
              setWorkoutToUpdate={setWorkoutToUpdate}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              currentWeek={currentWeek}
              setCurrentWeek={setCurrentWeek}
              workoutTitle={workoutTitle}
              setWorkoutTile={setWorkoutTile}
              workoutSubtitle={workoutSubtitle}
              workoutIntroVideoLength={workoutIntroVideoLength}
              setWorkoutIntroVideoLength={setWorkoutIntroVideoLength}
              setWorkoutSubtile={setWorkoutSubtile}
              groupName={groupName}
              setGroupName={setGroupName}
              infoTitle={infoTitle}
              setInfoTile={setInfoTile}
              infoFile={infoFile}
              setInfoFile={setInfoFile}
              workoutIntroVideoFile={workoutIntroVideoFile}
              setWorkoutIntroVideoFile={setWorkoutIntroVideoFile}
              relatedProducts={relatedProducts}
              setRelatedProducts={setRelatedProducts}
              relatedEquipments={relatedEquipments}
              setRelatedEquipments={setRelatedEquipments}
              renderWorkout={renderWorkout}
              setRenderWorkout={setRenderWorkout}
              renderedWorkoutExercises={renderedWorkoutExercises}
              setRenderWorkoutExercises={setRenderWorkoutExercises}
              nonRenderedWorkoutExercises={nonRenderedWorkoutExercises}
              setNonRenderedWorkoutExercises={setNonRenderedWorkoutExercises}
              trainers={trainers}
            />
          </TabPane>
          <TabPane tab="Music" key="3">
            <NewChallengeMusicTab musics={musics} setMusics={setMusics} />
          </TabPane>
          <TabPane tab="Additional" key="4">
            <NewChallengeAdditionalTab
              results={results}
              setResults={setResults}
              allProducts={allProducts}
              setAllProducts={setAllProducts}
              makePublic={makePublic}
              setMakePublic={setMakePublic}
              allowComments={allowComments}
              setAllowComments={setAllowComments}
              allowReviews={allowReviews}
              setAllowReviews={setAllowReviews}
              additionalProducts={additionalProducts}
              setAdditionalProducts={setAdditionalProducts}
              informationList={informationList}
              setInformationList={setInformationList}
              createChallenge={createChallengeButton}
              userCreatePost={userCreatePost}
              setUserCreatePost={setUserCreatePost}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default NewChallenge;
