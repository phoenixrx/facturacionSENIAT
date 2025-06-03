// app/index.tsx
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header personalizado */}
      <View style={styles.header}>
        {/* Logo a la izquierda */}
        <Image
          source={{
            uri: 'https://siac.empresas.historiaclinica.org/images/logograma.png', 
          }}
          style={styles.logo}
          resizeMode="contain"
        />


        {/* Botón hamburguesa a la derecha */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <MaterialIcons name="dehaze" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Contenido inferior */}
      <View style={styles.content}>
        <Text>Bienvenido a SIACmedica</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#17303a',
    elevation: 4,
    shadowOpacity: 0.2,
    width: '100%',
  },
  logo: {
    width: 150,
    height: 40,
  },
  appName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  menuButton: {
    padding: 10,
  },
  menuText: {
    color: 'white',
    fontSize: 24,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
});