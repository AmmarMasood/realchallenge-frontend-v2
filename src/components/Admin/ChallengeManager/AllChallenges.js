import React, { useState, useEffect, useContext } from "react";
import { Button, Tag, Table, Space, Input } from "antd";
import moment from "moment";
import {
  getAllUserChallenges,
  removeChallenge,
} from "../../../services/createChallenge/main";
import { Select } from "antd";
import UpdateChallenge from "./UpdateChallenge";
import { getAllTrainers } from "../../../services/trainers";
import { userInfoContext } from "../../../contexts/UserStore";
import slug from "elegant-slug";
import { Link } from "react-router-dom";
import { T } from "../../Translate";
import { LanguageContext } from "../../../contexts/LanguageContext";

function AllChallenges({ setCurrentSelection, setSelectedChallengeForUpdate }) {
  const [filterAllChallenges, setFilterAllChallenge] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [filter, setFilter] = useState("all");
  const [allTrainers, setAllTrainers] = useState([]);
  const userInfo = useContext(userInfoContext);
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (filter === "all") {
      setFilterAllChallenge(allChallenges);
      return;
    }
    const admins = allChallenges.filter((c) =>
      c.trainers.some((t) => t.username === filter)
    );
    setFilterAllChallenge(admins);
  }, [allChallenges, filter]);

  useEffect(() => {
    fetchChallenges();
  }, [language]);

  const fetchChallenges = async () => {
    const c = await getAllUserChallenges(language);
    const t = await getAllTrainers();
    console.log("trainers", t);
    console.log(c);
    setAllChallenges(c.challenges);
    setAllTrainers(t.trainers);
    setFilterAllChallenge(c.challenges);
  };

  const openChallengeUpdater = (record) => {
    setSelectedChallengeForUpdate(record);
    setCurrentSelection(5.3);
    // setShow(true);
  };

  const deleteChallenge = async (c) => {
    await removeChallenge(c._id);
    fetchChallenges();
  };
  const columns = [
    {
      title: "Challenge ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Challenge Name",
      dataIndex: "challengeName",
      key: "challengeName",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Updated At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Points",
      dataIndex: "points",
      key: "points",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Trainers",
      key: "trainers",
      dataIndex: "trainers",
      render: (tags) => (
        <>
          {tags.map((tag) => {
            return (
              <Tag color={"volcano"} key={tag._id}>
                {tag.firstName}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Access",
      key: "access",
      dataIndex: "access",
      render: (tags) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? "orange" : "orange";
            if (tag === "loser") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Action",
      key: "challengePreviewLink",
      render: (text, record) => (
        <Space size="middle">
          {/* <Button
            type="primary"
            onClick={() => duplicateChallenge(text, record)}
          >
            {t("adminDashboard.duplicate")}
          </Button>
          <Button type="primary">{t("adminDashboard.preview")}</Button>*/}
          <Link
            to={`/challenge/${slug(text.challengeName)}/${text._id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            <Button type="primary">
              {" "}
              <T>adminDashboard.preview</T>
            </Button>
          </Link>
          <Button type="primary" onClick={() => openChallengeUpdater(record)}>
            <T>adminDashboard.edit</T>
          </Button>
          <Button type="danger" onClick={() => deleteChallenge(text)}>
            <T>adminDashboard.delete</T>
          </Button>
        </Space>
      ),
    },
  ];

  // const duplicateChallenge = (i, r) => {
  //   setAllChallenges([...allChallenges, { ...i, id: i.id + 10 }]);
  // };
  return (
    <div>
      <h2 className="font-heading-black">
        <T>adminDashboard.challenges.all</T>
      </h2>
      <div className="admin-allchallenges-list-container">
        {userInfo.role === "admin" && (
          <div>
            <span className="font-heading-black" style={{ marginLeft: "10px" }}>
              Filter By Trainer:
            </span>
            <Select
              defaultValue=""
              style={{ width: 120, marginLeft: "10px" }}
              onChange={(e) => setFilter(e)}
            >
              <Select.Option key={1} value={"all"}>
                All
              </Select.Option>
              {allTrainers &&
                allTrainers.map((t, i) => (
                  <Select.Option key={i} value={t.username}>
                    {t.username}
                  </Select.Option>
                ))}
            </Select>
          </div>
        )}
        <Input
          placeholder="Search Challenge"
          onChange={(e) =>
            setFilterAllChallenge(
              allChallenges.filter((challenge) =>
                challenge.challengeName
                  .toUpperCase()
                  .includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          style={{ marginTop: "10px" }}
          placeholder="Search Challenge By ID"
          onChange={(e) =>
            setFilterAllChallenge(
              allChallenges.filter((challenge) =>
                challenge._id
                  .toUpperCase()
                  .includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllChallenges} />
      </div>
    </div>
  );
}

export default AllChallenges;
