import React, { useState, useEffect, useContext } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Pagination } from "antd";
import CommentSection from "./CommentSection";
import FeedCard from "./FeedCard";
import {
  addLikeToPost,
  addUnlikePost,
  getPostsWithPagination,
} from "../../services/communityPosts";
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
          <div style={{ textAlign: "center", width: "100%" }}>
            <LoadingOutlined style={{ fontSize: "30px", color: "#ff7700" }} />
          </div>
        ) : data ? (
          data.map((d) => (
            <FeedCard
              key={d._id}
              post={d}
              userInfo={userInfo}
              onLike={addLike}
              onUnlike={unlikePost}
              onOpenComments={(p) => {
                setSelectedPost(p);
                setOpen(true);
              }}
            />
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
