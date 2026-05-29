import React from "react";
import { Text, StyleSheet } from "react-native";
import { Colors } from "../theme/colors";

const AppText = ({ style, children, bold, color, ...rest }) => {
  return (
    <Text
      style={[
        styles.base,
        bold && styles.bold,
        color ? { color } : {},   // كان null والآن {} لتفادي التحذير
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: "Cairo",
    color: Colors.text,
  },
  bold: {
    fontFamily: "Cairo-Bold",
  },
});

export default AppText;
