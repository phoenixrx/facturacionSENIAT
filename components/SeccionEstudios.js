import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from 'react-native-toast-message';

const SeccionEstudios = forwardRef(({ styles, estudios, setEstudios, idMedico, idCli, nota, setNota }, ref) => {
  const [estudiosDisponibles, setEstudiosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clinicaPorDefecto, setClinicaPorDefecto] = useState(null);

  // Permitir que el padre llame a setClinicaPorDefecto
  useImperativeHandle(ref, () => ({
    setClinicaPorDefecto: (id) => setClinicaPorDefecto(id),
  }));

  useEffect(() => {
    const fetchEstudios = async () => {
      let clinicaFinal = idCli || clinicaPorDefecto;
      if (!idMedico || !clinicaFinal) return;
      if(isNaN(clinicaFinal)){
        clinicaFinal = clinicaFinal.id_cli        
      }
      
      const numeroDia = new Date().getDay();
      setLoading(true);

      try {
        const response = await fetch(
          `https://pruebas.siac.historiaclinica.org/api/estudios-filtrados?id_medico=${idMedico}&id_cli=${clinicaFinal}&dia=${numeroDia}`
        );
        const json = await response.json();

        if (json.success && Array.isArray(json.result)) {
          const lista = json.result.map((item) => ({
            label: item.descripcion,
            value: item.id_estudio,
          }));
          setEstudiosDisponibles([{ label: "Selecciona un estudio", value: "" }, ...lista]);
        } else {
          Toast.show({
            type: 'error',
            text1: 'No se encontraron estudios',
            text2: 'Seleccione la clínica para recargar',
            position: 'center'
          });
        }
      } catch (error) {
        console.error("Error al cargar estudios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstudios();
  }, [idMedico, idCli, clinicaPorDefecto]);

  return (
    <View style={styles.section}>
      <Text style={styles.label}>Estudio Requerido</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : (
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={estudios}
            onValueChange={(itemValue) => setEstudios(itemValue)}
            style={styles.picker}
          >
            {estudiosDisponibles.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
      )}

      <View style={{ marginTop: 16 }}>
        <Text style={styles.label}>Nota (opcional)</Text>
        <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 5, marginTop: 8 }}>
          <TextInput
            multiline
            numberOfLines={4}
            style={{ height: 80, padding: 8, textAlignVertical: "top" }}
            placeholder="Agrega una nota..."
            value={nota}
            onChangeText={setNota}
          />
        </View>
      </View>
    </View>
  );
});

const localStyles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 8,
  },
  picker: {
    height: 50,
    width: "100%",
  }
});

export default SeccionEstudios;
