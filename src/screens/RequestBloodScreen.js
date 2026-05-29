import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "../components/AppText";
import { useTheme } from "../context/ThemeContext";
import { createBloodRequest } from "../services/dataService";
import { bloodTypes } from "../utils/bloodCompatibility";

const CITY_PRESETS = [
  "كوستي",
  "ربك",
  "الدويم",
  "القطينة",
  "تندلتي",
  "الجبلين",
];

const HOSPITAL_PRESETS = [
  "مستشفى كوستي التعليمي",
  "مستشفى ربك",
  "مستشفى القطينة",
  "مستشفى الدويم",
  "مستشفى تندلتي",
  "مستشفى الجبلين",
  "مستشفى السلام بكوستي",
];

export default function RequestBloodScreen({ user, navigation }) {
  const { colors } = useTheme();

  const [bloodType, setBloodType] = useState(bloodTypes[0]);
  const [units, setUnits] = useState("");
  const [urgency, setUrgency] = useState("عادي");
  const [location, setLocation] = useState("");
  const [hospital, setHospital] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.uid) {
      Alert.alert("خطأ", "يجب تسجيل الدخول أولاً");
      return;
    }

    if (!units || !phone || !location) {
      Alert.alert(
        "حقول ناقصة",
        "الرجاء إدخال المدينة، عدد الوحدات، ورقم الهاتف"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await createBloodRequest({
        bloodType,
        units: parseInt(units),
        urgency,
        location: location.trim(),
        hospital: hospital.trim() || "غير محدد",
        phone,
        createdBy: user.uid,
      });

      Alert.alert(
        "تم نشر النداء",
        "نسأل الله أن تجد متبرعين في أقرب وقت. جزاك الله خيراً على مبادرتك."
      );

      // Reset form
      setUnits("");
      setPhone("");
      setHospital("");
      setLocation("");
      setUrgency("عادي");
      setBloodType(bloodTypes[0]);

      // Navigate back to dashboard (RequestorDashboard)
      navigation.goBack();
    } catch (e) {
      Alert.alert("حدث خطأ", e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleRow}>
        <MaterialCommunityIcons
          name="blood-bag"
          size={32}
          color={colors.primary}
        />

        <AppText
          bold
          style={[styles.title, { color: colors.text }]}
        >
          نشر نداء تبرع بالدم
        </AppText>
      </View>

      <AppText
        bold
        style={[styles.label, { color: colors.text }]}
      >
        فصيلة الدم المطلوبة *
      </AppText>

      <View style={styles.chipGrid}>
        {bloodTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.chip,
              {
                borderColor: colors.primary,
              },
              bloodType === type && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => setBloodType(type)}
          >
            <AppText
              bold
              style={[
                styles.chipText,
                {
                  color:
                    bloodType === type
                      ? "#fff"
                      : colors.text,
                },
              ]}
            >
              {type}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <AppText
        bold
        style={[styles.label, { color: colors.text }]}
      >
        عدد الوحدات المطلوبة *
      </AppText>

      <TextInput
        placeholder="مثال: 2"
        keyboardType="numeric"
        value={units}
        onChangeText={setUnits}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.text,
          },
        ]}
        placeholderTextColor={colors.textLight}
      />

      <AppText
        bold
        style={[styles.label, { color: colors.text }]}
      >
        المدينة *
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetScroll}
      >
        {CITY_PRESETS.map((city) => (
          <TouchableOpacity
            key={city}
            onPress={() => setLocation(city)}
            style={[
              styles.presetChip,
              {
                backgroundColor: colors.mediumGray,
              },
            ]}
          >
            <AppText style={{ color: colors.text }}>
              {city}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        placeholder="أو اكتب اسم المدينة (مثال: كوستي، النيل الأبيض)"
        value={location}
        onChangeText={setLocation}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.text,
            marginTop: 4,
          },
        ]}
        placeholderTextColor={colors.textLight}
      />

      <AppText
        bold
        style={[styles.label, { color: colors.text }]}
      >
        المستشفى
      </AppText>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetScroll}
      >
        {HOSPITAL_PRESETS.map((h) => (
          <TouchableOpacity
            key={h}
            onPress={() => setHospital(h)}
            style={[
              styles.presetChip,
              {
                backgroundColor: colors.mediumGray,
              },
            ]}
          >
            <AppText style={{ color: colors.text }}>
              {h}
            </AppText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TextInput
        placeholder="أو اكتب اسم المستشفى"
        value={hospital}
        onChangeText={setHospital}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.text,
            marginTop: 4,
          },
        ]}
        placeholderTextColor={colors.textLight}
      />

      <AppText
        bold
        style={[styles.label, { color: colors.text }]}
      >
        درجة الاستعجال
      </AppText>

      <View style={styles.urgencyRow}>
        <TouchableOpacity
          style={[
            styles.urgencyBtn,
            urgency === "عادي" && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setUrgency("عادي")}
        >
          <AppText bold style={{ color: urgency === "عادي" ? "#fff" : colors.text }}>عادي</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.urgencyBtn,
            urgency === "عاجل" && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setUrgency("عاجل")}
        >
          <AppText bold style={{ color: urgency === "عاجل" ? "#fff" : colors.text }}>عاجل</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.urgencyBtn,
            urgency === "حرج" && {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={() => setUrgency("حرج")}
        >
          <AppText bold style={{ color: urgency === "حرج" ? "#fff" : colors.text }}>حالة حرجة</AppText>
        </TouchableOpacity>
      </View>

      <AppText
        bold
        style={[styles.label, { color: colors.text }]}
      >
        رقم الهاتف للتواصل *
      </AppText>

      <TextInput
        placeholder="0912345678"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
        style={[
          styles.input,
          {
            backgroundColor: colors.input,
            color: colors.text,
          },
        ]}
        placeholderTextColor={colors.textLight}
      />

      <TouchableOpacity
        style={[
          styles.submitBtn,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText
            bold
            style={styles.submitBtnText}
          >
            نشر النداء
          </AppText>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  presetScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  urgencyBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  submitBtn: {
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 18,
  },
});
