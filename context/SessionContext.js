// context/SessionContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [fotoUri, setFotoUri] = useState(null);
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

  return (
    <SessionContext.Provider
      value={{ session, fotoUri, setFotoUri, login, logout, loading }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
