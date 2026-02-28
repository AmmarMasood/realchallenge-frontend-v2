import React, { useState, useEffect, useContext } from "react";
import { Button, Select, Table, Space, Input } from "antd";
import moment from "moment";

import {
  getAllUserExercises,
  removeExercise,
} from "../../../services/createChallenge/main";
import UpdateExercise from "./UpdateExercise";
import { getAllTrainers } from "../../../services/trainers";
import { userInfoContext } from "../../../contexts/UserStore";
import { T } from "../../Translate";
import { withRouter } from "react-router-dom";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { get } from "lodash";
// import UpdateExercises from "./UpdateExercises";

function AllExercises(props) {
  const { strings } = useContext(LanguageContext);
  const [filterAllExercises, setFilterAllExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [selectedExercisesForUpdate, setSelectedExercisesForUpdate] = useState(
    {}
  );
  const [openModal, setOpenModal] = useState(false);
  const [allTrainers, setAllTrainers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [userInfo, setUserInfo] = useContext(userInfoContext);

  useEffect(() => {
    fetchExercises();
    fetchTrainers();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilterAllExercises(allExercises);
      return;
    }
    // console.log(allExercises)
    const admins = allExercises.filter((e) => e.trainer._id === filter);
    setFilterAllExercises(admins);
  }, [allExercises, filter]);

  const fetchTrainers = async () => {
    const res = await getAllTrainers();
    if (res) {
      setAllTrainers(res.trainers);
    }
  };

  const fetchExercises = async () => {
    const c = await getAllUserExercises("");
    setAllExercises(c.exercises);
    setFilterAllExercises(c.exercises);

    const queryParams = new URLSearchParams(props.location.search);
    const selectedExercise = queryParams.get("exerciseId");

    if (selectedExercise) {
      const exerciseToUpdate = c.exercises.find(
        (exercise) => exercise._id === selectedExercise
      );
      if (exerciseToUpdate) {
        setSelectedExercisesForUpdate(exerciseToUpdate);
        setOpenModal(true);
      }
    }
  };

  const openExercisesUpdater = (record) => {
    setSelectedExercisesForUpdate(record);
    setOpenModal(true);
  };

  const deleteExercises = async (c) => {
    await removeExercise(c._id);
    fetchExercises();
  };
  const columns = [
    {
      title: <T>admin.exercise_id</T>,
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.exercise_name</T>,
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.trainer</T>,
      dataIndex: "trainer",
      key: "trainer",
      render: (text) => (
        <span className="font-paragraph-black">{text && text.username}</span>
      ),
    },
    {
      title: <T>admin.updated_at</T>,
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: <T>admin.created_by</T>,
      dataIndex: "user",
      key: "user",
      render: (text) => (
        <span className="font-paragraph-black">{text && text.username}</span>
      ),
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
      render: (text) => (
        <span className="font-paragraph-black">
          {text ? text.username || text.firstName || text : "-"}
        </span>
      ),
    },
    {
      title: <T>admin.action</T>,
      key: "challengePreviewLink",
      render: (text, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => openExercisesUpdater(record)}>
            <T>adminDashboard.edit</T>
          </Button>
          <Button type="danger" onClick={() => deleteExercises(text)}>
            <T>adminDashboard.delete</T>
          </Button>
        </Space>
      ),
    },
  ];

  // const duplicateExercises = (i, r) => {
  //   setAllExercises([...allExercises, { ...i, id: i.id + 10 }]);
  // };
  return (
    <div>
      <UpdateExercise
        show={openModal}
        setShow={setOpenModal}
        key={selectedExercisesForUpdate ? selectedExercisesForUpdate._id : ""}
        exerciseValues={selectedExercisesForUpdate}
        fetchExercises={fetchExercises}
        allTrainers={allTrainers}
      />
      <h2 className="font-heading-black"><T>admin.all_exercises</T></h2>
      <div className="admin-allchallenges-list-container">
        {userInfo.role === "admin" && (
          <div>
            <span className="font-heading-black" style={{ marginLeft: "10px" }}>
              <T>admin.filter_by_trainer</T>
            </span>

            <Select
              defaultValue=""
              style={{ width: 120, marginLeft: "10px" }}
              onChange={(e) => setFilter(e)}
            >
              <Select.Option key={1} value={"all"}>
                <T>admin.all</T>
              </Select.Option>
              {allTrainers &&
                allTrainers.map((t, i) => (
                  <Select.Option key={i} value={t._id}>
                    {t.username}
                  </Select.Option>
                ))}
            </Select>
          </div>
        )}

        <Input
          placeholder={get(strings, "admin.search_exercises_by_title", "Search Exercises By Title")}
          onChange={(e) =>
            setFilterAllExercises(
              allExercises.filter((exercise) =>
                exercise.title
                  .toUpperCase()
                  .includes(e.target.value.toUpperCase())
              )
            )
          }
        />

        <Input
          style={{ marginTop: "10px" }}
          placeholder={get(strings, "admin.search_exercises_by_id", "Search Exercises By ID")}
          onChange={(e) =>
            setFilterAllExercises(
              allExercises.filter((exercise) =>
                exercise._id
                  .toUpperCase()
                  .includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllExercises} />
      </div>
    </div>
  );
}

export default withRouter(AllExercises);
