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
  const { tokenData, session } = useSession();
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
  const [estudios, setEstudios] = useState("");
  const [idCli, setIdCli] = useState(null);
  const [nota, setNota] = useState('');
   
   const [fechaInicio, setFechaInicio] = useState("");
   const [fechaFin, setFechaFin] = useState("");
   const [seguroSeleccionado, setSeguroSeleccionado] = useState("");
   const [tipoAtencion, setTipoAtencion] = useState('P');
    const [entidadSeleccionada, setEntidadSeleccionada] = useState('');

  const handleBuscarPaciente = async () => {
    if(tipoCedula=='' || cedula=='' || cedula.length < 5 ){
      Alert.alert('Cedula', 'Error de la cedula a buscar');
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

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || fechaNacimientoDate;
    setShowDatePicker(false);
    setFechaNacimientoDate(currentDate);
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`;
    setFechaNacimiento(formattedDate);
  };

  const handleAgendarCita = async () => {
    if (!paciente?.id_paciente) {
      Alert.alert("Error", "Debes buscar o crear un paciente antes de agendar la cita.");
      return;
    }
    Alert.alert('Datos',`${paciente.id_paciente}`);
    let titulo = paciente.nombres + ' ' + paciente.apellidos 
    if(!idCli  || idCli=='' || idCli==0){
      Alert.alert("Error", "Debes seleccionar la clinica antes de agendar la cita.");
      return;
    }
    if(!id_medico || id_medico=='' || id_medico==0 ){
      Alert.alert("Error", "Ocurrio un error al asignar el medico de la cita.");
      return;
    }

    if(!fechaInicio || fechaInicio=='' || fechaInicio==0 ){
      Alert.alert("Error", "Debes seleccionar la fecha antes de agendar la cita.");
      return;
    }

    if(!fechaFin || fechaFin=='' || fechaFin==0 || isNaN(fechaFin) ){
      Alert.alert("Error", "Debes seleccionar la duración de la cita.");
      return;
    }

    if(!estudios || estudios=='' || estudios==0 ){
      Alert.alert("Error", "Debes seleccionar el estudio antes de agendar la cita.");
      return;
    }
    if(tipoAtencion!='P'){
      if(!entidadSeleccionada || entidadSeleccionada=='' || entidadSeleccionada==0 ){
        Alert.alert("Error", "Debes seleccionar la empresa-seguro.");
        return;
      }
    }

    // Validar que la fecha de inicio no sea menor a hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = new Date(fechaInicio);
    if (inicio < hoy) {
      Alert.alert("Error", "La fecha de inicio no puede ser menor a hoy.");
      return;
    }

    let fecha_inicio, fecha_fin;
    if (fechaInicio) {
      const f = new Date(fechaInicio);
      const year = f.getFullYear();
      const month = String(f.getMonth() + 1).padStart(2, '0');
      const day = String(f.getDate()).padStart(2, '0');
      const hours = String(f.getHours()).padStart(2, '0');
      const minutes = String(f.getMinutes()).padStart(2, '0');
      fecha_inicio = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    if (fecha_inicio && fechaFin) {
      const f = new Date(fecha_inicio);
      f.setMinutes(f.getMinutes() + parseInt(fechaFin));

      const year = f.getFullYear();
      const month = String(f.getMonth() + 1).padStart(2, '0');
      const day = String(f.getDate()).padStart(2, '0');
      const hours = String(f.getHours()).padStart(2, '0');
      const minutes = String(f.getMinutes()).padStart(2, '0');

      fecha_fin = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    let data = {
      id_paciente: paciente.id_paciente.toString(),
      tipo_consulta: tipoAtencion || 'P',
      id_cli: idCli.toString(),
      title: titulo || 'Cita medica',
      nota: nota,
      id_med: id_medico,
      fecha_inicio: fecha_inicio,
      fecha_fin: fecha_fin,
      tipo_sel: entidadSeleccionada || 0,
      estudios: estudios
    }
    
    const { token } = session;
    try {
    
      const response = await fetch('https://pruebas.siac.historiaclinica.org/api/mobile/crear-cita', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success==true) {
      Alert.alert(
                  'Éxito',
                  'Cita agendada correctamente',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        setIsPacienteOpen(true);
                        setIsDatosOpen(false);
                        setIsEstudiosOpen(false);
                        setTipoCedula("");
                        setCedula("");
                        setLoading(false);
                        setLoadingAgregar(false);
                        setPaciente(null);
                        setNuevoPaciente(false);
                        setNombre("");
                        setApellidos("");
                        setTelefono("");
                        setCorreo("");
                        setDireccion("");
                        setFechaNacimiento("");
                        setFechaNacimientoDate(new Date());
                        setShowDatePicker(false);
                        setSexo("");
                        setEstudios("");
                        setIdCli(null);
                        setNota('');
                      
                        setFechaInicio("");
                        setFechaFin("");
                        setSeguroSeleccionado("");
                        setTipoAtencion('P');
                        setEntidadSeleccionada('');
                        
                        navigation.goBack()}
                    }
                  ],
                  { cancelable: false }
                );
    
    } else {
      console.error('Error en la respuesta del servidor', result);
      Alert.alert('Error', result?.message || 'No se pudo agendar la cita.');
    }
  } catch (error) {
    console.error('Error al enviar la solicitud', error);
    Alert.alert('Error', 'Ocurrió un error al conectar con el servidor.');
  }
  };

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
                onSelectClinica={(clinica) => {
                  setIdCli(clinica.id_cli); // esto define idCli correctamente
                }}              
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
            tipoAtencion={tipoAtencion}
            setTipoAtencion={setTipoAtencion}
            fechaInicio={fechaInicio}
            setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}
            setFechaFin={setFechaFin}
            seguroSeleccionado={seguroSeleccionado}
            setSeguroSeleccionado={setSeguroSeleccionado}
            entidadSeleccionada={entidadSeleccionada}
            setEntidadSeleccionada={setEntidadSeleccionada}
            idCli={idCli}
          />
        )}

        {/* Estudios */}
        <TouchableOpacity onPress={() => toggleSection(setIsEstudiosOpen, isEstudiosOpen)} style={styles.accordionHeader}>
          <Text style={styles.accordionTitle}>Estudios</Text>
          <Ionicons name={isEstudiosOpen ? "chevron-up" : "chevron-down"} size={20} />
        </TouchableOpacity>

        {isEstudiosOpen && idCli && (
          <SeccionEstudios
            styles={styles}
            estudios={estudios}
            setEstudios={setEstudios}
            idMedico={id_medico}
            idCli={idCli}
            nota={nota}
            setNota={setNota}
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
    backgroundColor: "#1b5f7d",
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
    backgroundColor: "#8fccc3",
    borderRadius: 6,
  },
  agendarButton: {
    backgroundColor: "#204b5e",
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
  }, 
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
    flex: 1
  },
  radioSelected: {
    borderColor: '#007AFF'
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF'
  }
});


export default NewAppointmentScreen;
