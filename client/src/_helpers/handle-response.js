import { authenticationService } from "../_services/authentication.service";
import _ from "lodash";
export function handleResponse(response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text);
    if (!response.ok) {
      if ([401, 403].indexOf(response.status) !== -1) {
        // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
        authenticationService.logout();
        if (
          _.get(window, "location.href") &&
          !_.get(window, "location.href").includes("login")
        )
          window.location.href = "/";
      }

      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }

    return data;
  });
}
