import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import {
  CommentOutlined,
  FireOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FlagFilled,
  LoadingOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Avatar, Modal, Pagination } from "antd";
import CommentSection from "./CommentSection";

import ChatWhite from "../../assets/icons/chat-white.svg";
import Clap from "../../assets/icons/clap-orange.svg";
import Clock from "../../assets/icons/feed-clock.svg";
import ClapGray from "../../assets/icons/clap-gray.svg";
import {
  addLikeToPost,
  addUnlikePost,
  getPostsWithPagination,
} from "../../services/communityPosts";
// import ReactHTMLParser from "react-html-parser";
import { LanguageContext } from "../../contexts/LanguageContext";

function Community({ userInfo }) {
  const { language } = useContext(LanguageContext);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  // eslint-disable-next-line
  const [data, setData] = useState([]);
  const [selectedPost, setSelectedPost] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await getPostsWithPagination(pageNumber, language);
    setLoading(false);
    setData(res.posts);
    setTotalPosts(6 * res.lastPage);
    console.log(res);
  };

  useEffect(() => {
    fetchData();
  }, [pageNumber, language]);

  const addLike = async (id) => {
    const res = await addLikeToPost(id);
    if (res) {
      const d = data.map((i) => {
        if (i._id === id) {
          i.likes = res;
        }
        return i;
      });
      setData(d);
    }
    // fetchData();
    console.log("like", res);
  };
  const unlikePost = async (id) => {
    const res = await addUnlikePost(id);
    if (res) {
      const d = data.map((i) => {
        if (i._id === id) {
          i.likes = res;
        }
        return i;
      });
      setData(d);
    }
  };
  function itemRender(current, type, originalElement) {
    if (type === "prev") {
      return (
        <a className="orange-button-pagination font-paragraph-white">
          Previous
        </a>
      );
    }
    if (type === "next") {
      return (
        <a className="green-button-pagination font-paragraph-white">Next</a>
      );
    }
    return originalElement;
  }

  const updatePosts = (id, comments) => {
    const p = data.map((post) => {
      if (post._id === id) {
        post.comments = comments;
        return post;
      }
      return post;
    });
    setData(p);
  };

  return (
    <>
      <CommentSection
        post={selectedPost}
        updatePosts={updatePosts}
        visible={open}
        setVisible={setOpen}
        community={true}
      />
      <div
        className="dashboard-feed-container"
        style={{ justifyItems: "center" }}
      >
        {loading ? (
          <LoadingOutlined style={{ fontSize: "30px", color: "#ff7700" }} />
        ) : data ? (
          data.map((d) => (
            <div className="dashboard-feed-container-card">
              {console.log("d", d)}
              <Link to={`${d.url ? d.url : "#"}`}>
                <div
                  className="dashboard-feed-container-card-row1"
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    shape="square"
                    size="large"
                    src={d.avatar ? d.avatar : ""}
                    icon={<UserOutlined />}
                  />

                  <div className="dashboard-feed-container-card-row1-col2 font-paragraph-white">
                    <span>{d.username ? d.username : ""}</span>
                    <span
                      style={{
                        opacity: "0.8",
                        color: "#8e9298",
                        fontSize: "13px",
                      }}
                    >
                      <img src={Clock} alt="" /> {moment(d.date).fromNow()}
                    </span>
                  </div>
                </div>
              </Link>
              {/* <Link to={`/${d.type}/${d.id}`}> */}
              <Link to={`${d.url ? d.url : "#"}`}>
                <div
                  className="dashboard-feed-container-card-row2"
                  style={{
                    background: `url(${process.env.REACT_APP_SERVER}/uploads/${
                      d.image ? d.image.replaceAll(" ", "%20") : ""
                    })`,
                    backgroundSize: "cover",
                    cursor: "pointer",
                  }}
                >
                  <div className="dashboard-feed-container-card-row2-tag font-paragraph-white">
                    {d.type}
                  </div>
                </div>
                {/* </Link> */}
                <div className="dashboard-feed-container-card-row3">
                  <div className="dashboard-feed-container-card-row3-heading font-paragraph-white">
                    {/* {ReactHTMLParser(d.title)} */}
                  </div>
                  <div className="dashboard-feed-container-card-row3-text font-paragraph-white">
                    {/* {ReactHTMLParser(d.text)} */}
                  </div>
                </div>
              </Link>
              <div className="dashboard-feed-container-card-row4">
                <span
                  className="dashboard-feed-container-card-row4-click"
                  onClick={() => {
                    if (d.likes.some((like) => like["user"] === userInfo.id)) {
                      unlikePost(d._id);
                    } else {
                      addLike(d._id);
                    }
                  }}
                >
                  <img
                    src={
                      d.likes.some((like) => like["user"] === userInfo.id)
                        ? Clap
                        : ClapGray
                    }
                    alt=""
                  />{" "}
                  {d.likes.length}
                </span>
                <span
                  className="dashboard-feed-container-card-row4-click"
                  onClick={() => {
                    setOpen(true);
                    setSelectedPost(d);
                  }}
                >
                  <img src={ChatWhite} alt="" /> {d.comments.length}
                </span>
              </div>
            </div>
          ))
        ) : (
          <h2 className="font-heading-white">No posts here!</h2>
        )}
      </div>
      <div className="pagination-container">
        <div className="pagination-container-inside">
          {data && (
            <Pagination
              current={pageNumber}
              onChange={(page) => setPageNumber(page)}
              itemRender={itemRender}
              total={totalPosts}
              pageSize={6}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Community;
