import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Checkbox, List, Modal } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import {
  removeCategory,
  createCategory,
  getAllCategories,
  createProducts,
} from "../../../services/shop";
const { Option } = Select;
const { TextArea } = Input;

function NewProduct() {
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  // products
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productImg, setProductImg] = useState([]);
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [instock, setInstock] = useState(true);
  const [weight, setWeight] = useState(0);
  const [dimensions, setDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });
  const [allCategories, setAllCategories] = useState([]);
  const [newCategoryModalVisible, setNewCategoryModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const fethData = async () => {
    const data = await getAllCategories();
    setAllCategories(data.categories);
    console.log(data);
  };

  useEffect(() => {
    fethData();
  }, []);
  const onFinish = async (values) => {
    console.log("Success:", values);
    const d = {
      name: productName,
      description: productDesc,
      category: category,
      price: price,
      weight: weight,
      dimensions: dimensions,
      uploadImages: productImg.map((i) => i.link),
      instock: instock,
    };
    await createProducts(d);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const removeImage = (link) => {
    const imgs = productImg.filter((i) => i.link !== link);
    setProductImg(imgs);
  };

  const removeItem = async (id) => {
    await removeCategory(id);
    fethData();
  };
  return (
    <div>
      {/* media manager */}
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      {/*  */}
      {/* modal to create a new equipment */}
      <Modal
        onCancel={() => setNewCategoryModalVisible(false)}
        footer={false}
        visible={newCategoryModalVisible}
      >
        <p className="font-paragraph-white">Enter New Category Name</p>
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
                await createCategory(newCategoryName);
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
                <CloseSquareOutlined
                  onClick={() => removeItem(cat._id)}
                  style={{ color: "#ff8064", cursor: "pointer" }}
                />
              </List.Item>
            )}
          />
        </div>
      </Modal>
      {/*  */}
      <h2 className="font-heading-black">New Product</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <Form
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Product Name"
            name="productName"
            rules={[{ required: true, message: "Please input product name!" }]}
          >
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            name="productDesc"
            label="Product Description"
            rules={[
              {
                required: true,
                message: "Please input description!",
              },
            ]}
          >
            <TextArea
              rows={4}
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select
              className="field-focus-orange-border"
              placeholder="Select A Category"
              onChange={(e) => setCategory(e)}
              allowClear
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
              onClick={() => setNewCategoryModalVisible(true)}
            >
              Create New Category
            </Button>
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[
              {
                required: true,
                message: "Please input price!",
              },
            ]}
          >
            <Input
              addonBefore="€"
              value={price}
              type="number"
              onChange={(e) => setPrice(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="weight" label="Weight">
            <Input
              addonBefore="Kg"
              value={weight}
              type="number"
              onChange={(e) => setWeight(e.target.value)}
            />
          </Form.Item>
          <Form.Item name="dimensions" label="Dimensions">
            <Input
              placeholder="Length"
              value={dimensions.length}
              style={{ width: 100 }}
              type="number"
              onChange={(e) =>
                setDimensions({ ...dimensions, length: e.target.value })
              }
            />
            <Input
              placeholder="Width"
              style={{ width: 100 }}
              value={dimensions.width}
              type="number"
              onChange={(e) =>
                setDimensions({ ...dimensions, width: e.target.value })
              }
            />
            <Input
              placeholder="Height"
              value={dimensions.height}
              type="number"
              style={{ width: 100 }}
              onChange={(e) =>
                setDimensions({ ...dimensions, height: e.target.value })
              }
            />
          </Form.Item>
          <Form.Item
            name="uploadImg"
            valuePropName="checked"
            label="Upload Images"
          >
            <Button
              onClick={() => {
                setMediaManagerVisible(true);
                setMediaManagerType("images");
                setMediaManagerActions([productImg, setProductImg, "multiple"]);
              }}
            >
              Upload File
            </Button>
            <div style={{ display: "flex" }}>
              {productImg.map((img) => (
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
                    src={`${process.env.REACT_APP_SERVER}/uploads/${img.link}`}
                    height="100px"
                  />
                  <span>
                    {img.name}{" "}
                    <CloseSquareOutlined
                      style={{ cursor: "pointer" }}
                      onClick={() => removeImage(img.link)}
                    />
                  </span>
                </div>
              ))}
            </div>
          </Form.Item>
          <Form.Item
            name="remember"
            valuePropName="checked"
            label="In Stock"
            rules={[
              {
                required: true,
                message: "Please mark if the item is in stock!",
              },
            ]}
          >
            <Checkbox
              value={instock}
              onChange={(e) => setInstock(e.target.checked)}
            ></Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
              }}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default NewProduct;
