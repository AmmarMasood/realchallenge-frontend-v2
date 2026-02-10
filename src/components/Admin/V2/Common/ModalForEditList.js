import { useContext, useEffect, useState } from "react";
import { Modal, Input, Select, Tag } from "antd";
import { Link } from "react-router-dom";
import "../Workout/ExerciseChooseModal/ExerciseChooseModal.css";
import { EditFilled, EyeOutlined } from "@ant-design/icons";
import { userInfoContext } from "../../../../contexts/UserStore";
import { LanguageContext } from "../../../../contexts/LanguageContext";
import { get } from "lodash";
import slug from "elegant-slug";

function ModalForEditList({
  open,
  setOpen,
  data,
  onClickEdit,
  title,
  subtext,
  searchPlaceholder,
  searchKeys = ["challengeName"], // default keys
  type,
}) {
  const [adminInfo, setAdminInfo] = useContext(userInfoContext);
  const { strings } = useContext(LanguageContext);
  const [search, setSearch] = useState("");
  const [searchKey, setSearchKey] = useState(searchKeys[0]);
  const [selectedTrainer, setSelectedTrainer] = useState("all");
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Check if admin features should be shown
  const isAdmin = adminInfo?.role === "admin";
  const isTrainer = adminInfo?.role === "trainer";

  // Only admins can see filter dropdown
  const showAdminFeatures =
    isAdmin && (type === "exercise" || type === "challenge");

  // Both admins and trainers can see metadata
  const showMetadata =
    (isAdmin || isTrainer) && (type === "exercise" || type === "challenge");

  // Both admins and trainers can view challenges
  const canViewChallenge = (isAdmin || isTrainer) && type === "challenge";

  // Check if user can edit a specific item
  const canEdit = (item) => {
    if (isAdmin) return true; // Admins can edit everything
    if (isTrainer && item.user && item.user._id === adminInfo.id) {
      return true; // Trainers can edit their own content
    }
    if (isTrainer && item.trainers?.some((t) => (t._id || t) === adminInfo.id)) {
      return true; // Assigned trainers can edit
    }
    return false;
  };

  // Get unique trainers for the filter dropdown (admin only)
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

    // Check if the selected trainer matches as creator OR as assigned trainer OR in trainers array
    let matchesTrainer = true;
    if (showAdminFeatures && selectedTrainer !== "all") {
      const creatorId = (d.user || d.trainer)?._id; // Creator can be in user or trainer field
      const assignedTrainerId = d.trainer?._id; // Assigned trainer
      const isInTrainersArray = d.trainers?.some(
        (trainer) => trainer._id === selectedTrainer
      ); // Check trainers array

      matchesTrainer =
        creatorId === selectedTrainer || // Matches as creator
        assignedTrainerId === selectedTrainer || // Matches as assigned trainer
        isInTrainersArray; // Matches in trainers array
    }

    return matchesSearch && matchesTrainer;
  });

  // Update dimensions on window resize for dynamic responsiveness
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("test", type, JSON.stringify([data[0]]));
    // Reset search when modal opens
    if (open) {
      setSearch("");
      setSelectedTrainer("all");
    }
  }, [open]);

  // Calculate responsive dimensions based on screen size
  const getResponsiveDimensions = () => {
    const { width, height } = dimensions;

    // Mobile portrait (< 600px width)
    if (width < 600) {
      return {
        width: "95vw",
        listHeight: `${height - 250}px`, // Account for header, search, and margins
        maxListHeight: "60vh",
      };
    }
    // Mobile landscape or small tablet (600-900px width)
    else if (width < 900) {
      return {
        width: "80vw",
        listHeight: `${height - 280}px`,
        maxListHeight: "65vh",
      };
    }
    // Tablet (900-1200px width)
    else if (width < 1200) {
      return {
        width: "70vw",
        listHeight: `${height - 300}px`,
        maxListHeight: "70vh",
      };
    }
    // Desktop (>= 1200px width)
    else {
      return {
        width: "60vw",
        listHeight: `${height - 350}px`,
        maxListHeight: "75vh",
      };
    }
  };

  const responsiveDimensions = getResponsiveDimensions();

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={() => setOpen(false)}
      title=""
      width={responsiveDimensions.width}
      centered
      bodyStyle={{
        backgroundColor: "#171e27",
        border: "1px solid #FF950A",
        textAlign: "center",
        padding: dimensions.width < 600 ? "12px" : "24px", // Less padding on mobile
      }}
      style={{
        top: dimensions.width < 600 ? 10 : undefined, // Minimize top margin on mobile
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
          placeholder={searchPlaceholder || get(strings, "adminv2.search", "Search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 180, marginBottom: "10px", width: "100%" }}
          allowClear
        />

        {showAdminFeatures && uniqueTrainers.length > 0 && (
          <Select
            placeholder={get(strings, "adminv2.filter_by_trainer", "Filter by Trainer")}
            value={selectedTrainer}
            onChange={setSelectedTrainer}
            style={{ width: "150px", marginBottom: "10px" }}
            allowClear
            onClear={() => setSelectedTrainer("all")}
          >
            <Select.Option value="all">{get(strings, "adminv2.all_trainers", "All Trainers")}</Select.Option>
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
        style={{
          height: responsiveDimensions.listHeight,
          maxHeight: responsiveDimensions.maxListHeight,
          overflowY: "auto",
        }}
      >
        {filteredData.map((d, index) => (
          <div
            key={index}
            className={`exercise-selector__item`}
            style={{ cursor: "default" }}
          >
            <p>{d.name || d.title || d.challengeName || get(strings, "adminv2.unnamed", "Unnamed")}</p>
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
                  {subtext || get(strings, "adminv2.id", "ID")}: {d._id}
                </span>
                {showMetadata && (d.trainer || d.user) && (
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      lineHeight: "140%",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
                    {get(strings, "adminv2.created_by", "Created by")}: {d.user.firstName} {d.user.lastName}
                  </div>
                )}
                {showMetadata && d.trainer && (
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      lineHeight: "140%",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
                    {get(strings, "adminv2.trainer_label", "Trainer")}: {d.trainer.firstName} {d.trainer.lastName}
                  </div>
                )}
                {showMetadata && d.trainers && d.trainers.length > 0 && (
                  <div
                    style={{
                      fontWeight: 400,
                      fontSize: "11px",
                      lineHeight: "140%",
                      color: "#6B7280",
                      marginTop: "4px",
                    }}
                  >
                    {get(strings, "adminv2.trainers_label", "Trainers")}:{" "}
                    {d.trainers
                      .map(
                        (trainer) => `${trainer.firstName} ${trainer.lastName}`
                      )
                      .join(", ")}
                  </div>
                )}
                {(type === "challenge" || type === "recipe" || type === "blog") && d.adminApproved !== undefined && (
                  <div style={{ marginTop: "6px" }}>
                    <Tag color={d.adminApproved ? "green" : "orange"} style={{ fontSize: "10px" }}>
                      {d.adminApproved
                        ? get(strings, "admin.approved", "Approved")
                        : get(strings, "admin.pending_approval", "Pending Approval")}
                    </Tag>
                  </div>
                )}
              </div>

              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                {canViewChallenge && (
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
                {canEdit(d) && (
                  <EditFilled
                    style={{
                      cursor: "pointer",
                      color: "white",
                      fontSize: "18px",
                    }}
                    onClick={() => onClickEdit(d._id)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredData.length === 0 && (
          <div style={{ color: "#fff", marginTop: "20px" }}>
            {get(strings, "adminv2.no_results_found", "No results found")}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ModalForEditList;
