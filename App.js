import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SplashScreen from './screens/SplashScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // usamos nuestro encabezado personalizado
        drawerActiveTintColor: '#204b5e',
        drawerLabelStyle: { fontSize: 16 }
      }}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      {/* Puedes añadir más pantallas aquí si quieres */}
    </Drawer.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await AsyncStorage.getItem('session');
      setIsLoggedIn(!!session);
    };
    checkSession();
  }, []);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) return <SplashScreen onFinish={handleSplashFinish} />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="Drawer" component={DrawerRoutes} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
