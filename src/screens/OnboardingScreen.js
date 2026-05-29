import React, { useState } from "react";
import {
  View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import AppText from "../components/AppText";
import { Colors } from "../theme/colors";
import { bloodTypes } from "../utils/bloodCompatibility";

export default function OnboardingScreen({ user, onComplete, setUser }) {
  const [bloodType, setBloodType] = useState(bloodTypes[0]);
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user?.uid) return;
    if (!bloodType || !phone.trim() || !city.trim()) {
      Alert.alert("خطأ", "الرجاء إدخال فصيلة الدم والمدينة ورقم الهاتف");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        bloodType,
        location: city.trim(),
        phone: phone.trim(),
        available: true,
      };
      await setDoc(doc(db, "users", user.uid), userData, { merge: true });

      // Update local user state
      if (setUser) {
        setUser(prev => ({ ...prev, ...userData }));
      }

      if (onComplete) onComplete();
    } catch (e) {
      Alert.alert("خطأ", "فشل حفظ المعلومات، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MaterialCommunityIcons name="account-edit" size={48} color={Colors.primary} />
      <AppText bold style={styles.title}>أكمل حسابك</AppText>
      <AppText style={styles.subtitle}>هذه المعلومات ضرورية لتتمكن من التبرع وإنقاذ الأرواح</AppText>

      <AppText bold style={styles.label}>فصيلة الدم *</AppText>
      <View style={styles.bloodGrid}>
        {bloodTypes.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.bloodBtn, bloodType === type && styles.bloodBtnActive]}
            onPress={() => setBloodType(type)}
          >
            <AppText style={[styles.bloodBtnText, bloodType === type && styles.bloodBtnTextActive]}>{type}</AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText bold style={styles.label}>المدينة *</AppText>
      <TextInput
        placeholder="مثال: الخرطوم"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />

      <AppText bold style={styles.label}>رقم الهاتف *</AppText>
      <TextInput
        placeholder="0912345678"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <AppText bold style={styles.submitBtnText}>حفظ وإكمال</AppText>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: Colors.lightGray },
  title: { fontSize: 22, marginTop: 20, marginBottom: 10, color: Colors.primary },
  subtitle: { textAlign: "center", marginBottom: 24, color: Colors.textLight },
  label: { alignSelf: "flex-start", marginBottom: 8, fontSize: 15 },
  input: { fontFamily: "Cairo", backgroundColor: Colors.white, width: "100%", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.mediumGray, fontSize: 16, marginBottom: 16, textAlign: "right" },
  bloodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16, alignSelf: "flex-start" },
  bloodBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: Colors.mediumGray, backgroundColor: Colors.white },
  bloodBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  bloodBtnText: { color: Colors.text, fontSize: 16 },
  bloodBtnTextActive: { color: Colors.white },
  submitBtn: { backgroundColor: Colors.primary, width: "100%", padding: 16, borderRadius: 14, alignItems: "center", marginTop: 10 },
  submitBtnText: { color: Colors.white, fontSize: 18 }
});
