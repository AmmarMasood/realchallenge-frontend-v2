import React, { useState, useEffect, useContext } from "react";
import { Form, Input, Button, Select, Modal, List, Checkbox } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";
import { createPost } from "../../../services/posts";
import {
  createFaqCategory,
  getAllFaqCategories,
  removeFaqCategory,
  updateFaq,
} from "../../../services/faqs";
import EditTypeName from "./EditTypeName";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";

const { Option } = Select;

function UpdateFaq({ visible, setVisible, selectedFaq, getAllFaqs }) {
  const [form] = Form.useForm();
  const [category, setCategory] = useState([]);
  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [isPublic, setIsPublic] = useState(true);
  const { language } = useContext(LanguageContext);

  // update stuff
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);

  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  const fetchData = async () => {
    const aC = await getAllFaqCategories(language);
    // console.log(aC);
    if (aC) {
      setAllCategories(aC.categories);
    }
  };

  useEffect(() => {
    fetchData();

    form.setFieldsValue({
      question: selectedFaq.question,
      answer: selectedFaq.answer,
      isPublic: selectedFaq.isPublic,
      category: selectedFaq.category,
    });

    setIsPublic(selectedFaq.isPublic);
    selectedFaq.category && setCategory(selectedFaq.category);
  }, []);

  const removeCategory = async (id) => {
    await removeFaqCategory(id);
    fetchData();
  };
  const onFinish = async (values) => {
    const data = {
      ...values,
      category,
      isPublic,
    };
    console.log(data);
    await updateFaq(data, selectedFaq._id);
    getAllFaqs();
    setVisible(false);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      {/*  */}
      <EditTypeName
        editItemNameModalVisible={editItemNameModalVisible}
        setEditItemModelVisible={setEditItemNameModalVisible}
        fethData={fetchData}
        selectedItemForUpdate={selectedItemForUpdate}
        titleName={selectedItemForUpdateTitle}
      />
      {/* modal to create a new goal */}
      <Modal
        onCancel={() => setCategoryModal(false)}
        footer={false}
        visible={categoryModal}
      >
        <p className="font-paragraph-white"><T>admin.manage_categories</T></p>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
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
              if (newCategoryName.length > 0) {
                await createFaqCategory({ name: newCategoryName, language });
                // setShowGoalModal(false);
                fetchData();
              }
            }}
          >
            <T>admin.create_category</T>
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
                key={cat._id}
              >
                <span>{cat.name}</span>

                <span>
                  <Button
                    onClick={async () => {
                      removeCategory(cat._id);
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
                      setSelectedItemForUpdateTitle("Update Faq Category");
                      setSelectedItemForUpdate(cat);
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

      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={false}
        width="70%"
      >
        <h2 className="font-heading-white"><T>admin.update</T> FAQ</h2>
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
              label={<T>admin.question</T>}
              name="question"
              rules={[{ required: true, message: "Please input question!" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label={<T>admin.answer</T>}
              name="answer"
              rules={[{ required: true, message: "Please input answer!" }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item label={<T>admin.category</T>} name="category">
              <Select
                mode="multiple"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                value={category}
                onChange={(e) => setCategory(e)}
              >
                {allCategories.map((cat) => (
                  <Option value={cat._id} key={cat._id}>
                    {cat.name}
                  </Option>
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
                onClick={() => setCategoryModal(true)}
              >
                <T>admin.manage_category</T>
              </Button>
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              >
                <T>admin.make_public</T>
              </Checkbox>
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
                <T>admin.update</T>
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default UpdateFaq;
