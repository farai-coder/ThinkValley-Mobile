import apiClient from './api';
import { ENDPOINTS } from '../config/api';

export const collectionService = {
  getCollections: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.COLLECTIONS, { params });
    return response.data;
  },

  getCollection: async (id) => {
    const response = await apiClient.get(ENDPOINTS.COLLECTION_DETAIL(id));
    return response.data;
  },

  getFeaturedCollections: async () => {
    const response = await apiClient.get(ENDPOINTS.COLLECTIONS_FEATURED);
    return response.data;
  },

  getCollectionsByType: async (type) => {
    const response = await apiClient.get(ENDPOINTS.COLLECTIONS_BY_TYPE, { params: { type } });
    return response.data;
  },
};
