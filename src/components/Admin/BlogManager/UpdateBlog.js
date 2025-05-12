import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select, Modal, List } from "antd";
import { CloseSquareOutlined, LoadingOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import {
  createBlogCategory,
  getAllBlogCategories,
  getAllUserBlogs,
  removeBlogCategory,
} from "../../../services/blogs";
import EditCategoryName from "./EditCategoryName";
import TextEditor from "../../TextEditor";
import Checkbox from "antd/lib/checkbox/Checkbox";
import { userInfoContext } from "../../../contexts/UserStore";
import { LanguageContext } from "../../../contexts/LanguageContext";

const { Option } = Select;

function UpdateBlog({ blogInfo, show, setShow, onUpdateComplete }) {
  const [form] = Form.useForm();
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const [title, setTitle] = useState("");
  const [paragraph, setParagraph] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoLink, setVideLink] = useState("");
  //   category
  const [category, setCategory] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editCategoryNameModalVisible, setEditCategoryModelVisible] =
    useState(false);

  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] = useState(
    {}
  );
  const [isPublic, setIsPublic] = useState(false);
  const [allowComments, setAllowComments] = useState(false);
  const [allowReviews, setAllowReviews] = useState(false);

  const [allBlogs, setAllBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState("");
  const { language } = useContext(LanguageContext);

  const userInfo = useContext(userInfoContext)[0];
  useEffect(() => {
    fethData();
    getAllBlogsFromBackend();
    form.setFieldsValue({
      title: blogInfo.title,
      paragraph: blogInfo.paragraph,
      category: blogInfo.category,
    });
    blogInfo.category && setCategory(blogInfo.category._id);
    blogInfo.alternativeLanguage &&
      setSelectedBlog(blogInfo.alternativeLanguage._id);
    setFeaturedImage(blogInfo.featuredImage);
    setVideLink(blogInfo.videoLink);
    setTitle(blogInfo.title);
    setParagraph(blogInfo.paragraph);
    setAllowReviews(blogInfo.allowReviews);
    setAllowComments(blogInfo.allowComments);
    setIsPublic(blogInfo.isPublic);

    console.log(blogInfo);
  }, [blogInfo]);

  async function getAllBlogsFromBackend() {
    const data = await getAllUserBlogs(
      language === "dutch" ? "english" : "dutch"
    );
    if (data && data.blogs) {
      setAllBlogs(data.blogs);
    }
  }

  const fethData = async () => {
    const data = await getAllBlogCategories(language);
    setAllCategories(data.categories);
    console.log(data);
  };

  const updateTheBlog = async () => {
    let flag = false;
    if (title && paragraph && featuredImage && videoLink && category) {
      flag = true;
    }
    if (!flag) {
      alert("Please fill all the information");
    } else {
      setLoading(true);
      const vals = {
        title,
        paragraph,
        featuredImage:
          typeof featuredImage === "object"
            ? featuredImage.link
            : featuredImage,
        videoLink: typeof videoLink === "object" ? videoLink.link : videoLink,
        category,
        isPublic: isPublic,
        allowComments: allowComments,
        allowReviews: allowReviews,
        alternativeLanguage: selectedBlog,
      };
      onUpdateComplete(setLoading, vals, blogInfo._id);
    }
  };

  const onFinish = (values) => {
    console.log("Success:", values);
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
      {/* media manager */}
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      {/* edit category name modal */}
      <EditCategoryName
        editCategoryNameModalVisible={editCategoryNameModalVisible}
        setEditCategoryModelVisible={setEditCategoryModelVisible}
        fethData={fethData}
        selectedForUpdate={selectedCategoryForUpdate}
        titleName="Update Category"
      />
      {/* modal to create a new meal type  */}
      <Modal
        onCancel={() => setCategoryModalVisible(false)}
        footer={false}
        visible={categoryModalVisible}
      >
        <p className="font-paragraph-white">Manage Blog Category</p>

        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button
            type="primary"
            htmlType="submit"
            onClick={async () => {
              if (newCategoryName.length > 0) {
                await createBlogCategory(newCategoryName);
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
          <span className="font-subheading-white">All Categories</span>
          <List
            size="small"
            bordered
            dataSource={allCategories}
            renderItem={(cat) => (
              <List.Item
                style={{
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{cat.name}</span>
                <span>
                  <Button
                    onClick={async () => {
                      await removeBlogCategory(cat._id);
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
                      setSelectedCategoryForUpdate(cat);
                      setEditCategoryModelVisible(true);
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
      <h2 className="font-heading-white">Update Blog</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <Form
          layout="vertical"
          form={form}
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <div>
            <p>Language: {blogInfo?.language}</p>
            <span
              style={{ marginRight: "5px" }}
            >{`Select alternative language version`}</span>
            <Select
              style={{ width: "500px" }}
              onChange={(e) => setSelectedBlog(e)}
              value={selectedBlog}
            >
              <Option value={""} key={1}>
                -
              </Option>
              {allBlogs.map(
                (r, i) =>
                  r._id !== blogInfo._id && (
                    <Option key={i + 2} value={r._id}>
                      {r.title}
                    </Option>
                  )
              )}
            </Select>
          </div>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please input title!" }]}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Item>
          <Form.Item
            label="Featured Image"
            name="featuredImage"
            rules={[
              { required: true, message: "Please input featured image!" },
            ]}
          >
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("images");
                setMediaManagerActions([featuredImage, setFeaturedImage]);
              }}
            >
              Upload File
            </Button>
            {typeof featuredImage === "object" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: "15px",
                  marginTop: "10px",
                }}
              >
                <img
                  alt=""
                  src={`${process.env.REACT_APP_SERVER}/uploads/${featuredImage.link}`}
                  height="200px"
                  width="250px"
                />
                <span>
                  {featuredImage.name}{" "}
                  <CloseSquareOutlined
                    style={{ cursor: "pointer" }}
                    onClick={() => setFeaturedImage("")}
                  />
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginRight: "15px",
                  marginTop: "10px",
                }}
              >
                <img
                  alt=""
                  src={`${process.env.REACT_APP_SERVER}/uploads/${featuredImage}`}
                  height="200px"
                  width="250px"
                />
                <span>
                  <CloseSquareOutlined
                    style={{ cursor: "pointer" }}
                    onClick={() => setFeaturedImage("")}
                  />
                </span>
              </div>
            )}
          </Form.Item>
          <Form.Item
            label="Paragraph"
            name="paragraph"
            rules={[{ required: true }]}
          >
            {/* <Input.TextArea
              rows={20}
              value={paragraph}
              onChange={(e) => setParagraph(e.target.value)}
            /> */}
            <TextEditor
              key={JSON.stringify(paragraph)}
              value={paragraph}
              setValue={setParagraph}
            />
          </Form.Item>
          <Form.Item label="Video Link" name="videoLink">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("videos");
                setMediaManagerActions([videoLink, setVideLink]);
              }}
            >
              Upload File
            </Button>
            {typeof videoLink === "object" ? (
              <div className="font-paragraph-black">
                {videoLink.name}{" "}
                <CloseSquareOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => setVideLink("")}
                />
              </div>
            ) : (
              videoLink && (
                <div className="font-paragraph-black">
                  {`${process.env.REACT_APP_SERVER}/uploads/${videoLink}`}{" "}
                  <CloseSquareOutlined
                    style={{ cursor: "pointer" }}
                    onClick={() => setVideLink("")}
                  />
                </div>
              )
            )}
          </Form.Item>
          <Form.Item label="Category" name="category">
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Please select"
              value={category}
              onChange={(e) => setCategory(e)}
            >
              {allCategories.map((cat) => (
                <Option value={cat._id}>{cat.name}</Option>
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
              onClick={() => setCategoryModalVisible(true)}
            >
              Manage Blog Categories
            </Button>
          </Form.Item>

          {userInfo.role === "admin" && (
            <>
              <Form.Item>
                <Checkbox
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                >
                  Make Public
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={allowReviews}
                  onChange={(e) => setAllowReviews(e.target.checked)}
                >
                  Allow Reviews
                </Checkbox>
              </Form.Item>

              <Form.Item>
                <Checkbox
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                >
                  Allow Comments
                </Checkbox>
              </Form.Item>
            </>
          )}
          {loading ? (
            <LoadingOutlined style={{ color: "#ff7700", fontSize: "30px" }} />
          ) : (
            <Button
              style={{
                backgroundColor: "var(--color-orange)",
                border: "none",
                color: "white",
                marginTop: "5px",
              }}
              onClick={() => updateTheBlog()}
            >
              Update
            </Button>
          )}
        </Form>
      </div>
    </Modal>
  );
}

export default UpdateBlog;
