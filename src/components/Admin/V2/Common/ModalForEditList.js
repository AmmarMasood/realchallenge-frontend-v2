import { useContext, useEffect, useState } from "react";
import { Modal, Input, Select } from "antd";
import "../Workout/ExerciseChooseModal/ExerciseChooseModal.css";
import { EditFilled } from "@ant-design/icons";
import { userInfoContext } from "../../../../contexts/UserStore";

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

  // Filter data based on search and selected key
  const filteredData = data.filter((d) =>
    (d[searchKey] || "").toString().toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    console.log(type, JSON.stringify(data));
    // Reset search when modal opens
    if (open) {
      setSearch("");
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

      <Input
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ minWidth: 180, marginBottom: "10px" }}
        allowClear
      />

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
