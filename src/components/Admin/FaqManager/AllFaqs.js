import React, { useState, useEffect } from "react";
import { Button, Table, Space, Input } from "antd";
import moment from "moment";
import { getAllFaqs, removeFaq } from "../../../services/faqs";
import UpdateFaq from "./UpdateFaq";

function AllFaqs() {
  const [filterAllFaqs, setFilterAllFaqs] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState({});

  const fetchData = async () => {
    const d = await getAllFaqs("");
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
  }, []);
  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Question",
      dataIndex: "question",
      key: "question",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      render: (cat) => <span className="font-paragraph-black">{cat}</span>,
    },
    {
      title: "Public",
      dataIndex: "isPublic",
      key: "isPublic",
      render: (cat) => (
        <span className="font-paragraph-black">{cat ? "True" : "False"}</span>
      ),
    },
    {
      title: "Updated At",
      key: "createdAt",
      dataIndex: "createdAt",
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
              setSelectedFaq(text);
              setUpdateModal(true);
            }}
          >
            Edit
          </Button>
          <Button type="danger" onClick={() => removeFaqClick(text)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <h2 className="font-heading-black">All Faqs</h2>
      <UpdateFaq
        visible={updateModal}
        setVisible={setUpdateModal}
        selectedFaq={selectedFaq}
        getAllFaqs={fetchData}
        key={Math.random()}
      />
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder="Search Faq By Question"
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
          placeholder="Search Faq By ID"
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
