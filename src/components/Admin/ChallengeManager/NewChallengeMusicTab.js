import React, { useState } from "react";
import { List, Divider, Input, Button, Upload, message } from "antd";
import { v4 } from "uuid";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";

function NewChallengeMusicTab({ musics, setMusics, update }) {
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);

  var music = {
    musicId: v4(),
    name: "",
    file: "",
  };

  const handleMusicNameChange = (value, id) => {
    let w = [...musics];
    w = w.map((i) => {
      if (i.musicId === id) {
        return {
          ...i,
          name: value,
        };
      }
      return i;
    });
    setMusics(w);
  };
  const addMusicFile = () => {
    setMusics((prev) => [...prev, music]);
  };
  const dummyNonRenderedWorkoutExerciseAudio = (id, file) => {
    let w = [...musics];
    w = w.map((i) => {
      if (i.musicId === id) {
        return {
          ...i,
          file: file,
        };
      }
      return i;
    });
    setMusics(w);
  };

  const musicFileDelete = (id) => {
    let w = [...musics];
    w = w.map((i) => {
      if (i.musicId === id) {
        return {
          ...i,
          file: "",
        };
      }
      return i;
    });
    setMusics(w);
  };

  return (
    <div>
      <RemoteMediaManager
        visible={mediaManagerVisible}
        setVisible={setMediaManagerVisible}
        type={mediaManagerType}
        actions={mediaManagerActions}
      />
      <Divider orientation="left">Create Music Playlist</Divider>
      <List
        header={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="font-subheading-black">Music Files</div>{" "}
            <Button onClick={addMusicFile}>Add Music</Button>
          </div>
        }
        footer={false}
        bordered
        dataSource={musics}
        renderItem={(music) => (
          <List.Item
            key={music.musicId ? music.musicId : music._id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridGap: "20px",
            }}
          >
            <Input
              placeholder="Input Music Name"
              value={music.name}
              onChange={(e) =>
                handleMusicNameChange(e.target.value, music.musicId)
              }
            />
            <div>
              <p
                className="font-paragraph-white"
                style={{
                  color: "var(--color-orange)",
                  fontWeight: "600",
                }}
              >
                Upload Music File
              </p>
              {/* <Upload
                multiple={false}
                showUploadList={false}
                beforeUpload={checkForAudio}
                customRequest={(j) =>
                  dummyNonRenderedWorkoutExerciseAudio(j, music.musicId)
                }
              > */}
              {console.log("musics", musics)}
              {typeof music === "object" && !music.file && (
                <Button
                  className="new-workout-creator-container-1-btn font-paragraph-white"
                  style={{ marginTop: 0 }}
                  icon={<UploadOutlined />}
                  onClick={() => {
                    setMediaManagerVisible(true);
                    setMediaManagerType("musics");
                    setMediaManagerActions([
                      "",
                      dummyNonRenderedWorkoutExerciseAudio,
                      music.musicId,
                    ]);
                  }}
                >
                  Click to Upload
                </Button>
              )}
              {/* </Upload> */}
              <div className="font-paragraph-black">
                {music.file && music.file.name}{" "}
                {music.file && (
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => musicFileDelete(music.musicId)}
                  >
                    <DeleteOutlined />
                  </span>
                )}
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}

export default NewChallengeMusicTab;
