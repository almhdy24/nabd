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
import { useTheme } from "../context/ThemeContext";
import { loginWithEmail, registerWithEmail } from "../services/authService";

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loading, setLoading] = useState(false);

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'البريد الإلكتروني غير صالح';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب';
      case 'auth/user-not-found':
        return 'لا يوجد حساب مرتبط بهذا البريد';
      case 'auth/wrong-password':
        return 'كلمة المرور غير صحيحة';
      case 'auth/email-already-in-use':
        return 'هذا البريد مسجل بالفعل';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل)';
      case 'auth/network-request-failed':
        return 'فشل الاتصال بالإنترنت، تأكد من اتصالك';
      case 'auth/too-many-requests':
        return 'تم تعطيل الحساب مؤقتاً بسبب محاولات كثيرة. حاول لاحقاً';
      default:
        return 'حدث خطأ غير متوقع، حاول مرة أخرى';
    }
  };

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
      const errorMessage = getFirebaseErrorMessage(error.code);
      Alert.alert("خطأ", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="heart-pulse" size={70} color={colors.primary} />
          <AppText bold style={[styles.brand, { color: colors.primary }]}>نبض</AppText>
          <AppText style={[styles.subtitle, { color: colors.textLight }]}>Nabd – Blood Donation Sudan</AppText>
          <View style={styles.taglineRow}>
            <MaterialCommunityIcons name="pulse" size={18} color={colors.primary} />
            <AppText style={[styles.tagline, { color: colors.textLight }]}>نبض الحياة يبدأ منك</AppText>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.input }]}>
              <MaterialCommunityIcons name="email-outline" size={18} color={colors.textLight} />
              <TextInput
                placeholder="البريد الإلكتروني"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: colors.text }]}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.input }]}>
              <MaterialCommunityIcons name="lock-outline" size={18} color={colors.textLight} />
              <TextInput
                placeholder="كلمة المرور"
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { color: colors.text }]}
                secureTextEntry
                placeholderTextColor={colors.textLight}
              />
            </View>

            {!isLoginMode && (
              <View style={styles.roleContainer}>
                <AppText style={[styles.roleLabel, { color: colors.textLight }]}>اختر نوع الحساب</AppText>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleBtn,
                      { borderColor: colors.mediumGray },
                      role === "donor" && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setRole("donor")}
                  >
                    <MaterialCommunityIcons
                      name="hand-heart"
                      size={18}
                      color={role === "donor" ? colors.white : colors.primary}
                    />
                    <AppText
                      style={[
                        styles.roleText,
                        { color: role === "donor" ? colors.white : colors.primary },
                        role === "donor" && { fontWeight: "bold" }
                      ]}
                    >
                      متبرع
                    </AppText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleBtn,
                      { borderColor: colors.mediumGray },
                      role === "requestor" && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                    onPress={() => setRole("requestor")}
                  >
                    <MaterialCommunityIcons
                      name="hospital-box"
                      size={18}
                      color={role === "requestor" ? colors.white : colors.primary}
                    />
                    <AppText
                      style={[
                        styles.roleText,
                        { color: role === "requestor" ? colors.white : colors.primary },
                        role === "requestor" && { fontWeight: "bold" }
                      ]}
                    >
                      طلب دم
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.mainBtn, { backgroundColor: colors.primary }]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <AppText bold style={{ color: colors.white }}>
                  {isLoginMode ? "دخول" : "إنشاء حساب"}
                </AppText>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={{ marginTop: 18 }}>
              <AppText style={[styles.switchText, { color: colors.primary }]}>
                {isLoginMode ? "ليس لديك حساب؟ إنشاء حساب جديد" : "لديك حساب؟ تسجيل الدخول"}
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
  },
  card: {
    padding: 26,
    borderRadius: 28,
    alignItems: "center",
  },
  brand: {
    fontSize: 36,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 13,
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
  },
  form: {
    width: "100%",
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
  },
  roleText: {
    fontSize: 14,
  },
  mainBtn: {
    padding: 15,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  switchText: {
    textAlign: "center",
    fontSize: 13,
  },
});
