// App.js
import React, { useState } from 'react';
import Toast from 'react-native-toast-message';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from './context/SessionContext';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SplashScreen from './screens/SplashScreen';
import CustomDrawer from './components/CustomDrawer';
import AppointmentsScreen from './screens/AppointmentsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      <Drawer.Screen name="Citas" component={AppointmentsScreen} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { session, loading } = useSession();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => setShowSplash(false);

  if (loading || showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Drawer" component={DrawerRoutes} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <AppNavigator />
        <Toast />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
