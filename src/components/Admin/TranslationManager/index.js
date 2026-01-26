import React, { useState, useEffect, useContext, useMemo } from "react";
import {
  Table,
  Input,
  Tabs,
  Select,
  Tag,
  Space,
  Spin,
  Typography,
  Badge,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getAllTranslationsAdmin,
  updateTranslation,
} from "../../../services/uiTranslations";
import { LanguageContext } from "../../../contexts/LanguageContext";
import { T } from "../../Translate";
import { get } from "lodash";

const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

/**
 * Extract the section (first part) from a dot-notation key
 * e.g., "home.header.title" -> "home"
 */
function getSection(key) {
  const parts = key.split(".");
  return parts[0] || "other";
}

/**
 * Editable Cell Component
 */
function EditableCell({ value, onSave, language, translationKey }) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleBlur = async () => {
    if (inputValue !== value) {
      setSaving(true);
      try {
        await onSave(language, translationKey, inputValue);
      } catch (err) {
        setInputValue(value || "");
      }
      setSaving(false);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
    if (e.key === "Escape") {
      setInputValue(value || "");
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <Input.TextArea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{ minWidth: 200 }}
        disabled={saving}
      />
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      style={{
        cursor: "pointer",
        minHeight: 22,
        padding: "4px 8px",
        borderRadius: 4,
        border: "1px solid transparent",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = "1px solid #d9d9d9";
        e.currentTarget.style.background = "#fafafa";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = "1px solid transparent";
        e.currentTarget.style.background = "transparent";
      }}
    >
      {value ? (
        <Text>{value}</Text>
      ) : (
        <Text type="secondary" italic>
          Click to add translation
        </Text>
      )}
    </div>
  );
}

function TranslationManager() {
  const { strings } = useContext(LanguageContext);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const [activeTab, setActiveTab] = useState("english");
  const [counts, setCounts] = useState({ english: 0, dutch: 0, total: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllTranslationsAdmin();
      setTranslations(data.translations || []);
      setCounts(data.counts || { english: 0, dutch: 0, total: 0 });
    } catch (err) {
      console.error("Failed to fetch translations:", err);
    }
    setLoading(false);
  };

  const handleSave = async (language, key, value) => {
    await updateTranslation(language, key, value);
    // Update local state
    setTranslations((prev) =>
      prev.map((t) => {
        if (t.key === key) {
          return {
            ...t,
            [language]: {
              ...t[language],
              value,
              updatedAt: new Date().toISOString(),
            },
          };
        }
        return t;
      })
    );
  };

  // Extract unique sections from keys
  const sections = useMemo(() => {
    const sectionSet = new Set(translations.map((t) => getSection(t.key)));
    return ["all", ...Array.from(sectionSet).sort()];
  }, [translations]);

  // Filter translations based on search and section
  const filteredTranslations = useMemo(() => {
    return translations.filter((t) => {
      const matchesSearch =
        searchText === "" ||
        t.key.toLowerCase().includes(searchText.toLowerCase()) ||
        (t.english?.value || "")
          .toLowerCase()
          .includes(searchText.toLowerCase()) ||
        (t.dutch?.value || "").toLowerCase().includes(searchText.toLowerCase());

      const matchesSection =
        selectedSection === "all" || getSection(t.key) === selectedSection;

      return matchesSearch && matchesSection;
    });
  }, [translations, searchText, selectedSection]);

  // Calculate missing counts
  const missingCounts = useMemo(() => {
    let missingInEnglish = 0;
    let missingInDutch = 0;
    translations.forEach((t) => {
      if (!t.english?.value) missingInEnglish++;
      if (!t.dutch?.value) missingInDutch++;
    });
    return { english: missingInEnglish, dutch: missingInDutch };
  }, [translations]);

  const columns = [
    {
      title: get(strings, "admin.translation_key", "Key"),
      dataIndex: "key",
      key: "key",
      width: "30%",
      sorter: (a, b) => a.key.localeCompare(b.key),
      render: (text) => (
        <div>
          <Text code style={{ fontSize: 12 }}>
            {text}
          </Text>
          <div>
            <Tag color="blue" style={{ fontSize: 10, marginTop: 4 }}>
              {getSection(text)}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: (
        <Space>
          {activeTab === "english" ? "English" : "Dutch"}
          {activeTab === "english" && missingCounts.english > 0 && (
            <Badge
              count={missingCounts.english}
              style={{ backgroundColor: "#faad14" }}
              size="small"
            />
          )}
          {activeTab === "dutch" && missingCounts.dutch > 0 && (
            <Badge
              count={missingCounts.dutch}
              style={{ backgroundColor: "#faad14" }}
              size="small"
            />
          )}
        </Space>
      ),
      dataIndex: activeTab,
      key: "value",
      width: "50%",
      render: (langData, record) => (
        <EditableCell
          value={langData?.value}
          onSave={handleSave}
          language={activeTab}
          translationKey={record.key}
        />
      ),
    },
    {
      title: get(strings, "admin.status", "Status"),
      key: "status",
      width: "20%",
      filters: [
        { text: "Complete", value: "complete" },
        { text: "Missing translation", value: "missing" },
      ],
      onFilter: (value, record) => {
        const hasEnglish = !!record.english?.value;
        const hasDutch = !!record.dutch?.value;
        if (value === "complete") {
          return hasEnglish && hasDutch;
        }
        return !hasEnglish || !hasDutch;
      },
      render: (_, record) => {
        const hasEnglish = !!record.english?.value;
        const hasDutch = !!record.dutch?.value;

        if (hasEnglish && hasDutch) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              {get(strings, "admin.translation_complete", "Complete")}
            </Tag>
          );
        }

        const missing = [];
        if (!hasEnglish) missing.push("EN");
        if (!hasDutch) missing.push("NL");

        return (
          <Tag icon={<ExclamationCircleOutlined />} color="warning">
            {get(strings, "admin.translation_missing", "Missing")}: {missing.join(", ")}
          </Tag>
        );
      },
    },
  ];

  return (
    <div style={{ padding: "0 24px" }}>
      <h2 className="font-heading-black">
        <T>admin.translation_manager</T>
      </h2>

      <div
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Input
          placeholder={get(
            strings,
            "admin.search_translations",
            "Search by key or value..."
          )}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />

        <Select
          value={selectedSection}
          onChange={setSelectedSection}
          style={{ width: 200 }}
          placeholder={get(strings, "admin.filter_by_section", "Filter by section")}
        >
          {sections.map((section) => (
            <Option key={section} value={section}>
              {section === "all"
                ? get(strings, "admin.all_sections", "All Sections")
                : section}
            </Option>
          ))}
        </Select>

        <Text type="secondary">
          {get(strings, "admin.showing", "Showing")} {filteredTranslations.length}{" "}
          {get(strings, "admin.of", "of")} {counts.total}{" "}
          {get(strings, "admin.translations", "translations")}
        </Text>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <Space>
              English
              <Badge
                count={counts.english}
                style={{ backgroundColor: "#52c41a" }}
                overflowCount={9999}
              />
            </Space>
          }
          key="english"
        />
        <TabPane
          tab={
            <Space>
              Dutch
              <Badge
                count={counts.dutch}
                style={{ backgroundColor: "#1890ff" }}
                overflowCount={9999}
              />
            </Space>
          }
          key="dutch"
        />
      </Tabs>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredTranslations}
          rowKey="key"
          pagination={{
            pageSize: 50,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50", "100", "200"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          size="middle"
          scroll={{ x: 800 }}
        />
      )}
    </div>
  );
}

export default TranslationManager;
