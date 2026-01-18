import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Space, Input } from "antd";
import {
  getAllPosts,
  deletePostById,
  updatePostById,
} from "../../../services/posts";
import moment from "moment";
import UpdatePost from "./UpdatePost";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

function AllPosts() {
  const { strings } = useContext(LanguageContext);
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
      title: <T>admin.id</T>,
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.user</T>,
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.title_column</T>,
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.type</T>,
      dataIndex: "type",
      key: "type",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.likes</T>,
      key: "likes",
      dataIndex: "likes",
      render: (text) => {
        console.log(text);
        return <span className="font-paragraph-black">{text.length}</span>;
      },
    },
    {
      title: <T>admin.comments</T>,
      key: "comments",
      dataIndex: "comments",
      render: (text) => {
        console.log(text);
        return <span className="font-paragraph-black">{text.length}</span>;
      },
    },
    {
      title: <T>admin.updated_at</T>,
      key: "date",
      dataIndex: "date",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
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
              setSelectedPost(record);
              setShow(true);
            }}
          >
            <T>admin.edit</T>
          </Button>
          <Button type="danger" onClick={() => deletePost(text._id)}>
            <T>admin.delete</T>
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
      <h2 className="font-heading-black"><T>admin.all_posts</T></h2>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder={get(strings, "admin.search_post_by_title", "Search Post By Title")}
          onChange={(e) =>
            setFilterAllPosts(
              allPosts.filter((post) =>
                post.title.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          placeholder={get(strings, "admin.search_post_by_id", "Search Post By ID")}
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
