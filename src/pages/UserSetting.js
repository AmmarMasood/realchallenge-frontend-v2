import React, { useState, useEffect, useContext } from "react";
import LoggedinNavbar from "../components/LoggedinNavbar";
import "../assets/userSetting.css";
import {
  UserOutlined,
  MailOutlined,
  LoadingOutlined,
  CloseOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { Input, notification } from "antd";
import moment from "moment";
import { getUserProfileInfo } from "../services/users";
import { userInfoContext } from "../contexts/UserStore";
import { getSubscribtionInformation } from "../services/payment";
import { logoutUser, resetPassword } from "../services/authentication";
import { useHistory } from "react-router";
import { T, translate } from "../components/Translate";
import { usePackageConfig } from "../contexts/PackageConfigContext";

const emailIconStyle = {
  fontSize: "5rem",
  color: "var(--color-white)",
  padding: "8px",
  backgroundColor: "var(--color-orange-light)",
};

// Format a date for display, returning null (so the field is hidden) instead of
// the literal "Invalid date" when the source value is missing/unparseable.
const formatDate = (value) => {
  if (!value) return null;
  const m = moment(value);
  return m.isValid() ? m.format("DD/MM/YYYY") : null;
};

// Renders a label/value pair only when the value is present — never shows an
// empty or fabricated field (per the no-placeholder rule).
function Field({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="us-field">
      <span className="us-field-label">{label}</span>
      <span className="us-field-value">{value}</span>
    </div>
  );
}

// Loading placeholder shown while the profile/subscription data is fetched.
// Mirrors the real layout (left: id + email cards + button; right: membership)
// so nothing jumps when the data arrives.
function SettingsSkeleton() {
  return (
    <div className="user-setting-container-body">
      <div className="user-setting-container-body1">
        {[0, 1].map((i) => (
          <div className="user-setting-container-body1-box" key={i}>
            <div className="us-skeleton us-skeleton-icon" />
            <div style={{ width: "100%", padding: "10px" }}>
              <div
                className="us-skeleton us-skeleton-line"
                style={{ width: "45%" }}
              />
              <div
                className="us-skeleton us-skeleton-line"
                style={{ width: "75%", marginTop: 10 }}
              />
            </div>
          </div>
        ))}
        <div className="user-setting-body1-button-container">
          <div
            className="us-skeleton us-skeleton-button"
            style={{ marginLeft: "10px" }}
          />
        </div>
      </div>
      <div className="user-setting-container-body2">
        <div className="user-setting-container-body2-row1">
          <div className="user-setting-container-body2-row1-column1">
            <div
              className="us-skeleton us-skeleton-line"
              style={{ width: "55%", height: 16 }}
            />
            <div
              className="us-skeleton us-skeleton-line"
              style={{ width: "80%", marginTop: 12 }}
            />
          </div>
          <div className="user-setting-container-body2-row1-column2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i}>
                <div
                  className="us-skeleton us-skeleton-line"
                  style={{ width: "40%" }}
                />
                <div
                  className="us-skeleton us-skeleton-line"
                  style={{ width: "60%", marginTop: 8 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserSetting() {
  const { getPackage } = usePackageConfig();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [memberships, setMemberships] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [userInfo, setUserInfo] = useContext(userInfoContext);

  const fetchData = async () => {
    try {
      const res = await getUserProfileInfo(userInfo.id);
      if (!res || !res.customer) return;
      const customer = res.customer;

      setUserEmail(customer.email);
      setCustomerId(customer.mollieId || customer._id || userInfo.id || "");

      const mems = customer.customerDetails?.membership || [];

      // Pull live subscription data from Mollie (amount/status/method/dates).
      let subscriptions = [];
      if (customer.mollieId) {
        const subInfo = await getSubscribtionInformation(customer.mollieId);
        if (subInfo && subInfo.response) {
          try {
            const parsed = JSON.parse(subInfo.response);
            subscriptions = parsed?._embedded?.subscriptions || [];
          } catch (e) {
            console.error("Failed to parse subscription info:", e);
          }
        }
      }

      // One card per membership; enrich with the matching subscription when present.
      setMemberships(
        mems.map((m, i) => {
          const sub = subscriptions[i] || subscriptions[0] || null;
          return {
            name: m.name,
            isValid: m.isValid,
            startTime: m.startTime,
            endTime: m.endTime,
            price: m.price ?? sub?.amount?.value ?? null,
            interval: sub?.interval || null,
            status: sub?.status || null,
          };
        })
      );

      // Transactions come straight from the subscription records we actually have.
      setTransactions(
        subscriptions.map((s) => ({
          date: s.createdAt,
          method: s.method,
          total: s.amount?.value,
          status: s.status,
          name: s.description,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch user settings data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const updatePasswordButtonClick = async () => {
    if (email === userEmail) {
      setLoading(true);
      await resetPassword(email);
      setLoading(false);
      logoutUser(history, setUserInfo);
    } else {
      notification.error({
        message: translate("user_setting.error"),
        description: translate("user_setting.invalid_email"),
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [userInfo.id]);

  return (
    <>
      <LoggedinNavbar />
      <div className="user-setting-container">
        <div className="user-setting-inner">
        <div className="user-setting-container-heading font-paragraph-white">
          <span style={{ display: "inline-flex", alignItems: "center" }}>
            <UserOutlined style={{ paddingRight: "10px" }} />
            <T>user_setting.account_setting</T>
          </span>
          <button
            type="button"
            className="user-setting-close"
            onClick={() => history.goBack()}
            aria-label="Close"
          >
            <CloseOutlined />
          </button>
        </div>
        {dataLoading ? (
          <SettingsSkeleton />
        ) : (
        <div className="user-setting-container-body">
          <div className="user-setting-container-body1">
            {customerId ? (
              <div className="user-setting-container-body1-box">
                <IdcardOutlined style={emailIconStyle} />
                <div style={{ width: "100%", padding: "10px" }}>
                  <span className="font-paragraph-white">
                    <T>user_setting.customer_id</T>
                  </span>
                  <div className="us-customer-id font-paragraph-white">
                    {customerId}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="user-setting-container-body1-box">
              <MailOutlined style={emailIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">
                  <T>user_setting.enter_email_to_reset</T>
                </span>
                <Input
                  className="user-setting-container-body1-box-field font-paragraph-white"
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* <div className="user-setting-container-body1-box">
              <LockOutlined style={passwordIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">New Password</span>
                <Input
                  className="user-setting-container-body1-box-field font-paragraph-white"
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="user-setting-container-body1-box">
              <LockOutlined style={passwordIconStyle} />
              <div style={{ width: "100%", padding: "10px" }}>
                <span className="font-paragraph-white">
                  Confirm New Password
                </span>
                <Input
                  className="user-setting-container-body1-box-field font-paragraph-white"
                  value={confirmPassword}
                  type="password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div> */}
            {/* </div> */}
            <div className="user-setting-body1-button-container">
              {/* <button
                className="green-button font-paragraph-white"
                style={{ marginLeft: "10px" }}
              >
                {t("user_setting.save_email")}
              </button> */}
              {loading ? (
                <p className="font-paragraph-white">
                  <LoadingOutlined
                    style={{ color: "#fff", marginRight: "10px" }}
                  />{" "}
                  <T>user_setting.sending_reset_link</T>
                </p>
              ) : (
                <button
                  className="gray-button font-paragraph-white"
                  style={{ marginLeft: "10px" }}
                  onClick={updatePasswordButtonClick}
                >
                  <T>user_setting.update_password</T>
                </button>
              )}
            </div>
          </div>
          <div className="user-setting-container-body2">
            {memberships.length === 0 ? (
              <div className="user-setting-container-body2-row1">
                <div className="user-setting-container-body2-row1-column1">
                  <div className="font-paragraph-white">
                    <T>user_setting.membership</T>
                  </div>
                </div>
                <div className="user-setting-container-body2-row1-column2">
                  <Field
                    label={translate("user_setting.subscription")}
                    value={translate("user_setting.no_subscription")}
                  />
                </div>
              </div>
            ) : (
              memberships.map((m, idx) => {
                const pkg = m.name ? getPackage(m.name) : null;
                const isActive =
                  m.isValid === "active" || (m.name && m.name !== "CHALLENGE_1");
                const autoRebill = m.price
                  ? `€${m.price}${m.interval ? " / " + m.interval : ""}`
                  : null;
                return (
                  <div className="user-setting-container-body2-row1" key={idx}>
                    <div className="user-setting-container-body2-row1-column1">
                      <div className="font-paragraph-white">
                        <T>user_setting.membership</T>
                      </div>
                      {pkg ? (
                        <div className="us-membership-name font-paragraph-white">
                          {pkg.displayName}
                        </div>
                      ) : null}
                    </div>
                    <div className="user-setting-container-body2-row1-column2">
                      <Field
                        label={translate("user_setting.subscription")}
                        value={
                          pkg
                            ? pkg.displayName
                            : translate("user_setting.no_subscription")
                        }
                      />
                      <Field
                        label={translate("user_setting.active")}
                        value={translate(
                          isActive ? "user_setting.yes" : "user_setting.no"
                        )}
                      />
                      <Field
                        label={translate("user_setting.auto_rebill")}
                        value={autoRebill}
                      />
                      <Field
                        label={translate("user_setting.created")}
                        value={formatDate(m.startTime)}
                      />
                      <Field
                        label={translate("user_setting.expires_on")}
                        value={formatDate(m.endTime)}
                      />
                    </div>
                  </div>
                );
              })
            )}

            {transactions.length > 0 ? (
              <div className="us-transactions">
                <div className="us-transactions-heading font-paragraph-white">
                  <T>user_setting.transactions</T>
                </div>
                {transactions.map((t, i) => (
                  <div className="us-transaction-card" key={i}>
                    <Field
                      label={translate("user_setting.date")}
                      value={formatDate(t.date)}
                    />
                    <Field
                      label={translate("user_setting.methods")}
                      value={t.method}
                    />
                    <Field
                      label={translate("user_setting.total")}
                      value={t.total ? `€${t.total}` : null}
                    />
                    <Field
                      label={translate("user_setting.status")}
                      value={t.status}
                    />
                    <Field
                      label={translate("user_setting.membership")}
                      value={t.name}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        )}
        </div>
      </div>
    </>
  );
}

export default UserSetting;
