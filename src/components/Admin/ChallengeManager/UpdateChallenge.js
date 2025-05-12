import React, { useState, useEffect, useContext } from "react";
import { Tabs, Modal, Button, Form } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
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
  getAllChallenges,
  getAllUserChallenges,
  updateChallenge,
} from "../../../services/createChallenge/main";
import setAuthToken from "../../../helpers/setAuthToken";
import { userInfoContext } from "../../../contexts/UserStore";
import { createPost } from "../../../services/posts";
import { LanguageContext } from "../../../contexts/LanguageContext";

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}

function UpdateChallenge({ selectedChallengeForUpdate, setCurrentSelection }) {
  const [form] = Form.useForm();
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

  //fitness interest
  const [selectedFitnessInterest, setSelectedFitnessInterest] = useState([]);

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
  const [groupName, setGroupName] = useState("");
  const [infoTitle, setInfoTile] = useState("");
  const [infoFile, setInfoFile] = useState("");
  // const [points, setPoints] = useState(0);
  const [workoutIntroVideoFile, setWorkoutIntroVideoFile] = useState("");
  const [workoutIntroVideoLength, setWorkoutIntroVideoLength] = useState("");
  const [relatedEquipments, setRelatedEquipments] = useState([]);
  const [renderWorkout, setRenderWorkout] = useState(false);
  const [workoutIdsThatNeedToBeUpdated, setWorkoutIdsThatNeedToBeUpdated] =
    useState([]);
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
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [weeksToBeUpdated, setWeeksToBeUpdated] = useState([]);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  //
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [allChallenges, setAllChallenges] = useState([]);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    setAuthToken(localStorage.getItem("jwtToken"));
    addStuffToMainTabForm();
  }, []);

  useEffect(() => {
    fethData();
  }, []);
  const addStuffToMainTabForm = () => {
    console.log("selected challenge", selectedChallengeForUpdate);
    const {
      challengeName,
      description,
      price,
      points,
      currency,
      thumbnailLink,
      videoThumbnailLink,
      videoLink,
      trainers,
      access,
      difficulty,
      challengeGoals,
      tags,
      body,
      duration,
      music,
      additionalProducts,
      results,
      allowComments,
      allowReviews,
      isPublic,
      informationList,
      weeks,
      trainersFitnessInterest,
      alternativeLanguage,
    } = selectedChallengeForUpdate;

    console.log(selectedChallengeForUpdate);
    // return;
    alternativeLanguage && setSelectedChallenge(alternativeLanguage._id);
    setName(challengeName);
    setAccess(access);
    setPrice(price);
    setPoints(points);
    setCurrency(currency);
    setThumbnail({ name: thumbnailLink, link: thumbnailLink });
    setVideoThumbnail({ name: videoThumbnailLink, link: videoThumbnailLink });
    setVideoTrailer({ name: videoLink, link: videoLink });
    setTrainers(trainers.map((t) => t._id));
    setDescription(description);
    setDifficulty(difficulty);
    setSelectedFitnessInterest(trainersFitnessInterest.map((t) => t._id));
    setGoals(challengeGoals);
    setBodyFocus(body.map((t) => t._id));
    setDuration(duration);
    setTags(tags.map((t) => t._id));
    setMusics(
      music
        ? music.map((m) => ({
            _id: m._id,
            musicId: m._id,
            file: { name: m.url, link: m.url },
            name: m.name,
          }))
        : []
    );
    setAdditionalProducts(additionalProducts.map((t) => t._id));
    setResults(results);
    setAllowComments(allowComments);
    setAllowReviews(allowReviews);
    setMakePublic(isPublic);
    setInformationList(
      informationList.map((j) => ({
        _id: j._id,
        id: j._id,
        text: j.info,
        file: { link: j.icon },
      }))
    );
    setWeeksToBeUpdated(weeks);
    // setWeeks(weeks);
    console.log("checking ammar", weeks);
    const w = weeks.map((week) => ({
      _id: week._id,
      id: week._id,
      weekId: week._id,
      weekTitle: week.weekName ? week.weekName : "",
      weekSubtitle: week.weekSubtitle ? week.weekSubtitle : "",
      workouts: week.workouts.map((workout) => ({
        _id: workout._id,
        workoutId: workout._id,
        workoutTitle: workout.title ? workout.title : "",
        workoutSubtitle: workout.subtitle ? workout.subtitle : "",
        renderWorkout: workout.isRendered ? workout.isRendered : false,
        workoutIntroVideoFile: workout.introVideoLink
          ? {
              name: workout.introVideoLink,
              link: workout.introVideoLink,
            }
          : { name: "", link: "" },
        workoutIntroVideoLength: workout.introVideoLength
          ? workout.introVideoLength
          : "",
        relatedProducts: workout.relatedProducts
          ? workout.relatedProducts.map((t) => t._id)
          : "",
        relatedEquipments: workout.relatedEquipments
          ? workout.relatedEquipments.map((t) => t._id)
          : "",
        infoTitle: workout.infoTitle ? workout.infoTitle : "",
        infoFile: workout.infoFile
          ? { name: workout.infoFile, link: workout.infoFile }
          : "",
        groupName: workout.groupName ? workout.groupName : "",
        exercises: workout.isRendered
          ? workout.exercises.map((e) => ({
              _id: e?._id,
              exerciseId: e?.exerciseId?._id,
              exerciseName: e?.exerciseId?.title ? e?.exerciseId?.title : "",
              exerciseVideo: e?.exerciseId?.videoURL,
              voiceOverFile: e?.exerciseId?.voiceOverLink,
              videoLength: e?.exerciseLength ? e?.exerciseLength : "",
              exerciseGroupName: e?.groupName ? e?.groupName : "",
              breakAfterExercise: e?.break ? e?.break : "",
            }))
          : workout.exercises.map((e) => ({
              exerciseName: e?.renderedWorkoutExerciseName,
              exerciseVideo: e?.renderedWorkoutExerciseVideo,
            })),
      })),
    }));
    setWeeks(w);

    form.setFieldsValue({
      challengeName,
      description,
      price,
      points,
      currency: currency,
      access: access,
      duration,
      goals: challengeGoals,
    });
  };
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

  // const updateWorkouts = (weeks) => {
  //   weeks.map((week) => {
  //     week.workout.map(async (workout) => {
  //       await updateWorkout(workout, workout._id);
  //     });
  //   });
  // };
  const parseWeeksForBackend = (weeks) => {
    const w = weeks.map((week) => {
      let g = {
        ...week,
        weekName: week.weekTitle,
        weekSubtitle: week.weekSubtitle,
        workouts: week.workouts
          .map((wo) => wo._id)
          .filter(function (el) {
            return el !== undefined && el !== null;
          }),
      };
      workoutIdsThatNeedToBeUpdated
        .map((woId) => {
          if (g._id === woId.weelId || g.weekId === woId.weelId) {
            g.workouts = [...g.workouts, woId.workout];
          }
        })
        .filter(function (el) {
          return el !== undefined && el !== null;
        });
      console.log(g);
      return g;
    });

    console.log(w);
    return w;
  };
  const updateChallengeButton = async () => {
    const obj = {
      challengeName: name,
      description: description,
      price: price,
      points: points,
      currency: currency,
      thumbnailLink: typeof thumbnail === "object" ? thumbnail.link : "",
      videoThumbnailLink:
        typeof videoThumbnail === "object" ? videoThumbnail.link : "",
      trainers: trainers,
      challengeGoals: goals,
      trainersFitnessInterest: selectedFitnessInterest,
      tags: tags,
      body: bodyFocus,
      access: access,
      duration: duration,
      difficulty: difficulty,
      videoTrailer: typeof videoTrailer === "object" ? videoTrailer.link : "",
      weeks: parseWeeksForBackend(weeks),
      music: musics.map((m) => ({
        ...m,
        name: m.name,
        url: typeof m.file === "object" ? m.file.link : m.file,
      })),
      additionalProducts: additionalProducts,
      results: results,
      informationList: informationList
        ? informationList.map((i) => ({
            ...i,
            info: i.text,
            icon: i.file ? i.file.link : "",
          }))
        : [],
      allowComments,
      allowReviews,
      isPublic: makePublic,
      alternativeLanguage: selectedChallenge ? selectedChallenge : null,
    };
    console.log("JASON", obj, selectedChallengeForUpdate._id);
    // return;
    const res = await updateChallenge(obj, selectedChallengeForUpdate._id);
    selectedChallenge &&
      (await updateChallenge(
        { alternativeLanguage: selectedChallengeForUpdate._id },
        selectedChallenge
      ));
    console.log("response", res);
    console.log("weeks", workoutIdsThatNeedToBeUpdated);
    // updateWorkouts(obj.weeks);
    // if (res) {
    //   setCreatePostModalVisible(true);
    // }
    console.log(obj);
  };

  const createAPost = async () => {
    const values = {
      title: name,
      text: description,
      image: typeof thumbnail === "object" ? thumbnail.link : "",
      type: "Challenge",
    };
    await createPost(values);
    setCreatePostModalVisible(false);
    // console.log(values);
  };

  return (
    <div>
      {/* ask user to if they want to post challenge */}
      <Modal
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
      </Modal>
      <h2 className="font-heading-black">
        <ArrowLeftOutlined
          onClick={() => setCurrentSelection(6.1)}
          style={{ fontSize: "30px", cursor: "pointer", marginRight: "10px" }}
        />
        Update Challenge
        <Button
          className="font-paragraph-white"
          style={{
            backgroundColor: "var(--color-orange)",
            border: "none",
            marginTop: "10px",
            marginRight: "30px",
            float: "right",
          }}
          onClick={updateChallengeButton}
        >
          Update Challenge
        </Button>
      </h2>

      <div className="newchallenge-creator-container">
        <p>Language: {selectedChallengeForUpdate?.language}</p>
        <Tabs defaultActiveKey="1" onChange={callback}>
          <TabPane tab="Main" key="1">
            <NewChallengeMainTab
              allChallenges={allChallenges}
              selectedChallenge={selectedChallenge}
              setSelectedChallenge={setSelectedChallenge}
              form={form}
              selectedFitnessInterest={selectedFitnessInterest}
              setSelectedFitnessInterest={setSelectedFitnessInterest}
              id={selectedChallengeForUpdate._id}
              name={name}
              setName={setName}
              access={access}
              setAccess={setAccess}
              price={price}
              points={points}
              setPrice={setPrice}
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
              update={true}
            />
          </TabPane>
          <TabPane tab="Workouts" key="2">
            <NewChallengeWorkoutTab
              weeksToBeUpdated={weeksToBeUpdated}
              update={true}
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
              setWorkoutSubtile={setWorkoutSubtile}
              groupName={groupName}
              setGroupName={setGroupName}
              infoTitle={infoTitle}
              setInfoTile={setInfoTile}
              infoFile={infoFile}
              setInfoFile={setInfoFile}
              workoutIntroVideoFile={workoutIntroVideoFile}
              setWorkoutIntroVideoFile={setWorkoutIntroVideoFile}
              workoutIntroVideoLength={workoutIntroVideoLength}
              setWorkoutIntroVideoLength={setWorkoutIntroVideoLength}
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
              setWorkoutIdsThatNeedToBeUpdated={
                setWorkoutIdsThatNeedToBeUpdated
              }
              workoutIdsThatNeedToBeUpdated={workoutIdsThatNeedToBeUpdated}
              // updateWorkouts={updateWorkouts}
            />
          </TabPane>
          <TabPane tab="Music" key="3">
            <NewChallengeMusicTab
              musics={musics}
              setMusics={setMusics}
              update={true}
            />
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
              // createChallenge={createChallengeButton}
              update={true}
              updateChallenge={updateChallengeButton}
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}

export default UpdateChallenge;
