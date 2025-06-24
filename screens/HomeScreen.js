import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPublicIp } from '../utils/network'; // local IP ya no es necesaria
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {  
  const [ipPublica, setIpPublica] = useState('');
  useEffect(() => {
    
    const cargarDatos = async () => {
      const ipP = await getPublicIp();
      setIpPublica(ipP);
    };
    cargarDatos();
  }, []);

    const { top } = useSafeAreaInsets();
    const { tokenData } = useSession();      
    const nombreCompleto = `${tokenData?.nombre || ''} ${tokenData?.apellidos || ''}`.trim();
    
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={[styles.header]}>
        <Image source={require('../assets/logograma.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>SIAC</Text>
        <Text style={styles.subtitle}>medica</Text>

        {/* Mostramos el nombre completo del usuario */}
        <Text style={styles.text}>{nombreCompleto}</Text>
        <Text style={styles.text}>IP Pública: {ipPublica}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.appointmentsButton}
          onPress={() => navigation.navigate('Citas')}
        >
          <Ionicons name="calendar-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.appointmentsText}>Ver Agenda</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.appointmentsButton}
          onPress={() => navigation.navigate('Mis Pacientes')}
        >
          <Ionicons name="accessibility-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.appointmentsText}>Mis Pacientes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: '800',
    marginBottom: 0
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  text: {
    fontSize: 16,
    marginBottom: 10
  },
  appointmentsButton: {
    backgroundColor: '#204b5e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row'
  },
  appointmentsText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default HomeScreen;
