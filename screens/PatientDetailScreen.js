// screens/PatientDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Linking, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSession } from '../context/SessionContext';
import AdmisionesPaciente from '../components/AdmisionesPaciente';
import ConsultasResumen from '../components/ConsultasResumen';

const PatientDetailScreen = ({ route }) => {
  const navigation = useNavigation();
  const { paciente } = route.params;
  const { tokenData, session } = useSession();

  const id_medico = tokenData?.id_especialista || '';
  const id_cli = tokenData?.id_cli || '';

  const [showDatos, setShowDatos] = useState(true);
  const [showAdmisiones, setShowAdmisiones] = useState(false);
  const [showConsultas, setShowConsultas] = useState(false);
  const [pesoTallaData, setPesoTallaData] = useState([]);

  useEffect(() => {
  const fetchPesoTalla = async () => {
    try {
      const response = await fetch(
        `https://pruebas.siac.historiaclinica.org/api/mobile/pacientes-peso-talla?id_paciente=${paciente.id_paciente}`,
        {
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        }
      );

      const json = await response.json();
      
      if (json.success) {
        setPesoTallaData(json.pacientes_talla || []);
      }
    } catch (error) {
      console.error("Error al obtener peso y talla:", error);
    }
  };

  fetchPesoTalla();
}, []);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Image source={require('../assets/logograma.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Bloque: Datos */}
        <TouchableOpacity onPress={() => setShowDatos(!showDatos)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Datos</Text>
          <Ionicons name={showDatos ? 'chevron-up' : 'chevron-down'} size={22} color="#204b5e" />
        </TouchableOpacity>
        {showDatos && (
          <View style={styles.sectionContent}>
            <Text style={styles.detail}>Nombre: {paciente.paciente}</Text>
            <Text style={styles.detail}>Cédula: {paciente.cedula}</Text>
            <Text style={styles.detail}>Edad: {paciente.edad} ({new Date(paciente.fecha_nacimiento).toLocaleDateString()})</Text>
            <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Llamar al paciente',
                    `¿Desea llamar al ${paciente.telef1}?`,
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Llamar',
                        onPress: () => Linking.openURL(`tel:${paciente.telef1}`),
                      },
                    ]
                  );
                }}
              >
                <Text style={[styles.detail, { color: '#007AFF', textDecorationLine: 'underline' }]}>
                  Teléfono: {paciente.telef1}
                </Text>
              </TouchableOpacity>
              {pesoTallaData.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <Text style={[styles.subtitle, { marginBottom: 8 }]}>
                    Peso, Talla y Presión
                  </Text>

                  {pesoTallaData.map((item, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: '#f9f9f9',
                        padding: 10,
                        marginBottom: 8,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#ccc',
                      }}
                    >
                      <Text>Peso: {item.peso} kg</Text>
                      <Text>Talla: {item.talla} cm</Text>
                      <Text>Presión: {item.presion}</Text>
                      <Text>
                        Fecha: {new Date(item.fecha).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

          </View>
          
        )}

        {/* Bloque: Admisiones */}
        <TouchableOpacity onPress={() => setShowAdmisiones(!showAdmisiones)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Admisiones</Text>
          <Ionicons name={showAdmisiones ? 'chevron-up' : 'chevron-down'} size={22} color="#204b5e" />
        </TouchableOpacity>
        {showAdmisiones && (
          <AdmisionesPaciente idPaciente={paciente.id_paciente} idCli={id_cli} idMedico={id_medico} />
        )}

        {/* Bloque: Consultas */}
        <TouchableOpacity onPress={() => setShowConsultas(!showConsultas)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Consultas</Text>
          <Ionicons name={showConsultas ? 'chevron-up' : 'chevron-down'} size={22} color="#204b5e" />
        </TouchableOpacity>
        {showConsultas && (
          <ConsultasResumen paciente={paciente} />
        )}
      </ScrollView>
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
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f0f8ff',
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#204b5e',
  },
  sectionContent: {
    padding: 16,
    backgroundColor: '#fff',
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
  },subtitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#204b5e',
  marginBottom: 6,
},
});

export default PatientDetailScreen;
