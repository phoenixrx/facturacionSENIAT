// context/SessionContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('session');
        if (storedSession) {
          const parsed = JSON.parse(storedSession);
          setSession(parsed);
          if (parsed.fotoUri) {
            setFotoUri(parsed.fotoUri);
          }
        
        const [headerPart, payloadPart, signaturePart] = JSON.stringify(storedSession).split('.');
        let token_decoded = decodeJWT_local(payloadPart)
        setTokenData(JSON.parse(token_decoded)); 
        
        }
      } catch (error) {
        console.error('Error cargando la sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (sessionData) => {
    try {
      await AsyncStorage.setItem('session', JSON.stringify(sessionData));
      setSession(sessionData);
      if (sessionData.fotoUri) {
        setFotoUri(sessionData.fotoUri);
      }

      const [headerPart, payloadPart, signaturePart] = JSON.stringify(sessionData).split('.');
        let token_decoded = decodeJWT_local(payloadPart)
        setTokenData(JSON.parse(token_decoded));          
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

    function decodeJWT_local(token) {
        let base64 = token
        .replace(/-/g, '+')  // Convertir '-' a '+'
        .replace(/_/g, '/'); // Convertir '_' a '/'
        const padding = base64.length % 4;
        if (padding !== 0) {
            base64 += '='.repeat(4 - padding);
        }
        return atob(base64);
        }
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