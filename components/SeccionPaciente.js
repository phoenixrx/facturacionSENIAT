import React from "react";
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";

const estudiosDisponibles = [
  { label: "Selecciona un estudio", value: "" },
  { label: "Rayos X", value: "Rayos X" },
  { label: "Resonancia Magnética", value: "Resonancia Magnética" },
  { label: "Ultrasonido", value: "Ultrasonido" },
  { label: "Laboratorio", value: "Laboratorio" },
  { label: "Tomografía", value: "Tomografía" },
];

const SeccionEstudios = ({ styles, estudios, setEstudios }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>Estudio Requerido</Text>
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
    </View>
  );
};

export default SeccionEstudios;
