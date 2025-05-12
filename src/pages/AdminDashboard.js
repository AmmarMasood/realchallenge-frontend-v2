import React, { useContext, useState } from "react";
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
} from "@ant-design/icons";
import { Link, withRouter } from "react-router-dom";
import { VFSBrowser } from "../components/Admin/MediaManager/MediaManager";
import AllChallenges from "../components/Admin/ChallengeManager/AllChallenges";
import NewChallenge from "../components/Admin/ChallengeManager/NewChallenge";
import AllExercises from "../components/Admin/ExerciseManager/AllExercises";
import NewExercise from "../components/Admin/ExerciseManager/NewExercise";
import NewUser from "../components/Admin/UserManager/NewUser";
import AllUsers from "../components/Admin/UserManager/AllUsers";
import AllProducts from "../components/Admin/ShopManager/AllProducts";
import NewProduct from "../components/Admin/ShopManager/NewProduct";
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
import { T } from "../components/Translate";
import LanguageSelector from "../components/LanguageSelector/LanguageSelector";

const { Sider } = Layout;
const { SubMenu } = Menu;

function AdminDashboard(props) {
  // eslint-disable-next-line
  const [adminInfo, setAdminInfo] = useContext(userInfoContext);
  const [currentSelection, setCurrentSelection] = useState(1);
  const [selectedChallengeForUpdate, setSelectedChallengeForUpdate] = useState(
    {}
  );
  const content = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Link to="/user/profile" className="font-paragraph-white">
        <T>admin.profile_setting</T>
      </Link>
      <Link
        className="font-paragraphw-white hover-orange"
        onClick={() => logoutUser(props.history, setAdminInfo)}
      >
        <T>admin.logout</T>
      </Link>
    </div>
  );

  function showConfirm(newPath) {
    Modal.confirm({
      title: (
        <p className="font-paragraph-white">
          Are you sure, you want to leave before saving? All your progress will
          be lost
        </p>
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
              <span>
                {adminInfo.username} <CaretDownOutlined />
              </span>
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
            onConte
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
              {(adminInfo.role === "admin" || adminInfo.role === "trainer") && (
                <Button onClick={goToNewDashboard}>Go To New Dashboard</Button>
              )}

              {adminInfo.role === "admin" && (
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
              )}
              {adminInfo.role === "admin" && (
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
                  Manage Requests
                </Menu.Item>
              )}
              {/* {(adminInfo.role === "admin" || adminInfo.role === "blogger") && (
                <SubMenu key="2" icon={<CoffeeOutlined />} title="Manage Blogs">
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
                    <T>admin.all_blogs</T>
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
              )} */}
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

              {(adminInfo.role === "admin" || adminInfo.role === "nutrist") && (
                <SubMenu key="4" icon={<CoffeeOutlined />} title="Recipes">
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
                    <T>admin.all_recipes</T>
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
              {(adminInfo.role === "admin" || adminInfo.role === "trainer") && (
                <SubMenu key="5" icon={<ControlOutlined />} title="Exercises">
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
                    All Exercises
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
                    New Exercise
                  </Menu.Item>
                </SubMenu>
              )}
              {(adminInfo.role === "admin" || adminInfo.role === "trainer") && (
                <SubMenu
                  key="6"
                  icon={<VideoCameraAddOutlined />}
                  title="Challenges"
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
                    <T>admin.all_challenges</T>
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
              {adminInfo.role === "admin" && (
                <SubMenu
                  key="7"
                  icon={<UserAddOutlined />}
                  title="Manage Users"
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
              {adminInfo.role === "admin" && (
                <SubMenu
                  key="8"
                  icon={<InsertRowBelowOutlined />}
                  title="Manage Posts"
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
                    All Posts
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
                    New Post
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
              {adminInfo.role === "admin" && (
                <SubMenu
                  key="10"
                  icon={<NotificationOutlined />}
                  title="Manage Coupons"
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
              {adminInfo.role === "admin" && (
                <SubMenu
                  key="11"
                  icon={<QuestionCircleOutlined />}
                  title="Help Center"
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
                    All Faqs
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
                    New Faq
                  </Menu.Item>
                </SubMenu>
              )}
            </Menu>
          </Sider>
          <div className="admin-dashboard-container-main">
            {currentSelection === 3 && <VFSBrowser />}
            {currentSelection === 1.1 && <AllProducts />}
            {currentSelection === 1.2 && <NewProduct />}
            {/* {currentSelection === 2.1 && <AllBlogs />} */}
            {/* {currentSelection === 2.2 && (
              <NewBlog setCurrentSelection={setCurrentSelection} />
            )} */}
            {currentSelection === 4.1 && <AllRecipes />}
            {currentSelection === 4.2 && (
              <NewRecipe setCurrentSelection={setCurrentSelection} />
            )}
            {currentSelection === 5.1 && <AllExercises />}
            {currentSelection === 5.2 && (
              <NewExercise
                setCurrentSelection={setCurrentSelection}
                home={5.1}
              />
            )}

            {currentSelection === 6.1 && (
              <AllChallenges
                setSelectedChallengeForUpdate={setSelectedChallengeForUpdate}
                selectedChallengeForUpdate={selectedChallengeForUpdate}
                setCurrentSelection={setCurrentSelection}
                currentSelection={currentSelection}
              />
            )}
            {currentSelection === 6.2 && <NewChallenge />}
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
            {currentSelection === 11.1 && <AllFaqs />}
            {currentSelection === 11.2 && (
              <NewFaq setCurrentSelection={setCurrentSelection} home={11.1} />
            )}
            {currentSelection === 12 && <AllRequests />}
          </div>
        </Layout>
      </div>
    </>
  );
}

export default withRouter(AdminDashboard);
