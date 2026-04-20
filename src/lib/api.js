/**
 * ARKARISK MOCK API
 * This file simulates a backend server for a frontend-only prototype.
 * It uses localStorage for session persistence and mock data for dashboards.
 */

// Helper to simulate network latency
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Database
const mockData = {
  farmers: {
    '9999999999': {
      phone: '9999999999',
      name: 'Ramesh Patil',
      region: 'Pune District, Maharashtra',
      applications: [
        { id: 1, app_id: 'APP-8821', crop: 'Cotton', region: 'Pune, MH', loan_amount: '₹ 1,50,000', score: 24, status: 'Review' }
      ]
    },
    'default': {
      phone: '0000000000',
      name: 'New Farmer',
      region: 'Unassigned Region',
      applications: []
    }
  },
  lenderApplications: [
    { id: 1, app_id: 'APP-8821', farmer_phone: '9999999999', name: 'Ramesh Patil', region: 'Pune, MH', crop: 'Cotton', loan_amount: '₹ 1,50,000', score: 24, status: 'Review' },
    { id: 2, app_id: 'APP-8822', farmer_phone: '9999999998', name: 'Vikram Singh', region: 'Amritsar, PB', crop: 'Wheat', loan_amount: '₹ 3,00,000', score: 48, status: 'Review' },
    { id: 3, app_id: 'APP-8823', farmer_phone: '9999999997', name: 'Sunita Devi', region: 'Patna, BR', crop: 'Rice', loan_amount: '₹ 80,000', score: 72, status: 'High Risk' },
    { id: 4, app_id: 'APP-8824', farmer_phone: '9999999996', name: 'Anil Kumar', region: 'Nashik, MH', crop: 'Grapes', loan_amount: '₹ 5,00,000', score: 18, status: 'Approved' }
  ]
};

// In-memory store for active session (won't persist across refreshes, but localStorage will)
let currentSession = null;

/* --- Auth --- */

export const sendFarmerOTP = async (phone) => {
  await delay();
  // Generate random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Store it in session for verification
  sessionStorage.setItem('current_otp', otp);
  sessionStorage.setItem('current_phone', phone);

  console.log(`[MOCK API] OTP for ${phone}: ${otp}`);
  return { success: true, message: 'OTP sent successfully', otp };
};

export const verifyFarmerOTP = async (phone, otp) => {
  await delay();
  const storedOtp = sessionStorage.getItem('current_otp');
  const storedPhone = sessionStorage.getItem('current_phone');

  if (otp === storedOtp && phone === storedPhone) {
    const fakeToken = `mock_token_${Date.now()}`;
    localStorage.setItem('arkarisk_token', fakeToken);
    localStorage.setItem('arkarisk_role', 'farmer');
    localStorage.setItem('arkarisk_phone', phone);
    
    return { success: true, token: fakeToken };
  }
  
  throw new Error('Invalid OTP');
};

export const loginLender = async (email, password) => {
  await delay();
  // For prototype, any non-empty input works
  if (email && password) {
    const fakeToken = `mock_token_lender_${Date.now()}`;
    localStorage.setItem('arkarisk_token', fakeToken);
    localStorage.setItem('arkarisk_role', 'lender');
    
    return { success: true, token: fakeToken };
  }
  throw new Error('Invalid credentials');
};

export const logout = () => {
  localStorage.removeItem('arkarisk_token');
  localStorage.removeItem('arkarisk_role');
  localStorage.removeItem('arkarisk_phone');
  sessionStorage.clear();
};

/* --- Data Fetching --- */

export const fetchFarmerProfile = async () => {
  await delay();
  const phone = localStorage.getItem('arkarisk_phone');
  const profile = mockData.farmers[phone] || mockData.farmers['default'];
  return { name: profile.name, region: profile.region };
};

export const fetchFarmerApplications = async () => {
  await delay();
  const phone = localStorage.getItem('arkarisk_phone');
  const profile = mockData.farmers[phone] || mockData.farmers['default'];
  return profile.applications;
};

export const fetchAllApplications = async () => {
  await delay();
  return mockData.lenderApplications;
};
