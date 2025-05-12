import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Collapse,
  Button,
  Input,
  Modal,
  message,
  Select,
  Checkbox,
  List,
} from "antd";
import { v4 } from "uuid";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowsAltOutlined,
  ShrinkOutlined,
  CloseSquareOutlined,
} from "@ant-design/icons";
// panels
import CustomWeekPanel from "./NewChallengeWorkoutCollapse/CustomWeekPanel";
import {
  createChallengeEquipment,
  getAllChallengeEquipments,
  deleteChallengeEquipment,
} from "../../../services/createChallenge/equipments";
import {
  getAllProdcuts,
  removeProduct,
  createProducts,
} from "../../../services/shop";
import {
  updateWorkoutOnBackend,
  createWorkout,
  getAllExercises,
} from "../../../services/createChallenge/main";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import EditTypeName from "./EditTypeName";
import { LanguageContext } from "../../../contexts/LanguageContext";

const { Panel } = Collapse;
const { Option } = Select;

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
});

function NewChallengeWorkoutTab({
  weeksToBeUpdated,
  weeks,
  setWeeks,
  addWorkoutModalVisible,
  setAddWorkoutModalVisible,
  workoutModalFullscreen,
  setWorkoutModalFullscreen,
  allProducts,
  setAllProducts,
  setProducts,
  allEquipments,
  setAllEquipments,
  workoutToUpdate,
  setWorkoutToUpdate,
  currentStep,
  setCurrentStep,
  currentWeek,
  setCurrentWeek,
  workoutTitle,
  setWorkoutTile,
  workoutSubtitle,
  setWorkoutSubtile,
  groupName,
  setGroupName,
  infoTitle,
  setInfoTile,
  infoFile,
  setInfoFile,
  workoutIntroVideoFile,
  setWorkoutIntroVideoFile,
  workoutIntroVideoLength,
  setWorkoutIntroVideoLength,
  relatedProducts,
  setRelatedProducts,
  relatedEquipments,
  setRelatedEquipments,
  renderWorkout,
  setRenderWorkout,
  renderedWorkoutExercises,
  setRenderWorkoutExercises,
  nonRenderedWorkoutExercises,
  setNonRenderedWorkoutExercises,
  update,
  setWorkoutIdsThatNeedToBeUpdated,
  workoutIdsThatNeedToBeUpdated,
  trainers,
}) {
  // all exercises
  const [allExercises, setAllExercises] = useState([]);
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [equipmentModal, setEquipmentModal] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState("");

  const workoutModalRef = useRef(null);
  const { language } = useContext(LanguageContext);

  // for updating equpments

  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  useEffect(() => {
    // const responses = console.log("need updateing", update);
    // console.log("data", weeksToBeUpdated);
    fetchExercises();
  }, [trainers]);

  const fetchExercises = async () => {
    const allExe = await getAllExercises(language);
    const g = allExe.exercises.map((e) => ({ ...e, trainer: e.trainer._id }));
    var e = trainers ? g.filter((f) => trainers.includes(f.trainer)) : g;
    console.log("eee", e, allExe, trainers);
    setAllExercises(e);
  };

  const nonRenderedWorkoutExercise = {
    exerciseId: v4(),
    exerciseName: "",
    exerciseVideo: "",
    videoLength: "",
    voiceOverFile: "",
    exerciseGroupName: "",
  };

  const newWeek = {
    id: Math.floor(Math.random() * 100),
    weekId: v4(),
    weekTitle: "",
    weekSubtitle: "",
    workouts: [],
  };

  const fethData = async () => {
    const data = await getAllChallengeEquipments(language);
    const products = await getAllProdcuts(language);
    setAllProducts(products.products);
    setAllEquipments(data.equipments);
  };

  const removeItem = async (id) => {
    await deleteChallengeEquipment(id);
    fethData();
  };

  const rmProduct = async (id) => {
    await removeProduct(id);
    fethData();
  };
  const handleWeekNameChange = (id, value) => {
    let w = [...weeks];
    w = w.map((i) => {
      if (i.weekId === id) {
        i.weekTitle = value;
      }
      return i;
    });
    setWeeks(w);
  };

  const handleWeekSubtitleChange = (id, value) => {
    let w = [...weeks];
    w = w.map((i) => {
      if (i.weekId === id) {
        i.weekSubtitle = value;
      }
      return i;
    });
    setWeeks(w);
  };

  const checkForWorkout = () => {
    let q = weeks.map((week) => week.workouts).flat();
    q = q.map((j) => j.workoutId);
    return q.includes(workoutToUpdate);
  };

  const updateWorkoutOnTheBackend = async (workout, type, myWeekId) => {
    console.log("yelloe mello", workout, type);
    // return;
    if (type === "update") {
      const w = workout.map((g) => ({
        exercises: g.renderWorkout
          ? g.exercises.map((e) => ({
              _id: e._id,
              exerciseId: e.exerciseId,
              exerciseLength: e.videoLength,
              break: e.breakAfterExercise,
              groupName: e.exerciseGroupName,
            }))
          : g.exercises.map((e) => ({
              renderedWorkoutExerciseName: e.exerciseName,
              renderedWorkoutExerciseVideo: e.exerciseVideo,
            })),
        isRendered: g.renderWorkout,
        introVideoLink: g.workoutIntroVideoFile.link,
        introVideoLength: g.workoutIntroVideoLength,
        title: g.workoutTitle,
        subtitle: g.workoutSubtitle,
        relatedEquipments: g.relatedEquipments,
        relatedProducts: g.relatedProducts,
        _id: g._id,
        infoFile: g.infoFile ? g.infoFile.link : "",
        infotitle: g.infoTitle,
      }));
      const res = await updateWorkoutOnBackend(w);
      console.log("update workout", res);
    }
    if (type === "new") {
      const w = {
        isRendered: workout.renderWorkout,
        introVideoLink: workout.workoutIntroVideoFile
          ? workout.workoutIntroVideoFile.link
          : "",
        introVideoLength: workout.workoutIntroVideoLength,
        title: workout.workoutTitle,
        subtitle: workout.workoutSubtitle,
        equipment: workout.relatedEquipments,
        relatedProducts: workout.relatedProducts,
        infoFile: workout.infoFile ? workout.infoFile.link : "",
        infotitle: workout.infoTitle,
        exercises: workout.renderWorkout
          ? workout.exercises.map((e) => ({
              exerciseId: e.exerciseId,
              exerciseLength: e.videoLength,
              break: e.breakAfterExercise,
              groupName: e.exerciseGroupName,
            }))
          : workout.exercises.map((e) => ({
              renderedWorkoutExerciseName: e.exerciseName,
              renderedWorkoutExerciseVideo: e.exerciseVideo,
            })),
      };
      const res = await createWorkout(w);
      if (res && res.data) {
        setWorkoutIdsThatNeedToBeUpdated([
          ...workoutIdsThatNeedToBeUpdated,
          { weelId: myWeekId ? myWeekId : currentWeek, workout: res.data },
        ]);
      }
    }
    console.log("here");
  };

  const addWorkoutToWeek = () => {
    console.log("please work ayo", workoutTitle);
    if (workoutTitle.length > 0) {
      // console.log("update", update);
      // check for update and update return if found
      let flag = checkForWorkout();
      console.log(flag);
      // return;
      let w = [];
      if (flag) {
        let q = [...weeks];
        let weekThatContainWorkout = q.filter(
          (week) => week.weekId === currentWeek
        )[0];
        weekThatContainWorkout = weekThatContainWorkout.workouts.map(
          (workout) => {
            if (workout.workoutId === workoutToUpdate) {
              return {
                ...workout,
                workoutTitle,
                workoutSubtitle,
                groupName,
                infoTitle,
                infoFile,
                // points,
                workoutIntroVideoFile,
                workoutIntroVideoLength,
                relatedProducts,
                relatedEquipments,
                renderWorkout,
                exercises: renderWorkout
                  ? nonRenderedWorkoutExercises
                  : renderedWorkoutExercises,
              };
            }
            return workout;
          }
        );
        w = q.map((week) => {
          if (week.weekId === currentWeek) {
            return {
              ...week,
              workouts: weekThatContainWorkout,
            };
          }
          return week;
        });
        console.log("here", update);
        //this function works only when user is in update mode
        update && updateWorkoutOnTheBackend(weekThatContainWorkout, "update");
      } else {
        w = weeks.map((week) => {
          // add a new workout
          if (week.weekId === currentWeek) {
            return {
              ...week,
              workouts: [
                ...week.workouts,
                {
                  workoutId: v4(),
                  workoutTitle,
                  workoutSubtitle,
                  groupName,
                  infoTitle,
                  infoFile,
                  // points,
                  workoutIntroVideoFile,
                  workoutIntroVideoLength,
                  relatedProducts,
                  relatedEquipments,
                  renderWorkout,
                  exercises: renderWorkout
                    ? nonRenderedWorkoutExercises
                    : renderedWorkoutExercises,
                },
              ],
            };
          }
          return week;
        });
        console.log("here", update);
        update &&
          updateWorkoutOnTheBackend(
            {
              workoutId: v4(),
              workoutTitle,
              workoutSubtitle,
              groupName,
              infoTitle,
              infoFile,
              // points,
              workoutIntroVideoFile,
              workoutIntroVideoLength,
              relatedProducts,
              relatedEquipments,
              renderWorkout,
              exercises: renderWorkout
                ? nonRenderedWorkoutExercises
                : renderedWorkoutExercises,
            },
            "new"
          );
      }
      setWorkoutToUpdate("");
      setCurrentStep(0);
      setCurrentWeek("");
      setAddWorkoutModalVisible(false);
      setWorkoutTile("");
      setInfoTile("");
      setInfoFile("");
      // setPoints(0);
      setWorkoutIntroVideoFile("");
      setRelatedProducts([]);
      setRelatedEquipments([]);
      setRenderWorkout(false);
      setRenderWorkoutExercises([
        {
          exerciseId: v4(),
          exerciseName: "",
          exerciseVideo: "",
        },
      ]);
      setNonRenderedWorkoutExercises([
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
      setWeeks(w);
    } else {
      message.error("Please enter workout name!");
    }
  };

  const createWorkoutStep1 = () => (
    <div
      className="new-workout-creator-container-1"
      style={{ height: workoutModalFullscreen ? "60vh" : "100%" }}
    >
      <div>
        <p className="font-paragraph-white">Workout title</p>
        <Input
          value={workoutTitle}
          onChange={(e) => setWorkoutTile(e.target.value)}
        />
      </div>
      <div>
        <p className="font-paragraph-white">Workout Subtitle</p>
        <Input
          value={workoutSubtitle}
          onChange={(e) => setWorkoutSubtile(e.target.value)}
        />
      </div>
      <div>
        <p className="font-paragraph-white">Info title</p>
        <Input
          value={infoTitle}
          onChange={(e) => setInfoTile(e.target.value)}
        />
      </div>
      {/* <div>
        <p className="font-paragraph-white">Points</p>
        <Input
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          type="number"
        />
      </div> */}
      <div>
        <p className="font-paragraph-white">Info File</p>
        <Button
          className="new-workout-creator-container-1-btn font-paragraph-white"
          style={{ marginTop: 0 }}
          onClick={() => {
            setMediaManagerVisible(true);
            setMediaManagerType("docs");
            setMediaManagerActions([infoFile, setInfoFile]);
          }}
          icon={<UploadOutlined />}
        >
          Click to Upload
        </Button>
        <div className="font-paragraph-white" style={{ color: "#ff7700" }}>
          {infoFile.name}{" "}
          {infoFile && (
            <span style={{ cursor: "pointer" }} onClick={() => setInfoFile("")}>
              <DeleteOutlined />
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="font-paragraph-white">Upload Intro Video</p>

        <Button
          className="new-workout-creator-container-1-btn font-paragraph-white"
          style={{ marginTop: 0 }}
          icon={<UploadOutlined />}
          onClick={() => {
            setMediaManagerVisible(true);
            setMediaManagerType("videos");
            setMediaManagerActions([
              workoutIntroVideoFile,
              setWorkoutIntroVideoFile,
            ]);
          }}
        >
          Click to Upload
        </Button>

        <div className="font-paragraph-white" style={{ color: "#ff7700" }}>
          {workoutIntroVideoFile.name}{" "}
          {workoutIntroVideoFile && (
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setWorkoutIntroVideoFile("")}
            >
              <DeleteOutlined />
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="font-paragraph-white">Intro Video Length</p>
        <Input
          value={workoutIntroVideoLength}
          onChange={(e) => setWorkoutIntroVideoLength(e.target.value)}
        />
      </div>
      <div>
        <p className="font-paragraph-white">Select Related Products</p>
        <Select
          mode="multiple"
          showSearch
          style={{ width: "100%" }}
          value={relatedProducts}
          optionFilterProp="children"
          onChange={(e) => setRelatedProducts(e)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {allProducts.map((m, i) => (
            <Option value={m._id}>{m.name}</Option>
          ))}
        </Select>
      </div>
      <div>
        <p className="font-paragraph-white">Select Related Equipments</p>
        <Select
          mode="multiple"
          showSearch
          value={relatedEquipments}
          style={{ width: "100%" }}
          optionFilterProp="children"
          onChange={(e) => setRelatedEquipments(e)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {allEquipments.map((m, i) => (
            <Option value={m._id}>{m.name}</Option>
          ))}
        </Select>
        <Button
          style={{
            backgroundColor: "var(--color-orange)",
            border: "none",
            color: "white",
            marginTop: "5px",
          }}
          onClick={() => setEquipmentModal(true)}
        >
          Manage Equipments
        </Button>
      </div>
      {/* <div>
        <p className="font-paragraph-white">Group Name</p>
        <Input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div> */}
      <div>
        <p className="font-paragraph-white">
          Check if you need to render workout:
        </p>
        <Checkbox
          checked={renderWorkout}
          onChange={(e) => {
            setRenderWorkout(e.target.checked);
          }}
          className="font-paragraph-white"
        >
          Render Workout
        </Checkbox>
      </div>
    </div>
  );

  const handleRenderedWorkoutExerciseName = (rId, value) => {
    if (update) {
      let w = [...renderedWorkoutExercises];
      w[0] = {
        ...w[0],
        exerciseName: value,
      };

      setRenderWorkoutExercises(w);
    } else {
      let w = [...renderedWorkoutExercises];
      console.log("exercise from new challenge workout", w, value);
      w[0] = {
        ...w[0],
        exerciseName: value,
      };
      setRenderWorkoutExercises(w);
    }
  };

  const handleRenderedWorkoutExerciseVideo = (value) => {
    console.log("video to be uploded", value);
    if (update) {
      let w = [...renderedWorkoutExercises];
      w[0] = {
        ...w[0],
        exerciseVideo: value && value.link,
      };

      setRenderWorkoutExercises(w);
    } else {
      let w = [...renderedWorkoutExercises];
      console.log("exercise from new challenge workout", w, value);
      w[0] = {
        ...w[0],
        exerciseVideo: value && value.link,
      };
      setRenderWorkoutExercises(w);
    }
  };

  const handleNonRenderedWorkoutExerciseName = (rId, id) => {
    if (update) {
      const exercise = allExercises.filter((e) => e._id === id);
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i._id === rId) {
          i.exerciseName = exercise[0].title;
          i.exerciseVideo = exercise[0].videoURL;
          i.voiceOverFile = exercise[0].voiceOverLink;
          i.exerciseId = id;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
    } else {
      const exercise = allExercises.filter((e) => e._id === id);
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i.exerciseId === rId) {
          i.exerciseName = exercise[0].title;
          i.exerciseVideo = exercise[0].videoURL;
          i.voiceOverFile = exercise[0].voiceOverLink;
          i._id = id;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
    }
  };

  const handleNonRenderedWorkoutExerciseWorkoutLength = (eId, value) => {
    // const exercise = allExercises.filter((e) => e._id === eId);
    if (update) {
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i._id === eId) {
          i.videoLength = value;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
      // console.log(eId, value);
    } else {
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i.exerciseId === eId) {
          i.videoLength = value;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
      // console.log(eId, value);
    }
  };

  const handleNonRenderedWorkoutExerciseGroupName = (eId, value) => {
    // const exercise = allExercises.filter((e) => e._id === eId);
    if (update) {
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i._id === eId) {
          i.exerciseGroupName = value;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
    } else {
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i.exerciseId === eId) {
          i.exerciseGroupName = value;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
      // console.log(eId, value);
    }
  };

  const handleNonRenderedWorkoutExerciseBreak = (eId, value) => {
    if (update) {
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i._id === eId) {
          i.breakAfterExercise = value;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
    } else {
      let w = [...nonRenderedWorkoutExercises];
      w = w.map((i) => {
        if (i.exerciseId === eId) {
          i.breakAfterExercise = value;
        }
        return i;
      });
      setNonRenderedWorkoutExercises(w);
    }
  };
  const nonRenderedWorkoutExerciseRemove = (id) => {
    if (update) {
      let w = [...nonRenderedWorkoutExercises];
      w = w.filter((i) => i._id !== id);
      setNonRenderedWorkoutExercises(w);
    } else {
      let w = [...nonRenderedWorkoutExercises];
      w = w.filter((i) => i.exerciseId !== id);
      setNonRenderedWorkoutExercises(w);
    }
  };

  const removeWeek = (id) => {
    let w = [...weeks];
    w = w.filter((i) => i.weekId !== id);
    setWeeks(w);
  };

  const createWorkoutStep2 = () => {
    if (!renderWorkout) {
      return (
        <div className="new-workout-creator-container-2-rendered">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3 className="font-heading-white">Add Exercise</h3>
          </div>
          {renderedWorkoutExercises.map((e, i) => (
            <div
              style={{
                backgroundColor: "#fff",
                padding: "10px 15px 30px 15px",
              }}
            >
              <p
                className="font-paragraph-black"
                style={{ color: "var(--color-orange)", fontWeight: "600" }}
              >
                Select Exercise
              </p>
              {/* <Select
                showSearch
                style={{ width: "100%" }}
                placeholder="Select a exercise"
                optionFilterProp="children"
                value={update ? e.exerciseId : e._id}
                onChange={(exe) =>
                  handleRenderedWorkoutExerciseName(
                    update ? e._id : e.exerciseId,
                    exe
                  )
                }
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {allExercises.map((e, i) => (
                  <Option value={e._id} key={i}>
                    {e.title}
                  </Option>
                ))}
              </Select> */}
              <p
                className="font-paragraph-black"
                style={{ color: "var(--color-orange)", fontWeight: "600" }}
              >
                Title
              </p>
              <Input
                value={e.exerciseName}
                // disabled={true}
                onChange={(w) =>
                  handleRenderedWorkoutExerciseName(
                    update ? e._id : e.exerciseId,
                    w.target.value
                  )
                }
              />
              <p
                className="font-paragraph-white"
                style={{ color: "var(--color-orange)", fontWeight: "600" }}
              >
                Video
              </p>

              <Button
                onClick={() => {
                  setMediaManagerVisible(true);
                  setMediaManagerType("videos");
                  setMediaManagerActions([
                    e.exerciseVideo,
                    handleRenderedWorkoutExerciseVideo,
                  ]);
                }}
              >
                Upload Video
              </Button>
              <div
                className="font-paragraph-white"
                style={{ color: "#ff7700", margin: "5px 0" }}
              >
                {e.exerciseVideo && e.exerciseVideo}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div
          className="new-workout-creator-container-2-nonrender"
          style={{
            height: workoutModalFullscreen ? "60vh" : "50vh",
            background: "#232932",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              background: "#232932",
              // padding: "10px",
            }}
          >
            <h3 className="font-heading-white">Add Exercises</h3>
            <Button
              onClick={() =>
                setNonRenderedWorkoutExercises([
                  ...nonRenderedWorkoutExercises,
                  nonRenderedWorkoutExercise,
                ])
              }
              style={{
                backgroundColor: "var(--color-orange)",
                border: "var(--color-orange)",
                color: "white",
                marginRight: "10px",
              }}
            >
              <PlusOutlined /> Add
            </Button>
          </div>

          <Collapse defaultActiveKey={["1"]}>
            {nonRenderedWorkoutExercises.map((e, i) => (
              <Panel
                header={`Exercise ${i + 1}`}
                key={update ? e._id : e.exerciseId}
              >
                <div
                  style={{
                    background: "#232932",
                    margin: "-10px",
                    padding: "10px",
                  }}
                >
                  <Button
                    type="danger"
                    onClick={() =>
                      nonRenderedWorkoutExerciseRemove(
                        update ? e._id : e.exerciseId
                      )
                    }
                    style={{ float: "right" }}
                  >
                    Remove
                  </Button>
                  <Select
                    showSearch
                    style={{ width: "100%", marginTop: "10px" }}
                    placeholder="Select a exercise"
                    optionFilterProp="children"
                    value={update ? e.exerciseId : e._id}
                    onChange={(exe) =>
                      handleNonRenderedWorkoutExerciseName(
                        update ? e._id : e.exerciseId,
                        exe
                      )
                    }
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {allExercises.map((e, i) => (
                      <Option value={e._id} key={i}>
                        {e.title}
                      </Option>
                    ))}
                  </Select>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gridGap: "10px",
                      background: "#232932 !important",
                    }}
                  >
                    <div>
                      <p
                        className="font-paragraph-black"
                        style={{
                          color: "var(--color-orange)",
                          fontWeight: "600",
                        }}
                      >
                        Exercise Title
                      </p>
                      <Input value={e.exerciseName} disabled={true} />
                    </div>
                    <div>
                      <p
                        className="font-paragraph-black"
                        style={{
                          color: "var(--color-orange)",
                          fontWeight: "600",
                        }}
                      >
                        Exercise Length- must be in seconds
                      </p>
                      <Input
                        value={e.videoLength}
                        onChange={(l) =>
                          handleNonRenderedWorkoutExerciseWorkoutLength(
                            update ? e._id : e.exerciseId,
                            l.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p
                        className="font-paragraph-black"
                        style={{
                          color: "var(--color-orange)",
                          fontWeight: "600",
                        }}
                      >
                        Break after exercise- must be in seconds
                      </p>
                      <Input
                        placeholder="eg. 10"
                        type="number"
                        value={e.breakAfterExercise}
                        onChange={(l) =>
                          handleNonRenderedWorkoutExerciseBreak(
                            update ? e._id : e.exerciseId,
                            l.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p
                        className="font-paragraph-black"
                        style={{
                          color: "var(--color-orange)",
                          fontWeight: "600",
                        }}
                      >
                        Exercise Group Name
                      </p>
                      <Input
                        placeholder="eg. Round 1/3"
                        value={e.exerciseGroupName}
                        onChange={(l) =>
                          handleNonRenderedWorkoutExerciseGroupName(
                            update ? e._id : e.exerciseId,
                            l.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <p
                        className="font-paragraph-white"
                        style={{
                          color: "var(--color-orange)",
                          fontWeight: "600",
                        }}
                      >
                        Uploaded Video
                      </p>
                      <div className="font-paragraph-white">
                        {e.exerciseVideo}{" "}
                      </div>
                    </div>

                    <div>
                      <p
                        className="font-paragraph-white"
                        style={{
                          color: "var(--color-orange)",
                          fontWeight: "600",
                        }}
                      >
                        Uploaded Voiceover
                      </p>

                      <div className="font-paragraph-white">
                        {e.voiceOverFile}{" "}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            ))}
          </Collapse>
        </div>
      );
    }
  };

  const removeWorkout = (weekId, workoutId) => {
    let w = [...weeks];
    console.log(w);
    w = w.map((j) => {
      if (j.weekId === weekId) {
        j.workouts = j.workouts.filter((f) => f.workoutId !== workoutId);
        return j;
      }
      return j;
    });
    setWeeks(w);
  };

  const duplicateWorkout = (weekId, workout) => {
    const dw = { ...workout };
    let w = [...weeks];
    dw.workoutId = v4();
    delete dw._id;
    dw.exercises = dw.exercises.map((e) => {
      let p = { ...e, exerciseId: update ? e.exerciseId : v4() };
      delete p._id;
      return p;
    });
    w = w.map((j) => {
      if (j.weekId === weekId) {
        j.workouts.push(dw);
        return j;
      }
      return j;
    });

    update && updateWorkoutOnTheBackend(dw, "new", weekId);

    // console.log("workoouts", workoutIdsThatNeedToBeUpdated);
    setWeeks(w);
  };

  const duplicateExercise = (weekId, workout, exercise) => {
    const newE = {
      ...exercise,
      exerciseId: update ? exercise.exerciseId : v4(),
    };
    // console.log("who cares", newE, exercise);
    // return;
    delete newE._id;
    let w = [...weeks];
    w = w.map((week) => {
      if (week.weekId === weekId) {
        week.workouts = week.workouts.map((wo) => {
          if (wo.workoutId === workout.workoutId) {
            return {
              ...wo,
              exercises: [...wo.exercises, newE],
            };
          }
          return wo;
        });
        return week;
      }
      return week;
    });

    console.log("here 2", w);
    // return;
    setWeeks(w);
    setTimeout(() => {
      // console.log("yelloe mello", w.workout, w);
      update && updateWorkoutOnTheBackend(w[0].workouts, "update");
    }, 1000);
  };

  const duplicateWeek = (week) => {
    const ObjectId = v4();
    let newWeek = {
      ...week,
      weekId: ObjectId,
      workouts: week.workouts.map((t) => {
        let p = {
          ...t,
          exercises: t.exercises.map((l) => {
            delete l._id;
            return l;
          }),
        };
        delete p._id;
        update && updateWorkoutOnTheBackend(p, "new", ObjectId);
        return p;
      }),
      // _id: ObjectId,
    };
    delete newWeek._id;

    console.log("here3", newWeek, week);
    // return;
    setWeeks([...weeks, newWeek]);
  };
  const updateWorkout = (workout) => {
    //   this is for new workout creation process
    setWorkoutToUpdate(workout.workoutId);
    setCurrentStep(0);
    setWorkoutTile(workout.workoutTitle);
    setWorkoutSubtile(workout.workoutSubtitle);
    setGroupName(workout.groupName);
    setInfoTile(workout.infoTitle);
    setInfoFile(workout.infoFile);
    // setPoints(workout.points);
    setWorkoutIntroVideoFile(workout.workoutIntroVideoFile);
    setRelatedProducts(workout.relatedProducts);
    setRelatedEquipments(workout.relatedEquipments);
    setRenderWorkout(workout.renderWorkout);
    !workout.renderWorkout && setRenderWorkoutExercises(workout.exercises);
    workout.renderWorkout && setNonRenderedWorkoutExercises(workout.exercises);
    setAddWorkoutModalVisible(true);
  };

  const handleToggle = () => {
    setWorkoutModalFullscreen(!workoutModalFullscreen);
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(weeks, result.source.index, result.destination.index);

    setWeeks(items);
  };

  return (
    <div className="newchallenge-creator-container-tab">
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fethData}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />
      {/* media manager popup */}
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />

      {/* {console.log(
        "renderedWorkoutExercisesrenderedWorkoutExercisesrenderedWorkoutExercises",
        nonRenderedWorkoutExercises
      )} */}
      {/* modal to create a new equipment */}
      <Modal
        onCancel={() => setEquipmentModal(false)}
        footer={false}
        visible={equipmentModal}
      >
        <p className="font-paragraph-white">Enter New Equipment Name</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newEquipmentName}
            onChange={(e) => setNewEquipmentName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              if (newEquipmentName.length > 0) {
                await createChallengeEquipment({
                  name: newEquipmentName,
                  language,
                });
                // setEquipmentModal(false);
                fethData();
              }
            }}
            style={{
              backgroundColor: "var(--color-orange)",
              borderColor: "var(--color-orange)",
              marginLeft: "5px",
            }}
          >
            Create
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Equipment</span>
          <List
            size="small"
            bordered
            dataSource={allEquipments}
            renderItem={(equipment) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{equipment.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      removeItem(equipment._id);
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
                      setSelectedItemForUpdateTitle("Update Equipment");
                      setSelectedItemForUpdate(equipment);
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
      {/* main form */}
      {/* create a workout modal */}

      <Modal
        visible={addWorkoutModalVisible}
        onCancel={() => setAddWorkoutModalVisible(false)}
        footer={false}
        width={workoutModalFullscreen ? "100%" : "50%"}
        style={{ resize: "none" }}
        bodyStyle={{ height: workoutModalFullscreen ? "90vh" : "100%" }}
        maskStyle={{ height: workoutModalFullscreen ? "90vh" : "100%" }}
      >
        <div
          ref={workoutModalRef}
          style={{
            backgroundColor: "var(--color-gray)",
          }}
        >
          <span
            style={{
              float: "right",
              color: "white",
              padding: "3px 5px",
              border: "1px solid white",
              position: "absolute",
              right: "40px",
              cursor: "pointer",
              top: "5px",
              fontSize: "15px",
              zIndex: "10000",
            }}
            onClick={() => handleToggle()}
          >
            {workoutModalFullscreen ? (
              <ShrinkOutlined />
            ) : (
              <ArrowsAltOutlined />
            )}
          </span>
          <h1 className="font-subheading-white" style={{ margin: "5px" }}>
            Create a workout
          </h1>

          <div className="new-workout-creator-container">
            <>
              {currentStep === 0 && createWorkoutStep1()}
              {currentStep === 0 && (
                <div style={{ textAlign: "right" }}>
                  <Button
                    size="large"
                    className="new-workout-creator-container-1-btn font-paragraph-white"
                    onClick={() => setCurrentStep(1)}
                  >
                    Next Step
                  </Button>
                </div>
              )}
              {currentStep === 1 && createWorkoutStep2()}
              {currentStep === 1 && (
                <div>
                  <Button
                    size="large"
                    className="new-workout-creator-container-1-btn font-paragraph-white"
                    onClick={() => setCurrentStep(0)}
                  >
                    Prev Step
                  </Button>
                  <Button
                    size="large"
                    className="new-workout-creator-container-1-btn font-paragraph-white"
                    onClick={addWorkoutToWeek}
                    style={{ marginRight: "20px", float: "right" }}
                  >
                    Create Workout
                  </Button>
                </div>
              )}
            </>
          </div>
        </div>
      </Modal>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {weeks.map((w, i) => (
                <CustomWeekPanel
                  update={update}
                  week={w}
                  index={i}
                  id={w.weekId}
                  weeks={weeks}
                  setWeeks={setWeeks}
                  removeWeek={removeWeek}
                  duplicateWeek={duplicateWeek}
                  handleWeekNameChange={handleWeekNameChange}
                  handleWeekSubtitleChange={handleWeekSubtitleChange}
                  setCurrentWeek={setCurrentWeek}
                  setAddWorkoutModalVisible={setAddWorkoutModalVisible}
                  removeWorkout={removeWorkout}
                  updateWorkout={updateWorkout}
                  duplicateWorkout={duplicateWorkout}
                  duplicateExercise={duplicateExercise}
                />
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* </Collapse> */}

      <Button
        style={{
          backgroundColor: "var(--color-orange)",
          borderColor: "var(--color-orange)",
          color: "white",
          marginTop: "10px",
        }}
        onClick={() => setWeeks([...weeks, newWeek])}
      >
        Add A Week
      </Button>
    </div>
  );
}

export default NewChallengeWorkoutTab;
