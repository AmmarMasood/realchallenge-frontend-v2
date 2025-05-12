import React, { useState, useEffect } from "react";
import { Form, Input, Button, Modal, Select } from "antd";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { updateExercise } from "../../../services/createChallenge/main";

function UpdateExercise({
  show,
  setShow,
  exerciseValues,
  fetchExercises,
  allTrainers,
}) {
  const [form] = Form.useForm();
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [videoLink, setVideoLink] = useState("");
  const [voiceOverLink, setVoiceOverLink] = useState("");
  const [trainer, setTrainer] = useState("");

  useEffect(() => {
    console.log("trainer", exerciseValues.trainer);
    form.setFieldsValue({
      title: exerciseValues.title,
      break: exerciseValues.break,
      exerciseLength: exerciseValues.exerciseLength,
      exerciseGroupName: exerciseValues.exerciseGroupName,
      description: exerciseValues.description,
      trainer: exerciseValues.trainer,
    });
    setVideoLink({
      link: exerciseValues.videoURL,
      name: exerciseValues.videoURL,
    });
    setTrainer(exerciseValues.trainer);
    setVoiceOverLink({
      link: exerciseValues.voiceOverLink,
      name: exerciseValues.voiceOverLink,
    });
    console.log("nrere", exerciseValues);
  }, []);

  const onFinish = async (values) => {
    if (videoLink && trainer) {
      const data = {
        videoURL: videoLink.link,
        voiceOverLink: voiceOverLink.link,
        trainer: trainer,
        ...values,
      };
      const res = await updateExercise(data, exerciseValues._id);
      fetchExercises();
      setShow(false);
      console.log("values", res);
    } else {
      alert("Please add a video link of a exercise");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      visible={show}
      onCancel={() => setShow(false)}
      footer={false}
      width="70%"
    >
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <h2 className="font-heading-white">Update Exercise</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <Form
          layout="vertical"
          name="basic"
          form={form}
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
          <Form.Item label="Exercise Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Trainer" required="true">
            {/* {console.log("trainers", trainers)} */}
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              value={trainer ? trainer._id : ""}
              onChange={(e) => setTrainer(e)}
            >
              {allTrainers.map((trainer) => (
                <Select.Option value={trainer._id}>
                  {trainer.firstName} {trainer.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Voiceover Link">
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
              Update Exercise
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default UpdateExercise;
