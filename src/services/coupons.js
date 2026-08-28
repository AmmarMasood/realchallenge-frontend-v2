import axios from "axios";
import { notification } from "antd";

const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message: message,
    description: description,
  });
};

export function createCoupon(details) {
  return axios
    .post(`${process.env.REACT_APP_SERVER}/api/coupons/create`, details)
    .then((res) => {
      openNotificationWithIcon("success", "Coupon created!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to create coupon", "");
      console.log(err);
    });
}

export function getAllCoupons() {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/coupons/all`)
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to get coupons", "");
      console.log(err);
    });
}

export function deleteCoupon(id) {
  return axios
    .delete(`${process.env.REACT_APP_SERVER}/api/coupons/${id}`)
    .then((res) => {
      openNotificationWithIcon("success", "Coupon deleted!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to delete coupon", "");
      console.log(err);
    });
}

export function updateCoupon(body, id) {
  return axios
    .put(`${process.env.REACT_APP_SERVER}/api/coupons/${id}`, body)
    .then((res) => {
      openNotificationWithIcon("success", "Coupon updated!", "");
    })
    .catch((err) => {
      openNotificationWithIcon("error", "Unable to update coupon", "");
      console.log(err);
    });
}

export function getCouponByCode(code) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/coupons/code/${code}`)
    .then((res) => {
      return {
        success: true,
        data: res.data,
      };
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to verify coupon, please make sure you've entered correct code",
        "",
      );
      console.log(err);
    });
}

/**
 * Spends the coupon. The package and challenge are sent so the server can
 * enforce scope itself — it used to be checked only here in the browser, so
 * calling the endpoint directly applied any coupon to any package.
 */
export function getCouponDiscount(id, context = {}) {
  return axios
    .get(`${process.env.REACT_APP_SERVER}/api/coupons/use/${id}`, {
      data: context,
      params: context,
    })
    .then((res) => {
      openNotificationWithIcon("success", "Code successfully applied", "");
      return {
        success: true,
        data: res.data,
      };
    })
    .catch((err) => {
      openNotificationWithIcon(
        "error",
        "Unable to verify coupon, please make sure you've entered correct code",
        "",
      );
      console.log(err);
    });
}
