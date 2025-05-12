import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Modal } from "antd";
import {
  LoadingOutlined,
  CloseSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { registerUser } from "../../../services/authentication";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { updateUserProfileByAdmin } from "../../../services/users";
import {
  getAllTrainerGoals,
  updateTrainerById,
} from "../../../services/trainers";

const { Option } = Select;
function UpdateUser({
  userInfo,
  show,
  setShow,
  onUpdateComplete,
  fetchUsers,
  allChallengeGoals,
}) {
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
  const [allTrainerGoals, setAllTrainerGoals] = useState([]);
  const [selectedFitnessInterest, setSelectedFitnessInterest] = useState("");

  useEffect(() => {
    const allCountries = require("../../../assets/data/all-countries.json");
    setAllCountries(allCountries);
    fetchData();
    console.log("user info", userInfo);
    form.setFieldsValue({
      username: userInfo.username,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      role: userInfo.role ? userInfo.role.toUpperCase() : "",
      bio: userInfo.bio,
      country: userInfo.country,
      avatarLink: userInfo.avatarLink,
      hero: userInfo.heroBanner,
      motto: userInfo.motto,
      videoTrailer: userInfo.videoTrailerLink,
      goals: userInfo.trainerGoals ? userInfo.trainerGoals : [],
      gender: userInfo.gender,
    });
    setUsername(userInfo.username);
    setEmail(userInfo.email);
    setFirstName(userInfo.firstName);
    setLastName(userInfo.lastName);
    setBio(userInfo.bio);
    setGender(userInfo.gender);
    userInfo.avatarLink &&
      setAvatar({ name: userInfo.avatarLink, link: userInfo.avatarLink });
    setCountry(userInfo.country);
    userInfo.heroBanner &&
      setHero({ name: userInfo.heroBanner, link: userInfo.heroBanner });
    setMotto(userInfo.motto);
    setGoals(userInfo.goals ? userInfo.goals : []);
    userInfo.videoTrailerLink &&
      setVideoTrailer({
        name: userInfo.videoTrailerLink,
        link: userInfo.videoTrailerLink,
      });

    userInfo.role && setRole(userInfo.role.toUpperCase());
  }, []);

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const fetchData = async () => {
    const res = await getAllTrainerGoals();
    if (res.goals) {
      setAllTrainerGoals(res.goals);
    }

    console.log("res", res);
  };
  // function generatePass() {
  //   var length = 10,
  //     charset =
  //       "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  //     retVal = "";
  //   for (var i = 0, n = charset.length; i < length; ++i) {
  //     retVal += charset.charAt(Math.floor(Math.random() * n));
  //   }
  //   setPassword(retVal);
  //   form.setFieldsValue({
  //     password: retVal,
  //   });
  //   return retVal;
  // }

  const createANewUser = async () => {
    let flag = false;
    console.log("here", flag);
    if (username && firstName && lastName && email) {
      flag = true;
    }
    console.log("here", flag);
    if (flag) {
      if (role === "ADMIN") {
        const data = {
          firstName,
          lastName,
          email,
          username,
          gender,
          role: role.toLowerCase(),
        };
        const res = await updateUserProfileByAdmin(data, userInfo._id);
        fetchUsers();
        console.log("ADMIN CREATED", res);
        setLoading(false);
      } else if (role === "TRAINER") {
        const data = {
          firstName,
          lastName,
          password,
          email,
          username,
          role: role.toLowerCase(),
          heroBanner: typeof hero === "object" ? hero.link : hero,
          videoTrailerLink:
            typeof videoTrailer === "object" ? videoTrailer.link : videoTrailer,
          motto,
          bio,
          country,
          gender,
          trainersFitnessInterest: selectedFitnessInterest,
          avatarLink: typeof avatar === "object" ? avatar.link : avatar,
          trainerGoals: goals,
        };
        const res = await updateTrainerById(userInfo._id, data);
        fetchUsers();
        console.log("TRAINER CREATED", res);
        setLoading(false);
      } else {
        const data = {
          firstName,
          lastName,
          password,
          email,
          username,
          gender,
          role: role.toLowerCase(),
          hero: typeof hero === "object" ? hero.link : hero,
          videoTrailer:
            typeof videoTrailer === "object" ? videoTrailer.link : videoTrailer,
          motto,
          bio,
          country,
          avatar: typeof avatar === "object" ? avatar.link : avatar,
        };
        const res = await updateUserProfileByAdmin(data, userInfo._id);

        console.log("AUTHOR NUTRIENT SHOP MANAGER CREATED", res);
        fetchUsers();
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      width="60%"
      visible={show}
      footer={false}
      onCancel={() => setShow(false)}
      onOk={onUpdateComplete}
    >
      {/* media manager */}
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <h2 className="font-heading-white">Update User</h2>
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
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label="First Name"
            name="firstName"
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
            name="lastName"
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
              value={gender}
              onChange={(e) => setGender(e)}
              allowClear
            >
              <Option value="male">Male</Option>
              <Option value="female">Female</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>

          {/* <Form.Item
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
          </Form.Item> */}

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
              disabled={true}
              className="field-focus-orange-border"
              placeholder="Select A Role"
              onChange={(e) => setRole(e)}
              allowClear
            >
              <Option value="ADMIN">Admin</Option>
              <Option value="TRAINER">Trainer</Option>
              <Option value="AUTHOR">Author</Option>
              <Option value="NUTRITIONIST">Nutritionist</Option>
              <Option value="SHOP-MANAGER">Shop Manager</Option>
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
                      src={
                        avatar.link ===
                        "https://thumbs.dreamstime.com/b/default-avatar-photo-placeholder-profile-icon-eps-file-easy-to-edit-default-avatar-photo-placeholder-profile-icon-124557887.jpg"
                          ? avatar.link
                          : `${process.env.REACT_APP_SERVER}/uploads/${avatar.link}`
                      }
                      height="120px"
                      width="150px"
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
                      height="150px"
                      width="200px"
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
            <Form.Item label="Goals" name="goals">
              <Select
                value={goals}
                style={{ width: "100%" }}
                onChange={(e) => setGoals(e)}
                mode="multiple"
              >
                {allChallengeGoals.map((e) => (
                  <Option value={e._id}>{e.name}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {role.includes("TRAINER") && (
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
            </Form.Item>
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
              Update
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default UpdateUser;
