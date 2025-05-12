import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function getAllProdcuts() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/shop/product`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get products", "");
      console.log(err);
    });
}
export function createProducts(details) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/shop/product/create`, details)
    .then((res) => {
      openNotificationWithIcon("success", "Product created!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to create product", "");
      console.log(err);
    });
}

export function removeProduct(id) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/shop/product/${id}/delete`)
    .then((res) => {
      openNotificationWithIcon("success", "Product deleted!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to delete product", "");
      console.log(err);
    });
}

export function updateProduct(values, id) {
  return axios
    .post(
      `${process.env.REACT_APP_SERVER}/api/shop/product/${id}/update`,
      values
    )
    .then((res) => {
      openNotificationWithIcon("success", "Product updated successfully!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to delete product", "");
      console.log(err);
    });
}

export function getProductById(id) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/shop/product/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get product", "");
      console.log(err);
    });
}
export function getAllCategories() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/shop/category`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get categories", "");
      console.log(err);
    });
}

export function createCategory(name) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/shop/category/create`, {
      name: name,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Category created!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to create category", "");
      console.log(err);
    });
}

export function removeCategory(id) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/shop/category/${id}/delete`)
    .then((res) => {
      openNotificationWithIcon("success", "Category removed!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to remove category", "");
      console.log(err);
    });
}
