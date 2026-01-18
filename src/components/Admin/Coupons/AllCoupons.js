import React, { useState, useEffect, useContext } from "react";
import { Button, Tag, Table, Space, Input } from "antd";
import moment from "moment";
import { deleteCoupon, getAllCoupons } from "../../../services/coupons";
import UpdateCoupon from "./UpdateCoupon";
import { getAllChallenges } from "../../../services/createChallenge/main";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

function AllCoupons() {
  const { strings } = useContext(LanguageContext);
  const [filterAllCoupons, setFilterAllCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState({});
  const [updateCouponModal, setUpdateCouponModal] = useState(false);
  const [allCoupons, setAllCoupons] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);

  useEffect(() => {
    fetchData();
    fetchChallenges();
  }, []);

  const fetchData = async () => {
    const res = await getAllCoupons();

    if (res.coupons) {
      setAllCoupons(res.coupons);
      setFilterAllCoupons(res.coupons);
    }
    console.log(res);
  };

  const fetchChallenges = async () => {
    const c = await getAllChallenges(localStorage.getItem("locale"));
    setAllChallenges(c.challenges);
  };

  useEffect(() => {
    setFilterAllCoupons(allCoupons);
  }, [allCoupons]);
  const columns = [
    {
      title: get(strings, "admin.id", "Id"),
      dataIndex: "_id",
      key: "_id",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: get(strings, "admin.name", "Name"),
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: get(strings, "admin.code", "Code"),
      dataIndex: "code",
      key: "code",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: get(strings, "admin.discount", "Discount"),
      dataIndex: "discountPercent",
      key: "discountPercent",
      render: (text) => <span className="font-paragraph-black">{text}%</span>,
    },
    {
      title: get(strings, "admin.limit", "Limit"),
      dataIndex: "limitUsage",
      key: "limitUsage",
      render: (text) => <span className="font-paragraph-black">{text}</span>,
    },
    {
      title: get(strings, "admin.current_usage", "Current Usage"),
      dataIndex: "currentUsage",
      key: "currentUsage",
      render: (text) => (
        <span className="font-paragraph-black">{text ? text : 0}</span>
      ),
    },
    {
      title: get(strings, "admin.updated_at", "Updated At"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (
        <span className="font-paragraph-black">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: get(strings, "admin.applicable_on", "Applicable On"),
      key: "applicableOn",
      dataIndex: "applicableOn",
      render: (tags) => (
        <span>
          {tags.map((tag) => {
            let color = tag && tag.length > 5 ? "geekblue" : "green";
            if (tag === "loser") {
              color = "volcano";
            }
            return (
              <Tag color={color} key={tag}>
                {tag}
              </Tag>
            );
          })}
        </span>
      ),
    },
    {
      title: get(strings, "admin.action", "Action"),
      key: "challengePreviewLink",
      render: (text, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => {
              setSelectedCoupon(text);
              setUpdateCouponModal(true);
            }}
          >
            <T>admin.edit</T>
          </Button>
          <Button
            type="danger"
            onClick={async () => {
              await deleteCoupon(text._id);
              fetchData();
            }}
          >
            <T>admin.delete</T>
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div>
      <UpdateCoupon
        visible={updateCouponModal}
        setVisible={setUpdateCouponModal}
        selectedCoupon={selectedCoupon}
        fetchData={fetchData}
        allChallenges={allChallenges}
      />
      <h2 className="font-heading-black"><T>admin.all_coupons</T></h2>
      <div className="admin-allchallenges-list-container">
        <Input
          placeholder={get(strings, "admin.search_coupon_by_code", "Search Coupon By Code")}
          onChange={(e) =>
            setFilterAllCoupons(
              allCoupons.filter((mem) =>
                mem.code.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Input
          style={{ marginTop: "10px" }}
          placeholder={get(strings, "admin.search_coupon_by_id", "Search Coupon By ID")}
          onChange={(e) =>
            setFilterAllCoupons(
              allCoupons.filter((mem) =>
                mem._id.toUpperCase().includes(e.target.value.toUpperCase())
              )
            )
          }
        />
        <Table columns={columns} dataSource={filterAllCoupons} />
      </div>
    </div>
  );
}

export default AllCoupons;
