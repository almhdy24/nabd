import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthChange, getUserData } from "../services/authService";
import { registerForPushNotificationsAsync } from "../services/notificationService";
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
        // First get user data from Firestore
        const data = await getUserData(curr.uid);
        let fullUser = { ...curr, ...data };

        // Register push notification and save token
        const token = await registerForPushNotificationsAsync(fullUser.uid);
        if (token) {
          // Re-fetch user data to get updated pushTokens array
          const updatedData = await getUserData(curr.uid);
          fullUser = { ...fullUser, ...updatedData };
        }
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const splashTimer = setTimeout(() => setSplashVisible(false), 2500);
    return () => {
      unsubscribeAuth();
      clearTimeout(splashTimer);
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
