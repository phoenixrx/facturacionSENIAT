import React, { useState, useEffect }  from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput  } from "react-native";
import { Picker } from "@react-native-picker/picker";

const SeccionEstudios = ({ styles, estudios, setEstudios, idMedico, idCli,  nota,  setNota }) => {
 const [estudiosDisponibles, setEstudiosDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    var numeroDia = new Date().getDay();
    console.log(`https://pruebas.siac.historiaclinica.org/api/estudios-filtrados?id_medico=${idMedico}&id_cli=${idCli}&dia=${numeroDia}`)
    const fetchEstudios = async () => {
    var numeroDia = new Date().getDay();
      try {
        const response = await fetch(
          `https://pruebas.siac.historiaclinica.org/api/estudios-filtrados?id_medico=${idMedico}&id_cli=${idCli}&dia=${numeroDia}`
        );
        const json = await response.json();
        
        if (json.success && Array.isArray(json.result)) {
          // Convertimos los estudios al formato que el Picker necesita
          const lista = json.result.map((item) => ({
            label: item.descripcion,
            value: item.id_estudio,
          }));
          setEstudiosDisponibles([{ label: "Selecciona un estudio", value: "" }, ...lista]);
        } else {
          console.warn("No se encontraron estudios.");
        }
      } catch (error) {
        console.error("Error al cargar estudios:", error);
      } finally {
        setLoading(false);
      }
    };

    if (idMedico && idCli) {
      fetchEstudios();
    }
  }, [idMedico, idCli]);

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
};
const styles = StyleSheet.create({
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
  }
)

export default SeccionEstudios;
