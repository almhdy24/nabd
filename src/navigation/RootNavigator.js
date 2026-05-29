import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthChange, getUserData } from "../services/authService";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import SplashScreen from "../screens/SplashScreen";

export default function RootNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthChange(async (curr) => {
      if (curr) {
        const data = await getUserData(curr.uid);
        setUser({ ...curr, ...data });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Hide splash after 2.5 seconds
    const timer = setTimeout(() => setSplashVisible(false), 2500);

    return () => {
      unsubscribeAuth();
      clearTimeout(timer);
    };
  }, []);

  if (splashVisible) {
    return (
      <NavigationContainer>
        <SplashScreen />
      </NavigationContainer>
    );
  }

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? <AppNavigator user={user} setUser={setUser} /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
