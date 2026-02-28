import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select, Modal, Tag } from "antd";
import {
  LoadingOutlined,
  CloseSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { registerUser } from "../../../services/authentication";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { updateUserProfileByAdmin, updateUserRoles } from "../../../services/users";
import {
  getAllTrainerGoals,
  updateTrainerById,
} from "../../../services/trainers";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

const { Option } = Select;
function UpdateUser({
  userInfo,
  show,
  setShow,
  onUpdateComplete,
  fetchUsers,
  allChallengeGoals,
}) {
  const { strings } = useContext(LanguageContext);
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
  const [rolesChanged, setRolesChanged] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [membership, setMembership] = useState("");
  const [hero, setHero] = useState("");
  const [videoTrailer, setVideoTrailer] = useState("");
  const [motto, setMotto] = useState("");
  const [motto_en, setMottoEn] = useState("");
  const [motto_nl, setMottoNl] = useState("");
  const [bio, setBio] = useState("");
  const [bio_en, setBioEn] = useState("");
  const [bio_nl, setBioNl] = useState("");
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
    // Initialize roles from roles array or single role field
    const initialRoles = userInfo.roles && userInfo.roles.length > 0
      ? userInfo.roles.map(r => r.toUpperCase())
      : userInfo.role ? [userInfo.role.toUpperCase()] : [];

    form.setFieldsValue({
      username: userInfo.username,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      roles: initialRoles,
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
    setBioEn(userInfo.bio_en || "");
    setBioNl(userInfo.bio_nl || "");
    setGender(userInfo.gender);
    userInfo.avatarLink &&
      setAvatar({ name: userInfo.avatarLink, link: userInfo.avatarLink });
    setCountry(userInfo.country);
    userInfo.heroBanner &&
      setHero({ name: userInfo.heroBanner, link: userInfo.heroBanner });
    setMotto(userInfo.motto);
    setMottoEn(userInfo.motto_en || "");
    setMottoNl(userInfo.motto_nl || "");
    setGoals(userInfo.goals ? userInfo.goals : []);
    userInfo.videoTrailerLink &&
      setVideoTrailer({
        name: userInfo.videoTrailerLink,
        link: userInfo.videoTrailerLink,
      });

    setSelectedRoles(initialRoles);
    setRolesChanged(false);
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

  const saveRoles = async () => {
    if (rolesChanged && selectedRoles.length > 0) {
      setLoading(true);
      const rolesLowerCase = selectedRoles.map(r => r.toLowerCase());
      const result = await updateUserRoles(userInfo._id, rolesLowerCase);
      if (result) {
        setRolesChanged(false);
        fetchUsers();
      }
      setLoading(false);
    }
  };

  const createANewUser = async () => {
    let flag = false;
    console.log("here", flag);
    if (username && firstName && lastName && email) {
      flag = true;
    }
    console.log("here", flag);
    if (flag) {
      setLoading(true);

      // Save roles if changed
      if (rolesChanged && selectedRoles.length > 0) {
        const rolesLowerCase = selectedRoles.map(r => r.toLowerCase());
        await updateUserRoles(userInfo._id, rolesLowerCase);
        setRolesChanged(false);
      }

      if (selectedRoles.includes("ADMIN")) {
        const data = {
          firstName,
          lastName,
          email,
          username,
          gender,
        };
        const res = await updateUserProfileByAdmin(data, userInfo._id);
        fetchUsers();
        console.log("ADMIN UPDATED", res);
        setLoading(false);
      } else if (selectedRoles.includes("TRAINER")) {
        const data = {
          firstName,
          lastName,
          password,
          email,
          username,
          heroBanner: typeof hero === "object" ? hero.link : hero,
          videoTrailerLink:
            typeof videoTrailer === "object" ? videoTrailer.link : videoTrailer,
          motto: motto_en || motto,
          motto_en,
          motto_nl,
          bio: bio_en || bio,
          bio_en,
          bio_nl,
          country,
          gender,
          trainersFitnessInterest: selectedFitnessInterest,
          avatarLink: typeof avatar === "object" ? avatar.link : avatar,
          trainerGoals: goals,
        };
        const res = await updateTrainerById(userInfo._id, data);
        fetchUsers();
        console.log("TRAINER UPDATED", res);
        setLoading(false);
      } else {
        const data = {
          firstName,
          lastName,
          password,
          email,
          username,
          gender,
          hero: typeof hero === "object" ? hero.link : hero,
          videoTrailer:
            typeof videoTrailer === "object" ? videoTrailer.link : videoTrailer,
          motto: motto_en || motto,
          motto_en,
          motto_nl,
          bio: bio_en || bio,
          bio_en,
          bio_nl,
          country,
          avatar: typeof avatar === "object" ? avatar.link : avatar,
        };
        const res = await updateUserProfileByAdmin(data, userInfo._id);

        console.log("USER UPDATED", res);
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
      <h2 className="font-heading-white"><T>admin.update_user</T></h2>
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
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={true}
            />
          </Form.Item>
          <Form.Item
            label={<T>admin.first_name</T>}
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
            label={<T>admin.last_name</T>}
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

          <Form.Item name="gender" label={<T>admin.gender</T>}>
            <Select
              className="field-focus-orange-border"
              placeholder={get(strings, "admin.select_gender", "Select A Gender")}
              value={gender}
              onChange={(e) => setGender(e)}
              allowClear
            >
              <Option value="male"><T>admin.male</T></Option>
              <Option value="female"><T>admin.female</T></Option>
              <Option value="other"><T>admin.other</T></Option>
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
                  setSelectedRoles(["ADMIN"]);
                } else if (values.includes("CUSTOMER")) {
                  setSelectedRoles(["CUSTOMER"]);
                } else {
                  setSelectedRoles(values);
                }
                setRolesChanged(true);
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
            </Select>
          </Form.Item>
          {selectedRoles.includes("CUSTOMER") ? (
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
          ) : (
            ""
          )}

          {!selectedRoles.includes("ADMIN") && (
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
                      src={
                        avatar.link ===
                        "https://thumbs.dreamstime.com/b/default-avatar-photo-placeholder-profile-icon-eps-file-easy-to-edit-default-avatar-photo-placeholder-profile-icon-124557887.jpg"
                          ? avatar.link
                          : `${avatar.link}`
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
              <Form.Item label={<><T>admin.motto</T> <Tag color="blue">EN</Tag></>}>
                <Input
                  value={motto_en}
                  onChange={(e) => setMottoEn(e.target.value)}
                  placeholder="Motto (English)"
                />
              </Form.Item>
              <Form.Item label={<><T>admin.motto</T> <Tag color="orange">NL</Tag></>}>
                <Input
                  value={motto_nl}
                  onChange={(e) => setMottoNl(e.target.value)}
                  placeholder="Motto (Nederlands)"
                />
              </Form.Item>
              <Form.Item label={<><T>admin.bio</T> <Tag color="blue">EN</Tag></>}>
                <Input.TextArea
                  rows={6}
                  value={bio_en}
                  onChange={(e) => setBioEn(e.target.value)}
                  placeholder="Bio (English)"
                />
              </Form.Item>
              <Form.Item label={<><T>admin.bio</T> <Tag color="orange">NL</Tag></>}>
                <Input.TextArea
                  rows={6}
                  value={bio_nl}
                  onChange={(e) => setBioNl(e.target.value)}
                  placeholder="Bio (Nederlands)"
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
            <Form.Item label={<T>admin.goals</T>} name="goals">
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
          {selectedRoles.includes("TRAINER") && (
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
              <T>admin.update</T>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default UpdateUser;
