import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Space, Input, Select, Tag, Popconfirm, Tooltip, Modal } from "antd";
import { KeyOutlined, CheckCircleOutlined, CopyOutlined } from "@ant-design/icons";
import moment from "moment";
import { deleteUser, getAllUsers, adminResetPassword, adminActivateUser } from "../../../services/users";
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
  const [resetLinkModal, setResetLinkModal] = useState({ visible: false, email: "", resetLink: "" });

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

  const handleResetPassword = async (user) => {
    const result = await adminResetPassword(user._id);
    if (result) {
      setResetLinkModal({
        visible: true,
        email: result.email,
        resetLink: result.resetLink,
        emailFailed: result.emailFailed,
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleActivateUser = async (user) => {
    const result = await adminActivateUser(user._id);
    if (result) {
      fetchUsers();
    }
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
      title: <T>admin.status</T>,
      key: "isActive",
      dataIndex: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? <T>admin.active</T> : <T>admin.inactive</T>}
        </Tag>
      ),
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
          <Popconfirm
            title={<span style={{ color: "white" }}>{get(strings, "admin.reset_password_confirm", "Send password reset email to this user?")}</span>}
            onConfirm={() => handleResetPassword(record)}
            okText={get(strings, "admin.yes", "Yes")}
            cancelText={get(strings, "admin.no", "No")}
          >
            <Tooltip title={get(strings, "admin.reset_password", "Reset Password")}>
              <Button icon={<KeyOutlined />} />
            </Tooltip>
          </Popconfirm>
          {!record.isActive && (
            <Popconfirm
              title={<span style={{ color: "white" }}>{get(strings, "admin.activate_user_confirm", "Activate this user's account?")}</span>}
              onConfirm={() => handleActivateUser(record)}
              okText={get(strings, "admin.yes", "Yes")}
              cancelText={get(strings, "admin.no", "No")}
            >
              <Tooltip title={get(strings, "admin.activate_user", "Activate User")}>
                <Button type="primary" icon={<CheckCircleOutlined />} style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }} />
              </Tooltip>
            </Popconfirm>
          )}
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

      <Modal
        title={<span style={{ color: "white" }}>{get(strings, "admin.reset_email_sent", "Password Reset Email Sent")}</span>}
        open={resetLinkModal.visible}
        onOk={() => setResetLinkModal({ visible: false, email: "", resetLink: "" })}
        onCancel={() => setResetLinkModal({ visible: false, email: "", resetLink: "" })}
        footer={[
          <Button key="close" type="primary" onClick={() => setResetLinkModal({ visible: false, email: "", resetLink: "" })}>
            OK
          </Button>
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            <span style={{ color: "white" }}><strong>{get(strings, "admin.email_sent_to", "Email sent to")}:</strong> {resetLinkModal.email}</span>
          </p>
          {resetLinkModal.emailFailed && (
            <p style={{ color: "#ff4d4f" }}>
              {get(strings, "admin.email_failed_warning", "Note: Email sending failed, please share the link manually.")}
            </p>
          )}
        </div>
        <div>
          <p><span style={{ color: "white" }}><strong>{get(strings, "admin.reset_link_backup", "Here is the password reset link in case they can't find it")}:</strong></span></p>
          <div style={{
            background: "#f5f5f5",
            padding: "10px",
            borderRadius: "4px",
            wordBreak: "break-all",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ flex: 1 }}>{resetLinkModal.resetLink}</span>
            <Tooltip title={get(strings, "admin.copy_link", "Copy Link")}>
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={() => copyToClipboard(resetLinkModal.resetLink)}
              />
            </Tooltip>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AllUsers;
