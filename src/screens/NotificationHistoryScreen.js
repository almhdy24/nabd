import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function NotificationHistoryScreen({ user }) {
  const { colors } = useTheme();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      const data = docSnap.data();
      setNotifications(data?.notifications?.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) || []);
    });
    return unsubscribe;
  }, [user]);

  const markAsRead = async (notificationId) => {
    const userRef = doc(db, 'users', user.uid);
    const currentNotifs = [...notifications];
    const updatedNotifs = currentNotifs.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    await updateDoc(userRef, { notifications: updatedNotifs });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'new_request': return 'bell-ring';
      case 'request_accepted': return 'hand-heart';
      default: return 'bell-outline';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, opacity: item.read ? 0.6 : 1 }]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons name={getIcon(item.type)} size={24} color={colors.primary} />
        <View style={styles.content}>
          <AppText bold style={{ color: colors.text }}>{item.title}</AppText>
          <AppText style={{ color: colors.textLight, marginTop: 4 }}>{item.body}</AppText>
          <AppText style={{ color: colors.textLight, fontSize: 10, marginTop: 6 }}>
            {new Date(item.createdAt).toLocaleString('ar-EG')}
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-off-outline" size={64} color={colors.mediumGray} />
            <AppText style={{ color: colors.textLight, marginTop: 16 }}>لا توجد إشعارات حتى الآن</AppText>
          </View>
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: 16, padding: 14, marginBottom: 12, elevation: 1 },
  row: { flexDirection: 'row', gap: 12 },
  content: { flex: 1 },
  empty: { alignItems: 'center', marginTop: 80 },
});
