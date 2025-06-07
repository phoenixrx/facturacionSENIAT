import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  findNodeHandle,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppointmentActions from "./AppointmentActions";

const formatDate = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const getStatusColor = (status) => {
  switch (status.trim()) {
    case "Confirmado":
      return "#10b981";
    case "Atendido":
      return "#f59e0b";
    case "Agendado":
      return "#15aabf";
    default:
      return "#6b7280";
  }
};

const AppointmentCard = ({ appointment, fetchAppointments }) => {
  const [actionVisible, setActionVisible] = useState(false);
  const actionRef = useRef();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionPosition, setActionPosition] = useState(null);

  const handlePress = () => {
    setTimeout(() => {
      const handle = findNodeHandle(actionRef.current);
      if (handle) {
        UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
          setSelectedAppointment(appointment);
          setActionPosition({ x: pageX, y: pageY + height });
          setActionVisible(true);
        });
      }
    }, 100);
  };

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.timeContainer}>
        <Text style={styles.appointmentTime}>{formatDate(appointment.time)}</Text>
        <Text style={styles.appointmentTime}>{formatTime(appointment.time)}</Text>
        <Text style={styles.appointmentDuration}>{appointment.duration || "30 min"}</Text>
      </View>

      <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{appointment.patientName}</Text>
        <Text style={styles.appointmentType}>{appointment.estudio || appointment.type}</Text>
        <View style={styles.appointmentMeta}>
          <Ionicons name="location-outline" size={14} color="#6b7280" />
          <Text style={styles.appointmentLocation}>{appointment.location || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(appointment.status) }]} />
        <View ref={actionRef}>
          <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
            <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {actionVisible && (
          <AppointmentActions
            appointment={selectedAppointment}
            visible={actionVisible}
            onClose={() => setActionVisible(false)}
            position={actionPosition}
            fetchAppointments={fetchAppointments}
          />
        )}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  appointmentCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  timeContainer: {
    alignItems: "flex-start",
    marginRight: 12,
    width: 80,
  },
  appointmentTime: {
    fontSize: 14,
    color: "#374151",
  },
  appointmentDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  appointmentType: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  appointmentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  appointmentLocation: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  appointmentActions: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  actionButton: {
    padding: 4,
  },
});

export default AppointmentCard;
