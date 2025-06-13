import React, { useState } from 'react';
import { View, Text, TextInput,StyleSheet, TouchableOpacity, Platform } from 'react-native';
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
  seguroSeleccionado,
  setSeguroSeleccionado
}) => {
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  const tipos = [
    { label: 'Particular', key: 'P' },
    { label: 'Seguro', key: 'S' },
    { label: 'Empresas', key: 'E' },
    { label: 'Interno', key: 'I' }
  ];
  const opcionesSeguro = [
    { label: 'Seleccione', value: '' },
    { label: 'Seguro ABC', value: 'abc' },
    { label: 'Seguro XYZ', value: 'xyz' },
    { label: 'Seguro QRS', value: 'qrs' },
  ];

  const formatoFecha = (date) => {
    return date ? new Date(date).toLocaleString() : 'Seleccionar fecha';
  };

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
      <Text style={styles.label}>Tipo de atención</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
  {tipos.slice(0, 2).map(({ label, key }) => (
    <TouchableOpacity
      key={key}
      onPress={() => setTipoAtencion(key)}
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

<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
  {tipos.slice(2).map(({ label, key }) => (
    <TouchableOpacity
      key={key}
      onPress={() => setTipoAtencion(key)}
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


      {/* Picker adicional si no es Particular */}
      {tipoAtencion !== 'Particular' && (
        <>
          <Text style={styles.label}>Seleccione seguro</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={seguroSeleccionado}
              onValueChange={(itemValue) => setSeguroSeleccionado(itemValue)}
              style={styles.picker}
            >
              {opcionesSeguro.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </>
      )}
    </View>
    
  );
  
};


export default SeccionDatosCita;
