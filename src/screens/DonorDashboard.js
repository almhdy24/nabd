import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  TextInput,
  Modal,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

import {
  listenToActiveRequests,
  acceptBloodRequestWithCooldown,
  checkAndExpireRequests,
} from "../services/dataService";

import { logoutUser } from "../services/authService";
import AppText from "../components/AppText";
import { useTheme } from "../context/ThemeContext";
import { canDonateTo, compatibleWith } from "../utils/bloodCompatibility";
import * as Clipboard from "expo-clipboard";

export default function DonorDashboard({ user, setUser }) {
  const navigation = useNavigation();
  const { colors, isDark, toggleTheme } = useTheme();

  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [available, setAvailable] = useState(user.available ?? true);

  const [filters, setFilters] = useState({ city: "", urgency: "", hospital: "" });
  const [searchText, setSearchText] = useState("");
  const [filterModal, setFilterModal] = useState(false);

  const donorBlood = user.bloodType || "";
  const donorCity = user.location || "";

  const heartbeat = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeat, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(heartbeat, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    let unsub;
    const init = async () => {
      unsub = listenToActiveRequests((data) => {
        setRequests(data);
        applyFilters(data);
        setLoading(false);
        setRefreshing(false);
      });
      checkAndExpireRequests();
    };
    init();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const applyFilters = (data) => {
    let result = data.filter((r) => canDonateTo(donorBlood, r.bloodType));
    if (filters.city) result = result.filter((r) => r.location.includes(filters.city));
    if (filters.urgency) result = result.filter((r) => r.urgency === filters.urgency);
    if (filters.hospital) result = result.filter((r) => r.hospital?.includes(filters.hospital));
    if (searchText) {
      result = result.filter(
        (r) => r.location.includes(searchText) || r.hospital?.includes(searchText)
      );
    }
    result.sort((a, b) => (b.urgency === "حرج" ? 1 : 0) - (a.urgency === "حرج" ? 1 : 0));
    setFiltered(result);
  };

  const toggleAvailability = async () => {
    const newStatus = !available;
    setAvailable(newStatus);
    await updateDoc(doc(db, "users", user.uid), { available: newStatus });
    setUser((p) => ({ ...p, available: newStatus }));
  };

  const handleAccept = async (requestId, phone) => {
    try {
      await acceptBloodRequestWithCooldown(requestId, user.uid, {
        bloodType: donorBlood,
        phone: user.phone,
        city: donorCity,
      });
      Alert.alert("جزاك الله خير", "تم تسجيل استجابتك");
      Linking.openURL(`tel:${phone}`);
    } catch (e) {
      Alert.alert("خطأ", e.message);
    }
  };

  const copyNumber = async (phone) => {
    await Clipboard.setStringAsync(phone);
    Alert.alert("تم النسخ");
  };

  const handleWhatsApp = (phone) => {
    Linking.openURL(`whatsapp://send?phone=${phone}`);
  };

  const renderItem = ({ item }) => {
    const critical = item.urgency === "حرج";
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderLeftColor: critical ? colors.critical : "transparent",
          },
        ]}
      >
        <View style={styles.row}>
          <AppText bold style={{ color: colors.primary, fontSize: 20 }}>
            {item.bloodType}
          </AppText>
          <View
            style={{
              backgroundColor: critical ? colors.critical : colors.warning + "30",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <AppText style={{ color: critical ? colors.white : colors.warning }}>
              {item.urgency}
            </AppText>
          </View>
        </View>
        <AppText style={{ color: colors.textLight }}>{item.location}</AppText>
        <AppText style={{ color: colors.textLight }}>{item.hospital || "غير محدد"}</AppText>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)}>
            <MaterialCommunityIcons name="phone" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleWhatsApp(item.phone)}>
            <MaterialCommunityIcons name="whatsapp" size={22} color="#25D366" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => copyNumber(item.phone)}>
            <MaterialCommunityIcons name="content-copy" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleAccept(item.id, item.phone)}>
            <MaterialCommunityIcons name="heart" size={22} color={colors.success} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const EmptyListMessage = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="heart-plus" size={70} color={colors.mediumGray} />
      <AppText bold style={[styles.emptyTitle, { color: colors.text }]}>الحمد لله، لا توجد طلبات حالياً</AppText>
      <AppText style={[styles.emptyText, { color: colors.textLight, textAlign: 'center' }]}>
        لا توجد نداءات تحتاج إلى دم في هذه اللحظة. يمكنك تفعيل حالة "متاح للتبرع" ليتم التواصل معك عند الحاجة.
      </AppText>
    </View>
  );

  const compatibilityText = compatibleWith(donorBlood);
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.topRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <MaterialCommunityIcons name="heart-pulse" size={34} color={colors.primary} />
            <AppText bold style={{ color: colors.text, fontSize: 20 }}>
              نبض
            </AppText>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity onPress={() => navigation.navigate("الملف الشخصي")}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme}>
              <MaterialCommunityIcons
                name={isDark ? "weather-sunny" : "weather-night"}
                size={24}
                color={colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("خروج", "متأكد؟", [
                  { text: "إلغاء" },
                  { text: "خروج", onPress: logoutUser },
                ])
              }
            >
              <MaterialCommunityIcons name="logout" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.hero}>
          <Animated.View style={{ transform: [{ scale: heartbeat }] }}>
            <MaterialCommunityIcons name="heart-pulse" size={42} color={colors.primary} />
          </Animated.View>
          <AppText bold style={{ color: colors.primary, marginTop: 6 }}>
            تبرعك ينقذ حياة
          </AppText>
          <AppText style={{ color: colors.textLight, textAlign: "center" }}>
            كل نبضة منك ممكن تعني حياة شخص
          </AppText>
        </View>

        <AppText style={{ color: colors.primary, marginBottom: 8, fontSize: 13 }}>
          {compatibilityText}
        </AppText>

        <TextInput
          placeholder="ابحث مدينة أو مستشفى"
          value={searchText}
          onChangeText={(t) => {
            setSearchText(t);
            applyFilters(requests);
          }}
          style={[styles.search, { backgroundColor: colors.input, color: colors.text }]}
          placeholderTextColor={colors.textLight}
        />

        <View style={styles.switchRow}>
          <AppText style={{ color: colors.text }}>متاح للتبرع</AppText>
          <Switch value={available} onValueChange={toggleAvailability} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(i) => i.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setRefreshing(false);
              }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={EmptyListMessage}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hero: { alignItems: "center", marginVertical: 14 },
  search: { padding: 10, borderRadius: 20, marginTop: 10 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  card: { margin: 12, padding: 14, borderRadius: 18, borderLeftWidth: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  actions: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  emptyContainer: { alignItems: "center", marginTop: 80, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 20, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 15, lineHeight: 22 }
});
