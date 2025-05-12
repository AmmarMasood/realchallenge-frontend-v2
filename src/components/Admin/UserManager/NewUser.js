import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select, List, Modal } from "antd";
import {
  LoadingOutlined,
  CloseSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  registerUser,
  sendEmailVerification,
} from "../../../services/authentication";
import { createCustomerDetails } from "../../../services/customer";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import {
  createUserByAdmin,
  updateUserProfileByAdmin,
} from "../../../services/users";
import {
  createTrainerGoal,
  deleteTrainerGoals,
  getAllTrainerGoals,
} from "../../../services/trainers";
import { getAllChallengeGoals } from "../../../services/createChallenge/goals";
import EditTypeName from "./EditTypeName";
import { LanguageContext } from "../../../contexts/LanguageContext";

const { Option } = Select;
function NewUser({ setCurrentSelection, home }) {
  const [form] = Form.useForm();
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  // user stuff
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [membership, setMembership] = useState("");
  const [hero, setHero] = useState("");
  const [videoTrailer, setVideoTrailer] = useState("");
  const [motto, setMotto] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [allCountries, setAllCountries] = useState([]);
  const [goals, setGoals] = useState([]);
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  //trainer goals stuff
  const [allTrainerGoals, setAllTrainerGoals] = useState([]);
  const [allChallengeGoals, setAllChallengeGoals] = useState([]);
  const [selectedFitnessInterest, setSelectedFitnessInterest] = useState("");
  const [selectedTrainerGoal, setSelectedTrainerGoal] = useState("");
  const [showTrainerGoalModal, setShowTrainerGoalModal] = useState(false);
  const [newTrainerGoalName, setNewTrainerGoalName] = useState("");

  // update stuff
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);

  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  const { language } = useContext(LanguageContext);

  // admin",
  //           "trainer",
  //           "nutrist",
  //           "blogger",
  //           "shopmanager",
  //           "customer

  useEffect(() => {
    const allCountries = require("../../../assets/data/all-countries.json");
    setAllCountries(allCountries);
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getAllTrainerGoals(language);
    const aCh = await getAllChallengeGoals(language);

    // console.log("aCh", aCh);
    if (res.goals) {
      setAllTrainerGoals(res.goals);
    }
    if (aCh.challengeGoals) {
      setAllChallengeGoals(aCh.challengeGoals);
    }

    console.log("res", res);
  };
  const onFinish = (values) => {
    // console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  function generatePass() {
    var length = 10,
      charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
      retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    form.setFieldsValue({
      password: retVal,
    });
    return retVal;
  }

  const createANewUser = async () => {
    let flag = false;
    if (username && firstName && lastName && email && password) {
      flag = true;
    }
    if (flag) {
      setLoading(true);
      const data = {
        firstName,
        lastName,
        password,
        email,
        gender,
        username,
        role: role.toLowerCase(),
      };
      const res = await createUserByAdmin(data);
      // await sendEmailVerification(email);
      console.log("yas0", res);
      if (res) {
        if (role === "ADMIN") {
          const data = {
            heroBanner: "",
            videoTrailerLink: "",
            motto: "",
            bio: "",
            country: "",
            gender: "other",
            avatarLink: "",
            trainersFitnessInterest: [],
            trainerGoals: [],
          };
          await updateUserProfileByAdmin(data, res._id);
          await createCustomerDetails(
            {
              gender,
              goals: [],
              currentFitnessLevel: [],
              age: 10,
              weight: 150,
              measureSystem: "metrics",
              height: 18,
              bmi: 900,
              bmir: 50,
              caloriesPerDay: 200,
              amountOfProtein: 25,
              amountOfFat: 30,
              amountOfCarbohydrate: 45,
              avatarLink: "some link",
            },
            res._id
          );
          console.log("ADMIN CREATED");
          setLoading(false);
        } else if (role === "TRAINER") {
          const data = {
            heroBanner: typeof hero === "object" ? hero.link : "",
            videoTrailerLink:
              typeof videoTrailer === "object" ? videoTrailer.link : "",
            motto,
            bio,
            country,
            gender,
            avatarLink: typeof avatar === "object" ? avatar.link : avatar,
            trainersFitnessInterest: selectedFitnessInterest,
            trainerGoals: selectedTrainerGoal,
          };
          await updateUserProfileByAdmin(data, res._id, "trainer");
          console.log("TRAINER CREATED");
          setLoading(false);
        } else {
          const data = {
            heroBanner: typeof hero === "object" ? hero.link : "",
            videoTrailerLink:
              typeof videoTrailer === "object" ? videoTrailer.link : "",
            motto,
            bio,
            country,
            gender,
            avatarLink: typeof avatar === "object" ? avatar.link : "",
          };
          await updateUserProfileByAdmin(data, res._id);
          console.log("BLOGGER NUTRIENT SHOP MANAGER CREATED");
          setLoading(false);
        }
        setCurrentSelection(home);
      } else {
        window.alert("Unable to create account. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <div>
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
        fethData={fetchData}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />
      {/* modal to create a new trainer goal */}
      <Modal
        onCancel={() => setShowTrainerGoalModal(false)}
        footer={false}
        visible={showTrainerGoalModal}
      >
        {/* body focus stuff */}
        <p className="font-paragraph-white"> Create A New Fitness Interest</p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newTrainerGoalName}
            onChange={(e) => setNewTrainerGoalName(e.target.value)}
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
              if (newTrainerGoalName.length > 0) {
                await createTrainerGoal({ name: newTrainerGoalName, language });
                // setShowBodyfocusModal(false);
                fetchData();
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
                      fetchData();
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
      <h2 className="font-heading-black">Create A New User</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <Form
          name="basic"
          layout="vertical"
          form={form}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input username!" }]}
          >
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "Please input your E-mail!",
              },
            ]}
          >
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="firstname"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name="lastname"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="gender" label="Gender">
            <Select
              className="field-focus-orange-border"
              placeholder="Select A Gender"
              onChange={(e) => setGender(e)}
              gender={gender}
              allowClear
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              style={{ color: "black" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="primary"
              className="font-paragraph-white"
              onClick={() => generatePass()}
              style={{
                backgroundColor: "var(--color-orange)",
                float: "right",
                margin: "10px",
              }}
            >
              Generate Strong Password
            </Button>
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select
              className="field-focus-orange-border"
              placeholder="Select A Role"
              onChange={(e) => setRole(e)}
              allowClear
            >
              <Option value="ADMIN">Admin</Option>
              <Option value="TRAINER">Trainer</Option>
              <Option value="BLOGGER">Blogger</Option>
              <Option value="NUTRIST">Nutrist</Option>
              <Option value="SHOPMANAGER">Shop Manager</Option>
            </Select>
          </Form.Item>
          {role.includes("CUSTOMER") ? (
            <Form.Item
              name="membership"
              label="Membership"
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Select
                mode="multiple"
                className="field-focus-orange-border"
                placeholder="Select A Membership"
                onChange={(e) => setMembership(e)}
                allowClear
              >
                {[
                  "Challenge Three",
                  "Challenge One",
                  "Challenge Twelve",
                  "Free",
                ].map((e) => (
                  <Option value={e}>{e}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            ""
          )}

          {!role.includes("ADMIN") && (
            <>
              <Form.Item label="Avatar" name="avatar">
                <Button
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("images");
                    setMediaManagerActions([avatar, setAvatar]);
                  }}
                >
                  Upload Image
                </Button>
                {avatar && (
                  <div style={{ margin: "10px" }}>
                    <img
                      style={{
                        maxHeight: "500px",
                        maxWidth: "500px",
                        margin: "20px",
                      }}
                      src={`${process.env.REACT_APP_SERVER}/uploads/${avatar.link}`}
                      // height="120px"
                      // width="150px"
                      height="auto"
                      width={"80%"}
                      alt=""
                    />
                    <div>
                      {avatar.name}{" "}
                      <CloseSquareOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => setAvatar("")}
                      />
                    </div>
                  </div>
                )}
              </Form.Item>

              <Form.Item label="Hero" name="hero">
                <Button
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("images");
                    setMediaManagerActions([hero, setHero]);
                  }}
                >
                  Upload Image
                </Button>
                {hero && (
                  <div style={{ margin: "10px" }}>
                    <img
                      src={`${process.env.REACT_APP_SERVER}/uploads/${hero.link}`}
                      alt=""
                      height="50%"
                      width={"80%"}
                    />
                    <div>
                      {hero.name}{" "}
                      <CloseSquareOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => setHero("")}
                      />
                    </div>
                  </div>
                )}
              </Form.Item>

              <Form.Item label="Video Trailer" name="videoTrailer">
                <Button
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("videos");
                    setMediaManagerActions([videoTrailer, setVideoTrailer]);
                  }}
                >
                  Upload Video
                </Button>
                {videoTrailer && (
                  <div style={{ margin: "10px" }}>
                    <span>
                      {videoTrailer.name}{" "}
                      <CloseSquareOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => setVideoTrailer("")}
                      />
                    </span>
                  </div>
                )}
              </Form.Item>
              <Form.Item label="Motto" name="motto">
                <Input
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Bio" name="bio">
                <Input.TextArea
                  rows={8}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </Form.Item>
              <Form.Item label="Country" name="country">
                <Select
                  value={country}
                  style={{ width: "100%" }}
                  onChange={(e) => setCountry(e)}
                  showSearch
                >
                  {allCountries.map((co) => (
                    <Option value={co.name}>{co.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}
          {role.includes("TRAINER") && (
            // <Form.Item label="Goals" name="goals">
            //   <Select
            //     value={goals}
            //     style={{ width: "100%" }}
            //     onChange={(e) => setGoals(e)}
            //     mode="multiple"
            //   >
            //     {[
            //       "Behaviour",
            //       "Bootcamp",
            //       "Boxing",
            //       "Bulking",
            //       "Callisthenics",
            //       "Condition",
            //       "Cross Fit",
            //       "Cutting",
            //       "Diet",
            //       "Endurance",
            //       "Fatburn",
            //       "Gain Muscle",
            //       "Get Fit",
            //       "Gymnastics",
            //       "Health",
            //       "HIIT",
            //       "Hypertrophy",
            //       "Injuries",
            //       "Knowledge",
            //       "Lose weight",
            //       "Meditation",
            //       "Metabolism",
            //       "Mindset",
            //       "Mobility",
            //       "Nutrition",
            //       "Overweight",
            //       "Physiotherapy",
            //       "Powerlifting",
            //       "Pregnant",
            //       "Prevention",
            //       "Recover",
            //       "Revalidation",
            //       "Run",
            //       "Seniors",
            //       "Stay Fit",
            //       "Strength",
            //       "Stretch",
            //       "Technique",
            //       "Yoga",
            //     ].map((co) => (
            //       <Option value={co}>{co}</Option>
            //     ))}
            //   </Select>
            // </Form.Item>

            <>
              {/* <Form.Item label="Goals" name="goals">
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  value={
                    selectedTrainerGoal.length <= 0 ? [] : selectedTrainerGoal
                  }
                  onChange={(e) => setSelectedTrainerGoal(e)}
                >
                  {allChallengeGoals.map((g) => (
                    <Option value={g._id}>{g.name}</Option>
                  ))}
                </Select>
              </Form.Item> */}

              <Form.Item label="Fitness Interests" name="fitnessInterest">
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Please select"
                  value={
                    selectedFitnessInterest.length <= 0
                      ? []
                      : selectedFitnessInterest
                  }
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
                  onClick={() => setShowTrainerGoalModal(true)}
                >
                  Manage Fitness Interests
                </Button>
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
              }}
              onClick={createANewUser}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default NewUser;
