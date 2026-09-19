import apiClient from './api';
import { ENDPOINTS } from '../config/api';

export const productService = {
  getProducts: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS, { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(ENDPOINTS.PRODUCT_DETAIL(id));
    return response.data;
  },

  getProductReviews: async (id) => {
    const response = await apiClient.get(ENDPOINTS.PRODUCT_REVIEWS(id));
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await apiClient.get(ENDPOINTS.PRODUCTS, { params: { search: query } });
    return response.data;
  },
};
