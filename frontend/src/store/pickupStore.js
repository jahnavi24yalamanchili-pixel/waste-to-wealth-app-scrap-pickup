const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://waste-to-wealth-app-scrap-pickup.onrender.com";

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

const friendlyFallbacks = {
  400: "Please check the details and try again.",
  401: "Please login again to continue.",
  403: "You do not have permission for this action.",
  404: "The requested information was not found.",
  409: "This account already exists. Please login instead.",
  500: "Server error. Please try again after a moment.",
};

const request = async (url, options = {}, fallbackMessage = "Something went wrong.") => {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          friendlyFallbacks[response.status] ||
          fallbackMessage
      );
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError") {
      throw new Error(`Cannot connect to backend at ${API_URL}.`);
    }

    throw new Error(error.message || fallbackMessage);
  }
};

export const fallbackMaterials = [
  {
    _id: "newspaper",
    name: "Newspaper",
    category: "Paper",
    pricePerKg: 14,
    greenPointsPerKg: 3,
  },
  {
    _id: "plastic",
    name: "Plastic Bottles",
    category: "Plastic",
    pricePerKg: 18,
    greenPointsPerKg: 4,
  },
  {
    _id: "iron",
    name: "Iron Scrap",
    category: "Metal",
    pricePerKg: 28,
    greenPointsPerKg: 6,
  },
];

export const getMaterials = async () => {
  const data = await request(
    `${API_URL}/material-api/materials`,
    {},
    "Unable to load material prices."
  );
  return data.payload;
};

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const registerUser = async (user) => {
  return request(
    `${API_URL}/auth-api/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    },
    "Unable to create account. Please try again."
  );
};

export const loginUser = async (credentials) => {
  return request(
    `${API_URL}/auth-api/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
    "Unable to login. Please check your email and password."
  );
};

export const getCurrentUser = async (token) => {
  const data = await request(
    `${API_URL}/auth-api/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to refresh your account details."
  );

  return data.payload;
};

export const createPickup = async (pickup, token) => {
  return request(
    `${API_URL}/pickup-api/pickup`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(pickup),
    },
    "Unable to schedule pickup. Please try again."
  );
};

export const getMyPickups = async (token) => {
  const data = await request(
    `${API_URL}/pickup-api/my-pickups`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to load your pickups."
  );
  return data.payload;
};

export const getAllPickups = async (token) => {
  const data = await request(
    `${API_URL}/pickup-api/pickups`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to load pickup requests."
  );
  return data.payload;
};

export const getOpenPickups = async (token) => {
  const data = await request(
    `${API_URL}/pickup-api/open-pickups`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to load open pickup requests."
  );
  return data.payload;
};

export const getCollectorPickups = async (token) => {
  const data = await request(
    `${API_URL}/pickup-api/collector-pickups`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to load assigned pickups."
  );
  return data.payload;
};

export const getCollectors = async (token) => {
  const data = await request(
    `${API_URL}/user-api/collectors`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to load collectors."
  );
  return data.payload;
};

export const acceptPickup = async (pickupId, token) => {
  return request(
    `${API_URL}/pickup-api/accept/${pickupId}`,
    {
      method: "PUT",
      headers: authHeaders(token),
    },
    "Unable to accept pickup request."
  );
};

export const rejectPickup = async (pickupId, token) => {
  return request(
    `${API_URL}/pickup-api/reject/${pickupId}`,
    {
      method: "PUT",
      headers: authHeaders(token),
    },
    "Unable to reject pickup request."
  );
};

export const updatePickupStatus = async (pickupId, status, token) => {
  return request(
    `${API_URL}/pickup-api/status/${pickupId}`,
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    },
    "Unable to update pickup status."
  );
};
