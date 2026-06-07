import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import PostCover from "./PostCover";
import "./FeedCard.css";
import Clock from "../../assets/icons/feed-clock.svg";
import Clap from "../../assets/icons/clap-orange.svg";
import ClapGray from "../../assets/icons/clap-gray.svg";
import ChatWhite from "../../assets/icons/chat-white.svg";

// Strip HTML tags from a rich-text string so the line-clamp ellipsis on
// the description plays well (block-level <p>/<br> inside a -webkit-box
// container otherwise breaks the clamp). DOMParser handles entities
// correctly; the regex is a fallback for SSR/unsupported environments.
function stripHtml(html) {
  if (!html) return "";
  if (typeof window !== "undefined" && window.DOMParser) {
    try {
      const doc = new window.DOMParser().parseFromString(
        String(html),
        "text/html"
      );
      return (doc.body && doc.body.textContent) || "";
    } catch (_) {
      // fall through to regex
    }
  }
  return String(html).replace(/<[^>]+>/g, "");
}

/**
 * Shared card for both News Feed and Community tabs.
 * Identical markup; the data + like/comment endpoints are owned by the
 * parent (News Feed hits /api/posts, Community hits /api/community-posts).
 *
 * Props:
 *  - post: { _id, url, avatar, username, date, image, type, title, text,
 *            likes:[{user}], comments:[] }
 *  - userInfo: { id }  (current user; used to decide like vs unlike)
 *  - onLike(postId): called when the user likes a post
 *  - onUnlike(postId): called when the user unlikes a post
 *  - onOpenComments(post): called when the comment icon is clicked
 */
export default function FeedCard({
  post,
  userInfo,
  onLike,
  onUnlike,
  onOpenComments,
}) {
  if (!post) return null;
  const linkTo = post.url || "#";
  const userLiked =
    Array.isArray(post.likes) &&
    post.likes.some((like) => like && like.user === userInfo?.id);

  return (
    <div className="dashboard-feed-container-card">
      <Link to={linkTo}>
        <div
          className="dashboard-feed-container-card-row1"
          style={{ cursor: "pointer" }}
        >
          <Avatar
            shape="square"
            size="large"
            src={post.avatar || ""}
            icon={<UserOutlined />}
          />
          <div className="dashboard-feed-container-card-row1-col2 font-paragraph-white">
            <span>{post.username || ""}</span>
            <span
              style={{
                opacity: "0.8",
                color: "#8e9298",
                fontSize: "13px",
              }}
            >
              <img src={Clock} alt="" /> {moment(post.date).fromNow()}
            </span>
          </div>
        </div>
      </Link>
      <Link to={linkTo}>
        <PostCover image={post.image} tag={post.type} url={post.url} />
        <div className="dashboard-feed-container-card-row3">
          {post.title ? (
            <div className="dashboard-feed-container-card-row3-heading font-paragraph-white">
              {stripHtml(post.title)}
            </div>
          ) : null}
          <div className="dashboard-feed-container-card-row3-text font-paragraph-white">
            {stripHtml(post.text)}
          </div>
        </div>
      </Link>
      <div className="dashboard-feed-container-card-row4">
        <span
          className="dashboard-feed-container-card-row4-click"
          onClick={() => {
            if (userLiked) onUnlike && onUnlike(post._id);
            else onLike && onLike(post._id);
          }}
        >
          <img src={userLiked ? Clap : ClapGray} alt="" />{" "}
          <span>{Array.isArray(post.likes) ? post.likes.length : 0}</span>
        </span>
        <span
          className="dashboard-feed-container-card-row4-click"
          onClick={() => onOpenComments && onOpenComments(post)}
        >
          <img src={ChatWhite} alt="" />{" "}
          <span>{Array.isArray(post.comments) ? post.comments.length : 0}</span>
        </span>
      </div>
    </div>
  );
}
