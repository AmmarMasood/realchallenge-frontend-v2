import React, { useContext, useEffect, useState } from "react";
import "../assets/adminDashboard.css";
import Logo from "../images/logo_orange.png";
import { Avatar, Popover, Layout, Menu, Modal, Button } from "antd";
import {
  UserOutlined,
  CaretDownOutlined,
  ShopOutlined,
  NotificationOutlined,
  AuditOutlined,
  FolderViewOutlined,
  VideoCameraAddOutlined,
  UserAddOutlined,
  InsertRowBelowOutlined,
  CoffeeOutlined,
  ControlOutlined,
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import { VFSBrowser } from "../components/Admin/MediaManager/MediaManager";
import AllChallenges from "../components/Admin/ChallengeManager/AllChallenges";
import NewChallenge from "../components/Admin/ChallengeManager/NewChallenge";
import AllExercises from "../components/Admin/ExerciseManager/AllExercises";
import NewExercise from "../components/Admin/ExerciseManager/NewExercise";
import NewUser from "../components/Admin/UserManager/NewUser";
import AllUsers from "../components/Admin/UserManager/AllUsers";
// import AllProducts from "../components/Admin/ShopManager/AllProducts";
// import NewProduct from "../components/Admin/ShopManager/NewProduct";
import AllRecipes from "../components/Admin/RecipeManager/AllRecipes";
import NewRecipe from "../components/Admin/RecipeManager/NewRecipe";
import AllBlogs from "../components/Admin/BlogManager/AllBlogs";
import NewBlog from "../components/Admin/BlogManager/NewBlog";
import AllMemberships from "../components/Admin/MembershipManager/AllMemberships";
import NewMembership from "../components/Admin/MembershipManager/NewMembership";
import AllCoupons from "../components/Admin/Coupons/AllCoupons";
import NewCoupon from "../components/Admin/Coupons/NewCoupon";
import AllPosts from "../components/Admin/PostsManager/AllPosts";

import { userInfoContext } from "../contexts/UserStore";
import { logoutUser } from "../services/authentication";
import UpdateChallenge from "../components/Admin/ChallengeManager/UpdateChallenge";
import NewPost from "../components/Admin/PostsManager/NewPost";
import AllFaqs from "../components/Admin/FaqManager/AllFaqs";
import NewFaq from "../components/Admin/FaqManager/NewFaq";
import AllRequests from "../components/Admin/RequestManager/AllRequests";
import TranslationManager from "../components/Admin/TranslationManager";
import PackageManager from "../components/Admin/PackageManager";
import { T } from "../components/Translate";
import LanguageSelector from "../components/LanguageSelector/LanguageSelector";
import { hasRole, hasAnyRole } from "../helpers/roleHelpers";
import { LanguageContext } from "../contexts/LanguageContext";
import { get } from "lodash";

const { Sider } = Layout;
const { SubMenu } = Menu;

function AdminDashboard(props) {
  // eslint-disable-next-line
  const [adminInfo, setAdminInfo] = useContext(userInfoContext);
  const { language, strings } = useContext(LanguageContext);
  const [currentSelection, setCurrentSelection] = useState(1);
  const [selectedChallengeForUpdate, setSelectedChallengeForUpdate] = useState(
    {},
  );
  const content = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link to="/user/profile" className="font-paragraph-white">
        <T>admin.profile_setting</T>
      </Link>
      <button
        className="font-paragraphw-white hover-orange"
        onClick={() => logoutUser(props.history, setAdminInfo)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
        }}
      >
        <T>admin.logout</T>
      </button>
    </div>
  );

  function showConfirm(newPath) {
    Modal.confirm({
      title: (
        <span style={{ color: "#fff" }}>
          {get(
            strings,
            "admin.confirm_leave",
            "Are you sure you want to leave before saving? All your progress will be lost.",
          )}
        </span>
      ),
      icon: null,
      onOk() {
        // console.log("OK");
        setCurrentSelection(newPath);
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  }

  const checkBeforeMoving = (newLocation) => {
    if (
      currentSelection === 1.2 ||
      currentSelection === 2.2 ||
      currentSelection === 4.2 ||
      currentSelection === 5.2 ||
      currentSelection === 6.2 ||
      currentSelection === 7.2 ||
      currentSelection === 8.2 ||
      currentSelection === 9.2 ||
      currentSelection === 10.2 ||
      currentSelection === 11.2
    ) {
      // alert("Are you sure you wanna do that pussy?");
      showConfirm(newLocation);
      // setCurrentSelection(newLocation);
    } else {
      setCurrentSelection(newLocation);
    }
  };

  useEffect(() => {
    // get query params
    const queryParams = new URLSearchParams(props.location.search);
    const selectedTab = queryParams.get("tab");
    if (selectedTab && selectedTab === "new-exercise") {
      setCurrentSelection(5.2);
    }
    if (selectedTab && selectedTab === "update-exercise") {
      setCurrentSelection(5.1);
    }
    if (selectedTab && selectedTab === "new-recipe") {
      setCurrentSelection(4.2);
    }
    if (selectedTab && selectedTab === "new-blog") {
      setCurrentSelection(2.2);
    }

    if (selectedTab && selectedTab === "all-recipe") {
      setCurrentSelection(4.1);
    }

    if (selectedTab && selectedTab === "all-blog") {
      setCurrentSelection(2.1);
    }
  }, []);

  const goToNewDashboard = () => {
    props.history.push("/admin/v2/dashboard");
  };
  return (
    <>
      {/* admin navbar */}
      <div className="admin-dashboard-navbar">
        <div>
          <Link to="/admin/dashboard" className="navbar-logo">
            <img src={Logo} alt="logo" className="logo small-screenlogo" />
          </Link>
        </div>

        <div className="loggedin-nav-userinfo" style={{ width: "250px" }}>
          <div style={{ marginRight: "20px" }}>
            {" "}
            <LanguageSelector />
          </div>
          <Avatar
            shape="square"
            src={adminInfo.avatar}
            icon={<UserOutlined />}
          />
          <Popover placement="bottom" content={content} trigger="click">
            <div className="loggedin-nav-name font-paragraph-white">
              <span className="username-text">{adminInfo.username}</span>
              <CaretDownOutlined className="dropdown-arrow" />
            </div>
          </Popover>
        </div>
      </div>
      {/* admin sidebar */}
      {/* admin main container */}
      <div className="admin-dashboard-container">
        <Layout style={{ minHeight: "100vh" }}>
          <Sider
            breakpoint="lg"
            collapsedWidth="0"
            style={{ minHeight: "150vh", background: "var(--color-gray-dark)" }}
            onBreakpoint={(broken) => {
              console.log(broken);
            }}
            onCollapse={(collapsed, type) => {
              console.log(collapsed, type);
            }}
          >
            <div className="logo" />
            <Menu
              theme="dark"
              mode="inline"
              style={{ backgroundColor: "var(--color-gray-dark)" }}
              defaultSelectedKeys={["1"]}
            >
              {/* <Menu.Item
                key="0"
                icon={<AuditOutlined />}
                onClick={() => setCurrentSelection(0)}
              >
                <T>admin.requests</T>
              </Menu.Item> */}
              {hasAnyRole(adminInfo, [
                "admin",
                "trainer",
                "blogger",
                "nutrist",
              ]) && (
                <Button onClick={goToNewDashboard}>
                  <T>admin.go_to_new_dashboard</T>
                </Button>
              )}

              {/* {adminInfo.role === "admin" && (
                <SubMenu key="1" icon={<ShopOutlined />} title="Manage Shop">
                  <Menu.Item
                    key="1.1"
                    onClick={() => checkBeforeMoving(1.1)}
                    style={{
                      backgroundColor:
                        currentSelection === 1.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 1.1 ? "#fff" : "",
                    }}
                  >
                    <T>admin.all_products</T>
                  </Menu.Item>
                  <Menu.Item
                    key="1.2"
                    onClick={() => checkBeforeMoving(1.2)}
                    style={{
                      backgroundColor:
                        currentSelection === 1.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 1.2 ? "#fff" : "",
                    }}
                  >
                    <T>admin.new_product</T>
                  </Menu.Item>
                </SubMenu>
              )} */}
              {hasRole(adminInfo, "admin") && (
                <Menu.Item
                  key="12"
                  icon={<FolderViewOutlined />}
                  style={{
                    backgroundColor:
                      currentSelection === 12
                        ? "var(--color-orange)"
                        : "transparent",
                    color: currentSelection === 12 ? "#fff" : "",
                  }}
                  onClick={() => checkBeforeMoving(12)}
                >
                  <T>admin.manage_requests</T>
                </Menu.Item>
              )}
              {hasAnyRole(adminInfo, ["admin", "blogger"]) && (
                <SubMenu
                  key="2"
                  icon={<CoffeeOutlined />}
                  title={<T>admin.manage_blogs</T>}
                >
                  <Menu.Item
                    key="2.1"
                    style={{
                      backgroundColor:
                        currentSelection === 2.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 2.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(2.1)}
                  >
                    {hasRole(adminInfo, "admin") ? (
                      <T>admin.all_blogs</T>
                    ) : (
                      <T>admin.my_blogs</T>
                    )}
                  </Menu.Item>
                  <Menu.Item
                    key="2.2"
                    style={{
                      backgroundColor:
                        currentSelection === 2.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 2.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(2.2)}
                  >
                    <T>admin.new_blog</T>
                  </Menu.Item>
                </SubMenu>
              )}
              <Menu.Item
                key="3"
                icon={<FolderViewOutlined />}
                style={{
                  backgroundColor:
                    currentSelection === 3
                      ? "var(--color-orange)"
                      : "transparent",
                  color: currentSelection === 3 ? "#fff" : "",
                }}
                onClick={() => checkBeforeMoving(3)}
              >
                <T>admin.media_manager</T>
              </Menu.Item>

              {hasAnyRole(adminInfo, ["admin", "nutrist"]) && (
                <SubMenu
                  key="4"
                  icon={<CoffeeOutlined />}
                  title={<T>admin.manage_recipes</T>}
                >
                  <Menu.Item
                    key="4.1"
                    style={{
                      backgroundColor:
                        currentSelection === 4.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 4.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(4.1)}
                  >
                    {hasRole(adminInfo, "admin") ? (
                      <T>admin.all_recipes</T>
                    ) : (
                      <T>admin.my_recipes</T>
                    )}
                  </Menu.Item>
                  <Menu.Item
                    style={{
                      backgroundColor:
                        currentSelection === 4.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 4.2 ? "#fff" : "",
                    }}
                    key="4.2"
                    onClick={() => checkBeforeMoving(4.2)}
                  >
                    <T>admin.new_recipe</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
                <SubMenu
                  key="5"
                  icon={<ControlOutlined />}
                  title={<T>admin.manage_exercises</T>}
                >
                  <Menu.Item
                    key="5.1"
                    style={{
                      backgroundColor:
                        currentSelection === 5.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 5.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(5.1)}
                  >
                    {hasRole(adminInfo, "admin") ? (
                      <T>admin.all_exercises</T>
                    ) : (
                      <T>admin.my_exercises</T>
                    )}
                  </Menu.Item>
                  <Menu.Item
                    key="5.2"
                    style={{
                      backgroundColor:
                        currentSelection === 5.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 5.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(5.2)}
                  >
                    <T>admin.new_exercise</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {hasAnyRole(adminInfo, ["admin", "trainer"]) && (
                <SubMenu
                  key="6"
                  icon={<VideoCameraAddOutlined />}
                  title={<T>admin.manage_challenges</T>}
                >
                  <Menu.Item
                    key="6.1"
                    style={{
                      backgroundColor:
                        currentSelection === 6.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 6.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(6.1)}
                  >
                    {hasRole(adminInfo, "admin") ? (
                      <T>admin.all_challenges</T>
                    ) : (
                      <T>admin.my_challenges</T>
                    )}
                  </Menu.Item>
                  <Menu.Item
                    key="6.2"
                    style={{
                      backgroundColor:
                        currentSelection === 6.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 6.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(6.2)}
                  >
                    <T>admin.new_challenge</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {hasRole(adminInfo, "admin") && (
                <SubMenu
                  key="7"
                  icon={<UserAddOutlined />}
                  title={<T>admin.manage_users</T>}
                >
                  <Menu.Item
                    key="7.1"
                    style={{
                      backgroundColor:
                        currentSelection === 7.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 7.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(7.1)}
                  >
                    <T>admin.all_users</T>
                  </Menu.Item>
                  <Menu.Item
                    key="7.2"
                    style={{
                      backgroundColor:
                        currentSelection === 7.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 7.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(7.2)}
                  >
                    <T>admin.new_user</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {hasRole(adminInfo, "admin") && (
                <SubMenu
                  key="8"
                  icon={<InsertRowBelowOutlined />}
                  title={<T>admin.manage_posts</T>}
                >
                  <Menu.Item
                    key="8.1"
                    style={{
                      backgroundColor:
                        currentSelection === 8.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 8.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(8.1)}
                  >
                    <T>admin.all_posts</T>
                  </Menu.Item>
                  <Menu.Item
                    key="8.2"
                    style={{
                      backgroundColor:
                        currentSelection === 8.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 8.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(8.2)}
                  >
                    <T>admin.new_post</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {/* {adminInfo.role === "admin" && (
                <SubMenu
                  key="9"
                  icon={<InsertRowBelowOutlined />}
                  title="Membership"
                >
                  <Menu.Item
                    key="9.1"
                    style={{
                      backgroundColor:
                        currentSelection === 9.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 9.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(9.1)}
                  >
                    <T>admin.all_membership</T>
                  </Menu.Item>
                  <Menu.Item
                    key="9.2"
                    style={{
                      backgroundColor:
                        currentSelection === 9.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 9.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(9.2)}
                  >
                    <T>admin.new_membership</T>
                  </Menu.Item>
                </SubMenu>
              )} */}
              {hasRole(adminInfo, "admin") && (
                <SubMenu
                  key="10"
                  icon={<NotificationOutlined />}
                  title={<T>admin.manage_coupons</T>}
                >
                  <Menu.Item
                    key="10.1"
                    style={{
                      backgroundColor:
                        currentSelection === 10.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 10.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(10.1)}
                  >
                    <T>admin.all_coupons</T>
                  </Menu.Item>
                  <Menu.Item
                    key="10.2"
                    style={{
                      backgroundColor:
                        currentSelection === 10.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 10.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(10.2)}
                  >
                    <T>admin.new_coupons</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {hasRole(adminInfo, "admin") && (
                <SubMenu
                  key="11"
                  icon={<QuestionCircleOutlined />}
                  title={<T>admin.help_center</T>}
                >
                  <Menu.Item
                    key="11.1"
                    style={{
                      backgroundColor:
                        currentSelection === 11.1
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 11.1 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(11.1)}
                  >
                    <T>admin.all_faqs</T>
                  </Menu.Item>
                  <Menu.Item
                    key="11.2"
                    style={{
                      backgroundColor:
                        currentSelection === 11.2
                          ? "var(--color-orange)"
                          : "transparent",
                      color: currentSelection === 11.2 ? "#fff" : "",
                    }}
                    onClick={() => checkBeforeMoving(11.2)}
                  >
                    <T>admin.new_faq</T>
                  </Menu.Item>
                </SubMenu>
              )}
              {hasRole(adminInfo, "admin") && (
                <Menu.Item
                  key="13"
                  icon={<GlobalOutlined />}
                  style={{
                    backgroundColor:
                      currentSelection === 13
                        ? "var(--color-orange)"
                        : "transparent",
                    color: currentSelection === 13 ? "#fff" : "",
                  }}
                  onClick={() => checkBeforeMoving(13)}
                >
                  <T>admin.translation_manager</T>
                </Menu.Item>
              )}
              {hasRole(adminInfo, "admin") && (
                <Menu.Item
                  key="14"
                  icon={<DollarOutlined />}
                  style={{
                    backgroundColor:
                      currentSelection === 14
                        ? "var(--color-orange)"
                        : "transparent",
                    color: currentSelection === 14 ? "#fff" : "",
                  }}
                  onClick={() => checkBeforeMoving(14)}
                >
                  <T>admin.package_manager</T>
                </Menu.Item>
              )}
            </Menu>
          </Sider>
          <div className="admin-dashboard-container-main">
            {currentSelection === 3 && <VFSBrowser />}
            {/* {currentSelection === 1.1 && <AllProducts />} */}
            {/* {currentSelection === 1.2 && <NewProduct />} */}
            {currentSelection === 2.1 && <AllBlogs key={`blogs-${language}`} />}
            {currentSelection === 2.2 && (
              <NewBlog
                key={`new-blog-${language}`}
                setCurrentSelection={setCurrentSelection}
              />
            )}
            {currentSelection === 4.1 && (
              <AllRecipes key={`recipes-${language}`} />
            )}
            {currentSelection === 4.2 && (
              <NewRecipe
                key={`new-recipe-${language}`}
                setCurrentSelection={setCurrentSelection}
              />
            )}
            {currentSelection === 5.1 && (
              <AllExercises key={`exercises-${language}`} />
            )}
            {currentSelection === 5.2 && (
              <NewExercise
                key={`new-exercise-${language}`}
                setCurrentSelection={setCurrentSelection}
                home={5.1}
              />
            )}

            {currentSelection === 6.1 && (
              <AllChallenges
                key={`challenges-${language}`}
                setSelectedChallengeForUpdate={setSelectedChallengeForUpdate}
                selectedChallengeForUpdate={selectedChallengeForUpdate}
                setCurrentSelection={setCurrentSelection}
                currentSelection={currentSelection}
              />
            )}
            {currentSelection === 6.2 && (
              <NewChallenge key={`new-challenge-${language}`} />
            )}
            {currentSelection === 5.3 && (
              <UpdateChallenge
                key={
                  selectedChallengeForUpdate
                    ? selectedChallengeForUpdate._id
                    : ""
                }
                setSelectedChallengeForUpdate={setSelectedChallengeForUpdate}
                selectedChallengeForUpdate={selectedChallengeForUpdate}
                setCurrentSelection={setCurrentSelection}
                currentSelection={currentSelection}
              />
            )}

            {currentSelection === 7.1 && <AllUsers />}
            {currentSelection === 7.2 && (
              <NewUser setCurrentSelection={setCurrentSelection} home={7.1} />
            )}
            {currentSelection === 8.1 && <AllPosts />}
            {currentSelection === 8.2 && (
              <NewPost setCurrentSelection={setCurrentSelection} home={8.1} />
            )}
            {currentSelection === 9.1 && <AllMemberships />}
            {currentSelection === 9.2 && <NewMembership />}
            {currentSelection === 10.1 && <AllCoupons />}
            {currentSelection === 10.2 && (
              <NewCoupon
                setCurrentSelection={setCurrentSelection}
                home={10.1}
              />
            )}
            {currentSelection === 11.1 && <AllFaqs key={`faqs-${language}`} />}
            {currentSelection === 11.2 && (
              <NewFaq
                key={`new-faq-${language}`}
                setCurrentSelection={setCurrentSelection}
                home={11.1}
              />
            )}
            {currentSelection === 12 && <AllRequests />}
            {currentSelection === 13 && <TranslationManager />}
            {currentSelection === 14 && <PackageManager />}
          </div>
        </Layout>
      </div>
    </>
  );
}

export default withRouter(AdminDashboard);
