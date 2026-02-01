import axios from "axios";

const BASE_URL =
  "https://telvi-voice-ai-fnfafecbhqa9edfp.centralindia-01.azurewebsites.net";


export const fetchCustomers = async ({
  campaignId,
  skip = 0,
  limit = 100,
  include_campaign = false,
}) => {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  const response = await axios.get(
    `${BASE_URL}/campaigns/${campaignId}/customers`,
    {
      params: {
        skip,
        limit,
        include_campaign,
      },
      headers: {
        accept: "application/json",
      },
    }
  );

  return response.data;
};


export const uploadCustomersCsv = async ({
  campaignId,
  file,
  replace_existing = true,
}) => {
  if (!campaignId) {
    throw new Error("campaignId is required");
  }

  if (!file) {
    throw new Error("CSV file is required");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${BASE_URL}/campaigns/${campaignId}/customers/upload`,
    formData,
    {
      params: {
        replace_existing,
      },
      headers: {
        accept: "application/json",
        // ❗ DO NOT set Content-Type manually
      },
    }
  );

  return response.data;
};
