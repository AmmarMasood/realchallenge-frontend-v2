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
import { T } from "../../Translate";
import { get } from "lodash";

const { Option } = Select;
function NewUser({ setCurrentSelection, home }) {
  const { language, strings } = useContext(LanguageContext);
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
  const [selectedRoles, setSelectedRoles] = useState([]);
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
        roles: selectedRoles.map(r => r.toLowerCase()),
      };
      const res = await createUserByAdmin(data);
      // await sendEmailVerification(email);
      console.log("yas0", res);
      if (res) {
        if (selectedRoles.includes("ADMIN")) {
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
        } else if (selectedRoles.includes("TRAINER")) {
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
        } else if (selectedRoles.includes("CUSTOMER")) {
          // Create customer details for customer role
          await createCustomerDetails(
            {
              gender: gender || "other",
              goals: goals || [],
              currentFitnessLevel: [],
              age: 0,
              weight: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              measureSystem: "metrics",
              height: 0,
              bmi: 0,
              bmir: 0,
              caloriesPerDay: 0,
              amountOfProtein: 33,
              amountOfFat: 33,
              amountOfCarbohydrate: 34,
              avatarLink: typeof avatar === "object" ? avatar.link : "",
              membership: membership || [],
            },
            res._id
          );
          console.log("CUSTOMER CREATED");
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
        window.alert(get(strings, "admin.unable_to_create_account", "Unable to create account. Please try again."));
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
        <p className="font-paragraph-white"> <T>admin.create_fitness_interest</T></p>
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
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white"><T>admin.all_fitness_interests</T></span>
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
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle(get(strings, "admin.update_fitness_interest", "Update Fitness Interest"));
                      setSelectedItemForUpdate(g);
                      setEditItemNameModalVisible(true);
                    }}
                  >
                    <T>admin.edit</T>
                  </Button>
                </span>
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/* end */}
      <h2 className="font-heading-black"><T>admin.create_new_user</T></h2>
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
            label={<T>admin.username</T>}
            name="username"
            rules={[{ required: true, message: get(strings, "admin.please_input_username", "Please input username!") }]}
          >
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="email"
            label={<T>admin.email_address</T>}
            rules={[
              {
                type: "email",
                message: get(strings, "admin.invalid_email", "The input is not valid E-mail!"),
              },
              {
                required: true,
                message: get(strings, "admin.please_input_email", "Please input your E-mail!"),
              },
            ]}
          >
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Item>
          <Form.Item
            label={<T>admin.first_name</T>}
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
            label={<T>admin.last_name</T>}
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
          <Form.Item name="gender" label={<T>admin.gender</T>}>
            <Select
              className="field-focus-orange-border"
              placeholder={get(strings, "admin.select_gender", "Select A Gender")}
              onChange={(e) => setGender(e)}
              gender={gender}
              allowClear
            >
              <Option value="male"><T>admin.male</T></Option>
              <Option value="female"><T>admin.female</T></Option>
              <Option value="other"><T>admin.other</T></Option>
            </Select>
          </Form.Item>
          <Form.Item
            label={<T>admin.password</T>}
            name="password"
            rules={[{ required: true, message: get(strings, "admin.please_input_password", "Please input your password!") }]}
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
              <T>admin.generate_strong_password</T>
            </Button>
          </Form.Item>

          <Form.Item
            name="roles"
            label={<T>admin.roles</T>}
            rules={[
              {
                required: true,
                message: get(strings, "admin.please_select_role", "Please select at least one role"),
              },
            ]}
            extra={
              <span style={{ color: "#888", fontSize: "12px" }}>
                <T>admin.role_combination_hint</T>
              </span>
            }
          >
            <Select
              mode="multiple"
              className="field-focus-orange-border"
              placeholder={get(strings, "admin.select_roles", "Select Role(s)")}
              value={selectedRoles}
              onChange={(values) => {
                // Handle role combination rules
                if (values.includes("ADMIN")) {
                  // Admin must be alone
                  setSelectedRoles(["ADMIN"]);
                } else if (values.includes("CUSTOMER")) {
                  // Customer must be alone
                  setSelectedRoles(["CUSTOMER"]);
                } else {
                  // Other roles can combine
                  setSelectedRoles(values);
                }
              }}
              allowClear
            >
              <Option value="ADMIN" disabled={selectedRoles.length > 0 && !selectedRoles.includes("ADMIN")}>
                <T>admin.admin_role</T>
              </Option>
              <Option value="TRAINER" disabled={selectedRoles.includes("ADMIN") || selectedRoles.includes("CUSTOMER")}>
                <T>admin.trainer_role</T>
              </Option>
              <Option value="BLOGGER" disabled={selectedRoles.includes("ADMIN") || selectedRoles.includes("CUSTOMER")}>
                <T>admin.blogger_role</T>
              </Option>
              <Option value="NUTRIST" disabled={selectedRoles.includes("ADMIN") || selectedRoles.includes("CUSTOMER")}>
                <T>admin.nutrist_role</T>
              </Option>
              <Option value="SHOPMANAGER" disabled={selectedRoles.includes("ADMIN") || selectedRoles.includes("CUSTOMER")}>
                <T>admin.shopmanager_role</T>
              </Option>
              <Option value="CUSTOMER" disabled={selectedRoles.length > 0 && !selectedRoles.includes("CUSTOMER")}>
                Customer
              </Option>
            </Select>
          </Form.Item>
          {/* {selectedRoles.includes("CUSTOMER") ? (
            <>
              <Form.Item
                name="membership"
                label={<T>admin.membership</T>}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  className="field-focus-orange-border"
                  placeholder={get(strings, "admin.select_membership", "Select A Membership")}
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
              <Form.Item
                name="customerGoals"
                label={<T>admin.fitness_goals</T>}
              >
                <Select
                  mode="multiple"
                  className="field-focus-orange-border"
                  placeholder={get(strings, "admin.select_goals", "Select Fitness Goals")}
                  value={goals}
                  onChange={(e) => setGoals(e)}
                  allowClear
                >
                  {allChallengeGoals.map((g) => (
                    <Option key={g._id} value={g._id}>{g.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          ) : (
            ""
          )} */}

          {!selectedRoles.includes("ADMIN") && !selectedRoles.includes("CUSTOMER") && (
            <>
              <Form.Item label={<T>admin.avatar</T>} name="avatar">
                <Button
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("images");
                    setMediaManagerActions([avatar, setAvatar]);
                  }}
                >
                  <T>admin.upload_image</T>
                </Button>
                {avatar && (
                  <div style={{ margin: "10px" }}>
                    <img
                      style={{
                        maxHeight: "500px",
                        maxWidth: "500px",
                        margin: "20px",
                      }}
                      src={`${avatar.link}`}
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

              <Form.Item label={<T>admin.hero</T>} name="hero">
                <Button
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("images");
                    setMediaManagerActions([hero, setHero]);
                  }}
                >
                  <T>admin.upload_image</T>
                </Button>
                {hero && (
                  <div style={{ margin: "10px" }}>
                    <img
                      src={`${hero.link}`}
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

              <Form.Item label={<T>admin.video_trailer</T>} name="videoTrailer">
                <Button
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("videos");
                    setMediaManagerActions([videoTrailer, setVideoTrailer]);
                  }}
                >
                  <T>admin.upload_video</T>
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
              <Form.Item label={<T>admin.motto</T>} name="motto">
                <Input
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                />
              </Form.Item>
              <Form.Item label={<T>admin.bio</T>} name="bio">
                <Input.TextArea
                  rows={8}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </Form.Item>
              <Form.Item label={<T>admin.country</T>} name="country">
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
          {selectedRoles.includes("TRAINER") && (
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

              <Form.Item label={<T>admin.fitness_interests</T>} name="fitnessInterest">
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder={get(strings, "admin.please_select", "Please select")}
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
                  <T>admin.manage_fitness_interests</T>
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
              <T>admin.create</T>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default NewUser;
