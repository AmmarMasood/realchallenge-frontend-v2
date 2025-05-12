import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input, Select } from "antd";
import moment from "moment";
import { deleteUser, getAllUsers } from "../../../services/users";
import UpdateUser from "./UpdateUser";
import { getAllChallengeGoals } from "../../../services/createChallenge/goals";

function AllUsers() {
  const [filterAllUsers, setFilterAllUsers] = useState([]);
  const [allChallengeGoals, setAllChallengeGoals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState({});
  const [show, setShow] = useState("");

  async function fetchUsers() {
    const users = await getAllUsers();
    const aCh = await getAllChallengeGoals();
    if (aCh.challengeGoals) {
      setAllChallengeGoals(aCh.challengeGoals);
    }
    setAllUsers(users.users);
    setFilterAllUsers(users.users);
  }

  useEffect(async () => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (filter === "all") {
      setFilterAllUsers(allUsers);
    }
    if (filter === "admin") {
      const admins = allUsers.filter((f) => f.role === "admin");
      setFilterAllUsers(admins);
    }
    if (filter === "customer") {
      const admins = allUsers.filter((f) => f.role === "customer");
      setFilterAllUsers(admins);
    }
    if (filter === "nutrist") {
      const admins = allUsers.filter((f) => f.role === "nutrist");
      setFilterAllUsers(admins);
    }
    if (filter === "shopmanager") {
      const admins = allUsers.filter((f) => f.role === "shopmanager");
      setFilterAllUsers(admins);
    }
    if (filter === "blogger") {
      const admins = allUsers.filter((f) => f.role === "blogger");
      setFilterAllUsers(admins);
    }
    if (filter === "trainer") {
      const admins = allUsers.filter((f) => f.role === "trainer");
      setFilterAllUsers(admins);
    }
  }, [allUsers, filter]);

  const removeUser = async (d) => {
    await deleteUser(d._id);
    fetchUsers();
  };

  const onUpdateComplete = async (setLoading, vals, blogId) => {
    // await updateBlog(vals, blogId);
    // setLoading(false);
    // setShow(false);
    // fetchData();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    // {
    //   title: "Firstname",
    //   dataIndex: "firstName",
    //   key: "firstname",
    //   render: (text) => <span className="font-paragraph-black">{text}</span>,
    // },
    // {
    //   title: "Lastname",
    //   dataIndex: "lastName",
    //   key: "lastname",
    //   render: (text) => <span className="font-paragraph-black">{text}</span>,
    // },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },

    {
      title: "Role",
      key: "role",
      dataIndex: "role",
      render: (text) => (
        <span className="font-paragraph-black" style={{ color: "#ff7700" }}>
          {text}
        </span>
      ),
    },
    {
      title: "Created At",
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
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              setSelectedUser(record);
              setShow(true);
            }}
          >
            Edit
          </Button>
          <Button type="danger" onClick={() => removeUser(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <UpdateUser
        userInfo={selectedUser}
        show={show}
        setShow={setShow}
        onUpdateComplete={onUpdateComplete}
        allChallengeGoals={allChallengeGoals}
        fetchUsers={fetchUsers}
        key={selectedUser ? selectedUser._id : ""}
      />
      <h2 className="font-heading-black">All Users</h2>
      <div>
        <span className="font-heading-black" style={{ marginLeft: "10px" }}>
          Filter By Role:
        </span>
        <Select
          defaultValue=""
          style={{ width: 120, marginLeft: "10px" }}
          onChange={(e) => setFilter(e)}
        >
          {[
            "all",
            "admin",
            "customer",
            "trainer",
            "blogger",
            "shopmanager",
            "nutrist",
          ].map((t) => (
            <Select.Option value={t}>{t}</Select.Option>
          ))}
        </Select>
      </div>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search Users By Username"
          onChange={(e) =>
            setFilterAllUsers(
              allUsers.filter((user) =>
                user.username
                  .toUpperCase()
                  .includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          placeholder="Search User By ID"
          style={{ marginTop: "10px" }}
          onChange={(e) =>
            setFilterAllUsers(
              allUsers.filter((user) =>
                user._id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllUsers} />
      </div>
    </div>
  );
}

export default AllUsers;
