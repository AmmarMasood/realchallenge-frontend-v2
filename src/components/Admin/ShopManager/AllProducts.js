import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input, Avatar } from "antd";
import moment from "moment";
import { GiftOutlined } from "@ant-design/icons";
import { getAllProdcuts, removeProduct } from "../../../services/shop";
import UpdateProduct from "./UpdateProduct";

function AllProducts() {
  const [filterAllProducts, setFilterAllProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});

  const fetchData = async () => {
    const d = await getAllProdcuts();
    // console.log(d);
    setAllProducts(d.products);
    setFilterAllProducts(d.products);
  };

  const removeProductClick = async (product) => {
    // console.log("product", product);
    await removeProduct(product._id);
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, []);
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Image",
      dataIndex: "uploadImages",
      key: "uploadImages",
      render: (text) => (
        <Avatar
          src={`${process.env.REACT_APP_SERVER}/uploads/${text[0]}`}
          shape="square"
          size={64}
          icon={<GiftOutlined />}
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="font-paragraph-black">€ {text}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => (
        <span className="font-paragraph-black">{cat ? cat.name : ""}</span>
      ),
    },
    {
      title: "In Stock",
      key: "inStock",
      dataIndex: "inStock",
      render: (text) => (
        <span className="font-paragraph-black">
          {text ? "Available" : "Not Available"}
        </span>
      ),
    },
    {
      title: "Updated At",
      key: "createdAt",
      dataIndex: "createdAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Action",
      key: "challengePreviewLink",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              setSelectedProduct(text);
              setUpdateModal(true);
            }}
          >
            Edit
          </Button>
          <Button type="danger" onClick={() => removeProductClick(text)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h2 className="font-heading-black">All Products</h2>
      <UpdateProduct
        visible={updateModal}
        setVisible={setUpdateModal}
        selectedProduct={selectedProduct}
        getAllProducts={fetchData}
        key={Math.random()}
      />
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search Users"
          onChange={(e) =>
            setFilterAllProducts(
              allProducts.filter((p) =>
                p.name.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllProducts} />
      </div>
    </div>
  );
}

export default AllProducts;
