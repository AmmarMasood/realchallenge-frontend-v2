import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Modal } from "antd";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { createPost } from "../../../services/posts";

function UpdatePost({ postInfo, show, setShow, onUpdateComplete }) {
  const [form] = Form.useForm();
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [type, setType] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    form.setFieldsValue({
      name: postInfo.title,
      description: postInfo.text,
      category: postInfo.type,
    });
    setType(postInfo.type);
    setImage({ name: postInfo.image, link: postInfo.image });
  }, []);

  const onFinish = async (values) => {
    if (type && image) {
      const data = {
        id: postInfo._id,
        title: values.name,
        text: values.description,
        image: typeof image === "object" ? image.link : "",
        type: type,
      };
      onUpdateComplete(data);
    } else {
      window.alert("All values are requeired to create a post");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Modal
      width="60%"
      visible={show}
      footer={false}
      onCancel={() => setShow(false)}
      onOk={onUpdateComplete}
    >
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <h2 className="font-heading-white">Update Post</h2>
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
            label="Post Title"
            name="name"
            rules={[{ required: true, message: "Please input post title!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Post Description"
            name="description"
            rules={[
              { required: true, message: "Please input post description!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Post Image" name="image">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("images");
                setMediaManagerActions([image, setImage]);
              }}
            >
              Upload Image
            </Button>
            <div
              className="font-paragraph-white"
              style={{ color: "#ff7700", margin: "5px 0" }}
            >
              {image && (
                <img
                  src={`${process.env.REACT_APP_SERVER}/uploads/${image.link}`}
                  alt=""
                  height="100px"
                />
              )}
            </div>
          </Form.Item>
          <Form.Item label="Post Category" name="category" required={true}>
            <Select
              allowClear
              style={{ width: "100%" }}
              value={type}
              placeholder="Please select"
              onChange={(e) => setType(e)}
            >
              {["Challenge", "Magazine", "Recipe", "News Updates"].map(
                (e, i) => (
                  <Select.Option key={i + 1} value={e}>
                    {e}
                  </Select.Option>
                )
              )}
            </Select>
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
              Update
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default UpdatePost;
