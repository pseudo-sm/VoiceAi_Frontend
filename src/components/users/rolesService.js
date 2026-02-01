import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || "https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net";

const ROLES_API_URL = `${API_BASE_URL}/roles`;

export const getRoles = ({ skip = 0, limit = 100 }) => {
  return axios.get(ROLES_API_URL, {
    params: {
      skip,
      limit,
    },
    headers: {
      Accept: "application/json",
    },
  });
};

export const createRole = (payload) => {
  return axios.post(ROLES_API_URL, payload, {
    headers: {
      Accept: "application/json",
    },
  });
};

