import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Dimensions,
} from "react-native";
import Modal from "react-native-modal";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

const AppointmentActions = ({ appointment, visible, onClose, position }) => {
  if (!appointment || !position) return null;

  const handleCancel = () => {
    Alert.alert("Cancelar cita", `Cancelar cita con ID: ${appointment.id}`);
    onClose();
  };

  const handleCall = () => {
    const cleanPhone = appointment.phone.replace(/[^\d]/g, "");
    Linking.openURL(`tel:${cleanPhone}`);
    onClose();
  };

  const handleWhatsApp = () => {
    const cleanPhone = appointment.phone.replace(/[^\d]/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}`);
    onClose();
  };

  return (
    <Modal
      isVisible={visible}
      backdropOpacity={0}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      style={styles.modal}
    >
      <View
        style={[
          styles.menu,
          {
            top: position.y + 8,
            left: Math.min(position.x - 160, SCREEN_WIDTH - 200),
          },
        ]}
      >
        <TouchableOpacity onPress={handleCancel} style={styles.menuItem}>
          <Ionicons name="close-circle-outline" size={18} color="#DC2626" style={styles.icon} />
          <Text style={[styles.menuText, { color: "#DC2626" }]}>Cancelar cita</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCall} style={styles.menuItem}>
          <Ionicons name="call-outline" size={18} color="#2563EB" style={styles.icon} />
          <Text style={styles.menuText}>Llamar al paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleWhatsApp} style={styles.menuItem}>
          <Ionicons name="logo-whatsapp" size={18} color="#22C55E" style={styles.icon} />
          <Text style={styles.menuText}>Enviar WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    position: "absolute",
  },
  menu: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 200,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginTop:-50,
    
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    color: "#1f2937",
  },
  icon: {
    marginRight: 10,
  },
});

export default AppointmentActions;
