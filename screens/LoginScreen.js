
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { getLocalIp, getPublicIp } from '../utils/network';
import AsyncStorage from '@react-native-async-storage/async-storage';



const LoginScreen = ({ navigation }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const ip_local = await getLocalIp();
      const ip_internet = await getPublicIp();

      const response = await axios.post('https://pruebas.siac.historiaclinica.org/api/login', {
        usuario,
        password,
        ip_internet,
        ip_local
      });
      console.log(response.data)

      if (response.data.success) {
        // Aquí puedes guardar el estado de sesión como tú quieras
        Alert.alert('Login exitoso');
        await AsyncStorage.setItem('usuario', JSON.stringify({
            usuario,
            token: response.data.token || null, }));
        console.log(response.data)
        // navigation.navigate('Home'); // si tienes otra pantalla
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title={loading ? "Cargando..." : "Ingresar"} onPress={handleLogin} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }
});

export default LoginScreen;
