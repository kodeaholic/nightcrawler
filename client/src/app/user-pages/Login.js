import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { authenticationService } from "../../_services/authentication.service";
import _ from "lodash";
import cogoToast from "cogo-toast";
import { sleep } from "../../_helpers/sleep";
import { history } from "../../_helpers/history";
export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      submitting: false,
    };
  }
  render() {
    return (
      <div>
        <div className="d-flex align-items-center auth px-0">
          <div className="row w-100 mx-0">
            <div className="col-lg-4 mx-auto">
              <div className="card text-left py-5 px-4 px-sm-5">
                {/* <div className="brand-logo">
                  <img
                    src={require("../../assets/images/logo.svg")}
                    alt="logo"
                  />
                </div> */}
                <h4 style={{ textAlign: "center", fontWeight: "bold" }}>
                  NIGHTCRAWLER
                </h4>
                {/* <h6 className="font-weight-light">Sign in to continue.</h6> */}
                <Form className="pt-3">
                  <Form.Group className="d-flex search-field">
                    <Form.Control
                      id="email"
                      type="email"
                      placeholder="Username"
                      size="lg"
                      className="h-auto"
                      onChange={(e) => {
                        const email = e.target.value;
                        this.setState({ ...this.state, email: email });
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="d-flex search-field">
                    <Form.Control
                      id="password"
                      type="password"
                      placeholder="Password"
                      size="lg"
                      className="h-auto"
                      onChange={(e) => {
                        const password = e.target.value;
                        this.setState({ ...this.state, password: password });
                      }}
                    />
                  </Form.Group>
                  <div className="mt-3">
                    <button
                      type="button"
                      className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                      onClick={async (e) => {
                        this.setState({ ...this.state, submitting: true });
                        await sleep(500);
                        // if (
                        //   !_.isEmpty(this.state.email) ||
                        //   !_.isEmpty(this.state.password)
                        // ) {
                        //   const email = document.getElementById("email").value;
                        //   const password =
                        //     document.getElementById("password").value;
                        //   this.setState({ ...this.state, email, password });
                        // }
                        authenticationService
                          .login(this.state.email, this.state.password)
                          .then(
                            (user) => {
                              // const { from } = this.props.location.state || {
                              //   from: { pathname: "/" },
                              // };
                              // this.props.history.push(from);
                              console.log(user);
                            },
                            (error) => {
                              cogoToast.error("Incorrect email or password");
                              this.setState({
                                ...this.state,
                                submitting: false,
                              });
                            }
                          );
                      }}
                    >
                      SIGN IN
                    </button>
                  </div>
                  {/* <div className="my-2 d-flex justify-content-between align-items-center">
                    <div className="form-check">
                      <label className="form-check-label text-muted">
                        <input type="checkbox" className="form-check-input" />
                        <i className="input-helper"></i>
                        Keep me signed in
                      </label>
                    </div>
                    <a
                      href="!#"
                      onClick={(event) => event.preventDefault()}
                      className="auth-link text-muted"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="mb-2">
                    <button
                      type="button"
                      className="btn btn-block btn-facebook auth-form-btn"
                    >
                      <i className="mdi mdi-facebook mr-2"></i>Connect using
                      facebook
                    </button>
                  </div>
                  <div className="text-center mt-4 font-weight-light">
                    Don't have an account?{" "}
                    <Link to="/user-pages/register" className="text-primary">
                      Create
                    </Link>
                  </div> */}
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
