import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput } from "react-native";
import ClinicaSelector from "./ClinicaSelector";


const SeccionDatosCita = ({ styles, motivoCita, setMotivoCita }) =>   
  {const [clinicaSeleccionada, setClinicaSeleccionada] = useState(null);
    return(
 
  <View style={styles.section}>
    <Text>Motivo de la Cita</Text>
    <TextInput
      style={styles.input}
      placeholder="Motivo de la cita"
      value={motivoCita}
      onChangeText={setMotivoCita}
    />
    <ClinicaSelector
        idMedico={43}
        onClinicaSelect={(idCli) => setClinicaSeleccionada(idCli)}
      />
  </View>
   
)};

export default SeccionDatosCita;
