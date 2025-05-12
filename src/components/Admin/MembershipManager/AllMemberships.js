import React, { useState, useEffect } from "react";
import { Button, Tag, Table, Space, Input } from "antd";
import moment from "moment";

function AllMemberships() {
  const [filterAllMemberships, setFilterAllMemberships] = useState([]);
  const [allMemberships, setAllMemberships] = useState([
    {
      id: "10",
      membershipTitle: "Challenge One",
      price: 30,
      time: 1,
      // in months
      createdAt: new Date(),
    },

    {
      id: "12",
      membershipTitle: "Challenge Three",
      price: 78,
      time: 3,
      // in months
      createdAt: new Date(),
    },
    {
      id: "15",
      membershipTitle: "Challenge Twelve",
      price: 234,
      time: 12,
      // in months
      createdAt: new Date(),
    },
    {
      id: "18",
      membershipTitle: "Free",
      price: 0,
      time: 0,
      // in months
      createdAt: new Date(),
    },
  ]);

  useEffect(() => {
    setFilterAllMemberships(allMemberships);
  }, [allMemberships]);
  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Membership Name",
      dataIndex: "membershipTitle",
      key: "membershipTitle",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text) => <span className="font-paragraph-black">€ {text}</span>,
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      render: (text) => (
        <span className="font-paragraph-black">{text} months</span>
      ),
    },
    {
      title: "Updated At",
      dataIndex: "createdAt",
      key: "createdAt",
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
        <Space size="middle">
          <Button type="primary">Preview</Button>
          <Button type="primary">Edit</Button>
          <Button type="danger">Delete</Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h2 className="font-heading-black">All Membership</h2>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search Membership By Title"
          onChange={(e) =>
            setAllMemberships(
              allMemberships.filter((mem) =>
                mem.membershipTitle
                  .toUpperCase()
                  .includes(e.target.value.toUpperCase())
              )
            )
          }
        />

        <Input
          style={{ marginTop: "10px" }}
          placeholder="Search Membership By ID"
          onChange={(e) =>
            setAllMemberships(
              allMemberships.filter((mem) =>
                mem.id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllMemberships} />
      </div>
    </div>
  );
}

export default AllMemberships;
