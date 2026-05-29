import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../components/AppText";
import { useTheme } from "../context/ThemeContext";

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>

        {/* Brand Icon */}
        <MaterialCommunityIcons
          name="heart-pulse"
          size={72}
          color={colors.primary}
        />

        <AppText bold style={[styles.title, { color: colors.primary }]}>
          نبض
        </AppText>

        <AppText style={[styles.subtitle, { color: colors.textLight }]}>
          Nabd – Blood Donation Sudan
        </AppText>

        <View style={styles.taglineRow}>
          <MaterialCommunityIcons
            name="pulse"
            size={18}
            color={colors.primary}
          />
          <AppText style={[styles.tagline, { color: colors.text }]}>
            نبض الحياة يبدأ منك
          </AppText>
        </View>

        <View style={styles.separator} />

        {/* Description */}
        <AppText style={[styles.message, { color: colors.text }]}>
          تطبيق "نبض" هو مشروع مجتمعي سوداني يهدف إلى ربط المرضى المحتاجين
          للدم بالمتبرعين في أسرع وقت ممكن وقت الأزمات.
        </AppText>

        <AppText style={[styles.message, { color: colors.text }]}>
          التطبيق صُمم بروح إنسانية سودانية، لتسهيل الوصول للدم وإنقاذ الأرواح
          في الوقت المناسب.
        </AppText>

        {/* Quran */}
        <View style={styles.quoteBox}>
          <MaterialCommunityIcons
            name="book-open-variant"
            size={20}
            color={colors.primary}
          />

          <AppText style={[styles.quoteText, { color: colors.textLight }]}>
            "وَمَنْ أَحْيَاهَا فَكَأَنَّمَا أَحْيَا النَّاسَ جَمِيعًا"
          </AppText>
        </View>

        <View style={styles.sourceRow}>
          <MaterialCommunityIcons
            name="book"
            size={14}
            color={colors.textLight}
          />
          <AppText style={styles.source}>
            سورة المائدة – الآية 32
          </AppText>
        </View>

        {/* Hadith */}
        <View style={styles.quoteBox}>
          <MaterialCommunityIcons
            name="hand-heart"
            size={20}
            color={colors.primary}
          />

          <AppText style={[styles.quoteText, { color: colors.textLight }]}>
            "من نفس عن مؤمن كربة من كرب الدنيا، نفس الله عنه كربة من كرب يوم القيامة"
          </AppText>
        </View>

        <View style={styles.sourceRow}>
          <MaterialCommunityIcons
            name="book"
            size={14}
            color={colors.textLight}
          />
          <AppText style={styles.source}>
            صحيح مسلم – حديث رقم 2699
          </AppText>
        </View>

        <View style={styles.separator} />

        {/* Mission */}
        <View style={styles.missionHeader}>
          <MaterialCommunityIcons
            name="target"
            size={18}
            color={colors.primary}
          />
          <AppText bold style={[styles.teamTitle, { color: colors.primary }]}>
            رسالتنا
          </AppText>
        </View>

        <AppText
          style={{
            color: colors.textLight,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          أن يكون الوصول إلى الدم أسرع وأسهل في السودان {"\n"}
          وأن يصبح التبرع ثقافة حياة لا مجرد استجابة طارئة
        </AppText>

        {/* Footer */}
        <View style={styles.footer}>
          <MaterialCommunityIcons
            name="school"
            size={16}
            color={colors.textLight}
          />

          <AppText
            style={{
              color: colors.textLight,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            مشروع تخرج – جامعة النيل الأبيض
          </AppText>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: 20,
    alignItems: "center",
  },
  card: {
    padding: 26,
    borderRadius: 28,
    width: "100%",
    alignItems: "center",
  },

  title: {
    fontSize: 34,
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
    marginTop: 6,
  },

  tagline: {
    fontSize: 15,
    fontStyle: "italic",
  },

  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    width: "80%",
    marginVertical: 18,
  },

  message: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 23,
  },

  quoteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginVertical: 10,
  },

  quoteText: {
    fontSize: 14,
    fontStyle: "italic",
    flex: 1,
    lineHeight: 22,
  },

  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },

  source: {
    fontSize: 11,
    color: "#999",
  },

  missionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginBottom: 6,
  },

  teamTitle: {
    fontSize: 18,
  },

  footer: {
    marginTop: 16,
    alignItems: "center",
  },
});
