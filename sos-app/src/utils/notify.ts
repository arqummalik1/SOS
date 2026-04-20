import { Alert, Platform, ToastAndroid } from 'react-native';

export type NotifyType = 'success' | 'error' | 'info';

type NotifyInput = {
  message: string;
  type?: NotifyType;
  title?: string;
};

const DEFAULT_TITLES: Record<NotifyType, string> = {
  success: 'Success',
  error: 'Error',
  info: 'Info',
};

export const notify = ({ message, type = 'info', title }: NotifyInput): void => {
  const finalTitle = title ?? DEFAULT_TITLES[type];
  const line = `${finalTitle}: ${message}`;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(line);
    } else {
      console.warn('[SOS_NOTIFY]', line);
    }
    return;
  }

  if (Platform.OS === 'android') {
    ToastAndroid.show(line, ToastAndroid.SHORT);
    return;
  }

  Alert.alert(finalTitle, message);
};
