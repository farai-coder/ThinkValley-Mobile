import apiClient from './api';
import { ENDPOINTS } from '../config/api';

export const paymentService = {
  getConfig: async () => {
    const response = await apiClient.get(ENDPOINTS.PAYMENTS_CONFIG);
    return response.data; // { configured, methods: [{id, name}] }
  },

  initiatePaynow: async ({ orderNumber, method, phone }) => {
    const response = await apiClient.post(ENDPOINTS.PAYNOW_INITIATE, {
      order_number: orderNumber,
      method, // 'ecocash' | 'onemoney' | 'innbucks'
      phone,
    });
    return response.data; // { payment_id, status, instructions, redirect_url, pollurl }
  },

  getPaynowStatus: async (paymentId) => {
    const response = await apiClient.get(ENDPOINTS.PAYNOW_STATUS(paymentId));
    return response.data; // { payment_id, status, instructions, order_status, order_number }
  },
};
