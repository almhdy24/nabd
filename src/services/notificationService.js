import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { doc, updateDoc, arrayUnion, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token permission');
    Alert.alert('تنبيه', 'يجب منح صلاحية الإشعارات لتلقي تنبيهات التبرع');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('Expo push token:', token);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (token && userId) {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      // If user document does not exist, create it with minimal data
      if (!userSnap.exists()) {
        console.log('User document missing, creating it...');
        await setDoc(userRef, {
          uid: userId,
          pushTokens: [token],
          createdAt: new Date().toISOString(),
        });
        console.log('User document created with push token');
      } else {
        let tokens = userSnap.data()?.pushTokens || [];
        if (!tokens.includes(token)) {
          tokens.push(token);
          await updateDoc(userRef, { pushTokens: tokens });
          console.log('Push token saved to Firestore');
        } else {
          console.log('Push token already exists');
        }
      }
    }
    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
  const result = await response.json();
  if (result.data?.status === 'error') {
    throw new Error(result.data.message || 'فشل الإرسال');
  }
  return result;
}

export async function saveNotificationToHistory(userId, title, body, type, requestId = null) {
  const notification = {
    id: Date.now().toString(),
    title,
    body,
    type, // 'new_request', 'request_accepted', 'system'
    requestId,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    notifications: arrayUnion(notification),
  });
  console.log('Notification saved to history:', notification);
}

export async function refreshPushToken(userId, setUser) {
  const token = await registerForPushNotificationsAsync(userId);
  if (token && setUser) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    const freshUser = userSnap.data();
    setUser((prev) => ({ ...prev, pushTokens: freshUser?.pushTokens || [], notifications: freshUser?.notifications || [] }));
  }
  return token;
}
