import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import AppText from "../components/AppText";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SplashScreen() {
  const { colors } = useTheme();

  const pulse = useRef(new Animated.Value(1)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.15,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ alignItems: "center", opacity: fade }}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <MaterialCommunityIcons
            name="heart-pulse"
            size={90}
            color={colors.primary}
          />
        </Animated.View>

        <AppText bold style={[styles.title, { color: colors.primary }]}>
          نبض
        </AppText>

        <AppText style={[styles.subtitle, { color: colors.text }]}>
          Nabd – Blood Donation Sudan
        </AppText>

        <AppText style={[styles.tagline, { color: colors.textLight }]}>
          نبض الحياة يبدأ منك
        </AppText>
      </Animated.View>

      <View style={styles.bottom}>
        <AppText style={styles.verse}>
          "وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا"
        </AppText>
        <AppText style={styles.ref}>
          القرآن الكريم – سورة المائدة (32)
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 44, marginTop: 10 },
  subtitle: { fontSize: 13, marginTop: 4 },
  tagline: { fontSize: 16, marginTop: 10, fontStyle: "italic" },
  bottom: {
    position: "absolute",
    bottom: 60,
    paddingHorizontal: 20,
    alignItems: "center"
  },
  verse: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#888",
  },
  ref: {
    marginTop: 6,
    fontSize: 11,
    color: "#666",
  }
});
