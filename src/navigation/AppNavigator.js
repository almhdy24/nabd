import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import DonorTabs from "./DonorTabs";
import RequestorTabs from "./RequestorTabs";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ user, setUser }) {
  const [profileCompleted, setProfileCompleted] = useState(
    user.role === "donor" ? !!user.bloodType : true
  );

  // Donor onboarding (if not completed)
  if (user.role === "donor" && !profileCompleted) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen 
              {...props} 
              user={user}
              setUser={setUser}
              onComplete={() => setProfileCompleted(true)} 
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // After onboarding, show bottom tabs
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user.role === "donor" ? (
        <Stack.Screen name="DonorTabs">
          {props => <DonorTabs {...props} user={user} setUser={setUser} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="RequestorTabs">
          {props => <RequestorTabs {...props} user={user} setUser={setUser} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
