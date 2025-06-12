import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useSession } from '../context/SessionContext';

const ClinicaSelector = ({ id_medico, onSelectClinica }) => {
  const [clinicas, setClinicas] = useState([]);
  const [selectedClinica, setSelectedClinica] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();

  const baseImageUrl = 'https://siac.empresas.historiaclinica.org/';

  useEffect(() => {
    const fetchClinicas = async () => {
      if (!session?.token) return;

      try {
        const response = await fetch(
          `https://pruebas.siac.historiaclinica.org/api/mobile/clinicas_med?id_medico=${id_medico}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        );

        const json = await response.json();
        
        if (json.success && json.clinicas?.length > 0) {
          setClinicas(json.clinicas);

          if (json.clinicas.length === 1) {
            setSelectedClinica(json.clinicas[0]);
            onSelectClinica?.(json.clinicas[0]);
          }
        } else {
          console.warn('No se encontraron clínicas válidas');
        }
      } catch (error) {
        console.error('Error al obtener clínicas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicas();
  }, [id_medico, session?.token]);

  const handleSelect = (clinica) => {
    setSelectedClinica(clinica);
    setIsDropdownVisible(false);
    onSelectClinica?.(clinica);
    onClinicaSelect?.(clinica.id_cli);
  };

  if (loading) return <ActivityIndicator size="large" color="#000" />;

  return (
    <View style={styles.container}>
      {selectedClinica ? (
        <TouchableOpacity onPress={() => setIsDropdownVisible(true)} style={styles.logoContainer}>
          <Image
            source={{ uri: `${baseImageUrl}${selectedClinica.logo_empresa.replace('../', '')}` }}
            style={styles.logoGrande}
            resizeMode="contain"
          />
        </TouchableOpacity>
      ) : (
        <Text style={styles.label}>Selecciona una clínica</Text>
      )}

      {isDropdownVisible && (
        <FlatList
          data={clinicas}
          keyExtractor={(item) => item.id_cli.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item)}>
              <Image
                source={{ uri: `${baseImageUrl}${item.logo_empresa.replace('../', '')}` }}
                style={styles.logoMini}
              />
              <Text style={styles.itemText}>{item.apellidos}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        margin: 5,
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    dropdown: {
        width: '90%',
        maxHeight: 250,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingVertical: 2,
    },
    logoMini: {
        width: 30,
        height: 30,
        marginRight: 10,
    },
    logoGrande: {
        width: 100,
        height: 50,
        resizeMode: 'contain',
    },
    logoContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 2,
        borderRadius: 2,
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
    },
    itemText: {
        fontSize: 16,
    },
});

export default ClinicaSelector;
