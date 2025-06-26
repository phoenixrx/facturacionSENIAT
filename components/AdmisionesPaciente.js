// components/HistoricoPaciente.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';

const AdmisionesPaciente = ({ idPaciente, idCli, idMedico }) => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistorico = async () => {
      try {
        setLoading(true);

        const response = await fetch("https://pruebas.siac.historiaclinica.org/cargar_query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filtros: [idPaciente, idCli, idMedico, idMedico, idMedico],
            id_query: 0,
            id_contenedor: 5,
          }),
        });

        const json = await response.json();
        setHistorico(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error("Error cargando histórico:", error);
        Alert.alert("Error", "Ocurrió un problema al consultar el histórico");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorico();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#204b5e" />
      ) : historico.length > 0 ? (
        historico.map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.estudio}>{item.estudio}</Text>
            <Text style={styles.fecha}>Admitido: {new Date(item.fecha_admision).toLocaleDateString()}</Text>
            <Text>Medico: {item.medico}</Text>
            <Text>Seguro: {item.seguro}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No hay historial disponible.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  item: {
    backgroundColor: '#f1f9ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  estudio: {
    fontWeight: 'bold',
    color: '#204b5e',
    fontSize: 16,
    marginBottom: 4,
  },
  fecha: {
    color: '#555',
    marginBottom: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    paddingTop: 10,
  },
});

export default AdmisionesPaciente;
