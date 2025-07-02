import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          setSession(parsed);
          if (parsed.foto) setFotoUri(parsed.foto);

          const [_, payloadPart] = JSON.stringify(parsed).split('.');
          const tokenDecoded = decodeJWT_local(payloadPart);
          const token_d = JSON.parse(tokenDecoded);

          if (!token_d.id_especialista) {
            Alert.alert('No autorizado', 'Su cuenta no tiene permisos de especialista médico. Cerrando sesión.');
            await logout();
            return;
          }

          setTokenData(token_d);
        }
      } catch (error) {
        console.error('Error cargando la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // Registramos el token de notificación en un efecto aparte
  useEffect(() => {
    if (session && tokenData) {
      registerPushToken(session.token, tokenData.id_especialista);
    }
  }, [session, tokenData]);

  const login = async (sessionData) => {
    try {
      await AsyncStorage.setItem('session', JSON.stringify(sessionData));
      setSession(sessionData);

      if (sessionData.fotoUri) setFotoUri(sessionData.fotoUri);

      const [_, payloadPart] = JSON.stringify(sessionData).split('.');
      const tokenDecoded = decodeJWT_local(payloadPart);
      const token_d = JSON.parse(tokenDecoded);

      if (!token_d.id_especialista) {
        alert('No autorizado', 'Su cuenta no tiene permisos de especialista médico. Cerrando sesión.');
        await logout();
        return;
      }

      setTokenData(token_d);
    } catch (error) {
      console.error('Error guardando la sesión:', error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('session');
    } catch (error) {
      console.error('Error eliminando la sesión:', error);
    } finally {
      setSession(null);
      setFotoUri(null);
    }
  };

  const decodeJWT_local = (token) => {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding !== 0) {
      base64 += '='.repeat(4 - padding);
    }
    return atob(base64);
  };

  const registerPushToken = async (authToken, idMedico) => {
    try {
      console.log("🔔 Intentando registrar push token...");

      if (!Device.isDevice) {
        console.log("📱 No es un dispositivo físico. Registro cancelado.");
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log("🚫 Permiso de notificaciones no concedido.");
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = tokenData.data;
      console.log("✅ Token generado:", pushToken);

      const response = await fetch('https://pruebas.siac.historiaclinica.org/api/mobile/registrar-token-push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id_medico: idMedico,
          push_token: pushToken,
          plataforma: Platform.OS,
        }),
      });

      const result = await response.json();
      console.log("📬 Respuesta al registrar token:", result);
    } catch (error) {
      console.error("❌ Error registrando token de notificación:", error);
    }
  };

  return (
    <SessionContext.Provider
      value={{ session, fotoUri, setFotoUri, login, logout, loading, tokenData }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
export { SessionContext };
