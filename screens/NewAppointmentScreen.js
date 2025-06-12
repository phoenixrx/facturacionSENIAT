import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import ClinicaSelector from "../components/ClinicaSelector";
import SeccionPaciente from "../components/SeccionPaciente";
import SeccionDatosCita from "../components/SeccionDatosCita";
import SeccionEstudios from "../components/SeccionEstudios";
import { useSession } from "../context/SessionContext";

const NewAppointmentScreen = ({ navigation }) => {
  // Estados para los acordeones
  const [isPacienteOpen, setIsPacienteOpen] = useState(true);
  const [isDatosOpen, setIsDatosOpen] = useState(false);
  const [isEstudiosOpen, setIsEstudiosOpen] = useState(false);
  const { tokenData } = useSession();
  const id_medico = tokenData?.id_especialista || '';
  const toggleSection = (setter, value) => setter(!value);

  // Estados para sección Paciente
  const [tipoCedula, setTipoCedula] = useState("");
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingAgregar, setLoadingAgregar] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [nuevoPaciente, setNuevoPaciente] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [direccion, setDireccion] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaNacimientoDate, setFechaNacimientoDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sexo, setSexo] = useState("");

  // Estados para secciones cita y estudios
  const [motivoCita, setMotivoCita] = useState("");
  const [estudios, setEstudios] = useState("");

  const handleBuscarPaciente = async () => {
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

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaNacimientoDate;
    setShowDatePicker(false);
    setFechaNacimientoDate(currentDate);
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
    setFechaNacimiento(formattedDate);
  };

  const handleAgendarCita = () => {
    if (!paciente?.id_paciente) {
      Alert.alert("Error", "Debes buscar o crear un paciente antes de agendar la cita.");
      return;
    }

    if (!motivoCita) {
      Alert.alert("Error", "Por favor ingresa el motivo de la cita.");
      return;
    }

    // Aquí podrías enviar todo a tu API
    Alert.alert("Cita Agendada", `Motivo: ${motivoCita}\nEstudios: ${estudios}`);
  };

  const [clinicaSeleccionada, setClinicaSeleccionada] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={require("../assets/logograma.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Contenido Scrollable cambiar id_medico */}
      <ClinicaSelector
                id_medico={id_medico}
                onClinicaSelect={(idCli) => setClinicaSeleccionada(idCli)}
                
              />
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Paciente */}
        <TouchableOpacity onPress={() => toggleSection(setIsPacienteOpen, isPacienteOpen)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Paciente</Text>
          <Ionicons name={isPacienteOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>

        {isPacienteOpen && (
          <SeccionPaciente
            styles={styles}
            tipoCedula={tipoCedula}
            setTipoCedula={setTipoCedula}
            cedula={cedula}
            setCedula={setCedula}
            handleBuscarPaciente={handleBuscarPaciente}
            loading={loading}
            nuevoPaciente={nuevoPaciente}
            paciente={paciente}
            nombre={nombre}
            setNombre={setNombre}
            apellidos={apellidos}
            setApellidos={setApellidos}
            telefono={telefono}
            setTelefono={setTelefono}
            correo={correo}
            setCorreo={setCorreo}
            direccion={direccion}
            setDireccion={setDireccion}
            fechaNacimiento={fechaNacimiento}
            setShowDatePicker={setShowDatePicker}
            showDatePicker={showDatePicker}
            fechaNacimientoDate={fechaNacimientoDate}
            handleDateChange={handleDateChange}
            sexo={sexo}
            setSexo={setSexo}
            loadingAgregar={loadingAgregar}
            setLoadingAgregar={setLoadingAgregar}
          />
        )}

        {/* Datos de la cita */}
        <TouchableOpacity onPress={() => toggleSection(setIsDatosOpen, isDatosOpen)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Datos de la Cita</Text>
          <Ionicons name={isDatosOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>

        {isDatosOpen && (
          <SeccionDatosCita
            styles={styles}
            motivoCita={motivoCita}
            setMotivoCita={setMotivoCita}
          />
        )}

        {/* Estudios */}
        <TouchableOpacity onPress={() => toggleSection(setIsEstudiosOpen, isEstudiosOpen)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Estudios</Text>
          <Ionicons name={isEstudiosOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>

        {isEstudiosOpen && (
          <SeccionEstudios
            styles={styles}
            estudios={estudios}
            setEstudios={setEstudios}
          />
        )}

        {/* Botón Agendar */}
        <TouchableOpacity style={styles.agendarButton} onPress={handleAgendarCita}>
          <Text style={styles.agendarText}>Agendar Cita</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingTop: 0,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
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
  searchText: {
    color: "#fff",
    fontWeight: "bold",
  },
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
  agregarPacienteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  btnText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  }
});
export default NewAppointmentScreen;
