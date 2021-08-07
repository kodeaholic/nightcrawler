import { config } from "../../api.config";
import { authHeader } from "../../_helpers/auth-header";
import { handleResponse } from "../../_helpers/handle-response";

export const linkLeService = {
  getItems,
};

async function getItems(status, page = 1, limit = 10) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };

  const response = await fetch(
    `${config.apiEndpoint}/cophimlinkle?status=${status}&page=${page}&limit=${limit}`,
    requestOptions
  );
  const res = await handleResponse(response);
  return res;
}
