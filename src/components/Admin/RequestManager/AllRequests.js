import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input, Select, Switch } from "antd";
import moment from "moment";

import {
  getAllAdminRequests,
  updateAdminRequest,
} from "../../../services/adminRequests";
import slug from "elegant-slug";
import { Link } from "react-router-dom";
import { T } from "../../Translate";

function AllRequests() {
  const [filterAllData, setFilterAllData] = useState([]);
  const [allData, setAllData] = useState([]);
  const [requestsTypeFilter, setRequestsTypeFilter] = useState("challenge");
  const [requestsApprovedFilter, setRequestsApprovedFilter] =
    useState("notApproved");
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
    if (requestsTypeFilter === "challenge") {
      if (requestsApprovedFilter === "approved") {
        setFilterAllData(allData?.challenges?.filter((f) => f.adminApproved));
      }
      if (requestsApprovedFilter === "notApproved") {
        setFilterAllData(allData?.challenges?.filter((f) => !f.adminApproved));
      }
    }
    if (requestsTypeFilter === "recipe") {
      if (requestsApprovedFilter === "approved") {
        setFilterAllData(allData?.recipes?.filter((f) => f.adminApproved));
      }
      if (requestsApprovedFilter === "notApproved") {
        setFilterAllData(allData?.recipes?.filter((f) => !f.adminApproved));
      }
    }
    if (requestsTypeFilter === "blog") {
      if (requestsApprovedFilter === "approved") {
        setFilterAllData(allData?.blogs?.filter((f) => f.adminApproved));
      }
      if (requestsApprovedFilter === "notApproved") {
        setFilterAllData(allData?.blogs?.filter((f) => !f.adminApproved));
      }
    }
  }, [requestsApprovedFilter, allData, requestsTypeFilter]);

  const fetchData = async () => {
    const data = await getAllAdminRequests();
    setAllData(data.res);
    console.log("all blogs", data.res);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (text) => (
        <span className="font-paragraph-black">{requestsTypeFilter}</span>
      ),
    },
    {
      title: "Name",
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
      title: "Is Public",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (text) => (
        <span className="font-paragraph-black">{text ? "True" : "False"}</span>
      ),
    },
    {
      title: "Admin Approved",
      dataIndex: "adminApproved",
      key: "adminApproved",
      render: (text) => (
        <span className="font-paragraph-black">{text ? "True" : "False"}</span>
      ),
    },
    {
      title: "Updated At",
      key: "updatedAt",
      dataIndex: "updatedAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Action",
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
              Approved
            </Select.Option>
            <Select.Option key={2} value={"notApproved"}>
              Not Approved
            </Select.Option>
          </Select>
        </>
      ),
    },
  ];
  return (
    <div>
      <h2 className="font-heading-black">Manage Requets</h2>
      <div style={{ display: "flex" }}>
        <div>
          <span className="font-heading-black" style={{ marginLeft: "10px" }}>
            Filter By Type:
          </span>
          <Select
            defaultValue={requestsTypeFilter}
            style={{ width: 120, marginLeft: "10px" }}
            onChange={(e) => setRequestsTypeFilter(e)}
          >
            <Select.Option key={1} value={"challenge"}>
              Challenges
            </Select.Option>
            <Select.Option key={2} value={"recipe"}>
              Recipes
            </Select.Option>
            <Select.Option key={3} value={"blog"}>
              Blogs
            </Select.Option>
          </Select>
        </div>
        <div style={{ marginLeft: "20px" }}>
          <span className="font-heading-black" style={{ marginLeft: "10px" }}>
            Filter By Status:
          </span>
          <Select
            defaultValue={requestsApprovedFilter}
            style={{ width: 150, marginLeft: "10px" }}
            onChange={(e) => setRequestsApprovedFilter(e)}
          >
            <Select.Option key={1} value={"notApproved"}>
              Not Approved
            </Select.Option>
            <Select.Option key={2} value={"approved"}>
              Approved
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
