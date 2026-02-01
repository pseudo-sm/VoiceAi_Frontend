import axios from "axios";

const API_URL =
  "https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net/campaigns";

export const createCampaign = (formData) => {
  return axios.post(API_URL, formData, {
    headers: {
      Accept: "application/json",
    },
  });
};

export const getCampaigns = ({ skip = 0, limit = 100, includeDetails = false }) => {
  return axios.get(API_URL, {
    params: {
      skip,
      limit,
      include_details: includeDetails,
    },
    headers: {
      Accept: "application/json",
    },
  });
};

export const updateCampaign = (campaignId, formData) => {
  return axios.put(`${API_URL}/${campaignId}`, formData, {
    headers: {
      Accept: "application/json",
    },
  });
};

export const startCampaign = (campaignId) => {
  return axios.post(`${API_URL}/${campaignId}/start`, null, {
    headers: {
      Accept: "application/json",
    },
  });
};

export const scheduleCampaign = (campaignId) => {
  return axios.post(`${API_URL}/${campaignId}/schedule`, null, {
    headers: {
      Accept: "application/json",
    },
  });
};