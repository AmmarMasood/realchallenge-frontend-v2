import React, { useState, useEffect, useContext } from "react";
import "../assets/magazineArticle.css";
import "../assets/trainerprofile.css";
import "../assets/home.css";
import "../assets/challengeProfile.css";
import "../assets/recipeProfile.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Avatar, Input } from "antd";
import { UserOutlined, LoadingOutlined } from "@ant-design/icons";
import moment from "moment";
import { withRouter } from "react-router-dom";
import { addBlogComment, getBlogById } from "../services/blogs";
import {
  FacebookShareButton,
  LinkedinShareButton,
  PinterestShareButton,
  TwitterShareButton,
  PinterestIcon,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
} from "react-share";
import slug from "elegant-slug";
import { Helmet } from "react-helmet";
import { T } from "../components/Translate";
import { LanguageContext } from "../contexts/LanguageContext";
{
  /* todo later */
}
// import ReactHtmlParser from "react-html-parser";

// import ModalVideo from "react-modal-video";

function MagazineArticle(props) {
  const { language, updateLanguage } = useContext(LanguageContext);
  const [blogInfo, setBlogInfo] = useState({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [commentButtonLoading, setCommentButtomLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [allComments, setAllComments] = useState([]);

  useEffect(() => {
    fetchInfo();
  }, [language]);

  const postCommentToBackend = async () => {
    setCommentButtomLoading(true);
    const res = await addBlogComment(blogInfo._id, commentText);

    if (res) {
      setAllComments(res.comments);
    }
    setCommentButtomLoading(false);
    setCommentText("");
  };

  const fetchInfo = async () => {
    if (Object.keys(blogInfo).length > 0) {
      if (blogInfo.language === language) {
      } else {
        if (blogInfo.alternativeLanguage) {
          window.location.href = `${
            process.env.REACT_APP_FRONTEND_SERVER
          }/magazine/${slug(blogInfo.alternativeLanguage.title)}/${
            blogInfo.alternativeLanguage._id
          }`;
        }
      }
    } else {
      setLoading(true);
      const id = props.match.params.id;
      const res = await getBlogById(id);
      if (res && res.data) {
        const d = res.data.blog;
        setBlogInfo(d);
        setAllComments(d.comments);
        updateLanguage(d.language);
      }
      setLoading(false);
    }
  };

  // eslint-disable-next-line

  return loading ? (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <LoadingOutlined
        style={{
          color: "#ff7700",
          fontSize: "65px",
        }}
      />
    </div>
  ) : (
    <div>
      <Helmet>
        <title>{`Realchallenge: ${blogInfo.title}`}</title>
        <meta name="description" content={blogInfo.paragraph} />
        <meta property="og:title" content={blogInfo.title} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={blogInfo.paragraph} />
        <meta
          property="og:url"
          content={`http://localhost:3001/magazine/${slug(blogInfo.title)}/${
            blogInfo._id
          }`}
        />
        <meta name="author" content="Realchallenge" />
      </Helmet>
      <Navbar />
      {console.log(
        `${process.env.REACT_APP_SERVER}/uploads/${
          blogInfo ? blogInfo.featuredImage : ""
        }`
      )}
      <div
        className="magazine-article-head"
        style={{
          background: `url(${process.env.REACT_APP_SERVER}/uploads/${
            blogInfo ? blogInfo.featuredImage : ""
          }) no-repeat center center / cover`,
          backgroundSize: "cover",
        }}
      ></div>
      {/* todo do later */}
      {/* <ModalVideo
        channel="custom"
        autoplay
        isOpen={open}
        controlsList="nodownload"
        url={`${process.env.REACT_APP_SERVER}/uploads/${blogInfo?.videoLink}`}
        onClose={() => setOpen(false)}
      /> */}
      <div className="article-container">
        <div className="article-container-column1">
          <div className="article-container-column1-row1 font-paragraph-black">
            <Avatar
              shape="square"
              size="large"
              icon={<UserOutlined />}
              src={`${process.env.REACT_APP_SERVER}/uploads/${
                blogInfo && blogInfo.user ? blogInfo.user.avatarLink : ""
              }`}
            />{" "}
            {blogInfo && blogInfo.user ? blogInfo.user.username : ""}
          </div>
          <div
            className="article-container-column1-row1 font-paragraph-black"
            style={{ color: "var(--color-orange)", padding: "15px 0" }}
          >
            <T>magazine.share</T>

            <div>
              <FacebookShareButton
                url={window.location.href}
                quote="Hi. Please checkout this amazing article I found at realchallenge.fit"
              >
                <FacebookIcon
                  size={32}
                  round={true}
                  style={{ marginRight: "10px" }}
                />
              </FacebookShareButton>
              <LinkedinShareButton
                url={window.location.href}
                title="Awesome article at Realchallenge.fit"
                summary="Hi. Please checkout this amazing article I found at realchallenge.fit"
              >
                <LinkedinIcon
                  size={32}
                  round={true}
                  style={{ marginRight: "10px" }}
                />
              </LinkedinShareButton>
              <TwitterShareButton
                url={window.location.href}
                title="Check out this amazing article I found at Realchallenge.fit"
              >
                <TwitterIcon
                  size={32}
                  round={true}
                  style={{ marginRight: "10px" }}
                />
              </TwitterShareButton>
              <PinterestShareButton
                url={window.location.href}
                media={`${process.env.REACT_APP_SERVER}/uploads/${blogInfo.featuredImage}`}
                description="Hi. Please checkout this amazing article I found at realchallenge.fit"
              >
                <PinterestIcon
                  size={32}
                  round={true}
                  style={{ marginRight: "10px" }}
                />
              </PinterestShareButton>
            </div>
          </div>
        </div>
        <div className="article-container-column2">
          <h1 className="article-container-column2-heading font-heading-black">
            {blogInfo.title}
          </h1>
          <div>
            <span
              style={{
                color: "var(--color-orange)",
                marginRight: "20px",
                fontSize: "1.6rem",
              }}
            >
              {blogInfo && blogInfo.category ? blogInfo.category.name : ""}
            </span>
            <span style={{ fontSize: "1.6rem" }}>
              {moment(blogInfo?.createdAt).format("LL")}
            </span>
            {/* {console.log(article.articleDate)} */}
          </div>
          {/* <h1 className="font-subheading-black">{article.articleSubheading}</h1> */}
          <span
            onClick={() => setOpen(true)}
            style={{ color: "var(--color-orange)", cursor: "pointer" }}
          >
            Video Link To This Article
          </span>
          <p className="font-paragraph-black" style={{ fontSize: "1.8rem" }}>
            {/* todo later */}
            {/* {ReactHtmlParser(blogInfo?.paragraph)} */}
          </p>

          {/* comments */}
          <div
            className="trainer-profile-goals"
            style={{
              borderBottom: "1px solid transparent",
              backgroundColor: "#e1e9f2",
              padding: "10px",
            }}
          >
            <div
              className="trainer-profile-goals-heading font-paragraph-white"
              style={{
                color: "#72777B",
                textTransform: "uppercase",
              }}
            >
              <T>challenge_profile.comments</T>
            </div>
            {allComments.map((c) => (
              <div className="comment-container">
                <div className="comment-container-c1 font-paragraph-black">
                  <Avatar src={c.user.avatarLink} shape="square" />{" "}
                  <span style={{ marginLeft: "5px" }}>{c.user.username}</span>
                  <div className="comment-container-c2 font-paragraph-black">
                    {c.text}
                  </div>
                </div>

                <div
                  className="font-paragraph-white comment-container-c3"
                  style={{ color: "#82868b" }}
                >
                  {moment(c.createdAt).format("MMM, Do YYYY")}
                </div>
              </div>
            ))}
            {localStorage.getItem("jwtToken") && (
              <>
                <div
                  className="trainer-profile-goals-container"
                  style={{ marginTop: "10px" }}
                >
                  <Input.TextArea
                    rows={4}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>
                {commentButtonLoading ? (
                  <LoadingOutlined
                    style={{
                      color: "#ff7700",
                      fontSize: "30px",
                      marginTop: "10px",
                    }}
                  />
                ) : (
                  <button
                    className="common-transparent-button font-paragraph-white"
                    onClick={postCommentToBackend}
                    style={{
                      color: "#ff7700",
                      borderColor: "#ff7700",
                      marginTop: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <T>common.postComment</T>
                  </button>
                )}
              </>
            )}
          </div>
          {/* comments */}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default withRouter(MagazineArticle);
