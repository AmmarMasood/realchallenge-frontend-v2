import React, { useState, useEffect } from "react";
import { Form, Input, Button, Switch, Select, InputNumber } from "antd";
import { v4 as uuidv4 } from "uuid";
import { createCoupon } from "../../../services/coupons";
import { getAllChallenges } from "../../../services/createChallenge/main";

function NewCoupon() {
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [applicableOn, setApplicableOn] = useState([]);
  const [challengesApplicableOn, setChallengesApplicableOn] = useState([]);
  const [allChallenges, setAllChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const onFinish = async (values) => {
    setLoading(true);
    if (code.length > 0) {
      const s = {
        name: values.name,
        code: code,
        discountPercent: parseInt(values.discount),
        limitUsage: values.usageCount,
        isActive: values.active,
        applicableOn: values.applicableOn,
        challengesApplicableOn:
          challengesApplicableOn.length > 0 ? challengesApplicableOn : null,
      };
      const res = await createCoupon(s);
      console.log(res);
    } else {
      alert("Please enter coupon code");
    }
    setLoading(false);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  // const selectBefore = (
  //   <Select defaultValue="%" className="select-before">
  //     <Option value="%">%</Option>
  //     <Option value="€">€</Option>
  //   </Select>
  // );

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const c = await getAllChallenges(localStorage.getItem("locale"));
    setAllChallenges(c.challenges);
  };

  return (
    <>
      <h2 className="font-heading-black">New Coupon</h2>
      <div
        className="admin-newuser-container"
        style={{ padding: "50px 50px 50px 20px" }}
      >
        <Form
          layout="vertical"
          name="basic"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input coupon name!" }]}
            type="number"
          >
            <Input style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Coupon Code" name="couponCode">
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
            <Button
              type="primary"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
                marginTop: "10px",
                float: "right",
              }}
              onClick={() => {
                setCode("RL" + uuidv4().substring(1, 8));
              }}
            >
              Generate Coupon Code
            </Button>
          </Form.Item>

          <Form.Item
            label="Discount"
            name="discount"
            rules={[{ required: true, message: "Please input discount!" }]}
            type="number"
          >
            <Input
              placeholder="Must be in percentage eg 10"
              type="number"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Usage Count"
            name="usageCount"
            rules={[
              {
                required: true,
                message: "Please input number of times the code can be used!",
              },
            ]}
            type="number"
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Active" name="active">
            <Switch
              checkedChildren="is active"
              unCheckedChildren="not active"
              checked={active}
              onChange={(e) => setActive(e)}
            />
          </Form.Item>
          <Form.Item label="Applicable On Specific Plan" name="applicableOn">
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              value={applicableOn}
              placeholder="Please select"
              onChange={(e) => setApplicableOn(e)}
            >
              {[
                "ALL",
                "CHALLENGE ONE",
                "CHALLENGE THREE",
                "CHALLENGE TWELVE",
              ].map((e, i) => (
                <Select.Option key={i + 1} value={e}>
                  {e}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Applicable On Specific Challenge"
            name="challengesApplicableOn"
          >
            <Select
              mode="multiple"
              allowClear
              style={{ width: "100%" }}
              value={challengesApplicableOn}
              placeholder="Please select"
              onChange={(e) => setChallengesApplicableOn(e)}
            >
              {allChallenges.map((e, i) => (
                <Select.Option key={i + 1} value={e._id}>
                  {e.challengeName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* footer */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-orange)",
                borderColor: "var(--color-orange)",
                marginTop: "10px",
              }}
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}

export default NewCoupon;
