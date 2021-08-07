import { config } from "../../api.config";
import { authHeader } from "../../_helpers/auth-header";
import { handleResponse } from "../../_helpers/handle-response";

export const featureMovieService = {
  getItems,
};

async function getItems(
  published,
  page = 1,
  limit = 10,
  year,
  country,
  vnTitle
) {
  const requestOptions = {
    method: "GET",
    headers: authHeader(),
  };
  if (year) url += `&year=${year}`;
  if (country) url += `&country=${country}`;
  if (vnTitle) url += `&vnTitle=${vnTitle}`;
  let url = `${config.apiEndpoint}/cophimfeaturemovie?published=${published}&page=${page}&limit=${limit}`;
  const response = await fetch(url, requestOptions);
  const res = await handleResponse(response);
  return res;
}
