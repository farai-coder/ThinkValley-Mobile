import { Alert, Platform } from 'react-native';

/**
 * Alert.alert is a silent no-op on web, which hides validation errors and
 * confirmations in the browser preview. On web we log instead; native keeps
 * the normal dialog.
 */
export const alert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    const text = [title, message].filter(Boolean).join(' — ');
    // eslint-disable-next-line no-console
    console.warn(`[ALERT] ${text}`);
    return;
  }
  Alert.alert(title, message, buttons);
};
