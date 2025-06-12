import React, { useEffect, useState } from "react";
import { View, Text,  Image, ActivityIndicator, Alert, StyleSheet,FlatList, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSession } from "../context/SessionContext";

const ClinicaPicker = ({ idMedico }) => {
  const [clinicas, setClinicas] = useState([]);
  const [selectedClinica, setSelectedClinica] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();

  useEffect(() => {
    const fetchClinicas = async () => {
      try {
        const response = await fetch(
          `https://pruebas.siac.historiaclinica.org/api/mobile/clinicas_med?id_medico=${idMedico}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`
            }
          }
        );
        const data = await response.json();
        if (data.success && Array.isArray(data.clinicas)) {
          setClinicas(data.clinicas);
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
      } catch (error) {
        console.error('Error al obtener clínicas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicas();
  }, [idMedico, session.token]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  if (selectedClinica) {
    return (
      <TouchableOpacity onPress={() => setDropdownVisible(true)}>
        <Image
          source={{ uri: `https://siac.empresas.historiaclinica.org/${selectedClinica.logo_empresa.replace("../", "")}` }}
          style={styles.logoGrande}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.selectorText}>Selecciona una clínica</Text>
      </TouchableOpacity>

        {dropdownVisible && (
        <View style={styles.dropdown}>
            {clinicas.map((item) => (
            <TouchableOpacity
                key={item.id_cli.toString()}
                style={styles.option}
                onPress={() => {
                setSelectedClinica(item);
                setDropdownVisible(false);
                }}
            >
                <Image
                source={{ uri: `https://pruebas.siac.historiaclinica.org/${item.logo_empresa.replace("../", "")}` }}
                style={styles.logoMini}
                />
                <Text style={styles.optionText}>{item.apellidos}</Text>
            </TouchableOpacity>
            ))}
        </View>
        )}

    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginVertical: 10
  },
  selectorText: {
    fontSize: 16,
    color: '#333'
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16
  },
  logoMini: {
    width: 30,
    height: 30,
    resizeMode: 'contain'
  },
  logoGrande: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 10
  }
});

export default ClinicaPicker;
