import apiClient from './api';
import { ENDPOINTS } from '../config/api';

export const categoryService = {
  getCategories: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.CATEGORIES, { params });
    return response.data;
  },

  getCategoryTree: async () => {
    const response = await apiClient.get(ENDPOINTS.CATEGORY_TREE);
    return response.data;
  },

  getCategoryChildren: async (id, params = {}) => {
    const response = await apiClient.get(ENDPOINTS.CATEGORY_CHILDREN(id), { params });
    return response.data;
  },
};
