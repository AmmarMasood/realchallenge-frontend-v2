import React, { useState, useEffect, useContext } from "react";
import { CloseOutlined, UserOutlined } from "@ant-design/icons";
// import { Scrollbars } from "react-custom-scrollbars";
import { Input, Button } from "antd";
import { addNewComment } from "../../services/posts";
import { addNewCommunityPostComment } from "../../services/communityPosts";
import Modal from "react-modal";
import "../../assets/challengeReviewModal.css";
import moment from "moment";
import { userInfoContext } from "../../contexts/UserStore";
import TopIcon from "../../assets/icons/comment-header-icon.svg";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import NoCommentBack from "../../assets/icons/no-comments-background.svg";
import Avatar from "antd/lib/avatar/avatar";

function CommentSection({ post, updatePosts, visible, setVisible, community }) {
  const userInfo = useContext(userInfoContext)[0];
  const [newComment, setNewComment] = useState("");
  const [allComments, setAllComments] = useState([]);
  const { width } = useWindowDimensions();
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: width < 700 ? "90%" : "60%",
      overflow: "hidden",
      // height:"600px"
    },
  };

  useEffect(() => {
    console.log(post);
    setAllComments(post.comments ? post.comments : []);
  }, [post]);

  const addComment = async () => {
    if (newComment.length > 0) {
      if (community) {
        var n = await addNewCommunityPostComment(post._id, {
          text: newComment,
        });
      } else {
        var n = await addNewComment(post._id, { text: newComment });
      }

      console.log(n);
      setAllComments(n);
      setNewComment("");
    }
  };
  return (
    <Modal
      isOpen={visible}
      onRequestClose={() => {
        setVisible(false);
        updatePosts(post._id, allComments);
      }}
      style={customStyles}
      contentLabel="Comments"
    >
      <div className="challenge-review-modal-header">
        <span>
          <img src={TopIcon} alt="" />
          <span className="font-paragraph-white" style={{ marginLeft: "10px" }}>
            COMMENTS
          </span>
        </span>
        <CloseOutlined
          style={{ color: "#fff", fontSize: "26px", cursor: "pointer" }}
          onClick={() => {
            setVisible(false);
            updatePosts(post._id, allComments);
          }}
        />
      </div>
      <div className="challenge-review-modal">
        {/* todo do later */}
        {/* <Scrollbars style={{ height: "400px" }}>
          {allComments.length > 0 ? (
            allComments.map((comment) => (
              // <div className="challenge-profile-comment font-paragraph-white">
              //   <span className="challenge-profile-comment-username">
              //     <UserOutlined /> {comment.username}
              //   </span>
              //   <span>{comment.text}</span>
              // </div>
              <div
                className="comment-container"
                style={{ marginBottom: width < 700 ? "20px" : "10px" }}
              >
                <div
                  className="comment-container-c1 font-paragraph-white"
                  style={{
                    alignItems: "flex-start",
                    flexDirection: width < 700 ? "column" : "row",
                  }}
                >
                  <Avatar src={comment.user.avatarLink} shape="square" />{" "}
                  <span
                    style={{
                      marginLeft: "5px",
                      fontWeight: "bolder",
                      fontSize: "16px",
                    }}
                  >
                    {comment.user.username}
                  </span>
                  <div style={{ paddingLeft: width < 700 ? "0" : "20px" }}>
                    <div
                      className="comment-container-c2 font-paragraph-white"
                      style={{
                        padding: 0,
                        fontWeight: "200",
                        fontSize: "14px",
                      }}
                    >
                      {comment.text}
                    </div>
                    <div
                      className="font-paragraph-white comment-container-c3"
                      style={{ color: "#82868b", padding: 0 }}
                    >
                      {moment(comment.createdAt).format("MMM, Do YY")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <img
              src={NoCommentBack}
              alt=""
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          )}
        </Scrollbars> */}
        <div style={{ marginTop: "10px" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <Avatar
              src={`${process.env.REACT_APP_SERVER}/uploads/${userInfo.avatar}`}
              shape="square"
              style={{ marginRight: "10px" }}
            />{" "}
            <Input.TextArea
              rows="3"
              placeholder="Enter New Comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "10px 10px 10px 40px",
            }}
          >
            <Button
              className="font-paragraph-white"
              style={{
                padding: "3px 20px",
                color: "#fff",
                backgroundColor: "transparent",
                border: "2px solid #ff7700",
                borderRadius: "0",
              }}
              onClick={() => {
                setVisible(false);
                updatePosts(post._id, allComments);
              }}
            >
              Cancel
            </Button>
            <Button
              className="common-orange-button font-paragraph-white"
              style={{ padding: "3px 10px", borderRadius: "0" }}
              onClick={() => addComment()}
            >
              New Comment
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default CommentSection;
