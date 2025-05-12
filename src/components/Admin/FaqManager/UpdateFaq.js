import React, { useState, useEffect } from "react";
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
const { Option } = Select;

function UpdateFaq({ visible, setVisible, selectedFaq, getAllFaqs }) {
  const [form] = Form.useForm();
  const [category, setCategory] = useState([]);
  const [categoryModal, setCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [isPublic, setIsPublic] = useState(true);

  // update stuff
  const [editItemNameModalVisible, setEditItemNameModalVisible] =
    useState(false);

  const [selectedItemForUpdate, setSelectedItemForUpdate] = useState({});
  const [selectedItemForUpdateTitle, setSelectedItemForUpdateTitle] =
    useState("");

  const fetchData = async () => {
    const aC = await getAllFaqCategories();
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
        <p className="font-paragraph-white">Categories</p>
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
                await createFaqCategory(newCategoryName);
                // setShowGoalModal(false);
                fetchData();
              }
            }}
          >
            Create Category
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
                    Delete
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedItemForUpdateTitle("Update Faq Category");
                      setSelectedItemForUpdate(cat);
                      setEditItemNameModalVisible(true);
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

      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={false}
        width="70%"
      >
        <h2 className="font-heading-white">Update FAQ</h2>
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
              label="Question"
              name="question"
              rules={[{ required: true, message: "Please input question!" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="Answer"
              name="answer"
              rules={[{ required: true, message: "Please input answer!" }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item label="Category" name="category">
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
                Manage Category
              </Button>
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              >
                Make public
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
                Update
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
}

export default UpdateFaq;
