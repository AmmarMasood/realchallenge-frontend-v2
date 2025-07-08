import { Modal } from "antd";
import "../Workout/ExerciseChooseModal/ExerciseChooseModal.css";

import { EditFilled } from "@ant-design/icons";
function ModalForEditList({
  open,
  setOpen,
  data,
  onClickEdit,
  title,
  subtext,
}) {
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

      <div className="exercise-selector__list" style={{ maxHeight: "230px" }}>
        {data.map((d, index) => (
          <div
            key={index}
            className={`exercise-selector__item `}
            onClick={() => onClickEdit(d)}
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
      </div>
    </Modal>
  );
}

export default ModalForEditList;
