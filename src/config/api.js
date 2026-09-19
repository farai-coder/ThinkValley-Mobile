// API Configuration
// Update this URL to match your backend server
const API_BASE_URL = 'https://wetradeafrica.co.zw/api';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login/',
  REGISTER: '/auth/register/',
  CHECK_ACCOUNT: '/auth/check/',
  SEND_REGISTER_OTP: '/auth/send-register-otp/',
  VERIFY_REGISTER_OTP: '/auth/verify-register-otp/',
  GOOGLE_AUTH: '/auth/google/',
  FORGOT_PASSWORD: '/auth/forgot-password/',
  VERIFY_OTP: '/auth/verify-otp/',
  RESET_PASSWORD: '/auth/reset-password/',
  ME: '/auth/me/',
  CHANGE_PASSWORD: '/auth/change-password/',
  
  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id) => `/products/${id}/`,
  PRODUCT_REVIEWS: (id) => `/products/${id}/reviews/`,
  
  // Categories
  CATEGORIES: '/categories/',
  CATEGORY_TREE: '/categories/tree/',
  CATEGORY_CHILDREN: (id) => `/categories/${id}/children/`,
  
  // Orders
  ORDERS: '/orders/',
  ORDER_DETAIL: (id) => `/orders/${id}/`,
  
  // Collections
  COLLECTIONS: '/collections/',
  COLLECTION_DETAIL: (id) => `/collections/${id}/`,
  COLLECTIONS_FEATURED: '/collections/featured/',
  COLLECTIONS_BY_TYPE: '/collections/by_type/',
  
  // Search
  SEARCH: '/search/',

  // Payments
  PAYMENTS_CONFIG: '/payments/config/',
  PAYNOW_INITIATE: '/payments/paynow/initiate/',
  PAYNOW_STATUS: (paymentId) => `/payments/paynow/${paymentId}/status/`,
};
