import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select, Modal, List } from "antd";
import { CloseSquareOutlined, LoadingOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import {
  createBlog,
  createBlogCategory,
  getAllBlogCategories,
  getAllBlogs,
  getAllUserBlogs,
  removeBlogCategory,
  updateBlog,
} from "../../../services/blogs";
import { userInfoContext } from "../../../contexts/UserStore";
import EditCategoryName from "./EditCategoryName";
import TextEditor from "../../TextEditor";
import Checkbox from "antd/lib/checkbox/Checkbox";
import { createPost } from "../../../services/posts";
import slug from "elegant-slug";
// import ReactHTMLParser from "react-html-parser";
import { LanguageContext } from "../../../contexts/LanguageContext";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { T } from "../../Translate";
const { Option } = Select;

function NewBlog({ setCurrentSelection }) {
  // user context
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const { language } = useContext(LanguageContext);

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
  const [userCreatePost, setUserCreatePost] = useState(false);
  // ----
  const [selectedBlog, setSelectedBlog] = useState("");
  const [allBlogs, setAllBlogs] = useState([]);

  // useEffect(() => {
  //   fethData();
  //   getAllBlogsFromBackend();
  // }, [language]);

  const fethData = async () => {
    const data = await getAllBlogCategories(language);
    setAllCategories(data.categories);
    console.log(data);
  };

  async function getAllBlogsFromBackend() {
    const data = await getAllUserBlogs(
      language === "english" ? "dutch" : "english"
    );
    // console.log(data);
    if (data && data.blogs) {
      setAllBlogs(data.blogs);
    }
  }

  async function updateSelectedBlog(id) {
    await updateBlog(
      {
        alternativeLanguage: id,
      },
      selectedBlog
    );
  }
  const createNewBlog = async () => {
    let flag = false;
    if (title && paragraph && featuredImage && videoLink && category) {
      flag = true;
    }
    if (!flag) {
      alert("Please fill all the information");
    } else {
      setLoading(true);
      const vals = {
        language: language,
        title,
        paragraph,
        featuredImage: featuredImage.link,
        videoLink: videoLink.link,
        category,
        user: userInfo.id,
        isPublic: isPublic,
        allowComments: allowComments,
        allowReviews: allowReviews,
      };
      if (selectedBlog) vals.alternativeLanguage = selectedBlog;

      const res = await createBlog(vals);
      setLoading(false);
      if (res) {
        // return;
        userCreatePost && createAPost(res.newBlog._id);
        selectedBlog && updateSelectedBlog(res.newBlog._id);
        setCurrentSelection(2.1);
      }
    }
  };

  const createAPost = async (id) => {
    const values = {
      title: title,
      image: featuredImage.link,
      text: "",
      type: "Magazine",
      language: language,
      url: `/magazine/${slug(title)}/${id}`,
    };
    await createPost(values);
    // setCreatePostModalVisible(false);
    // console.log(values);
  };

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
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
                await createBlogCategory({
                  name: newCategoryName,
                  language: language,
                });
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
      <h2 className="font-heading-black">New Blog</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <div style={{ marginTop: "-40px", marginBottom: "20px" }}>
          <span style={{ marginRight: "5px" }}>Select Language:</span>
          <LanguageSelector notFromNav={true} />
          <div>
            <span
              style={{ marginRight: "5px" }}
            >{`Select alternative language version`}</span>
            <Select
              style={{ width: "500px" }}
              onChange={(e) => setSelectedBlog(e)}
            >
              <Option value={""}>-</Option>
              {allBlogs.map((r, i) => (
                <Option key={i} value={r._id}>
                  {r.title}
                </Option>
              ))}
            </Select>
          </div>
        </div>
        <Form
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Title"
            name="recipeName"
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
            {featuredImage && (
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
                  src={`${process.env.REACT_APP_MEDIA_BASE_URL}${featuredImage.link}`}
                  height="auto"
                  width={"80%"}
                />
                <span>
                  {featuredImage.name}{" "}
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
            <TextEditor value={paragraph} setValue={setParagraph} />
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
            {videoLink && (
              <div className="font-paragraph-black">
                {videoLink.name}{" "}
                <CloseSquareOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => setVideLink("")}
                />
              </div>
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
              {" "}
              <Form.Item>
                <Checkbox
                  checked={userCreatePost}
                  onChange={(e) => setUserCreatePost(e.target.checked)}
                >
                  Create a post
                </Checkbox>
              </Form.Item>
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
              onClick={() => createNewBlog()}
            >
              <T>adminDashboard.create</T>
            </Button>
          )}
        </Form>
      </div>
    </>
  );
}

export default NewBlog;
