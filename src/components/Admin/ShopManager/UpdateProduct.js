import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Checkbox, List, Modal } from "antd";
import { CloseSquareOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { getAllCategories, updateProduct } from "../../../services/shop";
import { withRouter } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

function UpdateProduct(props) {
  const [form] = Form.useForm();
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

  const fethData = async () => {
    const data = await getAllCategories();
    setAllCategories(data.categories);
    // console.log(props.match.params.productId);
  };

  useEffect(() => {
    console.log(props.selectedProduct);
    form.setFieldsValue({
      productName: props.selectedProduct.name,
      productDesc: props.selectedProduct.description,
      category: props.selectedProduct._id,
      price: props.selectedProduct.price,
      weight: props.selectedProduct.weight,
      inStock: props.selectedProduct.inStock,
    });
    props.selectedProduct.dimensions &&
      setDimensions(props.selectedProduct.dimensions);
    props.selectedProduct.inStock && setInstock(props.selectedProduct.inStock);
    props.selectedProduct.uploadImages &&
      setProductImg(props.selectedProduct.uploadImages);
    fethData();
  }, [props.selectedProduct]);
  const onFinish = async (values) => {
    console.log("Success:", values);
    const uploadImages = productImg.map((i) => {
      if (typeof i === "object") {
        return i.link;
      }
      return i;
    });
    const d = {
      name: values.productName,
      description: values.productDesc,
      category: values.category,
      price: values.price,
      weight: values.weight,
      dimensions: dimensions,
      uploadImages: uploadImages,
      instock: values.inStock,
    };
    await updateProduct(d, props.selectedProduct._id);
    // console.log(d);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const removeImage = (link) => {
    const imgs = productImg.filter((i) => i.link !== link);
    setProductImg(imgs);
  };
  return (
    <Modal
      visible={props.visible}
      onCancel={() => {
        props.setVisible(!props.visible);
        props.getAllProducts();
      }}
      width="80vw"
      key={props.key}
      footer={false}
    >
      {/* media manager */}
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      {/*  */}

      <h2 className="font-heading-white">Update Product</h2>
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
                    src={`${process.env.REACT_APP_SERVER}/uploads/${
                      typeof img === "object" ? img.link : img
                    }`}
                    height="100px"
                  />
                  <span>
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
            name="inStock"
            valuePropName="inStock"
            label="In Stock"
            rules={[
              {
                required: true,
                message: "Please mark if the item is in stock!",
              },
            ]}
          >
            <Input
              type="checkbox"
              checked={instock}
              onChange={(e) => setInstock(e.target.checked)}
            ></Input>
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
              Update
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

export default withRouter(UpdateProduct);
