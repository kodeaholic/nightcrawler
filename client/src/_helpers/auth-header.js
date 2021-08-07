import { authenticationService } from "../_services/authentication.service";
import _ from "lodash";
export function authHeader() {
  // return authorization header with jwt token
  const currentUser = authenticationService.currentUserValue;
  if (currentUser && currentUser.tokens) {
    return {
      Authorization: `Bearer ${_.get(currentUser, 'tokens.access.token')}`,
      "Content-Type": "application/json",
    };
  } else {
    return { "Content-Type": "application/json" };
  }
}
