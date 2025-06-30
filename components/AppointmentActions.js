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
  Platform
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from "react-native-modal";
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

const AppointmentActions = ({ appointment, visible, onClose, position, fetchAppointments }) => {
  if (!appointment || !position) return null;
  const [loading, setLoading] = useState(false);
  const openDatePicker = () => {
  if (Platform.OS === 'android') {
    // Primero seleccionamos la fecha
    DateTimePickerAndroid.open({
      value: newDate,
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          // Guardamos la fecha seleccionada y pedimos la hora
          const updatedDate = new Date(selectedDate);
          DateTimePickerAndroid.open({
            value: updatedDate,
            mode: 'time',
            is24Hour: true,
            onChange: (event2, selectedTime) => {
              if (event2.type === 'set' && selectedTime) {
                updatedDate.setHours(selectedTime.getHours());
                updatedDate.setMinutes(selectedTime.getMinutes());
                setNewDate(updatedDate);
              }
            }
          });
        }
      }
    });
  } else {
    setShowDatePicker(true); // iOS
  }
};



  const [showReprogramModal, setShowReprogramModal] = useState(false);
  const [newDate, setNewDate] = useState(new Date());
  const [duration, setDuration] = useState(30);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { session } = useSession();

  const handleCancel = () => {
    if (appointment.time) {
      const appointmentDate = new Date(appointment.time);
      const today = new Date();
      appointmentDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        setTimeout(() => {Toast.show({
          type: 'error',
          text1: 'No se puede cancelar',
          text2: 'No puedes cancelar una cita pasada.',
          position: 'center',
        });},300)
        
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
setTimeout(() => {Toast.show({
                type: response.ok ? 'success' : 'error',
                text1: response.ok ? 'Cita cancelada' : 'Error al cancelar',
                text2: result?.message || 'Se ha procesado la solicitud.',
                position: 'center',
                visibilityTime: 3000
              });},300)
              

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

  const confirmReprogram = () => {
    Alert.alert(
      "Reprogramar cita",
      `¿Deseas reprogramar esta cita para otra fecha?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí", onPress: () => setShowReprogramModal(true) }
      ]
    );
  };

  const submitReprogram = async () => {
  const now = new Date();
  if (newDate < now) {
    setShowReprogramModal(false); 
    setTimeout(() => {Toast.show({
      type: 'error',
      text1: 'Fecha inválida',
      text2: 'No puedes reprogramar para una fecha anterior a hoy.',
      position: 'center'
    });},300)
    
    return;
  }

  if (duration < 15 || duration > 120) {
    setShowReprogramModal(false); // <- Cerrar antes del Toast
    setTimeout(() => {Toast.show({
      type: 'error',
      text1: 'Duración inválida',
      text2: 'Debe estar entre 15 y 120 minutos.',
      position: 'center'
    });},300)
    
    return;
  }

  const start = newDate;
  const end = new Date(newDate.getTime() + duration * 60000);
  const body = {
    id_cal: appointment.id,
    start: start.toISOString(),
    end: end.toISOString(),
    usuario: appointment.user,
    motivo: 1
  };

  try {
    setLoading(true);
    const { token } = session;
    const response = await fetch('https://pruebas.siac.historiaclinica.org/api/agendas/reprogramar', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();

    setShowReprogramModal(false); 
setTimeout(() => {Toast.show({
      type: response.ok ? 'success' : 'error',
      text1: response.ok ? 'Cita reprogramada' : 'Error al reprogramar',
      text2: result?.message || '',
      position: 'center'
    });},300)
    

    if (response.ok && typeof fetchAppointments === 'function') {
      await fetchAppointments();
    }
  } catch (err) {
    setShowReprogramModal(false); 
    setTimeout(() => {Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Ocurrió un error al reprogramar la cita.',
      position: 'center'
    });},300)
    
  } finally {
    setLoading(false);
    onClose(); // cerrar también el menú flotante
  }
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

          <TouchableOpacity onPress={confirmReprogram} style={styles.menuItem}>
            <Ionicons name="calendar-outline" size={18} color="#F59E0B" style={styles.icon} />
            <Text style={styles.menuText}>Reprogramar cita</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal Reprogramar */}
      <Modal isVisible={showReprogramModal} onBackdropPress={() => setShowReprogramModal(false)}>
        <View style={[styles.menu, { alignSelf: 'center' }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>Nueva fecha y duración</Text>
          <TouchableOpacity onPress={openDatePicker} style={{ marginBottom: 10 }}>
            <Text>Seleccionar fecha y hora</Text>
            <Text>{newDate.toLocaleString()}</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && showDatePicker && (
            <DateTimePicker
              value={newDate}
              mode="datetime"
              display="spinner"
              onChange={(e, selectedDate) => {
                if (selectedDate) setNewDate(selectedDate);
                setShowDatePicker(false);
              }}
            />
          )}


          <Text style={{ marginTop: 10 }}>Duración (minutos):</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setDuration((prev) => (prev >= 120 ? 15 : prev + 15))}
          >
            <Text style={styles.menuText}>{duration} minutos (tocar para cambiar)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { justifyContent: 'center' }]} onPress={submitReprogram}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" style={styles.icon} />
            <Text style={[styles.menuText, { color: '#10B981' }]}>Confirmar Reprogramación</Text>
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
    marginTop: -50,
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
