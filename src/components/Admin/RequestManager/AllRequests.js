import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Space, Input, Select, Switch } from "antd";
import moment from "moment";

import {
  getAllAdminRequests,
  updateAdminRequest,
} from "../../../services/adminRequests";
import slug from "elegant-slug";
import { Link } from "react-router-dom";
import { T } from "../../Translate";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { get } from "lodash";

function AllRequests() {
  const { strings } = useContext(LanguageContext);
  const [filterAllData, setFilterAllData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [requestsTypeFilter, setRequestsTypeFilter] = useState("challenge");
  const [requestsApprovedFilter, setRequestsApprovedFilter] =
    useState("notApproved");
  const [sortOrder, setSortOrder] = useState("desc");
  useEffect(() => {
    fetchData();
  }, []);

  async function updateRequestStatus(id, type, value) {
    const res = await updateAdminRequest(
      id,
      type,
      value === "approved" ? true : false
    );
    console.log(res);
    fetchData();
  }

  useEffect(() => {
    let data = [];
    if (requestsTypeFilter === "challenge") {
      if (requestsApprovedFilter === "approved") {
        data = allData?.challenges?.filter((f) => f.adminApproved) || [];
      }
      if (requestsApprovedFilter === "notApproved") {
        data = allData?.challenges?.filter((f) => !f.adminApproved) || [];
      }
    }
    if (requestsTypeFilter === "recipe") {
      if (requestsApprovedFilter === "approved") {
        data = allData?.recipes?.filter((f) => f.adminApproved) || [];
      }
      if (requestsApprovedFilter === "notApproved") {
        data = allData?.recipes?.filter((f) => !f.adminApproved) || [];
      }
    }
    if (requestsTypeFilter === "blog") {
      if (requestsApprovedFilter === "approved") {
        data = allData?.blogs?.filter((f) => f.adminApproved) || [];
      }
      if (requestsApprovedFilter === "notApproved") {
        data = allData?.blogs?.filter((f) => !f.adminApproved) || [];
      }
    }
    const sorted = [...data].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
    setFilterAllData(sorted);
  }, [requestsApprovedFilter, allData, requestsTypeFilter, sortOrder]);

  const fetchData = async () => {
    const data = await getAllAdminRequests();
    setAllData(data.res);
    console.log("all blogs", data.res);
  };

  const columns = [
    {
      title: <T>admin.id</T>,
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.type</T>,
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span className="font-paragraph-black">{requestsTypeFilter}</span>
      ),
    },
    {
      title: <T>admin.name</T>,
      key: "bang",
      render: (text, record) =>
        text.name
          ? text.name
          : text.challengeName
          ? text.challengeName
          : text.title
          ? text.title
          : "",
    },
    {
      title: <T>admin.is_public</T>,
      dataIndex: "isPublic",
      key: "isPublic",
      render: (text) => (
        <span className="font-paragraph-black">{text ? get(strings, "admin.true", "True") : get(strings, "admin.false", "False")}</span>
      ),
    },
    {
      title: <T>admin.admin_approved</T>,
      dataIndex: "adminApproved",
      key: "adminApproved",
      render: (text) => (
        <span className="font-paragraph-black">{text ? get(strings, "admin.true", "True") : get(strings, "admin.false", "False")}</span>
      ),
    },
    {
      title: <T>admin.updated_at</T>,
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: <T>admin.action</T>,
      key: "challengePreviewLink",
      render: (text, record) => (
        <>
          {console.log("yas", text)}
          <Link
            to={`/${requestsTypeFilter}/${slug(
              text.name
                ? text.name
                : text.challengeName
                ? text.challengeName
                : text.title
                ? text.title
                : ""
            )}/${text._id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            <Button type="primary">
              <T>adminDashboard.preview</T>
            </Button>
          </Link>

          <Select
            style={{ width: 150, marginLeft: "10px" }}
            value={text.adminApproved ? "approved" : "notApproved"}
            onChange={(e) =>
              updateRequestStatus(text._id, requestsTypeFilter, e)
            }
          >
            <Select.Option key={1} value={"approved"}>
              <T>admin.approved</T>
            </Select.Option>
            <Select.Option key={2} value={"notApproved"}>
              <T>admin.not_approved</T>
            </Select.Option>
          </Select>
        </>
      ),
    },
  ];
  return (
    <div>
      <h2 className="font-heading-black"><T>admin.manage_requests</T></h2>
      <div style={{ display: "flex" }}>
        <div>
          <span className="font-heading-black" style={{ marginLeft: "10px" }}>
            <T>admin.filter_by_type</T>
          </span>
          <Select
            defaultValue={requestsTypeFilter}
            style={{ width: 120, marginLeft: "10px" }}
            onChange={(e) => setRequestsTypeFilter(e)}
          >
            <Select.Option key={1} value={"challenge"}>
              <T>admin.challenges</T>
            </Select.Option>
            <Select.Option key={2} value={"recipe"}>
              <T>admin.recipes</T>
            </Select.Option>
            <Select.Option key={3} value={"blog"}>
              <T>admin.blogs</T>
            </Select.Option>
          </Select>
        </div>
        <div style={{ marginLeft: "20px" }}>
          <span className="font-heading-black" style={{ marginLeft: "10px" }}>
            <T>admin.filter_by_status</T>
          </span>
          <Select
            defaultValue={requestsApprovedFilter}
            style={{ width: 150, marginLeft: "10px" }}
            onChange={(e) => setRequestsApprovedFilter(e)}
          >
            <Select.Option key={1} value={"notApproved"}>
              <T>admin.not_approved</T>
            </Select.Option>
            <Select.Option key={2} value={"approved"}>
              <T>admin.approved</T>
            </Select.Option>
          </Select>
        </div>
        <div style={{ marginLeft: "20px" }}>
          <span className="font-heading-black" style={{ marginLeft: "10px" }}>
            <T>admin.sort_by</T>
          </span>
          <Select
            defaultValue={sortOrder}
            style={{ width: 200, marginLeft: "10px" }}
            onChange={(e) => setSortOrder(e)}
          >
            <Select.Option key={1} value={"desc"}>
              <T>admin.newest_first</T>
            </Select.Option>
            <Select.Option key={2} value={"asc"}>
              <T>admin.oldest_first</T>
            </Select.Option>
          </Select>
        </div>
      </div>
      <div className="admin-allchallenges-list-container">
        <Table columns={columns} dataSource={filterAllData} />
      </div>
    </div>
  );
}

export default AllRequests;
