import { ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useSession } from '../context/SessionContext';
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

const AppointmentActions = ({ appointment, visible, onClose, position, fetchAppointments  }) => {
  if (!appointment || !position) return null;
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const handleCancel = () => {
    
    if (appointment.time) {
      const appointmentDate = new Date(appointment.time);
      const today = new Date();
      // Limpiar horas para comparar solo fechas
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
      Toast.show({
        type: 'error',
        text1: 'No se puede cancelar',
        text2: 'No puedes cancelar una cita pasada.',
        position: 'center',
      });
      onClose();
      return;
      }
    }
    Alert.alert(
      "Cancelar cita",
      `¿Deseas cancelar la cita de ${appointment.patientName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí",
          onPress: async () => {
            try {
              setLoading(true);
              const { token } = session;
              const response = await fetch(
                `https://pruebas.siac.historiaclinica.org/api/mobile/cita?id=${appointment.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                  },
              });

              const result = await response.json();
              
              Toast.show({
                type: response.ok ? 'success' : 'error',
                text1: response.ok ? 'Cita cancelada' : 'Error al cancelar',
                text2: result?.message || 'Se ha procesado la solicitud.',
                position: 'center',
                visibilityTime: 3000
            });

            if (response.ok && typeof fetchAppointments === 'function') {
              await fetchAppointments();
            }
            } catch (error) {
               
               Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Ocurrió un error al cancelar la cita.',
                position: 'center',
                text1Style: { fontSize: 20, fontWeight: 'bold' },
              });
            } finally {
              setLoading(false);
              onClose();
            }
          }
        }
      ]
    );
  };

  const handleCall = () => {
      const cleanPhone = (appointment.phone || "").replace(/[^\d]/g, "");
      if (!cleanPhone) {
        Toast.show({
          type: 'error',
          text1: 'Teléfono no disponible',
          text2: 'Este paciente no tiene un número de teléfono registrado.',
          position: 'center',
        });
        return;
      }

    Linking.openURL(`tel:${cleanPhone}`);
    onClose();
  };

  const handleWhatsApp = () => {
    const cleanPhone = (appointment.phone || "").replace(/[^\d]/g, "");
    if (!cleanPhone) {
      Toast.show({
        type: 'error',
        text1: 'Teléfono no disponible',
        text2: 'Este paciente no tiene un número de teléfono registrado.',
        position: 'center',
      });
      return;
    }

    Linking.openURL(`https://wa.me/${cleanPhone}`);
    onClose();
  };



  return (  
  <>
  {loading && (
    <View style={styles.spinnerOverlay}>
      <ActivityIndicator size="large" color="#204b5e" />
    </View>
  )}

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
            left: Math.max(8, Math.min(position.x - 160, SCREEN_WIDTH - 208)),

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
    </>
  );
  
};



const styles = StyleSheet.create({
  spinnerOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
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
