import React, { Component, Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Spinner from "../app/shared/Spinner";
import { PrivateRoute } from "../_components/PrivateRoute";

const Dashboard = lazy(() => import("./dashboard/Dashboard"));

const Buttons = lazy(() => import("./basic-ui/Buttons"));
const Dropdowns = lazy(() => import("./basic-ui/Dropdowns"));
const Typography = lazy(() => import("./basic-ui/Typography"));

const BasicElements = lazy(() => import("./form-elements/BasicElements"));

const BasicTable = lazy(() => import("./tables/BasicTable"));

const Mdi = lazy(() => import("./icons/Mdi"));

const ChartJs = lazy(() => import("./charts/ChartJs"));

const Error404 = lazy(() => import("./error-pages/Error404"));
const Error500 = lazy(() => import("./error-pages/Error500"));

const Login = lazy(() => import("./user-pages/Login"));
const Register1 = lazy(() => import("./user-pages/Register"));
const CoPhimLinkLeComponent = lazy(() => import("./co-phim/link-le"));
const CoPhimFeatureMovieComponent = lazy(() => import("./co-phim/feature-movie"));
class AppRoutes extends Component {
  render() {
    return (
      <Suspense fallback={<Spinner />}>
        <Switch>
          {/* <PrivateRoute exact path="/dashboard" component={Dashboard} /> */}
          <Route exact path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route exact path="/dashboard" component={Dashboard} />
          <Route path="/co-phim/link-le" component={CoPhimLinkLeComponent} />
          <Route path="/co-phim/feature-movie" component={CoPhimFeatureMovieComponent} />
          <Route path="/basic-ui/buttons" component={Buttons} />
          <Route path="/basic-ui/dropdowns" component={Dropdowns} />
          <Route path="/basic-ui/typography" component={Typography} />

          <Route
            path="/form-Elements/basic-elements"
            component={BasicElements}
          />

          <Route path="/tables/basic-table" component={BasicTable} />

          <Route path="/icons/mdi" component={Mdi} />

          <Route path="/charts/chart-js" component={ChartJs} />
          {/* <Route path="/user-pages/register-1" component={Register1} /> */}

          <Route component={Error404} />
          {/* <Route path="/error-pages/error-500" component={Error500} /> */}
        </Switch>
      </Suspense>
    );
  }
}

export default AppRoutes;
