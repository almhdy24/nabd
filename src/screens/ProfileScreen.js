import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { logoutUser } from "../services/authService";
import AppText from "../components/AppText";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen({ user }) {
  const { colors } = useTheme();
  const [donations, setDonations] = useState(0);
  const [lastDonation, setLastDonation] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDonations(data.donations || 0);
        setLastDonation(data.lastDonationDate);
      }
    };
    fetchStats();
  }, []);

  const getHumanTitle = () => {
    if (donations >= 10) return { name: "بطل التبرع", color: "#FFD700", icon: "crown" };
    if (donations >= 6) return { name: "منقذ الأرواح", color: "#C0C0C0", icon: "star-circle" };
    if (donations >= 3) return { name: "داعم للحياة", color: "#cd7f32", icon: "heart-circle" };
    if (donations >= 1) return { name: "متبرع كريم", color: colors.success, icon: "hand-heart" };
    return { name: "عضو المجتمع", color: colors.primary, icon: "account-heart" };
  };
  const title = getHumanTitle();
  const lastDonationDate = lastDonation ? new Date(lastDonation).toLocaleDateString('ar-EG') : 'لا يوجد';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <MaterialCommunityIcons name={title.icon} size={70} color={title.color} />
        <AppText bold style={[styles.name, { color: colors.text }]}>{user.email}</AppText>
        <AppText style={{ color: colors.textLight }}>نوع الحساب: {user.role === "donor" ? "متبرع" : "طالب دم"}</AppText>

        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: colors.lightGray }]}>
            <AppText bold style={[styles.statNumber, { color: colors.primary }]}>{donations}</AppText>
            <AppText style={{ color: colors.textLight }}>عدد الاستجابات</AppText>
          </View>
        </View>

        <View style={styles.impactCard}>
          <MaterialCommunityIcons name="heart-outline" size={20} color={colors.primary} />
          <AppText style={[styles.impactText, { color: colors.textLight }]}>شكراً لمشاركتك في دعم المرضى. كل استجابة تنقذ حياة.</AppText>
        </View>

        {user.role === "donor" && (
          <View style={styles.donationInfo}>
            <AppText style={{ color: colors.textLight }}>آخر تبرع: {lastDonationDate}</AppText>
          </View>
        )}

        <View style={[styles.badgeBox, { borderColor: title.color }]}>
          <AppText bold style={{ color: title.color }}>{title.name}</AppText>
        </View>
      </View>

      <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.primary }]} onPress={() => {
        Alert.alert("تسجيل الخروج", "هل أنت متأكد؟", [
          { text: "إلغاء", style: "cancel" },
          { text: "خروج", style: "destructive", onPress: logoutUser }
        ]);
      }}>
        <AppText bold style={styles.logoutText}>تسجيل الخروج</AppText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  profileCard: { padding: 30, borderRadius: 28, alignItems: "center", marginBottom: 20, elevation: 4 },
  name: { fontSize: 20, marginTop: 12, marginBottom: 6 },
  statsRow: { flexDirection: "row", justifyContent: "center", marginVertical: 20 },
  statBox: { padding: 15, borderRadius: 20, alignItems: "center", minWidth: 120 },
  statNumber: { fontSize: 32 },
  impactCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0f0f030', padding: 12, borderRadius: 20, marginVertical: 12 },
  impactText: { flex: 1, fontSize: 13 },
  donationInfo: { marginBottom: 12 },
  badgeBox: { borderWidth: 2, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, marginTop: 5 },
  logoutBtn: { padding: 16, borderRadius: 30, alignItems: "center" },
  logoutText: { color: "#fff", fontSize: 16 }
});
