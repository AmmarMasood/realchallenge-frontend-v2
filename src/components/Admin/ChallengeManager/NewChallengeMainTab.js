import React, { useState, useEffect, useContext } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Modal,
  Checkbox,
  List,
  InputNumber,
  Radio,
} from "antd";
import { LoadingOutlined, CloseSquareOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
// services
import {
  createChallengeGoal,
  deleteChallengeTGoal,
  getAllChallengeGoals,
} from "../../../services/createChallenge/goals";
import {
  createChallengeTag,
  deleteChallengeTag,
  getAllChallengeTags,
} from "../../../services/createChallenge/tags";
import {
  getAllBodyFocus,
  createBodyFocus,
  deleteChallengeBodyfocus,
} from "../../../services/createChallenge/bodyFocus";
import {
  createTrainerGoal,
  deleteTrainerGoals,
  getAllTrainerGoals,
  getAllTrainers,
} from "../../../services/trainers";
import { getIntensityGroups } from "../../../services/createChallenge/main";
import EditTypeName from "./EditTypeName";
import { LanguageContext } from "../../../contexts/LanguageContext";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { T } from "../../Translate";
import { getDefaultGoals } from "../../../constants/goals";
const { Option } = Select;

function NewChallengeMainTab({
  form,
  selectedChallenge,
  setSelectedChallenge,
  allChallenges,
  name,
  setName,
  access,
  setAccess,
  price,
  points,
  setPrice,
  setPoints,
  currency,
  setCurrency,
  thumbnail,
  setThumbnail,
  videoThumbnail,
  setVideoThumbnail,
  videoTrailer,
  setVideoTrailer,
  trainers,
  setTrainers,
  allTrainers,
  setAllTrainers,
  description,
  setDescription,
  difficulty,
  setDifficulty,
  goals,
  setGoals,
  selectedFitnessInterest,
  setSelectedFitnessInterest,
  bodyFocus,
  setBodyFocus,
  duration,
  setDuration,
  allGoals,
  setAllGoals,
  newGoalName,
  setNewGoalName,
  showGoalModal,
  setShowGoalModal,
  allBodyfocus,
  setAllBodyfocus,
  newBodyfocusName,
  setNewBodyfocusName,
  showBodyfocusModal,
  setShowBodyfocusModal,
  tags,
  setTags,
  allTags,
  setAllTags,
  newTagName,
  setNewTagName,
  showTagModal,
  setShowTagModal,
  update,
  multipleIntensities,
  setMultipleIntensities,
  intensityGroupId,
  setIntensityGroupId,
  intensity,
  setIntensity,
  isGroupHead = true,
  groupHeadName = "",
}) {
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);

  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);
  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fitnessInterestModal, setFitnessInterestModal] = useState(false);
  const [allTrainerGoals, setAllTrainerGoals] = useState([]);
  const [newTrainerFitnessInterest, setNewTrainerFitnessInterest] =
    useState("");
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [groupMode, setGroupMode] = useState("new"); // "new" | "existing"
  const [trainerGroups, setTrainerGroups] = useState([]);
  const [priceInheritedFromGroup, setPriceInheritedFromGroup] = useState(false);
  const { language } = useContext(LanguageContext);

  // Hide price/currency/access for non-head group siblings
  const isNonHeadSibling = (update && intensityGroupId && !isGroupHead) || priceInheritedFromGroup;

  useEffect(() => {
    fethData();
  }, [language]);

  async function fethData() {
    const bodyFocus = await getAllBodyFocus(language);
    const goals = await getAllChallengeGoals(language);
    const tags = await getAllChallengeTags(language);
    const trainers = await getAllTrainers(language);
    const res = await getAllTrainerGoals(language);

    setAllBodyfocus(bodyFocus.body);
    setAllGoals(goals.challengeGoals);
    setAllTags(tags.tags);
    setAllTrainers(trainers.trainers);
    setFilteredTrainers(trainers.trainers);
    setAllTrainerGoals(res.goals);
  }

  // Set groupMode to "existing" if editing a challenge that already has a group
  useEffect(() => {
    if (intensityGroupId) {
      setGroupMode("existing");
    }
  }, [intensityGroupId]);

  // Fetch trainer groups when multipleIntensities is enabled
  useEffect(() => {
    if (multipleIntensities) {
      getIntensityGroups(trainers || []).then((res) => {
        setTrainerGroups(res.groups || []);
      });
    }
  }, [multipleIntensities, trainers]);

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const removeItem = async (type, id) => {
    if (type === "goal") {
      await deleteChallengeTGoal(id);
      fethData();
      return;
    }

    if (type === "tag") {
      await deleteChallengeTag(id);
      fethData();
      return;
    }

    if (type === "bodyFocus") {
      await deleteChallengeBodyfocus(id);
      fethData();
      return;
    }
  };

  const selectBefore = (
    <Select
      defaultValue="$"
      className="select-before"
      value={currency}
      onChange={(e) => setCurrency(e)}
      name="currency"
    >
      <Option value="$">$</Option>
      <Option value="€">€</Option>
    </Select>
  );
  return (
    <div className="newchallenge-creator-container-tab">
      {/* media manager */}
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      {/*  */}
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fethData}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />
      {/* manage  */}

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
                fethData();
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
            dataSource={allTrainerGoals}
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
                    onClick={async () => {
                      await deleteTrainerGoals(g._id);
                      fethData();
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
      {/* end */}

      {/* modal to create a new goal */}
      <Modal
        onCancel={() => setShowGoalModal(false)}
        footer={false}
        visible={showGoalModal}
      >
        <p className="font-paragraph-white">
          <T>adminDashboard.challenges.eng</T>
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newGoalName}
            onChange={(e) => setNewGoalName(e.target.value)}
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
              if (newGoalName.length > 0) {
                await createChallengeGoal(newGoalName);
                // setShowGoalModal(false);
                fethData();
              }
            }}
          >
            <T>adminDashboard.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Goals</span>
          <List
            size="small"
            bordered
            dataSource={allGoals}
            renderItem={(goal) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{goal.name}</span>
                <CloseSquareOutlined
                  onClick={() => removeItem("goal", goal._id)}
                  style={{ color: "#ff8064", cursor: "pointer" }}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/* modal to create a new TAGS */}
      <Modal
        onCancel={() => setShowTagModal(false)}
        footer={false}
        visible={showTagModal}
      >
        <p className="font-paragraph-white">Enter New Tag</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
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
              if (newTagName.length > 0) {
                await createChallengeTag(newTagName);
                // setShowGoalModal(false);
                fethData();
              }
            }}
          >
            <T>adminDashboard.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Tags</span>
          <List
            size="small"
            bordered
            dataSource={allTags}
            renderItem={(tag) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{tag.name}</span>
                <CloseSquareOutlined
                  onClick={() => removeItem("tag", tag._id)}
                  style={{ color: "#ff8064", cursor: "pointer" }}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/* modal to create a new body */}
      <Modal
        onCancel={() => setShowBodyfocusModal(false)}
        footer={false}
        visible={showBodyfocusModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white">
          {" "}
          <T>adminDashboard.challenges.enterbf</T>
        </p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newBodyfocusName}
            onChange={(e) => setNewBodyfocusName(e.target.value)}
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
              if (newBodyfocusName.length > 0) {
                await createBodyFocus(newBodyfocusName);
                // setShowBodyfocusModal(false);
                fethData();
              }
            }}
          >
            {/* Manage Body Focus */}

            <T>adminDashboard.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white">All Body Focus</span>
          <List
            size="small"
            bordered
            dataSource={allBodyfocus}
            renderItem={(bodyFocus) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{bodyFocus.name}</span>

                <span>
                  <Button
                    onClick={() => {
                      removeItem("bodyFocus", bodyFocus._id);
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
                      setSelectedItemForUpdate(bodyFocus);
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
      {/* modal to create a new equipment */}
      {/* <Modal
        onCancel={() => setEquipmentModal(false)}
        footer={false}
        visible={equipmentModal}
      >
        <p className="font-paragraph-white">
          {t("adminDashboard.challenges.enterneweq")}
        </p>
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
                await createChallengeEquipment(newEquipmentName);
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
                <CloseSquareOutlined
                  onClick={() => removeItem("equipment", equipment._id)}
                  style={{ color: "#ff8064", cursor: "pointer" }}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal> */}

      <div>
        {!update && (
          <>
            {" "}
            <span style={{ marginRight: "5px" }}>Select Language:</span>
            <LanguageSelector notFromNav={true} />
          </>
        )}
        <div>
          <span
            style={{ marginRight: "5px" }}
          >{`Select alternative language version`}</span>
          <Select
            style={{ width: "500px" }}
            value={selectedChallenge}
            onChange={(e) => setSelectedChallenge(e)}
          >
            <Option value={""}>-</Option>
            {!update &&
              allChallenges.map((r, i) => (
                <Option value={r._id}>{r.challengeName}</Option>
              ))}
            {update &&
              allChallenges.map(
                (r, i) =>
                  r.challengeName !== name && (
                    <Option value={r._id}>{r.challengeName}</Option>
                  )
              )}
          </Select>
        </div>
      </div>
      {/* main form */}
      <Form
        name="basic"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        form={form ? form : null}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Name"
          name="challengeName"
          rules={[{ required: true, message: "Please input challenge name!" }]}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input description!" }]}
        >
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Item>
        {isNonHeadSibling ? (
          <Form.Item label="Price & Currency">
            <div style={{ padding: "8px 12px", background: "#2a2f36", borderRadius: "4px", color: "#ff7700" }}>
              {groupHeadName
                ? `Price is managed by the group head: "${groupHeadName}"`
                : "Price is inherited from the group head"}
            </div>
          </Form.Item>
        ) : (
          <>
            <Form.Item label="Currency" name="currency">
              <Select
                defaultValue="$"
                className="select-before"
                value={currency}
                onChange={(e) => setCurrency(e)}
                name="currency"
              >
                <Option value="$">$</Option>
                <Option value="€">€</Option>
              </Select>
            </Form.Item>
            <Form.Item label="Price" name="price">
              <InputNumber
                min={0.1}
                style={{ width: "100%" }}
                disabled={isFree}
                value={price}
                onChange={(e) => setPrice(e)}
              />
            </Form.Item>
          </>
        )}
        {!isNonHeadSibling && (
          <Form.Item name="isFree">
            <Checkbox
              value={isFree}
              onChange={(e) => {
                setIsFree(e.target.checked);
                setPrice(0);
                setAccess(["FREE"]);
              }}
            >
              Free Challenge
            </Checkbox>
          </Form.Item>
        )}
        <Form.Item label="Points" name="points">
          <Input
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          label="Thumbnail"
          name="thumbnail"
          rules={[{ required: true, message: "Please input thumbnail!" }]}
        >
          <Button
            onClick={() => {
              setMediaManagerVisible(true);
              setMediaManagerType("images");
              setMediaManagerActions([thumbnail, setThumbnail]);
            }}
          >
            Upload File
          </Button>
          <div
            className="font-paragraph-white"
            style={{ color: "#ff7700", margin: "5px 0" }}
          >
            <span>{thumbnail && thumbnail.name}</span>
            {thumbnail && (
              <CloseSquareOutlined
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={() => setThumbnail("")}
              />
            )}
          </div>
        </Form.Item>
        <Form.Item
          label="Video Thumbnail"
          name="videoThumbnail"
          rules={[{ required: true, message: "Please input thumbnail!" }]}
        >
          <Button
            onClick={() => {
              setMediaManagerVisible(true);
              setMediaManagerType("videos");
              setMediaManagerActions([videoThumbnail, setVideoThumbnail]);
            }}
          >
            Upload File
          </Button>
          <div
            className="font-paragraph-white"
            style={{ color: "#ff7700", margin: "5px 0" }}
          >
            <span>{videoThumbnail && videoThumbnail.name}</span>
            {videoThumbnail && (
              <CloseSquareOutlined
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={() => setVideoThumbnail("")}
              />
            )}
          </div>
        </Form.Item>
        <Form.Item
          label="Video Trailer"
          name="videoTrailer"
          rules={[{ required: true, message: "Please input video trailer!" }]}
        >
          <Button
            onClick={() => {
              setMediaManagerVisible(true);
              setMediaManagerType("videos");
              setMediaManagerActions([videoTrailer, setVideoTrailer]);
            }}
          >
            Upload File
          </Button>
          <div
            className="font-paragraph-white"
            style={{ color: "#ff7700", margin: "5px 0" }}
          >
            <span>{videoTrailer && videoTrailer.name}</span>
            {videoTrailer && (
              <CloseSquareOutlined
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={() => setVideoTrailer("")}
              />
            )}
          </div>
        </Form.Item>
        <Form.Item label="Trainers">
          {/* {console.log("trainers", trainers)} */}
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={trainers}
            onChange={(e) => setTrainers(e)}
            filterOption={false}
            onSearch={(e) => {
              const t = allTrainers.filter((f) =>
                f.firstName
                  .concat(f.lastName)
                  ?.toLowerCase()
                  .includes(e.toLowerCase())
              );
              setFilteredTrainers(t);
            }}
          >
            {filteredTrainers.map((trainer) => (
              <Option value={trainer._id}>
                {trainer.firstName} {trainer.lastName}
              </Option>
            ))}
          </Select>
        </Form.Item>
        {!isNonHeadSibling && (
          <Form.Item label="Access" name="access">
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              disabled={isFree}
              value={access}
              onChange={(e) => setAccess(e)}
            >
              {/* <Option value="FREE">FREE</Option> */}
              <Option value="CHALLENGE-3">CHALLENGE-3</Option>
              <Option value="CHALLENGE-12">CHALLENGE-12</Option>
              <Option value="CHALLENGE-1">CHALLENGE-1</Option>
            </Select>
          </Form.Item>
        )}
        <Form.Item label="Intensity" name="intensity">
          <Select
            allowClear
            style={{ width: "100%" }}
            placeholder="Select intensity"
            value={intensity || undefined}
            onChange={(val) => setIntensity(val || "")}
          >
            <Option value="Easy">Easy</Option>
            <Option value="Medium">Medium</Option>
            <Option value="Hard">Hard</Option>
          </Select>
          <Checkbox
            checked={multipleIntensities}
            onChange={(e) => {
              setMultipleIntensities(e.target.checked);
              if (!e.target.checked) {
                setIntensityGroupId("");
              }
            }}
            className="font-paragraph-black"
          >
            This challenge has multiple intensity levels
          </Checkbox>
          {multipleIntensities && (
            <div style={{ marginTop: "10px" }}>
              <Radio.Group
                value={groupMode}
                onChange={(e) => {
                  setGroupMode(e.target.value);
                  if (e.target.value === "new") {
                    setIntensityGroupId("");
                    setPriceInheritedFromGroup(false);
                  }
                }}
                style={{ marginBottom: "10px" }}
              >
                <Radio value="new">Create new group</Radio>
                <Radio value="existing">Add to existing group</Radio>
              </Radio.Group>
              {groupMode === "existing" && (
                <Select
                  style={{ width: "100%" }}
                  value={intensityGroupId || undefined}
                  onChange={(val) => {
                    setIntensityGroupId(val);
                    // Auto-fill price/currency/access from group
                    const group = trainerGroups.find((g) => g.groupId === val);
                    if (group) {
                      if (group.price !== undefined) setPrice(group.price);
                      if (group.currency) setCurrency(group.currency);
                      if (group.access) setAccess(group.access);
                      setPriceInheritedFromGroup(true);
                    }
                  }}
                  placeholder="Select a group"
                >
                  {trainerGroups.map((g) => (
                    <Option key={g.groupId} value={g.groupId}>
                      {g.challenges.map((c) => c.challengeName).join(", ")}{" "}
                      ({g.challenges.map((c) => c.intensity).join(", ")})
                    </Option>
                  ))}
                </Select>
              )}
            </div>
          )}
        </Form.Item>

        <Form.Item label="Goals" name="goals">
          {console.log("goasl", goals)}
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={goals}
            onChange={(e) => setGoals(e)}
          >
            {getDefaultGoals().map((g) => (
              <Option key={g._id} value={g._id}>
                {g.name}
              </Option>
            ))}
          </Select>
          {/* <Button
            style={{
              backgroundColor: "var(--color-orange)",
              border: "none",
              color: "white",
              float: "right",
              marginTop: "5px",
            }}
            onClick={() => setShowGoalModal(true)}
          >
            Manage Goals
          </Button> */}
        </Form.Item>
        {/* TODO add link tags */}
        {/* <Form.Item label="Tags" name="tags">
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={tags}
            onChange={(e) => setTags(e)}
          >
            {allTags.map((t) => (
              <Option value={t._id}>{t.name}</Option>
            ))}
          </Select>
          <Button
            style={{
              backgroundColor: "var(--color-orange)",
              border: "none",
              color: "white",
              float: "right",
              marginTop: "5px",
            }}
            onClick={() => setShowTagModal(true)}
          >
            Manage Tag
          </Button>
        </Form.Item> */}
        <Form.Item label="Body Focus" name="bodyFocus">
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={bodyFocus}
            onChange={(e) => setBodyFocus(e)}
          >
            {allBodyfocus.map((bodyfocus) => (
              <Option value={bodyfocus._id}>{bodyfocus.name}</Option>
            ))}
          </Select>
          <Button
            style={{
              backgroundColor: "var(--color-orange)",
              border: "none",
              color: "white",
              float: "right",
              marginTop: "5px",
            }}
            onClick={() => setShowBodyfocusModal(true)}
          >
            Manage Body Focus
          </Button>
        </Form.Item>

        <Form.Item label="Fitness Interests" name="fitnessInterest">
          {console.log(
            "allTrainerGoals",
            allTrainerGoals,
            selectedFitnessInterest
          )}
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={selectedFitnessInterest}
            onChange={(e) => setSelectedFitnessInterest(e)}
          >
            {allTrainerGoals.map((g) => (
              <Option value={g._id}>{g.name}</Option>
            ))}
          </Select>
          <Button
            style={{
              backgroundColor: "var(--color-orange)",
              border: "none",
              color: "white",
              float: "right",
              marginTop: "5px",
            }}
            onClick={() => setFitnessInterestModal(true)}
          >
            Manage Fitness Interests
          </Button>
        </Form.Item>

        {/* <Form.Item label="Equipment" name="equipment">
          <Select
            mode="multiple"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={equipments}
            onChange={(e) => setEquipments(e)}
          >
            {allEquipments.map((equipment) => (
              <Option value={equipment._id}>{equipment.name}</Option>
            ))}
          </Select>
          <Button
            style={{
              backgroundColor: "var(--color-orange)",
              border: "none",
              color: "white",
              float: "right",
              marginTop: "5px",
            }}
            onClick={() => setEquipmentModal(true)}
          >
            Manage Equipments
          </Button>
        </Form.Item> */}
        <Form.Item label="Duration" name="duration">
          {/* <Select
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select"
            value={duration}
            onChange={(e) => setDuration(e)}
          >
            <Option value="long">Long</Option>
            <Option value="short">Short</Option>
          </Select> */}
          <Input
            value={duration}
            type="number"
            placeholder="Please enter duration in minutes"
            onChange={(e) => setDuration(e.target.value)}
          />
        </Form.Item>
      </Form>
    </div>
  );
}

export default NewChallengeMainTab;
