import React, { useState, useContext } from "react";
import { Form, Input, Button, Select } from "antd";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { createPost } from "../../../services/posts";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";
const { Option } = Select;

function NewPost() {
  const { strings } = useContext(LanguageContext);
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [type, setType] = useState("");
  const [image, setImage] = useState("");

  const onFinish = async (values) => {
    if (type && image) {
      const data = {
        title: values.name,
        text: values.description,
        image: typeof image === "object" ? image.link : "",
        type: type,
      };
      await createPost(data);
    } else {
      window.alert(get(strings, "admin.all_values_required", "All values are required to create a post"));
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
      <h2 className="font-heading-black"><T>admin.new_post</T></h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <Form
          layout="vertical"
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label={<T>admin.post_title</T>}
            name="name"
            rules={[{ required: true, message: get(strings, "admin.please_input_post_title", "Please input post title!") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={<T>admin.post_description</T>}
            name="description"
            rules={[
              { required: true, message: get(strings, "admin.please_input_post_description", "Please input post description!") },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={<T>admin.post_image</T>} name="image">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("images");
                setMediaManagerActions([image, setImage]);
              }}
            >
              <T>admin.upload_image</T>
            </Button>
            <div
              className="font-paragraph-white"
              style={{ color: "#ff7700", margin: "5px 0" }}
            >
              {image && image.name}
            </div>
          </Form.Item>
          <Form.Item label={<T>admin.post_category</T>} name="category" required={true}>
            <Select
              allowClear
              style={{ width: "100%" }}
              value={type}
              placeholder={get(strings, "admin.please_select", "Please select")}
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
              <T>admin.create</T>
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}

export default NewPost;
