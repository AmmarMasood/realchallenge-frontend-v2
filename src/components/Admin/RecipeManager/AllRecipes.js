import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input, Tag } from "antd";
import {
  getAllRecipes,
  deleteRecipeWithId,
  getAllUserRecipes,
} from "../../../services/recipes";
import moment from "moment";
import UpdateRecipe from "./UpdateRecipe";
import { useContext } from "react";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

function AllRecipes() {
  const { language, strings } = useContext(LanguageContext);
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
      title: <T>admin.id</T>,
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.name</T>,
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.calories</T>,
      dataIndex: "kCalPerPerson",
      key: "kCalPerPerson",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.preparation_time</T>,
      dataIndex: "prepTime",
      key: "prepTime",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.language</T>,
      dataIndex: "language",
      key: "language",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.updated_at</T>,
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: <T>admin.is_public</T>,
      key: "isPublic",
      dataIndex: "isPublic",
      render: (text) => (
        <span className="font-paragraph-black">{text ? get(strings, "admin.true", "True") : get(strings, "admin.false", "False")}</span>
      ),
    },
    {
      title: "Updated By",
      dataIndex: "updatedBy",
      key: "updatedBy",
      render: (text) => (
        <span className="font-paragraph-black">
          {text ? text.username || text.firstName || text : "-"}
        </span>
      ),
    },
    {
      title: <T>admin.status</T>,
      key: "adminApproved",
      dataIndex: "adminApproved",
      render: (approved) => (
        <Tag color={approved ? "green" : "orange"}>
          {approved ? <T>admin.approved</T> : <T>admin.pending_approval</T>}
        </Tag>
      ),
    },
    {
      title: <T>admin.action</T>,
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
            <T>admin.edit</T>
          </Button>
          <Button type="danger" onClick={() => deleteRecipe(text._id)}>
            <T>admin.delete</T>
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
      <h2 className="font-heading-black"><T>admin.all_recipes</T></h2>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder={get(strings, "admin.search_recipe_by_name", "Search Recipe By Name")}
          onChange={(e) =>
            setFilterAllRecipes(
              allRecipes.filter((recipe) =>
                recipe.name.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          placeholder={get(strings, "admin.search_recipe_by_id", "Search Recipe By ID")}
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
