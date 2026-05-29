import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../components/AppText";
import { Colors } from "../theme/colors";
import { loginWithEmail, registerWithEmail } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("تنبيه", "يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }

    setLoading(true);
    try {
      if (isLoginMode) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, role);
      }
    } catch (error) {
      Alert.alert("خطأ", "تأكد من البيانات أو الاتصال بالشبكة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.card}>

          {/* Brand Header */}
          <MaterialCommunityIcons
            name="heart-pulse"
            size={70}
            color={Colors.primary}
          />

          <AppText bold style={styles.brand}>
            نبض
          </AppText>

          <AppText style={styles.subtitle}>
            Nabd – Blood Donation Sudan
          </AppText>

          <View style={styles.taglineRow}>
            <MaterialCommunityIcons
              name="pulse"
              size={18}
              color={Colors.primary}
            />
            <AppText style={styles.tagline}>
              نبض الحياة يبدأ منك
            </AppText>
          </View>

          {/* Form Card */}
          <View style={styles.form}>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={Colors.mediumGray}
              />
              <TextInput
                placeholder="البريد الإلكتروني"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={18}
                color={Colors.mediumGray}
              />
              <TextInput
                placeholder="كلمة المرور"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>

            {/* Role Selection */}
            {!isLoginMode && (
              <View style={styles.roleContainer}>

                <AppText style={styles.roleLabel}>
                  اختر نوع الحساب
                </AppText>

                <View style={styles.roleButtons}>

                  <TouchableOpacity
                    style={[
                      styles.roleBtn,
                      role === "donor" && styles.roleActive,
                    ]}
                    onPress={() => setRole("donor")}
                  >
                    <MaterialCommunityIcons
                      name="hand-heart"
                      size={18}
                      color={role === "donor" ? "#fff" : Colors.primary}
                    />
                    <AppText
                      style={
                        role === "donor"
                          ? styles.roleTextActive
                          : styles.roleText
                      }
                    >
                      متبرع
                    </AppText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleBtn,
                      role === "requestor" && styles.roleActive,
                    ]}
                    onPress={() => setRole("requestor")}
                  >
                    <MaterialCommunityIcons
                      name="hospital-box"
                      size={18}
                      color={role === "requestor" ? "#fff" : Colors.primary}
                    />
                    <AppText
                      style={
                        role === "requestor"
                          ? styles.roleTextActive
                          : styles.roleText
                      }
                    >
                      طلب دم
                    </AppText>
                  </TouchableOpacity>

                </View>
              </View>
            )}

            {/* Button */}
            <TouchableOpacity
              style={styles.mainBtn}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <AppText bold style={{ color: "#fff" }}>
                  {isLoginMode ? "دخول" : "إنشاء حساب"}
                </AppText>
              )}
            </TouchableOpacity>

            {/* Switch Mode */}
            <TouchableOpacity
              onPress={() => setIsLoginMode(!isLoginMode)}
              style={{ marginTop: 18 }}
            >
              <AppText style={styles.switchText}>
                {isLoginMode
                  ? "ليس لديك حساب؟ إنشاء حساب جديد"
                  : "لديك حساب؟ تسجيل الدخول"}
              </AppText>
            </TouchableOpacity>

          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.lightGray,
  },

  card: {
    backgroundColor: "#fff",
    padding: 26,
    borderRadius: 28,
    alignItems: "center",
  },

  brand: {
    fontSize: 36,
    marginTop: 10,
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 6,
  },

  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
  },

  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    color: Colors.textLight,
  },

  form: {
    width: "100%",
    marginTop: 10,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGray,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 52,
    gap: 8,
  },

  input: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Cairo",
  },

  roleContainer: {
    marginTop: 10,
    marginBottom: 14,
  },

  roleLabel: {
    textAlign: "right",
    marginBottom: 10,
    color: Colors.textLight,
    fontSize: 13,
  },

  roleButtons: {
    flexDirection: "row",
    gap: 10,
  },

  roleBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    justifyContent: "center",
    alignItems: "center",
  },

  roleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  roleText: {
    color: Colors.primary,
  },

  roleTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  mainBtn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },

  switchText: {
    color: Colors.primary,
    textAlign: "center",
    fontSize: 13,
  },
});
