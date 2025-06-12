import React from "react";
import { View, Text, TextInput } from "react-native";

const SeccionEstudios = ({ styles, estudios, setEstudios }) => (
  <View style={styles.section}>
    <Text>Estudios Requeridos</Text>
    <TextInput
      style={styles.input}
      placeholder="Estudios requeridos (opcional)"
      value={estudios}
      onChangeText={setEstudios}
    />
  </View>
);

export default SeccionEstudios;
