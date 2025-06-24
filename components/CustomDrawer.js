// components/CustomDrawer.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getLocalIp, getPublicIp } from '../utils/network';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from '../context/SessionContext';

const CustomDrawer = ({ navigation }) => {
  const { session, logout, fotoUri, setFotoUri } = useSession();
  const [ipLocal, setIpLocal] = useState('');
  const [ipPublica, setIpPublica] = useState('');

  useEffect(() => {
      const cargarDatos = async () => {
      setIpLocal(await getLocalIp());
      setIpPublica(await getPublicIp());
      
    };
    cargarDatos();
  }, []);

  const cambiarFotoPerfil = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso denegado', 'No se puede acceder a la galería');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (resultado.canceled) return;

    const image = resultado.assets[0];
    const { token, usuario } = session;

    const formData = new FormData();
    formData.append('usuario', usuario);
    formData.append('foto', {
      uri: image.uri,
      name: `perfil-${usuario}.jpg`,
      type: 'image/jpeg',
    });

    try {
      const res = await fetch(
        'https://pruebas.siac.historiaclinica.org/api/mobile/cambiar-foto-perfil',
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const json = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', 'Foto actualizada con éxito');
        setFotoUri(image.uri);
      } else {
        Alert.alert('Error', json?.message || 'No se pudo subir la foto');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Ocurrió un error al subir la imagen');
    }
  };

  return (
    <DrawerContentScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={fotoUri ? { uri: fotoUri } : require('../assets/profile-default.png')}
          style={styles.avatar}
        />
        <Pressable onPress={cambiarFotoPerfil}>
          <Text style={{ color: '#aef', marginTop: 8, fontSize: 14 }}>Cambiar foto</Text>
        </Pressable>
        <Text style={styles.usuario}>
          Hola, {session?.usuario
            ? session.usuario.charAt(0).toUpperCase() + session.usuario.slice(1)
            : ''}
        </Text>
        <Text style={styles.ipText}>🌐 {ipPublica || 'Cargando...'}</Text>
        <Text style={styles.ipText}>🖧 {ipLocal || 'Cargando...'}</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Inicio')}
        >
          <Ionicons name="home-outline" size={22} color="#333" />
          <Text style={styles.menuText}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Citas')}
        >
          <Ionicons name="calendar-outline" size={22} color="#333" />
          <Text style={styles.menuText}>Citas</Text>
        </TouchableOpacity>

        <DrawerItem
          label="Perfil"
          labelStyle={styles.itemLabel}
          onPress={() => navigation.navigate('Profile')}
          icon={({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          )}
        />
        <DrawerItem
          label="Configuración"
          labelStyle={styles.itemLabel}
          onPress={() => alert('Proximamente')}
          icon={({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
        />
      </View>

      <View style={styles.footer}>
        <Pressable style={styles.logoutButton} onPress={logout}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#204b5e',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
  },
  usuario: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ipText: {
    color: '#aad',
    fontSize: 12,
    marginTop: 4,
  },
  body: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  itemLabel: {
    fontSize: 15,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#cc0000',
    padding: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default CustomDrawer;
