import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllPosts() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/posts/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get posts", "");
      console.log(err);
    });
}

export function createPost(data) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/posts/create`, data)
    .then((res) => {
      openNotificationWithIcon(
        "success",
        "Your post is now live to everyone!",
        ""
      );
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to create post", "");
      console.log(err);
    });
}

// Returns { exists: boolean, postId: string|null } for a given post url.
export function postExistsForUrl(url) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/posts/exists`, {
      params: { url },
    })
    .then((res) => res.data)
    .catch(() => ({ exists: false, postId: null }));
}

export function getPostsWithPagination(number, language) {
  return axios
    .get(
      `${process.env.REACT_APP_SERVER}/api/posts/all/?pageNumber=${number}&language=${language}`
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get posts", "");
      console.log(err);
    });
}

export function addLikeToPost(id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/posts/like/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to like the post.", "");
      console.log(err);
    });
}

export function addUnlikePost(id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/posts/unlike/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to unlike the post.", "");
      console.log(err);
    });
}

export function addNewComment(id, obj) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/posts/comment/${id}`, obj)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to add comment.", "");
      console.log(err);
    });
}

export function deletePostById(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/posts/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully deleted the post.", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to delete post.", "");
      console.log(err);
    });
}

export function updatePostById(id, values) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/posts/${id}`, values)
    .then((res) => {
      openNotificationWithIcon("success", "Successfully updated the post.", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update post.", "");
      console.log(err);
    });
}
