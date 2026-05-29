import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RequestorDashboard from '../screens/RequestorDashboard';
import RequestBloodScreen from '../screens/RequestBloodScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AboutScreen from '../screens/AboutScreen';
import NotificationHistoryScreen from '../screens/NotificationHistoryScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export default function RequestorTabs({ user, setUser }) {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'الرئيسية') iconName = 'home-variant';
          else if (route.name === 'طلب جديد') iconName = 'plus-circle';
          else if (route.name === 'الإشعارات') iconName = 'bell';
          else if (route.name === 'الملف الشخصي') iconName = 'account-circle';
          else if (route.name === 'عن التطبيق') iconName = 'information';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: { backgroundColor: colors.card, borderTopWidth: 0, elevation: 0 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="الرئيسية">
        {props => <RequestorDashboard {...props} user={user} setUser={setUser} />}
      </Tab.Screen>
      <Tab.Screen name="طلب جديد">
        {props => <RequestBloodScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="الإشعارات">
        {props => <NotificationHistoryScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="الملف الشخصي">
        {props => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="عن التطبيق" component={AboutScreen} />
    </Tab.Navigator>
  );
}
