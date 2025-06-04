import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalIp, getPublicIp } from '../utils/network';

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
    navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
        });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido, {usuario}!</Text>
      <Text style={styles.text}>IP Local: {ipLocal}</Text>
      <Text style={styles.text}>IP Pública: {ipPublica}</Text>
      <View style={{ marginTop: 30 }}>
        <Button title="Cerrar sesión" onPress={cerrarSesion} color="#cc0000" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 16, marginBottom: 10 }
});

export default HomeScreen;
