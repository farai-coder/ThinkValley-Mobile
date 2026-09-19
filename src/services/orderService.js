import apiClient from './api';
import { ENDPOINTS } from '../config/api';
import { Platform } from 'react-native';

const money = (v) => Number(v || 0).toFixed(2);

export const orderService = {
  getOrders: async (params = {}) => {
    const response = await apiClient.get(ENDPOINTS.ORDERS, { params });
    return response.data;
  },

  getOrder: async (id) => {
    const response = await apiClient.get(ENDPOINTS.ORDER_DETAIL(id));
    return response.data;
  },

  /**
   * Create an order using the same payload contract as the web checkout:
   * FormData with flat order fields + JSON-stringified `items`, and an
   * optional `id_image` file for cash-on-delivery verification.
   *
   * cart: [{ id, title|name, price|sale_price, quantity, image }]
   * shipping: { customer_name, first_name, last_name, email, phone, address,
   *             address2, city, state, zip_code, subtotal, shipping_cost, tax, total }
   */
  createOrder: async ({ cart, user, shipping, paymentMethod, idImageUri }) => {
    const payload = {
      customer_name: shipping.customer_name,
      first_name: shipping.first_name || (shipping.customer_name || '').split(' ')[0] || '',
      last_name: shipping.last_name || (shipping.customer_name || '').split(' ').slice(1).join(' '),
      email: shipping.email || user?.email || '',
      phone: shipping.phone || user?.phone || '',
      address: shipping.address,
      address2: shipping.address2 || '',
      city: shipping.city,
      state: shipping.state || '',
      zip_code: shipping.zip_code || '',
      country: 'Zimbabwe',
      company: user?.company || '',
      payment_method: paymentMethod, // 'cod' | 'paynow_ecocash' | 'paynow_onemoney' | 'paynow_innbucks'
      shipping_method: 'standard',
      subtotal: money(shipping.subtotal),
      shipping_cost: money(shipping.shipping_cost ?? 0),
      tax: money(shipping.tax ?? 0),
      total: money(shipping.total),
      status: 'pending',
      note: shipping.note || '',
      user: user?.id ?? null,
      items: (cart || []).map((item) => ({
        product: item.id,
        title: item.title || item.name || '',
        price: money(item.sale_price ?? item.price),
        qty: item.quantity ?? item.qty ?? 1,
        image_url: item.image_url || item.display_image || item.image || '',
        size: item.size ?? null,
        color: item.color ?? null,
      })),
    };

    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (key === 'items') {
        formData.append('items', JSON.stringify(payload[key]));
      } else if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, String(payload[key]));
      }
    });

    if (idImageUri) {
      if (Platform.OS === 'web') {
        // On web, fetch the local blob/data URL and send a real Blob —
        // the { uri } file shape only works on native.
        const blob = await (await fetch(idImageUri)).blob();
        formData.append('id_image', blob, 'id_card.jpg');
      } else {
        formData.append('id_image', {
          uri: idImageUri,
          name: 'id_card.jpg',
          type: 'image/jpeg',
        });
      }
    }

    const response = await apiClient.post(ENDPOINTS.ORDERS, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
