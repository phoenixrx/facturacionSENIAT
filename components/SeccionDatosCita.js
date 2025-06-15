import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';

const SeccionDatosCita = ({
  styles,
  tipoAtencion,
  setTipoAtencion,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  entidadSeleccionada,
  setEntidadSeleccionada,
  seguroSeleccionado,
  setSeguroSeleccionado,
  idCli
}) => {
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [entidades, setEntidades] = useState([]);
  const [loading, setLoading] = useState(false);

  const tipos = [
    { label: 'Particular', key: 'P' },
    { label: 'Seguro', key: 'S' },
    { label: 'Empresas', key: 'E' },
    { label: 'Interno', key: 'I' }
  ];
   const etiquetas = {
    S: 'Seleccione seguro',
    E: 'Seleccione empresa',
    I: 'Seleccione entidad interna'
  };

  const formatoFecha = (date) => {
    return date ? new Date(date).toLocaleString() : 'Seleccionar fecha';
  };

  
  useEffect(() => {
    const fetchEntidades = async () => {
      if (tipoAtencion === 'P') return;

      setLoading(true);
      try {
        const response = await fetch(
          `https://pruebas.siac.historiaclinica.org/api/tipo_admision?tipo=${tipoAtencion}&clinic_id=${idCli}`
        );
        const json = await response.json();
        let identificador = '';
        switch (tipoAtencion) {
          case 'S':
            identificador = 'id_seguro';
            break;
          case 'E':
            identificador = 'id_empresa';
            break;
          case 'I':
            identificador = 'id_tipo_interno';
            break;
          default:
            break;
        }        
        if (Array.isArray(json)) {
          setEntidades([{ label: '-- Seleccione --', value: '' }, ...json.map(ent => ({
            label: ent.descripcion,
            value: ent[identificador]
          }))]);
        } else {
          setEntidades([]);
        }
      } catch (error) {
        console.error('Error al obtener entidades:', error);
        setEntidades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntidades();
  }, [tipoAtencion]);

  return (
    <View style={styles.section}>
      {/* Fecha y hora inicio */}
      <Text style={styles.label}>Fecha y hora de inicio</Text>
      <TouchableOpacity
        onPress={() => setShowPickerInicio(true)}
        style={styles.input}
      >
        <Text>{formatoFecha(fechaInicio)}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showPickerInicio}
        mode="datetime"
        date={fechaInicio || new Date()}
        onConfirm={(date) => {
          setFechaInicio(date);
          setShowPickerInicio(false);
        }}
        onCancel={() => setShowPickerInicio(false)}
      />

      {/* Fecha y hora fin */}
      <Text style={styles.label}>Fecha y hora de fin</Text>
      <TouchableOpacity
        onPress={() => setShowPickerFin(true)}
        style={styles.input}
      >
        <Text>{formatoFecha(fechaFin)}</Text>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showPickerFin}
        mode="datetime"
        date={fechaFin || new Date()}
        onConfirm={(date) => {
          setFechaFin(date);
          setShowPickerFin(false);
        }}
        onCancel={() => setShowPickerFin(false)}
      />

     {/* Tipo de atención (radio buttons agrupados) */}
      <View style={{ marginTop: 16 }}>
      <Text style={styles.label}>Tipo de atención</Text>

      {/* Radios agrupados */}
      {[0, 2].map(start => (
        <View key={start} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          {tipos.slice(start, start + 2).map(({ label, key }) => (
            <TouchableOpacity
              key={key}
              onPress={() => {
                setTipoAtencion(key);
                setEntidadSeleccionada(''); // Limpiar picker
              }}
              style={[
                styles.radioOption,
                tipoAtencion === key && styles.radioSelected
              ]}
            >
              <View style={styles.radioCircle}>
                {tipoAtencion === key && <View style={styles.radioDot} />}
              </View>
              <Text style={{ marginLeft: 8 }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Picker condicional */}
      {tipoAtencion !== 'P' && (
        <View style={{ marginTop: 16 }}>
          <Text style={styles.label}>{etiquetas[tipoAtencion]}</Text>
          <View style={styles.pickerContainer}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Picker
                selectedValue={entidadSeleccionada}
                onValueChange={(itemValue) => setEntidadSeleccionada(itemValue)}
                style={styles.picker}
              >
                {entidades.map(item => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            )}
          </View>
        </View>
      )}
    </View>
    </View>
    
  );
  
};


export default SeccionDatosCita;
