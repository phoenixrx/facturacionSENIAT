import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";

const SeccionPaciente = ({
  styles,
  tipoCedula,
  setTipoCedula,
  cedula,
  setCedula,
  handleBuscarPaciente,
  loading,
  nuevoPaciente,
  paciente,
  nombre,
  setNombre,
  apellidos,
  setApellidos,
  telefono,
  setTelefono,
  correo,
  setCorreo,
  direccion,
  setDireccion,
  fechaNacimiento,
  setShowDatePicker,
  showDatePicker,
  fechaNacimientoDate,
  handleDateChange,
  sexo,
  setSexo,
  loadingAgregar,
  setLoadingAgregar,
}) => {
  const handleAgregarPaciente = async () => {
    if (!tipoCedula || !cedula || !nombre || !apellidos || !telefono || !sexo || !fechaNacimiento || !direccion) {
      Alert.alert("Error", "Por favor llena todos los campos obligatorios.");
      return;
    }

    setLoadingAgregar(true);
    try {
      const response = await fetch("https://pruebas.siac.historiaclinica.org/crear-paciente", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_cedula: tipoCedula,
          cedula,
          nombres: nombre,
          apellidos,
          telef1: telefono,
          sexo,
          correo,
          fecha_nacimiento: fechaNacimiento,
          direccion,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error("No se pudo crear el paciente.");

      if (!isNaN(result.id_paciente)) {
        Alert.alert("Éxito", "Paciente creado correctamente.");
        handleBuscarPaciente();
      } else {
        Alert.alert("Error", result.error || "Error desconocido.");
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoadingAgregar(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text>Tipo de Cédula y Cédula</Text>
      <View style={styles.cedulaRow}>
        <TextInput
          style={[styles.input, { width: 80 }]}
          value={tipoCedula}
          
          onChangeText={(text) => {
            const upper = text.toUpperCase();
            if (upper === "" || /^[VEPGJM]$/.test(upper)) setTipoCedula(upper);
          }}
          placeholder="V, E, J"
          maxLength={1}
        />
        <TextInput
          style={styles.cedulaInput}
          value={cedula}
          onChangeText={(text) => {
            let cleaned = text.replace(/[^0-9-]/g, "");
            const parts = cleaned.split("-");
            if (parts.length > 2) cleaned = parts[0] + "-" + parts[1];
            setCedula(cleaned);
          }}
          keyboardType="default"
          placeholder="Cédula"
        />
      </View>

      <TouchableOpacity onPress={handleBuscarPaciente} disabled={loading} style={[styles.searchButton, loading && { backgroundColor: "#ccc" }]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.searchText}>Buscar Paciente</Text>}
      </TouchableOpacity>

      {nuevoPaciente ? (
        <>
          <Text>Nombre</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} />
          <Text>Apellidos</Text>
          <TextInput style={styles.input} value={apellidos} onChangeText={setApellidos} />
          <Text>Teléfono</Text>
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
          <Text>Correo</Text>
          <TextInput style={styles.input} value={correo} onChangeText={setCorreo} keyboardType="email-address" />
          <Text>Dirección</Text>
          <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} />
          <Text>Fecha de Nacimiento</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{fechaNacimiento || "Selecciona una fecha"}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={fechaNacimientoDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          )}
          <Text>Sexo</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={sexo} onValueChange={setSexo} style={styles.picker}>
              <Picker.Item label="Seleccionar..." value="" />
              <Picker.Item label="Masculino" value="M" />
              <Picker.Item label="Femenino" value="F" />
            </Picker>
          </View>
          <TouchableOpacity
            style={[styles.agregarPacienteBtn, loadingAgregar && { backgroundColor: "#999" }]}
            onPress={handleAgregarPaciente}
            disabled={loadingAgregar}
          >
            {loadingAgregar ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="person-add" size={20} color="#fff" />
                <Text style={styles.btnText}>Agregar Paciente</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      ) : paciente ? (
        <View style={styles.patientInfo}>
          <Text>Nombre: {paciente.nombres}</Text>
          <Text>Apellidos: {paciente.apellidos}</Text>
          <Text>Teléfono: {paciente.telef1}</Text>
          <Text>Correo: {paciente.correo}</Text>
          <Text>
            Fecha Nac:{" "}
            {paciente.fecha_nacimiento
              ? new Date(paciente.fecha_nacimiento).toLocaleDateString("es-ES")
              : ""}
          </Text>
          <Text>Sexo: {paciente.sexo === "M" ? "Masculino" : "Femenino"}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default SeccionPaciente;