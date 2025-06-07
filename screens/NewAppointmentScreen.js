import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Collapsible from "react-native-collapsible";

const NewAppointmentScreen = ({ navigation }) => {
  // Estados de acordeón
  const [isPacienteOpen, setIsPacienteOpen] = useState(true);
  const [isDatosOpen, setIsDatosOpen] = useState(false);
  const [isEstudiosOpen, setIsEstudiosOpen] = useState(false);

  // Estados de formulario
  const [tipoCedula, setTipoCedula] = useState("");
  const [cedula, setCedula] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [nuevoPaciente, setNuevoPaciente] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaNacimientoDate, setFechaNacimientoDate] = useState(new Date());
  const [sexo, setSexo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFechaNacimientoDate(selectedDate);
      const formatted = selectedDate.toISOString().split("T")[0];
      setFechaNacimiento(formatted);
    }
  };

  const handleBuscarPaciente = async () => {
    if (!tipoCedula || !cedula) {
      Alert.alert("Error", "Debe ingresar tipo de cédula y cédula.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://pruebas.siac.historiaclinica.org/api/pacientes/?tipo_cedula=${tipoCedula}&cedula=${cedula}`
      );
      const data = await response.json();
      if (data.error || isNaN(data.length)) {
        setNuevoPaciente(true);
        setPaciente(null);
      } else {
        setNuevoPaciente(false);
        setPaciente(data[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al buscar el paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image source={require("../assets/logograma.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* PACIENTE */}
        <TouchableOpacity
          onPress={() => setIsPacienteOpen(!isPacienteOpen)}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>Paciente</Text>
          <Ionicons name={isPacienteOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>
        <Collapsible collapsed={!isPacienteOpen}>
          <View style={styles.section}>
            <Text>Tipo de Cédula y Cédula</Text>
            <View style={styles.cedulaRow}>
              <TextInput
                style={[styles.input, { width: 80 }]}
                value={tipoCedula}
                onChangeText={setTipoCedula}
                placeholder="Tipo"
              />
              <TextInput
                style={styles.cedulaInput}
                value={cedula}
                onChangeText={setCedula}
                keyboardType="numeric"
                placeholder="Cédula"
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleBuscarPaciente}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.searchText}>Buscar Paciente</Text>
              )}
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
        </Collapsible>

        {/* DATOS DE LA CITA */}
        <TouchableOpacity
          onPress={() => setIsDatosOpen(!isDatosOpen)}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>Datos de la Cita</Text>
          <Ionicons name={isDatosOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>
        <Collapsible collapsed={!isDatosOpen}>
          <View style={styles.section}>
            <TextInput style={styles.input} placeholder="Motivo de la cita" />
            {/* Agrega más campos aquí si necesitas */}
          </View>
        </Collapsible>

        {/* ESTUDIOS */}
        <TouchableOpacity
          onPress={() => setIsEstudiosOpen(!isEstudiosOpen)}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>Estudios</Text>
          <Ionicons name={isEstudiosOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>
        <Collapsible collapsed={!isEstudiosOpen}>
          <View style={styles.section}>
            <TextInput style={styles.input} placeholder="Estudios requeridos (opcional)" />
          </View>
        </Collapsible>

        {/* BOTÓN AGENDA */}
        <TouchableOpacity style={styles.agendarButton} onPress={() => Alert.alert("Cita agendada")}>
          <Text style={styles.agendarText}>Agendar Cita</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  accordionTitle: { fontSize: 16, fontWeight: "bold" },
  section: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginVertical: 6,
  },
  searchButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 10,
  },
  searchText: { color: "#fff", fontWeight: "bold" },
  patientInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
  },
  agendarButton: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  agendarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  header: {
    backgroundColor: "#204b5e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "rgb(21, 170, 191)",
    elevation: 4,
    shadowColor: "rgb(21, 170, 191)",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: "contain",
  },
  cedulaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    marginVertical: 6,
    height: 50,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    fontSize: 16,
    color: "#111827",
  },
  cedulaInput: {
    flex: 2,
    borderColor: "#d1d5db",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
});

export default NewAppointmentScreen;
