import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging'; // 🔁 FCM

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // 🔁 Registro de token FCM real
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
      // 👇 Solicitar permisos y obtener token FCM
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('🚫 Permiso de notificaciones no concedido.');
        return;
      }

      const pushToken = await messaging().getToken();
      console.log('✅ Token FCM:', pushToken);

      // 👇 Enviar token a tu backend
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

      const data = await response.json();
      console.log('📡 Registro del token:', data);

    } catch (error) {
      console.error('❌ Error registrando token FCM:', error);
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
