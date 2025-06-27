// components/ConsultasResumen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSession } from '../context/SessionContext';
import { decode } from 'html-entities';

const stripHtml = (html) => {
  const plainText = html.replace(/<[^>]+>/g, '');
  return decode(plainText);
};

const truncateWords = (text, numWords = 20) => {
  const words = text.trim().split(/\s+/);
  return words.slice(0, numWords).join(' ') + (words.length > numWords ? '...' : '');
};

const ConsultasResumen = ({ paciente }) => {
  const { session } = useSession();
  const [resumenes, setResumenes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://pruebas.siac.historiaclinica.org/api/mobile/resumen-consultas?id_paciente=${paciente.id_paciente}`,
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        );

        const json = await response.json();

        if (json.success && Array.isArray(json.resumen)) {
          setResumenes(json.resumen);
        }
      } catch (error) {
        console.error('Error cargando resumenes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumen();
  }, [paciente]);

  return (
    <View style={{ padding: 16 }}>
      
      {loading ? (
        <ActivityIndicator size="large" color="#204b5e" />
      ) : resumenes.length > 0 ? (
        <ScrollView style={{ maxHeight: 300 }}>
          {resumenes.map((item, index) => {
            const cleanText = stripHtml(item.motivo_resultado);
            const resumen = truncateWords(cleanText);
            const fecha = new Date(item.fecha_creacion).toLocaleString();
            return (
              <View key={index} style={styles.card}>
                <Text style={styles.date}>{fecha}</Text>
                <Text>{resumen}</Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <Text>No hay consultas registradas.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#204b5e',
  },
  card: {
    backgroundColor: '#f5faff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  date: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#204b5e',
  },
});

export default ConsultasResumen;