import React, { useState, useContext } from "react";
import { Select, Input, Button, Checkbox, Upload, List, message } from "antd";
import { v4 } from "uuid";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import RemoteMediaManager from "../MediaManager/RemoteMediaManager";
import { userInfoContext } from "../../../contexts/UserStore";
import { T } from "../../Translate";

const Option = Select.Option;

function NewChallengeAdditionalTab({
  results,
  setResults,
  allProducts,
  setAllProducts,
  makePublic,
  setMakePublic,
  allowComments,
  setAllowComments,
  allowReviews,
  setAllowReviews,
  additionalProducts,
  setAdditionalProducts,
  informationList,
  setInformationList,
  createChallenge,
  update,
  updateChallenge,
  userCreatePost,
  setUserCreatePost,
}) {
  // media manager stuff
  const [mediaManagerVisible, setMediaManagerVisible] = useState(false);
  const [mediaManagerType, setMediaManagerType] = useState("images");
  const [mediaManagerActions, setMediaManagerActions] = useState([]);
  const userInfo = useContext(userInfoContext)[0];

  const [loading, setLoading] = useState(false);

  var info = {
    id: v4(),
    icon: "",
    thumbnailBase64: "",
    text: "",
  };

  const handleInfoTextChange = (value, id) => {
    let w = [...informationList];
    w = w.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          text: value,
        };
      }
      return i;
    });
    setInformationList(w);
  };
  const addInfoToList = () => {
    setInformationList((prev) => [...prev, info]);
  };
  const uploadIcon = (id, file) => {
    var infoList = informationList.map((i) => {
      if (i.id === id) {
        return {
          ...i,
          file: file,
        };
      }
      return i;
    });
    console.log(infoList);
    setInformationList(infoList);
  };

  const removeListItem = (id) => {
    var n = informationList.filter((i) => i.id !== id);
    setInformationList(n);
  };
  return (
    <div>
      <div>
        <RemoteMediaManager
          visible={mediaManagerVisible}
          setVisible={setMediaManagerVisible}
          type={mediaManagerType}
          actions={mediaManagerActions}
        />
        <p className="font-subheading-black">
          <T>adminDashboard.challenges.sp</T>
        </p>
        <Select
          mode="multiple"
          showSearch
          style={{ width: "100%" }}
          optionFilterProp="children"
          value={additionalProducts}
          onChange={(e) => setAdditionalProducts(e)}
          filterOption={(input, option) =>
            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {allProducts.map((m, i) => (
            <Option value={m._id}>{m.name}</Option>
          ))}
        </Select>
      </div>
      <div>
        <p className="font-subheading-black">Results</p>
        <Input.TextArea
          className="font-paragraph-black"
          value={results}
          onChange={(e) => setResults(e.target.value)}
        />
      </div>
      <div>
        <p className="font-subheading-black">
          <T>adminDashboard.challenges.il</T>
        </p>
        {/* <Input.TextArea
          maxLength={200}
          showCount
          className="font-paragraph-black"
          value={info}
          onChange={(e) => setInfo(e.target.value)}
        /> */}
        <List
          header={
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={addInfoToList}>
                <T>adminDashboard.challenges.af</T>
              </Button>
            </div>
          }
          footer={false}
          bordered
          dataSource={informationList}
          renderItem={(info) => (
            <List.Item
              key={info.id}
              style={{
                display: "grid",
                gridTemplateColumns: "0.1fr 1fr 1fr",
                gridGap: "20px",
              }}
            >
              <Button type="danger" onClick={() => removeListItem(info.id)}>
                X
              </Button>
              <Input.TextArea
                rows={4}
                placeholder="Input Information"
                value={info.text}
                onChange={(e) => handleInfoTextChange(e.target.value, info.id)}
              />
              <div>
                {/* <Upload
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={dummyRequest}
                  onChange={(e) => handleChange(e, info.id)}
                  style={{ width: "100px" }}
                > */}
                {info.file ? (
                  <img
                    src={`${process.env.REACT_APP_SERVER}/uploads/${info.file.link}`}
                    alt=""
                    height="100px"
                    width="120px"
                  />
                ) : (
                  <>
                    <p
                      className="font-paragraph-white"
                      style={{
                        color: "var(--color-orange)",
                        fontWeight: "600",
                      }}
                    >
                      Upload Icon
                    </p>
                    <Button
                      className="new-workout-creator-container-1-btn font-paragraph-white"
                      style={{ marginTop: 0 }}
                      onClick={() => {
                        setMediaManagerVisible(true);
                        setMediaManagerType("images");
                        setMediaManagerActions(["", uploadIcon, info.id]);
                      }}
                      icon={<UploadOutlined />}
                    >
                      Click to Upload
                    </Button>
                  </>
                )}

                {/* </Upload> */}
              </div>
            </List.Item>
          )}
        />
      </div>
      {userInfo.role === "admin" && (
        <>
          <div>
            <Checkbox
              checked={allowComments}
              onChange={(e) => setAllowComments(e.target.checked)}
              className="font-paragraph-black"
            >
              <T>adminDashboard.challenges.allowcb</T>
            </Checkbox>
          </div>
          <div>
            <Checkbox
              checked={allowReviews}
              onChange={(e) => setAllowReviews(e.target.checked)}
              className="font-paragraph-black"
            >
              <T>adminDashboard.challenges.allowrv</T>
            </Checkbox>
          </div>
          <div>
            <Checkbox
              checked={makePublic}
              onChange={(e) => setMakePublic(e.target.checked)}
              className="font-paragraph-black"
            >
              <T>adminDashboard.challenges.mp</T>
            </Checkbox>
          </div>
          {!update && (
            <div>
              <Checkbox
                checked={userCreatePost}
                onChange={(e) => setUserCreatePost(e.target.checked)}
                className="font-paragraph-black"
              >
                Create a post
              </Checkbox>
            </div>
          )}
        </>
      )}
      {update ? (
        <Button
          className="font-paragraph-white"
          style={{
            backgroundColor: "var(--color-orange)",
            border: "none",
            marginTop: "20px",
          }}
          onClick={updateChallenge}
        >
          Update Challenge
        </Button>
      ) : (
        <Button
          className="font-paragraph-white"
          style={{
            backgroundColor: "var(--color-orange)",
            border: "none",
            marginTop: "20px",
          }}
          onClick={createChallenge}
        >
          <T>adminDashboard.challenges.createAC</T>
        </Button>
      )}
    </div>
  );
}

export default NewChallengeAdditionalTab;
