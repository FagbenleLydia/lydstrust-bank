const axios = require('axios');

const BASE_URL = process.env.NIBSS_BASE_URL;
const API_KEY = process.env.NIBSS_API_KEY;
const API_SECRET = process.env.NIBSS_API_SECRET;

// Cache the token so we don't request it every time
let nibssToken = null;
let tokenExpiry = null;

const getNibssToken = async () => {
  // Return cached token if still valid
  if (nibssToken && tokenExpiry && Date.now() < tokenExpiry) {
    return nibssToken;
  }

  const response = await axios.post(`${BASE_URL}/api/auth/token`, {
    apiKey: API_KEY,
    apiSecret: API_SECRET,
  }, { timeout: 15000 });

  const token = response.data.token || response.data.access_token || response.data.data?.token;
  if (!token) throw new Error('NIBSS authentication failed: no token in response.');
  nibssToken = token;
  // Cache for 55 minutes
  tokenExpiry = Date.now() + 55 * 60 * 1000;
  return nibssToken;
};

const nibssClient = async () => {
  const token = await getNibssToken();
  return axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// Insert a fake BVN into the system (for testing)
const insertBvn = async (bvnData) => {
  const client = await nibssClient();
  const response = await client.post('/api/insertBvn', bvnData);
  return response.data;
};

// Validate BVN
const validateBvn = async (bvn) => {
  const client = await nibssClient();
  const response = await client.post('/api/validateBvn', { bvn });
  return response.data;
};

// Insert a fake NIN into the system (for testing)
const insertNin = async (ninData) => {
  const client = await nibssClient();
  const response = await client.post('/api/insertNin', ninData);
  return response.data;
};

// Validate NIN
const validateNin = async (nin) => {
  const client = await nibssClient();
  const response = await client.post('/api/validateNin', { nin });
  return response.data;
};

// Create bank account via KYC
const createNibssAccount = async (accountData) => {
  const client = await nibssClient();
  const response = await client.post('/api/account/create', accountData);
  return response.data;
};

// Name enquiry
const nameEnquiry = async (accountNumber) => {
  const client = await nibssClient();
  const response = await client.get(`/api/account/name-enquiry/${accountNumber}`);
  return response.data;
};

// Transfer funds
const transferFunds = async (transferData) => {
  const client = await nibssClient();
  const response = await client.post('/api/transfer', transferData);
  return response.data;
};

// Get transaction by reference
const getTransaction = async (ref) => {
  const client = await nibssClient();
  const response = await client.get(`/api/transaction/${ref}`);
  return response.data;
};

// Get account balance
const getAccountBalance = async (accountNumber) => {
  const client = await nibssClient();
  const response = await client.get(`/api/account/balance/${accountNumber}`);
  return response.data;
};

// Get all fintech accounts
const getAllAccounts = async () => {
  const client = await nibssClient();
  const response = await client.get('/api/accounts');
  return response.data;
};

module.exports = {
  insertBvn,
  validateBvn,
  insertNin,
  validateNin,
  createNibssAccount,
  nameEnquiry,
  transferFunds,
  getTransaction,
  getAccountBalance,
  getAllAccounts,
};
