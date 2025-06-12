import React from "react";
import { View, Text, TextInput } from "react-native";

const SeccionDatosCita = ({ styles, motivoCita, setMotivoCita }) => (
  <View style={styles.section}>
    <Text>Motivo de la Cita</Text>
    <TextInput
      style={styles.input}
      placeholder="Motivo de la cita"
      value={motivoCita}
      onChangeText={setMotivoCita}
    />
  </View>
);

export default SeccionDatosCita;
