import React, { useState, useEffect, useContext } from "react";
import {
  Table,
  Input,
  InputNumber,
  Button,
  Switch,
  Space,
  Spin,
  Typography,
  Card,
  Popconfirm,
  Form,
  Tag,
} from "antd";
import {
  SaveOutlined,
  ReloadOutlined,
  EditOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  getAllPackagesAdmin,
  updatePackage,
  resetPackagesToDefaults,
} from "../../../services/packageConfig";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

const { Title, Text } = Typography;

function PackageManager() {
  const { strings } = useContext(LanguageContext);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState("");
  const [editedData, setEditedData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllPackagesAdmin();
      setPackages(data.packages || []);
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
    setLoading(false);
  };

  const isEditing = (record) => record.packageId === editingKey;

  const edit = (record) => {
    setEditedData({ ...record });
    setEditingKey(record.packageId);
  };

  const cancel = () => {
    setEditingKey("");
    setEditedData({});
  };

  const handleFieldChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const save = async (packageId) => {
    setSaving(true);
    try {
      // Sync legacy displayName with EN value for backward compatibility
      const dataToSave = {
        ...editedData,
        displayName: editedData.displayName_en || editedData.displayName,
        description: editedData.description_en || editedData.description,
        priceDisplayText: editedData.priceDisplayText_en || editedData.priceDisplayText,
      };
      await updatePackage(packageId, dataToSave);
      setEditingKey("");
      setEditedData({});
      fetchData();
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await resetPackagesToDefaults();
      fetchData();
    } catch (err) {
      console.error("Failed to reset:", err);
    }
    setLoading(false);
  };

  const columns = [
    {
      title: get(strings, "admin.package_id", "Package ID"),
      dataIndex: "packageId",
      key: "packageId",
      width: 150,
      render: (text) => (
        <Tag color="blue" style={{ fontFamily: "monospace" }}>
          {text}
        </Tag>
      ),
    },
    {
      title: get(strings, "admin.display_name", "Display Name"),
      key: "displayName",
      width: 280,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Input
              value={editedData.displayName_en}
              onChange={(e) =>
                handleFieldChange("displayName_en", e.target.value)
              }
              prefix={<Tag color="blue" style={{ margin: 0 }}>EN</Tag>}
              style={{ width: "100%" }}
            />
            <Input
              value={editedData.displayName_nl}
              onChange={(e) =>
                handleFieldChange("displayName_nl", e.target.value)
              }
              prefix={<Tag color="orange" style={{ margin: 0 }}>NL</Tag>}
              style={{ width: "100%" }}
            />
          </Space>
        ) : (
          <Space direction="vertical" size={0}>
            <Text strong>{record.displayName_en || record.displayName}</Text>
            {record.displayName_nl && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                NL: {record.displayName_nl}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: get(strings, "admin.price", "Price (EUR)"),
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (text, record) => {
        const editable = isEditing(record);
        // CHALLENGE_1 uses individual challenge price
        if (record.packageId === "CHALLENGE_1") {
          return (
            <Text type="secondary" italic>
              {get(strings, "admin.uses_challenge_price", "Uses challenge price")}
            </Text>
          );
        }
        return editable ? (
          <InputNumber
            value={editedData.price}
            onChange={(value) => handleFieldChange("price", value)}
            min={0}
            precision={2}
            prefix="€"
            style={{ width: "100%" }}
          />
        ) : (
          <Text>€{text?.toFixed(2)}</Text>
        );
      },
    },
    {
      title: get(strings, "admin.price_display", "Price Display Text"),
      key: "priceDisplayText",
      width: 220,
      render: (_, record) => {
        const editable = isEditing(record);
        if (record.packageId === "CHALLENGE_1") {
          return <Text type="secondary">-</Text>;
        }
        return editable ? (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Input
              value={editedData.priceDisplayText_en}
              onChange={(e) =>
                handleFieldChange("priceDisplayText_en", e.target.value)
              }
              prefix={<Tag color="blue" style={{ margin: 0 }}>EN</Tag>}
              placeholder="e.g. €4.5 /Week"
              style={{ width: "100%" }}
            />
            <Input
              value={editedData.priceDisplayText_nl}
              onChange={(e) =>
                handleFieldChange("priceDisplayText_nl", e.target.value)
              }
              prefix={<Tag color="orange" style={{ margin: 0 }}>NL</Tag>}
              placeholder="e.g. €4,5 /Week"
              style={{ width: "100%" }}
            />
          </Space>
        ) : (
          <Space direction="vertical" size={0}>
            <Text>{record.priceDisplayText_en || record.priceDisplayText || "-"}</Text>
            {record.priceDisplayText_nl && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                NL: {record.priceDisplayText_nl}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: get(strings, "admin.savings", "Savings"),
      dataIndex: "savingsPercent",
      key: "savingsPercent",
      width: 100,
      render: (text, record) => {
        const editable = isEditing(record);
        if (record.packageId === "CHALLENGE_1") {
          return <Text type="secondary">-</Text>;
        }
        return editable ? (
          <Input
            value={editedData.savingsPercent}
            onChange={(e) =>
              handleFieldChange("savingsPercent", e.target.value)
            }
            placeholder="e.g. 40%"
            style={{ width: 80 }}
          />
        ) : text ? (
          <Tag color="green">{text}</Tag>
        ) : (
          "-"
        );
      },
    },
    {
      title: get(strings, "admin.billing_months", "Billing (months)"),
      dataIndex: "billingInterval",
      key: "billingInterval",
      width: 120,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <InputNumber
            value={editedData.billingInterval}
            onChange={(value) => handleFieldChange("billingInterval", value)}
            min={1}
            max={24}
            style={{ width: "100%" }}
          />
        ) : (
          <Text>{text} month{text > 1 ? "s" : ""}</Text>
        );
      },
    },
    {
      title: get(strings, "admin.challenges_allowed", "Challenges"),
      dataIndex: "challengesAllowed",
      key: "challengesAllowed",
      width: 100,
      render: (text, record) => {
        const editable = isEditing(record);
        return editable ? (
          <InputNumber
            value={editedData.challengesAllowed}
            onChange={(value) => handleFieldChange("challengesAllowed", value)}
            min={1}
            max={10}
            style={{ width: "100%" }}
          />
        ) : (
          <Text>{text} paid</Text>
        );
      },
    },
    {
      title: get(strings, "admin.active", "Active"),
      dataIndex: "isActive",
      key: "isActive",
      width: 80,
      render: (isActive, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Switch
            checked={editedData.isActive}
            onChange={(checked) => handleFieldChange("isActive", checked)}
          />
        ) : (
          <Switch checked={isActive} disabled />
        );
      },
    },
    {
      title: get(strings, "admin.action", "Action"),
      key: "action",
      width: 150,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => save(record.packageId)}
              loading={saving}
              size="small"
            >
              {get(strings, "admin.save", "Save")}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={cancel}
              size="small"
            >
              {get(strings, "admin.cancel", "Cancel")}
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => edit(record)}
            disabled={editingKey !== ""}
            size="small"
          >
            {get(strings, "admin.edit", "Edit")}
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "0 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 className="font-heading-black">
          <T>admin.package_manager</T>
        </h2>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            {get(strings, "admin.refresh", "Refresh")}
          </Button>
          <Popconfirm
            title={get(
              strings,
              "admin.reset_confirm",
              "Are you sure you want to reset all packages to defaults?"
            )}
            onConfirm={handleReset}
            okText={get(strings, "admin.yes", "Yes")}
            cancelText={get(strings, "admin.no", "No")}
          >
            <Button danger>
              {get(strings, "admin.reset_to_defaults", "Reset to Defaults")}
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Text type="secondary">
          {get(
            strings,
            "admin.package_manager_description",
            "Manage subscription package prices and display names. Package IDs cannot be changed as they are used internally. Changes require a manual save - click Edit, make changes, then Save."
          )}
        </Text>
      </Card>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={packages}
          rowKey="packageId"
          pagination={false}
          bordered
          scroll={{ x: 1400 }}
        />
      )}
    </div>
  );
}

export default PackageManager;
