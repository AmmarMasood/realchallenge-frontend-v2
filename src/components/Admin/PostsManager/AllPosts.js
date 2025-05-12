import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input } from "antd";
import {
  getAllPosts,
  deletePostById,
  updatePostById,
} from "../../../services/posts";
import moment from "moment";
import UpdatePost from "./UpdatePost";

function AllPosts() {
  const [filterAllPosts, setFilterAllPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [show, setShow] = useState("");
  const [selectedPost, setSelectedPost] = useState({});

  async function fetchData() {
    const data = await getAllPosts();
    console.log(data);
    // return;
    setAllPosts(data.posts);
    setFilterAllPosts(data.posts);
  }

  async function deletePost(id) {
    await deletePostById(id);
    fetchData();
  }

  async function onUpdateComplete(values) {
    await updatePostById(values.id, values);
    setShow(false);
  }
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
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Likes",
      key: "likes",
      dataIndex: "likes",
      render: (text) => {
        console.log(text);
        return <span className="font-paragraph-black">{text.length}</span>;
      },
    },
    {
      title: "Comments",
      key: "comments",
      dataIndex: "comments",
      render: (text) => {
        console.log(text);
        return <span className="font-paragraph-black">{text.length}</span>;
      },
    },
    {
      title: "Updated At",
      key: "date",
      dataIndex: "date",
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
              setSelectedPost(record);
              setShow(true);
            }}
          >
            Edit
          </Button>
          <Button type="danger" onClick={() => deletePost(text._id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <UpdatePost
        postInfo={selectedPost}
        show={show}
        setShow={setShow}
        onUpdateComplete={onUpdateComplete}
        key={selectedPost ? selectedPost._id : ""}
      />
      <h2 className="font-heading-black">All Posts</h2>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search Post By Title"
          onChange={(e) =>
            setFilterAllPosts(
              allPosts.filter((post) =>
                post.title.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          placeholder="Search Post By ID"
          style={{ marginTop: "10px" }}
          onChange={(e) =>
            setFilterAllPosts(
              allPosts.filter((post) =>
                post._id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllPosts} />
      </div>
    </div>
  );
}

export default AllPosts;
