import {API_BASE_URL} from "../config/api.js"

export async function getDataToDay() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const url = API_BASE_URL+"/admin/orderitems/today";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}

export async function getDataAccountCreateToday() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("No access token found.");
  }

  const url = API_BASE_URL+"/admin/accounts/today";

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json();
}