// App.js
import React, { useState, useEffect } from 'react';
import Toast from 'react-native-toast-message';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from './context/SessionContext';

import ErrorBoundary from './components/ErrorBoundary';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import SplashScreen from './screens/SplashScreen';
import CustomDrawer from './components/CustomDrawer';
import AppointmentsScreen from './screens/AppointmentsScreen';
import NewAppointmentScreen from './screens/NewAppointmentScreen';
import ProfileScreen from './screens/ProfileScreen';
import PatientsScreen from './screens/PatientsScreen';
import PatientDetailScreen from './screens/PatientDetailScreen';

import { Provider as PaperProvider } from 'react-native-paper';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

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
      <Drawer.Screen name="Mis Pacientes" component={PatientsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
    </Drawer.Navigator>
  );
}

function AppNavigator() {
  const { session, loading, tokenData } = useSession();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => setShowSplash(false);

  if (loading || showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  const now = Math.floor(Date.now() / 1000);
  const isExpired = !tokenData?.exp || now >= tokenData?.exp;

  if (isExpired) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Drawer" component={DrawerRoutes} />
            <Stack.Screen name="NewAppointment" component={NewAppointmentScreen} />
            <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Detalle del Paciente' }} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    async function checkForOTAUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Actualización disponible",
            "Se descargó una nueva versión. La app se reiniciará para aplicar los cambios.",
            [
              { text: "Aceptar", onPress: () => Updates.reloadAsync() }
            ]
          );
        }
      } catch (e) {
        console.warn("Error al buscar actualización OTA:", e);
      }
    }

    checkForOTAUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ErrorBoundary>
          <PaperProvider>
            <AppNavigator />
            <Toast />
          </PaperProvider>
        </ErrorBoundary>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
