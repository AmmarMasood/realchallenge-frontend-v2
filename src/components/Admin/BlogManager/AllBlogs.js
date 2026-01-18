import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Space, Input, Select, Tag } from "antd";
import moment from "moment";
import UpdateBlog from "./UpdateBlog";
import {
  getAllUserBlogs,
  removeBlog,
  updateBlog,
} from "../../../services/blogs";
import { T } from "../../Translate";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { get } from "lodash";

function AllBlogs() {
  const { language, strings } = useContext(LanguageContext);
  const [filterAllBlogs, setFilterAllBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState({});
  const [show, setShow] = useState("");

  useEffect(() => {
    fetchData();
  }, [language]);

  const onUpdateComplete = async (setLoading, vals, blogId) => {
    await updateBlog(vals, blogId);
    setLoading(false);
    setShow(false);
    fetchData();
  };

  const fetchData = async () => {
    const data = await getAllUserBlogs(language);
    setAllBlogs(data.blogs);
    setFilterAllBlogs(data.blogs);
    console.log("all blogs", data.blogs);
  };

  const deleteBlog = async (blog) => {
    await removeBlog(blog._id);
    fetchData();
  };
  const columns = [
    {
      title: <T>admin.id</T>,
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.title_column</T>,
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.author</T>,
      dataIndex: "user",
      key: "user",
      render: (text) => (
        <span className="font-paragraph-black">{text?.username}</span>
      ),
    },
    {
      title: <T>admin.category</T>,
      dataIndex: "category",
      key: "category",
      render: (text) => (
        <span className="font-paragraph-black">{text ? text.name : ""}</span>
      ),
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
              setSelectedBlog(record);
              setShow(true);
            }}
          >
            <T>adminDashboard.edit</T>
          </Button>
          <Button type="danger" onClick={() => deleteBlog(record)}>
            <T>adminDashboard.delete</T>
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <UpdateBlog
        show={show}
        setShow={setShow}
        onUpdateComplete={onUpdateComplete}
        blogInfo={selectedBlog}
        key={selectedBlog ? selectedBlog._id : ""}
      />
      <h2 className="font-heading-black">
        {" "}
        <T>adminDashboard.blogs.all</T>
      </h2>

      <div className="admin-allchallenges-list-container">
        <Input
          placeholder={get(strings, "admin.search_blogs_by_name", "Search Blogs By Name")}
          onChange={(e) =>
            setFilterAllBlogs(
              allBlogs.filter((blog) =>
                blog.title.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          style={{ marginTop: "10px" }}
          placeholder={get(strings, "admin.search_blogs_by_id", "Search Blogs By ID")}
          onChange={(e) =>
            setFilterAllBlogs(
              allBlogs.filter((blog) =>
                blog._id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />

        <Table columns={columns} dataSource={filterAllBlogs} />
      </div>
    </div>
  );
}

export default AllBlogs;
