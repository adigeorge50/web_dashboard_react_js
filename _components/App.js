// React-related
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch
} from "react-router-dom";
import PropTypes from "prop-types";
import { instanceOf } from "prop-types";
import { compose } from "redux";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

// Networking
import axios from "axios";
import API_URLS from "../_data/api_urls";

// Antd
import { Layout, Divider, Card } from "antd";
const { Meta } = Card;
import { Row, Col } from 'antd';
const { Header, Content, Footer } = Layout;
import { Menu, Dropdown, Icon } from "antd";
import { Input } from "antd";
import { Button, Spin } from "antd";
import { Form, Checkbox } from "antd";
const FormItem = Form.Item;
import { message } from "antd";

// Components
import HomeComponent from "./Home";
import CreateFormComponent from "./CreateForm";
import EventDetailsComponent from "./Events/EventDetails";
import ClassroomsComponent from './Classrooms/Classrooms'
import ClassroomDetailsComponent from './Classrooms/ClassroomDetails'
import TeacherOnboarding from "./Onboarding/TeacherOnboarding"
import TeacherFirstRun from "./Onboarding/TeacherFirstRun"
import ParentOnboarding from "./Onboarding/ParentOnboarding"
import TeacherOnboardingIndex from "./Onboarding/Teacher/TeacherIndex"
import ParentsOnboardingIndex from "./Onboarding/Parents/ParentsIndex"
import ParentInvitation from "./Onboarding/Parents/ParentInvitation"
import ResetPassword from "./ResetPassword"
import ForgotPassword from "./ForgotPassword"
import ConfirmEmail from "./Onboarding/ConfirmEmail"
import FirstRunWizard from "./Onboarding/Teacher/FirstRunWizard"
import MyProfile from './MyProfile/MyProfile';

// Assets
import LOGO from "../img/logo.svg";
import TEACHER from "../img/Register/teacher.svg"
import PARENT from "../img/Register/parent.svg"

// Redux
// Actions
import { updateAuth } from "../__actions/auth";
import { updateLang } from "../__actions/localization";
import { updateFullName } from "../__actions/fullName";

// Misc
import { withCookies, Cookies } from "react-cookie";
import NotFoundComponent from "./404";

import { parseQueryString } from "../_utils/index"

// import GoogleLogin from 'react-google-login'

const HeaderComponent = ({ userData, updateLang, signOut, fullTeacherName }) => {
  let isTeacher
  if (userData) {
    const { roles } = userData
    isTeacher = roles.indexOf("teacher") !== -1

    // console.log('USER DATA', userData, isTeacher)
  }

  return (
    <Header id="header">
      <div className="container">
        <div className="logo">
          <Link to="/">
            <img src={LOGO} />
          </Link>
        </div>
        
        {userData && (
          <div className="header-right">
            <Dropdown
              overlay={isTeacher ?
                <Menu>
                  <Menu.Item key="0" className={window.location.pathname === '/' ? 'activeItem': '' }>
                    <Link to={"/"}>
                      Calendar View
                    </Link>
                  </Menu.Item>

                  <Menu.Item key="1" className={window.location.pathname === '/manageprofile' ? 'activeItem': '' }>
                    <Link to={'/manageprofile'}>
                      Manage my profile
                    </Link>
                  </Menu.Item>

                  <Menu.Item key="2" className={window.location.pathname === '/classrooms' ? 'activeItem': '' }>
                    <Link to='/classrooms'>
                      Manage my classroom(s)
                    </Link>
                  </Menu.Item>

                  <Menu.Divider />

                  <Menu.Item key="3">
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        signOut();
                      }}
                    >
                      <Icon type="logout" /> Sign Out
                    </a>
                  </Menu.Item>
                </Menu>
                :
                <Menu>
                  <Menu.Item key="3">
                    <a
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        signOut();
                      }}
                    >
                      <Icon type="logout" /> Sign Out
                    </a>
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <a className="ant-dropdown-link" href="#">
                <Icon type="user" /> {fullTeacherName} <Icon type="down" />
              </a>
            </Dropdown>
          </div>
        )}
      </div>
    </Header>
  )
}

const FooterComponent = () =>
  <Footer id="footer" style={{ padding: 0, paddingTop: 15, paddingBottom: 15 }}>
    <div className="container" style={{ textAlign: "left" }}>
      &copy; Copyright, At School Today 2019

      <span style={{ float: "right" }}>
        <a href="https://www.atschooltoday.net/external/web_app/privacy_terms/" target="_blank">
          Terms of service

          <Divider type="vertical"></Divider>

          Privacy Policy
        </a>
      </span>
    </div>
  </Footer>

const registerComponent = () =>
  <div className="container marginTop-15 register-screen">
    <h3 style={{ margin: 0 }}>Register</h3>
    <p>What is your role?</p>

    <Row gutter={16} className="marginTop-30">
      <Col className="gutter-row" sm={12} xs={24} style={{ marginBottom: 15 }}>
        <Link to="/register/teacher">
          <Card
            hoverable
            style={{ width: "100%", height: 310 }}
          >
            <img src={TEACHER} style={{ maxWidth: 228.22 }} />

            <Meta
              title="Teacher"
              description="Create permission forms, create/modify student records"
            />
          </Card>
        </Link>
      </Col>

      <Col className="gutter-row" sm={12} xs={24}>
        <Link to="/register/parent">
          <Card
            hoverable
            style={{ width: "100%", height: 310 }}
          >
            <img src={PARENT} style={{ maxWidth: 228.22 }} />

            <Meta
              title="Parent"
              description="Sign permission forms, keep track of school events"
            />
          </Card>
        </Link>
      </Col>
    </Row>

    {/* <Link to="/onboarding/teacher">
      <Button type="primary" style={{ marginRight: 10 }}>
        Teacher
      </Button>
    </Link>

    or

    <Link to="/onboarding/parent">
      <Button type="primary" style={{ marginLeft: 10 }}>
        Parent
      </Button>
    </Link> */}
  </div>
export const getUserName = (auth) => {
  return axios.get(API_URLS.teacherAccount.get, {
    headers: {
      "Authorization": `Bearer ${auth.authToken}`
    }
  })
  .then(({data}) => {
    const fullName = `${data.firstName} ${data.lastName}`;
    return fullName;
  })
  .catch(err => {
    // used here, because there is no plans about editing parent name from FE part
    return auth.fullName;
  });
}
class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false
    };
  }

  

  componentDidMount() {
    const { cookies } = this.props;
    const authToken = cookies.get("ast-auth");
    if (authToken !== undefined) {
      const authJSON = JSON.parse(atob(authToken));
      getUserName(authJSON).then(fullName => this.props.updateFullName(fullName));
      this.props.updateAuth(authJSON.authToken, authJSON.fullName, authJSON.roles)
    } else {
      // (function(d, s, id) {
        // var js,
          // fjs = d.getElementsByTagName(s)[0];
        // if (d.getElementById(id)) {
        //   return;
        // }
        // js = d.createElement(s);
        // js.id = id;
        // js.src = "https://connect.facebook.net/en_US/sdk.js";
        // fjs.parentNode.insertBefore(js, fjs);
        // js.onload = function() {
          // console.log("FB LOADED");
          // window.FB.init({
          //   appId: "130204614320906",
          //   autoLogAppEvents: true,
          //   xfbml: true,
          //   version: "v2.12"
          // });

          // window.FB.getLoginStatus(function(response) {
          //   if (response.status === "connected") {
          //     console.log("Logged in.");
          //   } else {
          //     console.log("NOT LOGGED IN");
          //   }
          // });

          // window.FB.Event.subscribe('auth.statusChange', function(response) {

          // }.bind(this))
        // }.bind(this)
      // }.bind(this)(document, "script", "facebook-jssdk"));
    }
  }

  _updateAuth(authToken, fullName, roles) {
    // Update auth in Redux
    this.props.updateAuth(authToken, fullName, roles)
    // Set cookies
    this.props.cookies.set(
      "ast-auth",
      btoa(
        JSON.stringify({
          authToken,
          fullName,
          roles
        })
      ),
      {
        path: "/",
        expires: new Date(JSON.parse(atob(authToken.split(".")[1])).exp * 1000)
      }
    );
  }

  // _oAuthLogin(provider, e) {
  //   console.log("OAUTH LOGIN", provider);
  //   if (provider === "facebook" && window.FB) {
  //     window.FB.login(
  //       function(response) {
  //         console.log("AUTH Response", response);
  //         if (response.authResponse) {
  //           axios
  //             .post(API_URLS.accounts.facebookLogin, {
  //               accessToken: response.authResponse.accessToken
  //             })
  //             .then(
  //               function(response) {
  //                 const { data } = response;
  //                 console.log(response.data);

  //                 this._updateAuth(data.authToken, data.fullName);
  //               }.bind(this)
  //             )
  //             .catch(
  //               function(error) {
  //                 console.log(error);
  //               }.bind(this)
  //             );
  //         } else {
  //           console.log("NO AUTH");
  //         }
  //       }.bind(this),
  //       { scope: "email,public_profile" }
  //     );
  //   }
  // }

  googleLoginFailure(error) {
    message.error("Unsuccessful!")
  }

  googleLoginSuccess(data) {
    console.log("Success", data)
  }

  componentWillReceiveProps(nextProps) {
    const { auth } = nextProps;

    if (auth.isAuthenticated) {
      const { roles } = auth
      const isTeacher = roles.indexOf("teacher") !== -1

      if (isTeacher && nextProps.location.pathname == "/") {
        this.setState({
          ...this.state,
          loading: true
        }, _ => {
          axios.get(API_URLS.school.get, {
            headers: {
                "Authorization": `Bearer ${auth.authToken}`
            }
          })
            .then(response => {
              const { data } = response

              this.setState({
                ...this.state,
                loading: false
              })

              if (!data || data.length === 0) {
                this.props.history.push("/first-run")
              }
            })
            .catch(error => {
              console.log(error)
            })
        })
      }
    }
  }

  _checkAuthState = () => {
    const { isAuthenticated } = this.props.auth

    if (this.props.location.pathname != "/login" && !isAuthenticated) {
      this.props.history.push('/login')
    }
  }

  _signIn(email, password) {
    this.setState({
      ...this.state,
      loading: true
    });

    axios
      .post(API_URLS.accounts.signIn, {
        username: email,
        password
      })
      .then(
        function(response) {
          this.setState({
            ...this.state,
            loading: false
          });

          if (response.data) {
            const { authToken, fullName, roles } = response.data;

            this._updateAuth(authToken, fullName, roles);
            getUserName(response.data).then(fullName => this.props.updateFullName(fullName));
          }
        }.bind(this)
      )
      .catch(
        function(error) {
          console.log(error);

          this.setState({
            ...this.state,
            loading: false
          });

          if (error.response.status === 400) {
            return message.error("Wrong Credentials!");
          }

          message.error("Something went wrong!");
        }.bind(this)
      );
  }

  // _onChange(e) {
  //   // this.setState({
  //   //   ...this.state,
  //   //   [e.target.id]: e.target.value
  //   // });
  //   this.props.form.setFieldsValue({
  //     [e.target.id]: e.target.value
  //   })
  // }

  _signOut() {
    this.props.updateAuth(null, null)
    this.props.cookies.remove("ast-auth", { path: "/" })
    this.props.history.push("/")
  }
  _signOutAndRedirect= (path) => {
    this.props.updateAuth(null, null)
    this.props.cookies.remove("ast-auth", { path: "/" })
    this.props.history.replace(path)
  }

  render() {
    const { loading } = this.state;
    const { auth, fullName: fullTeacherName } = this.props;
    if (auth.isAuthenticated) {
      const { roles } = auth
      const isTeacher = roles.indexOf("teacher") !== -1

      return (
        <Layout className="layout fullheight">
          <HeaderComponent
            userData={auth}
            fullTeacherName={fullTeacherName}
            updateLang={this.props.updateLang.bind(this)}
            signOut={this._signOut.bind(this)}
          />

          <Layout>
            <Content>
              {!loading && isTeacher &&
                <Switch>
                  <Route path="/" component={HomeComponent} exact={true} />
                  <Route
                    path="/form/create"
                    component={CreateFormComponent}
                    exact={true}
                  />

                  <Route
                    path="/form/edit/:id"
                    component={CreateFormComponent}
                    exact={true}
                  />

                  <Route
                    path="/classrooms"
                    component={ClassroomsComponent}
                    exact={true}
                  />

                  <Route
                    path="/classrooms/:id"
                    component={ClassroomDetailsComponent}
                    exact={true}
                  />

                  <Route
                    path="/events/:id"
                    component={EventDetailsComponent}
                    exact={true}
                  />

                  <Route
                    path="/onboarding/parents"
                    component={ParentsOnboardingIndex}
                    exact={true}
                  />

                  <Route
                    path="/onboarding/:classroomID"
                    component={TeacherOnboardingIndex}
                    exact={true}
                  />

                  <Route
                    path="/first-run"
                    component={FirstRunWizard}
                    exact={true}
                  />
                  <Route
                    path="/manageprofile"
                    component={MyProfile}
                    exact={true}
                  />
                  <Route
                    path="/classroominvitation/:invitationID"
                    render={(props) => <NotFoundComponent signOut={this._signOutAndRedirect} {...props}/>}
                    exact={true}
                  />

                  <Route path="*" exact={true} component={NotFoundComponent} />

                  {/* <Route path="/404" component={NotFoundComponent} exact={true} /> */}
                </Switch>
              }

              {!loading && !isTeacher && roles.indexOf("parent") !== -1 &&
                <Switch>
                  <Route path="/" component={ParentsOnboardingIndex} exact={true} />

                  <Route
                    path="/classroominvitation/:invitationID"
                    component={ParentInvitation}
                    exact={true}
                  />

                  <Route path="*" exact={true} component={NotFoundComponent} />
                </Switch>
              }

              {loading &&
                <div className="container" style={{ textAlign: "center", paddingTop: 30 }}>
                  <Spin />
                </div>
              }
            </Content>
          </Layout>

          <FooterComponent />
        </Layout>
      );
    } else {
      const LoginFormComponent = Form.create()(LoginForm)
      const queryParams = parseQueryString()

      return (
        <Layout className="layout fullheight">
          <HeaderComponent />

          <Layout>
            <Content>
              <Switch>
                <Route
                  path="/register/teacher"
                  component={TeacherOnboarding}
                  exact={true}
                />

                <Route
                  path="/register/parent"
                  component={ParentOnboarding}
                  exact={true}
                />

                <Route
                  path="/classroominvitation/:invitationID"
                  component={ParentInvitation}
                  exact={true}
                />

                <Route
                    path="/register/parent/:newParentId"
                    component={ParentInvitation}
                    exact={true}
                  />

                <Route
                  path="/resetpassword"
                  component={ResetPassword}
                  exact={true}
                />

                <Route
                  path="/forgotpassword"
                  component={ForgotPassword}
                  exact={true}
                />

                <Route
                  path="/register"
                  component={registerComponent}
                  exact={true}
                />

                <Route
                  path="/confirmemail"
                  component={ConfirmEmail}
                  exact={true}
                />

                <Route
                  path="*"
                  exact={true}
                  component={() =>
                    <div className="container">
                      {queryParams.name &&
                        <div>
                          <h3 className="marginTop-30" style={{ marginBottom: 0 }}>Nice to see you again {queryParams.name}</h3>
                          <p>Please login</p>
                        </div>
                      }

                      {!queryParams.name && <h3 className="marginTop-30">Sign In</h3>}

                      <LoginFormComponent
                        signIn={this._signIn.bind(this)}
                        // oAuthLogin={this._oAuthLogin.bind(this)}
                        loading={loading}
                      />
                    </div>
                  }
                />
              </Switch>
            </Content>
          </Layout>

          <FooterComponent />
        </Layout>
      );
    }
  }
}

class LoginForm extends React.Component {
  state = {
    loading: false
  }

  componentDidMount() {
    const queryParams = parseQueryString()
    const { form } = this.props

    if (queryParams && queryParams.email) {
      form.setFieldsValue({
        email: queryParams.email
      })
    }
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const { signIn, oAuthLogin, loading } = this.props

    return (
      <Form
        onSubmit={e => {
          e.preventDefault()

          const values = this.props.form.getFieldsValue()
          signIn(values.email, values.password)
        }}
        className="login-form"
        style={{ marginTop: "15px" }}
      >
        <FormItem style={{ marginBottom: "10px" }}>
          {getFieldDecorator("email", {
            rules: [
              { required: true, message: "Please input your email address!" }
            ]
          })(
            <Input
              prefix={
                <Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />
              }
              placeholder="Email Address"
              size="large"
            />
          )}
        </FormItem>

        <FormItem>
          {getFieldDecorator("password", {
            rules: [
              { required: true, message: "Please input your Password!" }
            ]
          })(
            <Input
              prefix={
                <Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />
              }
              type="password"
              placeholder="Password"
              size="large"
            />
          )}
        </FormItem>

        <FormItem>
          {getFieldDecorator("remember", {
            valuePropName: "checked",
            initialValue: true
          })(
            <Checkbox>Remember me</Checkbox>
          )}

          <Link className="login-form-forgot" to="/forgotpassword">
            Forgot password
          </Link>

          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            size="large"
            loading={loading}
          >
            Log in
          </Button>

        
          {
            // commented according to this https://axondevgroup.atlassian.net/browse/AST-143
            /* <Button
            type="primary"
            className="login-form-button facebook"
            size="large"
            onClick={_ => oAuthLogin("facebook")}
            disabled={loading}
          >
            <Icon type="facebook" /> Login using Facebook
          </Button> */}

          {/* <GoogleLogin
            clientId="254675200179-u0fq8imod3n0mf4vu9pdcktvabsqd9an.apps.googleusercontent.com"
            className="ant-btn login-form-button google ant-btn-primary ant-btn-lg"
            onSuccess={this.googleLoginSuccess}
            onFailure={this.googleLoginFailure}
          >
            <Icon type="google" /> Login using Google
          </GoogleLogin> */}

          Or <Link to="/register">register now!</Link>
        </FormItem>
      </Form>
    )
  }
}

App.propTypes = {
  cookies: instanceOf(Cookies).isRequired
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      updateAuth,
      updateLang,
      updateFullName,
    },
    dispatch
  );
}

export default compose(
  connect(
    state => ({
      auth: state.auth,
      localization: state.localization,
      fullName: state.fullName,
    }),
    mapDispatchToProps
  )
)(withCookies(Form.create()(App)));
