import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Space, Input, Select } from "antd";
import moment from "moment";
import { deleteUser, getAllUsers } from "../../../services/users";
import UpdateUser from "./UpdateUser";
import { getAllChallengeGoals } from "../../../services/createChallenge/goals";
import { hasRole } from "../../../helpers/roleHelpers";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

function AllUsers() {
  const { strings } = useContext(LanguageContext);
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
      const filtered = allUsers.filter((f) => hasRole(f, "admin"));
      setFilterAllUsers(filtered);
    }
    if (filter === "customer") {
      const filtered = allUsers.filter((f) => hasRole(f, "customer"));
      setFilterAllUsers(filtered);
    }
    if (filter === "nutrist") {
      const filtered = allUsers.filter((f) => hasRole(f, "nutrist"));
      setFilterAllUsers(filtered);
    }
    if (filter === "shopmanager") {
      const filtered = allUsers.filter((f) => hasRole(f, "shopmanager"));
      setFilterAllUsers(filtered);
    }
    if (filter === "blogger") {
      const filtered = allUsers.filter((f) => hasRole(f, "blogger"));
      setFilterAllUsers(filtered);
    }
    if (filter === "trainer") {
      const filtered = allUsers.filter((f) => hasRole(f, "trainer"));
      setFilterAllUsers(filtered);
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
      title: <T>admin.id</T>,
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.username</T>,
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
      title: <T>admin.email</T>,
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },

    {
      title: <T>admin.roles</T>,
      key: "roles",
      dataIndex: "roles",
      render: (roles, record) => {
        // Support both roles array and legacy role field
        const displayRoles = roles && roles.length > 0 ? roles : (record.role ? [record.role] : []);
        return (
          <span className="font-paragraph-black" style={{ color: "#ff7700" }}>
            {displayRoles.join(", ")}
          </span>
        );
      },
    },
    {
      title: <T>admin.created_at</T>,
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
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              setSelectedUser(record);
              setShow(true);
            }}
          >
            <T>admin.edit</T>
          </Button>
          <Button type="danger" onClick={() => removeUser(record)}>
            <T>admin.delete</T>
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
      <h2 className="font-heading-black"><T>admin.all_users</T></h2>
      <div>
        <span className="font-heading-black" style={{ marginLeft: "10px" }}>
          <T>admin.filter_by_role</T>
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
          placeholder={get(strings, "admin.search_users_by_username", "Search Users By Username")}
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
          placeholder={get(strings, "admin.search_user_by_id", "Search User By ID")}
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
