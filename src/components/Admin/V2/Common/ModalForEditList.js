import { useContext, useEffect, useState } from "react";
import { Modal, Input, Select } from "antd";
import { Link } from "react-router-dom";
import "../Workout/ExerciseChooseModal/ExerciseChooseModal.css";
import { EditFilled, EyeOutlined } from "@ant-design/icons";
import { userInfoContext } from "../../../../contexts/UserStore";
import slug from "elegant-slug";

function ModalForEditList({
  open,
  setOpen,
  data,
  onClickEdit,
  title,
  subtext,
  searchPlaceholder = "Search",
  searchKeys = ["challengeName"], // default keys
  type,
}) {
  const [adminInfo, setAdminInfo] = useContext(userInfoContext);
  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState(searchKeys[0]);
  const [selectedTrainer, setSelectedTrainer] = useState("all");

  // Check if admin features should be shown
  const isAdmin = adminInfo?.role === "admin";
  const showAdminFeatures =
    isAdmin && (type === "exercise" || type === "challenge");

  // Get unique trainers for the filter dropdown
  const uniqueTrainers = showAdminFeatures
    ? Array.from(
        new Map(
          data
            .filter((d) => d.trainer || d.user)
            .map((d) => {
              const trainer = d.trainer || d.user;
              return [
                trainer._id,
                {
                  _id: trainer._id,
                  firstName: trainer.firstName,
                  lastName: trainer.lastName,
                },
              ];
            })
        ).values()
      )
    : [];

  // Filter data based on search, selected key, and trainer
  const filteredData = data.filter((d) => {
    const matchesSearch = (d[searchKey] || "")
      .toString()
      .toLowerCase()
      .includes(search.toLowerCase());

    // Check if the selected trainer matches as creator OR as assigned trainer
    let matchesTrainer = true;
    if (showAdminFeatures && selectedTrainer !== "all") {
      const creatorId = (d.user || d.trainer)?._id; // Creator can be in user or trainer field
      const assignedTrainerId = d.trainer?._id; // Assigned trainer

      matchesTrainer =
        creatorId === selectedTrainer || // Matches as creator
        assignedTrainerId === selectedTrainer; // Matches as assigned trainer
    }

    return matchesSearch && matchesTrainer;
  });

  useEffect(() => {
    console.log("test", type, JSON.stringify([data[0]]));
    // Reset search when modal opens
    if (open) {
      setSearch("");
      setSelectedTrainer("all");
    }
  }, [open]);

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={() => setOpen(false)}
      title=""
      bodyStyle={{
        backgroundColor: "#171e27",
        border: "1px solid #FF950A",
        textAlign: "center",
      }}
    >
      <div className="exercise-selector__header">
        <h2 className="exercise-selector__title">{title}</h2>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 180, marginBottom: "10px", width: "100%" }}
          allowClear
        />

        {showAdminFeatures && uniqueTrainers.length > 0 && (
          <Select
            placeholder="Filter by Trainer"
            value={selectedTrainer}
            onChange={setSelectedTrainer}
            style={{ width: "150px", marginBottom: "10px" }}
            allowClear
            onClear={() => setSelectedTrainer("all")}
          >
            <Select.Option value="all">All Trainers</Select.Option>
            {uniqueTrainers.map((trainer) => (
              <Select.Option key={trainer._id} value={trainer._id}>
                {trainer.firstName} {trainer.lastName}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
      <div
        className="exercise-selector__list"
        style={{ maxHeight: "230px", overflowY: "auto" }}
      >
        {filteredData.map((d, index) => (
          <div
            key={index}
            className={`exercise-selector__item`}
            style={{ cursor: "default" }}
          >
            <p>{d.name || d.title || d.challengeName || "Unnamed"}</p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    verticalAlign: "middle",
                    color: "#465060",
                  }}
                >
                  {subtext || "ID"}: {d._id}
                </span>
                {showAdminFeatures && (d.trainer || d.user) && (
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      lineHeight: "140%",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
                    Created by: {d.user.firstName} {d.user.lastName}
                  </div>
                )}
                {showAdminFeatures && d.trainer && (
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      lineHeight: "140%",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
                    Trainer: {d.trainer.firstName} {d.trainer.lastName}
                  </div>
                )}
              </div>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                {isAdmin && type === "challenge" && (
                  <Link
                    to={`/challenge/${slug(d.challengeName)}/${d._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <EyeOutlined
                      style={{
                        cursor: "pointer",
                        color: "white",
                        fontSize: "18px",
                      }}
                    />
                  </Link>
                )}
                <EditFilled
                  style={{
                    cursor: "pointer",
                    color: "white",
                    fontSize: "18px",
                  }}
                  onClick={() => onClickEdit(d._id)}
                />
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div style={{ color: "#fff", marginTop: "20px" }}>
            No results found.
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalForEditList;
