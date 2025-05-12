import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select } from "antd";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { createExercise } from "../../../services/createChallenge/main";
import { getAllTrainers } from "../../../services/trainers";
import { userInfoContext } from "../../../contexts/UserStore";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { LanguageContext } from "../../../contexts/LanguageContext";
const { Option } = Select;

function NewExercise({ setCurrentSelection, home }) {
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [trainer, setTrainer] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [voiceOverLink, setVoiceOverLink] = useState("");
  const [allTrainers, setAllTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const userInfo = useContext(userInfoContext)[0];
  const { language } = useContext(LanguageContext);

  useEffect(() => {
    if (userInfo.role === "trainer") {
      setTrainer(userInfo.id);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    const res = await getAllTrainers();
    if (res) {
      setAllTrainers(res.trainers);
      setFilteredTrainers(res.trainers);
    }
  };
  const onFinish = async (values) => {
    console.log(values, trainer);
    // return;
    if (videoLink && trainer) {
      console.log(values);
      const data = {
        videoURL: videoLink.link,
        voiceOverLink: voiceOverLink.link,
        trainer,
        language,
        ...values,
      };
      const res = await createExercise(data);
      setCurrentSelection(home);
      console.log("values", res);
    } else {
      alert("Please add a video link and trainer of a exercise");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <h2 className="font-heading-black">New Exercise</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <div>
          <span>Select Language: </span>
          <LanguageSelector notFromNav={true} />
        </div>
        <Form
          layout="vertical"
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Exercise Title"
            name="title"
            rules={[
              { required: true, message: "Please input exercise title!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Exercise Video" required="true">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("videos");
                setMediaManagerActions([videoLink, setVideoLink]);
              }}
            >
              Upload Video
            </Button>
            <div
              className="font-paragraph-white"
              style={{ color: "#ff7700", margin: "5px 0" }}
            >
              {videoLink && videoLink.name}
            </div>
          </Form.Item>
          <Form.Item label="Exercise Description (Optional)" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Trainer" required="true">
            {/* {console.log("trainers", trainers)} */}
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              value={trainer}
              disabled={userInfo.role === "trainer" ? true : false}
              onChange={(e) => setTrainer(e)}
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
          <Form.Item label="Voiceover Link (Optional)">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("voiceOvers");
                setMediaManagerActions([voiceOverLink, setVoiceOverLink]);
              }}
            >
              Upload Voiceover
            </Button>
            <div
              className="font-paragraph-white"
              style={{ color: "#ff7700", margin: "5px 0" }}
            >
              {voiceOverLink && voiceOverLink.name}
            </div>
          </Form.Item>

          {/* footer */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
                marginTop: "10px",
              }}
            >
              Create Exercise
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}

export default NewExercise;
