import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalIp, getPublicIp } from '../utils/network';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [usuario, setUsuario] = useState('');
  const [ipLocal, setIpLocal] = useState('');
  const [ipPublica, setIpPublica] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      const sessionData = await AsyncStorage.getItem('session');
      if (sessionData) {
        const { usuario } = JSON.parse(sessionData);
        setUsuario(usuario);
      }

      const ipL = await getLocalIp();
      const ipP = await getPublicIp();
      setIpLocal(ipL);
      setIpPublica(ipP);
    };

    cargarDatos();
  }, []);

  const cerrarSesion = async () => {
    await AsyncStorage.removeItem('session');
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };
    const { top } = useSafeAreaInsets();
  return (
    
    <SafeAreaView style={{ flex: 1 }} >
      <View style={[styles.header]}>
        <Image source={require('../assets/logograma.png')} style={styles.logo} />
        <Pressable onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>

      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Bienvenido, {usuario}</Text>
        <Text style={styles.text}>IP Local: {ipLocal}</Text>
        <Text style={styles.text}>IP Pública: {ipPublica}</Text>

        <Pressable style={styles.logoutButton} onPress={cerrarSesion}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#204b5e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(21, 170, 191)',
    elevation: 4,
    shadowColor: 'rgb(21, 170, 191)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain'
  },
  content: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    marginBottom: 10
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#cc0000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});

export default HomeScreen;
