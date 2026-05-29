import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, setDoc, updateDoc, arrayUnion, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register device token and save to Firestore
export async function registerForPushNotificationsAsync(userId) {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token permission');
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Expo push token:', token);

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Save token to Firestore
  if (token && userId) {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    let tokens = userSnap.data()?.pushTokens || [];
    if (!tokens.includes(token)) {
      tokens.push(token);
      await updateDoc(userRef, { pushTokens: tokens });
    }
  }
  return token;
}

// Send push notification via Expo
export async function sendPushNotification(expoPushToken, title, body, data = {}) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title,
    body,
    data,
  };
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// Save notification to user's history in Firestore
export async function saveNotificationToHistory(userId, title, body, type, requestId = null) {
  const notification = {
    id: Date.now().toString(),
    title,
    body,
    type, // 'request_accepted', 'new_request', 'system'
    requestId,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    notifications: arrayUnion(notification),
  });
}

// Notify all donors about a new blood request
export async function notifyDonorsNewRequest(requestData) {
  const { bloodType, location, hospital, id } = requestData;
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'donor'),
    where('bloodType', '==', bloodType),
    where('available', '==', true)
  );
  const snapshot = await getDocs(q);
  for (const docSnap of snapshot.docs) {
    const donor = docSnap.data();
    const tokens = donor.pushTokens || [];
    for (const token of tokens) {
      await sendPushNotification(
        token,
        'نداء تبرع جديد',
        `مطلوب فصيلة ${bloodType} في ${location}${hospital ? ` - ${hospital}` : ''}`,
        { requestId: id }
      );
      await saveNotificationToHistory(
        docSnap.id,
        'نداء تبرع جديد',
        `مطلوب فصيلة ${bloodType} في ${location}`,
        'new_request',
        id
      );
    }
  }
}

// Notify requestor when a donor accepts
export async function notifyRequestorOnAccept(requestorId, donorInfo, requestId) {
  const userSnap = await getDoc(doc(db, 'users', requestorId));
  const tokens = userSnap.data()?.pushTokens || [];
  for (const token of tokens) {
    await sendPushNotification(
      token,
      'تم استلام استجابة',
      `تطوع ${donorInfo.bloodType} للتبرع لك. اتصل به الآن: ${donorInfo.phone}`,
      { requestId }
    );
    await saveNotificationToHistory(
      requestorId,
      'تم استلام استجابة',
      `تطوع متبرع لفصيلة ${donorInfo.bloodType}. يمكنك الاتصال به.`,
      'request_accepted',
      requestId
    );
  }
}
