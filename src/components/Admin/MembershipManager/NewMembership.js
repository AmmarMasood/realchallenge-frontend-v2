import React, { useState } from "react";
import { Form, Input, Button, Upload, Select, InputNumber, List } from "antd";
const { Option } = Select;

function NewMembership() {
  const [membershipName, setMembershipName] = useState("");
  const [price, setPrice] = useState(0);
  const [months, setMonths] = useState(0);
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
      <h2 className="font-heading-black">New Membership</h2>
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
            label="Membership Name"
            name="membershipName"
            rules={[
              { required: true, message: "Please input membership name!" },
            ]}
          >
            <Input
              value={membershipName}
              onChange={(e) => setMembershipName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Months"
            name="months"
            rules={[{ required: true, message: "Please input month!" }]}
            type="number"
          >
            <InputNumber
              value={months}
              onChange={(e) => setMonths(e)}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input price!" }]}
            type="number"
          >
            <InputNumber
              value={price}
              onChange={(e) => setPrice(e)}
              style={{ width: "100%" }}
            />
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

export default NewMembership;
