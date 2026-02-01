import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || "https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net";

const USERS_API_URL = `${API_BASE_URL}/users`;

export const getUsers = ({ skip = 0, limit = 100, includeRoles = false }) => {
  return axios.get(USERS_API_URL, {
    params: {
      skip,
      limit,
      include_roles: includeRoles,
    },
    headers: {
      Accept: "application/json",
    },
  });
};

export const createUser = (payload) => {
  return axios.post(USERS_API_URL, payload, {
    headers: {
      Accept: "application/json",
    },
  });
};

export const updateUser = (userId, payload) => {
  return axios.put(`${USERS_API_URL}/${userId}`, payload, {
    headers: {
      Accept: "application/json",
    },
  });
};

export const updateUserPassword = (userId, payload) => {
  return axios.patch(`${USERS_API_URL}/${userId}/password`, payload, {
    headers: {
      Accept: "application/json",
    },
  });
};

export const deleteUser = (userId) => {
  return axios.delete(`${USERS_API_URL}/${userId}`, {
    headers: {
      Accept: "*/*",
    },
  });
};

