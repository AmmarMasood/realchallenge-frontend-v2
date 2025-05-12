import React, { useState, useEffect, useContext } from "react";
import { CloseOutlined } from "@ant-design/icons";
// import { Scrollbars } from "react-custom-scrollbars";
import { Input, Button, Rate } from "antd";
// import { addNewComment } from "../../services/posts";
import Modal from "react-modal";
import "../../assets/challengeReviewModal.css";
import moment from "moment";
import useWindowDimensions from "../../helpers/useWindowDimensions";
import Avatar from "antd/lib/avatar/avatar";
import TopIcon from "../../assets/icons/review-challenge-header-icon.svg";
import BackIcon from "../../assets/icons/review-challenge-icon.svg";
import { addRecipeReview } from "../../services/recipes";
import { userInfoContext } from "../../contexts/UserStore";

function ReviewsModal({ item, visible, setVisible, type, fetchData }) {
  const [alreadyReviewd, setAlreadyReviewd] = useState(false);
  const [userInfo, setUserInfo] = useContext(userInfoContext);
  const [newReview, setNewReview] = useState({ text: "", rating: 1 });
  const [allReviews, setAllReviews] = useState([]);
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
    console.log(item);
    setAllReviews(item.reviews);
    const g =
      item.reviews && item.reviews.filter((f) => f.user._id === userInfo.id);
    if (g && g.length > 0) {
      setAlreadyReviewd(true);
    } else {
      setAlreadyReviewd(false);
    }
    //   setAllComments(post.comments ? post.comments : []);
  }, [item]);

  const addReview = async () => {
    if (newReview.text.length > 0) {
      if (type === "recipes") {
        const n = await addRecipeReview(
          item._id,
          newReview.text,
          newReview.rating
        );
        setVisible(false);
        fetchData();
        console.log(n);
      }
      // const n = await addNewComment(post._id, { text: newComment });
      console.log(newReview);
      // setAllComments(n);
      // setNewComment("");
    }
  };

  return (
    <Modal
      isOpen={visible}
      onRequestClose={() => {
        setVisible(false);
      }}
      style={customStyles}
      contentLabel="Comments"
    >
      <div className="challenge-review-modal-header">
        <span>
          <img src={TopIcon} alt="" />
          <span className="font-paragraph-white" style={{ marginLeft: "10px" }}>
            REVIEWS
          </span>
        </span>
        <CloseOutlined
          style={{ color: "#fff", fontSize: "26px", cursor: "pointer" }}
          onClick={() => {
            setVisible(false);
          }}
        />
      </div>
      <div className="challenge-review-modal">
        {/* todo do later */}
        {/* <Scrollbars style={{ height: "300px" }}>
          {allReviews.length > 0 ? (
            allReviews.map((review) => (
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
                  <span>
                    <Avatar src={review.user.avatarLink} shape="square" />{" "}
                    <p
                      style={{
                        marginLeft: "5px",
                        fontWeight: "bolder",
                        fontSize: "16px",
                        marginTop: "0",
                        // border: "2px solid red",
                        width: "140px",
                        display: "inline-block",
                      }}
                    >
                      {review.user.username}
                    </p>
                  </span>
                  <div
                    style={{
                      paddingLeft: width < 700 ? "0" : "20px",
                    }}
                  >
                    <Rate value={review.rating} disabled={true} />
                    <div
                      className="comment-container-c2 font-paragraph-white"
                      style={{
                        padding: 0,
                        fontWeight: "200",
                        fontSize: "14px",
                      }}
                    >
                      {review.comment}
                    </div>
                    <div
                      className="font-paragraph-white comment-container-c3"
                      style={{ color: "#82868b", padding: 0 }}
                    >
                      {moment(review.createdAt).format("MMM, Do YY")}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <img
              src={BackIcon}
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
        {localStorage.getItem("jwtToken") ? (
          !alreadyReviewd ? (
            <div style={{ marginTop: "10px" }}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={`${process.env.REACT_APP_SERVER}/${userInfo.avatar}`}
                  shape="square"
                  style={{ marginRight: "10px" }}
                />
                <span style={{ width: "100%" }}>
                  <Rate
                    style={{ marginBottom: "10px" }}
                    onChange={(e) =>
                      setNewReview((prevalue) => ({ ...prevalue, rating: e }))
                    }
                    value={newReview.rating}
                  />

                  <Input.TextArea
                    rows="3"
                    placeholder="Write your review here"
                    value={newReview.text}
                    onChange={(e) =>
                      setNewReview((preValue) => ({
                        ...preValue,
                        text: e.target.value,
                      }))
                    }
                  />
                </span>
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  margin: "10px",
                }}
              >
                <Button
                  className="font-paragraph-white"
                  style={{
                    padding: "3px 20px",
                    color: "#fff",
                    backgroundColor: "transparent",
                    border: "2px solid #ff7700",
                  }}
                  onClick={() => {
                    setVisible(false);
                  }}
                >
                  Close
                </Button>
                <Button
                  className="common-orange-button font-paragraph-white"
                  style={{ padding: "3px 10px" }}
                  onClick={() => addReview()}
                >
                  Submit
                </Button>
              </div>
            </div>
          ) : (
            <p className="font-paragraph-white">{"Already Reviewed"}</p>
          )
        ) : (
          <p className="font-paragraph-white">
            Please signup or login to review
          </p>
        )}
      </div>
    </Modal>
  );
}

export default ReviewsModal;
