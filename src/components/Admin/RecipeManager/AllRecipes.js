import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input } from "antd";
import {
  getAllRecipes,
  deleteRecipeWithId,
  getAllUserRecipes,
} from "../../../services/recipes";
import moment from "moment";
import UpdateRecipe from "./UpdateRecipe";
import { useContext } from "react";
import { LanguageContext } from "../../../contexts/LanguageContext";

function AllRecipes() {
  const { language } = useContext(LanguageContext);
  const [filterAllRecipes, setFilterAllRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState({});

  async function fetchData() {
    const data = await getAllUserRecipes(language);
    if (data) {
      setAllRecipes(data.recipes);
      setFilterAllRecipes(data.recipes);
    }
  }

  async function deleteRecipe(id) {
    await deleteRecipeWithId(id);
    fetchData();
  }
  useEffect(() => {
    fetchData();
  }, [language]);
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Calories",
      dataIndex: "kCalPerPerson",
      key: "kCalPerPerson",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Prepration Time",
      dataIndex: "prepTime",
      key: "prepTime",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Language",
      dataIndex: "language",
      key: "language",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Updated At",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Is Public",
      key: "isPublic",
      dataIndex: "isPublic",
      render: (text) => (
        <span className="font-paragraph-black">{text ? "True" : "False"}</span>
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
          <Button type="danger" onClick={() => deleteRecipe(text._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <UpdateRecipe
        visible={updateModal}
        setVisible={setUpdateModal}
        selectedProduct={selectedProduct}
        getAllProducts={fetchData}
        key={Math.random()}
      />
      <h2 className="font-heading-black">All Recipes</h2>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search Recipe By Name"
          onChange={(e) =>
            setFilterAllRecipes(
              allRecipes.filter((recipe) =>
                recipe.name.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          placeholder="Search Recipe By ID"
          style={{ marginTop: "10px" }}
          onChange={(e) =>
            setFilterAllRecipes(
              allRecipes.filter((recipe) =>
                recipe._id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllRecipes} />
      </div>
    </div>
  );
}

export default AllRecipes;
