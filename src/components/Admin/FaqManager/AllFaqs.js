import React, { useState, useEffect, useContext } from "react";
import { Button, Table, Space, Input } from "antd";
import moment from "moment";
import { getAllFaqs, removeFaq } from "../../../services/faqs";
import UpdateFaq from "./UpdateFaq";
import { LanguageContext } from "../../../contexts/LanguageContext";
import LanguageSelector from "../../LanguageSelector/LanguageSelector";
import { T } from "../../Translate";

function AllFaqs() {
  const [filterAllFaqs, setFilterAllFaqs] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState({});
  const { language } = useContext(LanguageContext);

  const fetchData = async () => {
    const d = await getAllFaqs(language);
    if (d && d.faqs) {
      setAllFaqs(d.faqs);
      setFilterAllFaqs(d.faqs);
    }
    // console.log("dasdasdasd", d);
  };

  const removeFaqClick = async (faq) => {
    // console.log("faq", faq);
    await removeFaq(faq._id);
    fetchData();
  };
  useEffect(() => {
    fetchData();
  }, [language]);
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.question</T>,
      dataIndex: "question",
      key: "question",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: <T>admin.answer</T>,
      dataIndex: "answer",
      key: "answer",
      render: (cat) => <span className="font-paragraph-black">{cat}</span>,
    },
    {
      title: <T>admin.public</T>,
      dataIndex: "isPublic",
      key: "isPublic",
      render: (cat) => (
        <span className="font-paragraph-black">{cat ? "True" : "False"}</span>
      ),
    },
    {
      title: <T>admin.updated_at</T>,
      key: "createdAt",
      dataIndex: "createdAt",
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
              setSelectedFaq(text);
              setUpdateModal(true);
            }}
          >
            <T>admin.edit</T>
          </Button>
          <Button type="danger" onClick={() => removeFaqClick(text)}>
            <T>admin.delete</T>
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h2 className="font-heading-black"><T>admin.all_faqs</T></h2>
      <div style={{ marginBottom: "20px" }}>
        <span style={{ marginRight: "10px" }}><T>admin.select_language</T>:</span>
        <LanguageSelector notFromNav={true} />
      </div>
      <UpdateFaq
        visible={updateModal}
        setVisible={setUpdateModal}
        selectedFaq={selectedFaq}
        getAllFaqs={fetchData}
        key={Math.random()}
      />
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search FAQ By Question"
          onChange={(e) =>
            setFilterAllFaqs(
              allFaqs.filter((p) =>
                p.question.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          style={{ marginTop: "10px" }}
          placeholder="Search FAQ By ID"
          onChange={(e) =>
            setFilterAllFaqs(
              allFaqs.filter((p) =>
                p._id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllFaqs} />
      </div>
    </div>
  );
}

export default AllFaqs;
