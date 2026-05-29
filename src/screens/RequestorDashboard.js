import React, { useState, useEffect } from "react";
import { 
  View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert 
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { logoutUser } from "../services/authService";
import AppText from "../components/AppText";
import { useTheme } from "../context/ThemeContext";

export default function RequestorDashboard({ user, setUser }) {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "requests"),
      where("createdBy", "==", user.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching requests:", error);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد من رغبتك في تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "خروج", onPress: async () => await logoutUser(), style: "destructive" }
    ]);
  };

  const renderResponders = (responders) => {
    if (!responders || responders.length === 0) return null;
    return (
      <View style={styles.respondersContainer}>
        <AppText bold style={[styles.respondersTitle, { color: colors.text }]}>المتطوعون الذين استجابوا:</AppText>
        {responders.map((r, idx) => (
          <View key={idx} style={styles.responderRow}>
            <MaterialCommunityIcons name="account" size={14} color={colors.primary} />
            <AppText style={[styles.responderInfo, { color: colors.textLight }]}>{r.bloodType} | {r.phone || "لا يوجد رقم"}</AppText>
          </View>
        ))}
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={styles.bloodRow}>
          <MaterialCommunityIcons name="water" size={20} color={colors.primary} />
          <AppText bold style={[styles.bloodText, { color: colors.primary }]}>{item.bloodType}</AppText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? colors.success + '20' : colors.mediumGray }]}>
          <AppText style={[styles.statusText, { color: item.status === 'active' ? colors.success : colors.textLight }]}>
            {item.status === 'active' ? "نشط" : "مكتمل"}
          </AppText>
        </View>
      </View>

      <View style={styles.infoRow}>
        <MaterialCommunityIcons name="map-marker" size={16} color={colors.textLight} />
        <AppText style={[styles.infoText, { color: colors.textLight }]}>{item.location}</AppText>
      </View>
      {item.hospital && (
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="hospital" size={16} color={colors.textLight} />
          <AppText style={[styles.infoText, { color: colors.textLight }]}>{item.hospital}</AppText>
        </View>
      )}

      {renderResponders(item.responders)}

      <View style={styles.footerRow}>
        <AppText style={[styles.respondersCountText, { color: colors.success }]}>
          <MaterialCommunityIcons name="account-group" size={16} /> {item.respondersCount || 0} استجابوا
        </AppText>
      </View>
    </View>
  );

  // Humanitarian empty message
  const EmptyListMessage = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="heart-plus" size={70} color={colors.mediumGray} />
      <AppText bold style={[styles.emptyTitle, { color: colors.text }]}>لم تنشر أي نداء بعد</AppText>
      <AppText style={[styles.emptyText, { color: colors.textLight, textAlign: 'center' }]}>
        يمكنك نشر نداء تبرع بالدم للمرضى المحتاجين. كل نداء قد يكون سبباً في إنقاذ حياة.
      </AppText>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerTop}>
          <AppText bold style={[styles.title, { color: colors.text }]}>طلباتي</AppText>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconBtn}>
              <MaterialCommunityIcons name={isDark ? "weather-sunny" : "weather-night"} size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconBtn}>
              <MaterialCommunityIcons name="logout" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.newRequestBtn, { backgroundColor: colors.primary }]} 
          onPress={() => navigation.navigate("طلب جديد")}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.white} />
          <AppText bold style={[styles.newRequestText, { color: colors.white }]}>نشر نداء تبرع جديد</AppText>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={EmptyListMessage}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomLeftRadius: 25, borderBottomRightRadius: 25, elevation: 4, marginBottom: 15 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBtn: { padding: 5 },
  title: { fontSize: 22 },
  newRequestBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, borderRadius: 15, gap: 8 },
  newRequestText: { fontSize: 16 },
  card: { padding: 16, borderRadius: 20, marginHorizontal: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  bloodRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  bloodText: { fontSize: 20 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "bold" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  infoText: { fontSize: 14 },
  respondersContainer: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
  respondersTitle: { marginBottom: 4 },
  responderRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 2 },
  responderInfo: { fontSize: 13 },
  footerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  respondersCountText: { fontWeight: "bold" },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 15, lineHeight: 22 }
});
