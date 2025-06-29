// screens/LoginScreen.js
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import axios from 'axios';
import { getLocalIp, getPublicIp } from '../utils/network';
import { useSession } from '../context/SessionContext';

const LoginScreen = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSession();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const ip_local = await getLocalIp();
      const ip_internet = await getPublicIp();

      const response = await axios.post(
        'https://pruebas.siac.historiaclinica.org/api/login',
        { usuario, password, ip_internet, ip_local }
      );

      const token = response?.data?.token;

      if (token) {
        const session = { usuario, token };
        login(session); 
      } else {
        Alert.alert('Error', 'Credenciales inválidas');
      }
    } catch (error) {
      if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
        if (error.response.status === 401) {
            Alert.alert('Error', 'Credenciales inválidas');
        } else {
            Alert.alert('Error', `Error del servidor: ${error.response.status}`);
        }
        } else if (error.request) {
            Alert.alert('Error', 'No se recibió respuesta del servidor');
        } else {
            // Algo sucedió al configurar la solicitud
            Alert.alert('Error', 'Error al configurar la solicitud');
        }
    } finally {
      setLoading(false);
    }
  };

const [isUsuarioFocused, setIsUsuarioFocused] = useState(false);
const [isPasswordFocused, setIsPasswordFocused] = useState(false);

return (
    <View style={styles.container}>
        <Image source={require('../assets/logograma.png')} style={styles.logo} />
        <TextInput
            placeholder="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            style={isUsuarioFocused ? styles.inputFocused : styles.input}
            autoCorrect={false}
            autoCapitalize="none"
            onFocus={() => setIsUsuarioFocused(true)}
            onBlur={() => setIsUsuarioFocused(false)}
        />
        <TextInput
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            style={isPasswordFocused ? styles.inputFocused : styles.input}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            onSubmitEditing={handleLogin}
        />
        <Button
            title={loading ? 'Cargando...' : 'Ingresar'}
            onPress={handleLogin}
            disabled={loading || !usuario || !password}
            color="#204b5e"
        />
    </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#113545'
    },
    container_safearea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        color: 'black',
        fontWeight: 'bold',
        backgroundColor: '#9AA4AF',
        marginBottom: 15,
        padding: 12,
        borderRadius: 8
    },
    inputFocused: {
        borderWidth: 1,
        borderColor: '#ccc',
        color: 'white',
        backgroundColor: 'black',
        marginBottom: 15,
        padding: 12,
        borderRadius: 8
    },
    logo: {
        width: 110,
        height: 50,
        marginBottom: 20,
        resizeMode: 'contain',
        alignItems: 'center',
        alignSelf: 'center'
    }
});

export default LoginScreen;
