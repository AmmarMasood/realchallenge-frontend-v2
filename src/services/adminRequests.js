// /api/admin/request
import axios from "axios";

export async function getAllAdminRequests() {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_SERVER}/api/admin/requests/all`
    );
    return { success: true, res: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, res: "unable to get data" };
  }
}

export async function updateAdminRequest(id, type, value) {
  try {
    const res = await axios.put(
      `${process.env.REACT_APP_SERVER}/api/admin/requests`,
      { type, id, value }
    );
    return { success: true, res: res.data };
  } catch (err) {
    console.error(err);
    return { success: false, res: "unable to get data" };
  }
}
