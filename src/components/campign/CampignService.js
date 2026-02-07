import axios from "axios";

const API_URL =
  "https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net/campaigns";

// Base host for other endpoints (narratives, etc.)
const BASE_URL = "https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net";



export const getCampaignById = ({
  campaignId,
  includeDetails = false,
  includeSlots = true,
  generateSignedUrl = false,
  sasExpiryHours = 24,
}) => {
  return axios.get(`${BASE_URL}/campaigns/${campaignId}`, {
    headers: {
      Accept: "application/json",
    },
    params: {
      include_details: includeDetails,
      include_slots: includeSlots,
      generate_signed_url: generateSignedUrl,
      sas_expiry_hours: sasExpiryHours,
    },
  });
};


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

export const updateCampaign = (campaignId, payload) => {
  return axios.put(`${API_URL}/${campaignId}`, payload, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
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



export const getCampaignCustomers = ({
  campaignId,
  skip = 0,
  limit = 100,
  includeCampaign = false,
}) => {
  return axios.get(`${API_URL}/${campaignId}/customers`, {
    params: {
      skip,
      limit,
      include_campaign: includeCampaign,
    },
    headers: {
      Accept: "application/json",
    },
  });
};

export const getNarratives = ({ skip = 0, limit = 100, includeLanguages = false } = {}) => {
  return axios.get(`${BASE_URL}/narratives`, {
    params: {
      skip,
      limit,
      include_languages: includeLanguages,
    },
    headers: {
      Accept: "application/json",
    },
  });
};