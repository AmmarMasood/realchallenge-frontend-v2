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
import { get } from "lodash";

const { Option } = Select;

function NewBlog({ setCurrentSelection }) {
  // user context
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const { language, strings } = useContext(LanguageContext);

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
  const [translationKey, setTranslationKey] = useState(null);

  // Handle selecting a blog to translate
  const handleSelectBlog = (blogId) => {
    setSelectedBlog(blogId);
    if (blogId) {
      const blog = allBlogs.find((b) => b._id === blogId);
      if (blog && blog.translationKey) {
        setTranslationKey(blog.translationKey);
      } else {
        setTranslationKey(null);
      }
    } else {
      setTranslationKey(null);
    }
  };

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

  // updateSelectedBlog removed - using translationKey for multi-language support
  const createNewBlog = async () => {
    let flag = false;
    if (title && paragraph && featuredImage && videoLink && category) {
      flag = true;
    }
    if (!flag) {
      alert(get(strings, "admin.please_fill_all_information", "Please fill all the information"));
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
      // alternativeLanguage removed - using translationKey for multi-language support
      if (translationKey) vals.translationKey = translationKey;

      const res = await createBlog(vals);
      setLoading(false);
      if (res) {
        // return;
        userCreatePost && createAPost(res.newBlog._id);
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
        <p className="font-paragraph-white"><T>admin.manage_blog_category</T></p>
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
            <T>admin.create</T>
          </Button>
        </div>
        <div style={{ height: "300px", overflow: "auto", marginTop: "10px" }}>
          <span className="font-subheading-white"><T>admin.all_categories</T></span>
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
                    <T>admin.delete</T>
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedCategoryForUpdate(cat);
                      setEditCategoryModelVisible(true);
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
      <h2 className="font-heading-black"><T>admin.new_blog</T></h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <div style={{ marginTop: "-40px", marginBottom: "20px" }}>
          <span style={{ marginRight: "5px" }}><T>admin.select_language</T>:</span>
          <LanguageSelector notFromNav={true} />
          <div>
            <span
              style={{ marginRight: "5px" }}
            ><T>admin.select_alt_language</T></span>
            <Select
              style={{ width: "500px" }}
              value={selectedBlog}
              onChange={handleSelectBlog}
            >
              <Option value={""}>-</Option>
              {allBlogs.map((r) => (
                <Option key={r._id} value={r._id}>
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
            label={<T>admin.title</T>}
            name="recipeName"
            rules={[{ required: true, message: "Please input title!" }]}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Form.Item>
          <Form.Item
            label={<T>admin.featured_image</T>}
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
              <T>admin.upload_file</T>
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
                  src={`${featuredImage.link}`}
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
            label={<T>admin.paragraph</T>}
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
          <Form.Item label={<T>admin.video_link</T>} name="videoLink">
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("videos");
                setMediaManagerActions([videoLink, setVideLink]);
              }}
            >
              <T>admin.upload_file</T>
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
          <Form.Item label={<T>admin.category</T>} name="category">
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
              <T>admin.manage_categories</T>
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
                  <T>admin.create_post</T>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                >
                  <T>admin.make_public</T>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={allowReviews}
                  onChange={(e) => setAllowReviews(e.target.checked)}
                >
                  <T>admin.allow_reviews</T>
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                >
                  <T>admin.allow_comments</T>
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
