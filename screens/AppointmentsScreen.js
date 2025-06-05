"use client"

import { useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity,  Image, Pressable } from "react-native"
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const AppointmentCard = ({ appointment }) => (
  
    <View style={styles.appointmentCard}>
        <View style={styles.timeContainer}>
        <Text style={styles.appointmentTime}>{appointment.time}</Text>
        <Text style={styles.appointmentDuration}>{appointment.duration}</Text>
        </View>
        <View style={styles.appointmentDetails}>
        <Text style={styles.patientName}>{appointment.patientName}</Text>
        <Text style={styles.appointmentType}>{appointment.type}</Text>
        <View style={styles.appointmentMeta}>
            <Ionicons name="location-outline" size={14} color="#6b7280" />
            <Text style={styles.appointmentLocation}>{appointment.location}</Text>
        </View>
        </View>
        <View style={styles.appointmentActions}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(appointment.status) }]} />
        <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
        </TouchableOpacity>
        </View>
    </View>
   
)

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "#10b981"
    case "pending":
      return "#f59e0b"
    case "cancelled":
      return "#ef4444"
    default:
      return "#6b7280"
  }
}

const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity style={[styles.tabButton, isActive && styles.activeTab]} onPress={onPress}>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
)

export default function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState("today")
  const navigation = useNavigation()

  const appointments = {
    today: [
      {
        id: 1,
        time: "09:00 AM",
        duration: "30 min",
        patientName: "John Doe",
        type: "Regular Checkup",
        location: "Room 101",
        status: "confirmed",
      },
      {
        id: 2,
        time: "10:30 AM",
        duration: "45 min",
        patientName: "Sarah Wilson",
        type: "Consultation",
        location: "Room 102",
        status: "confirmed",
      },
      {
        id: 3,
        time: "02:00 PM",
        duration: "30 min",
        patientName: "Mike Johnson",
        type: "Follow-up",
        location: "Room 101",
        status: "pending",
      },
    ],
    upcoming: [
      {
        id: 4,
        time: "09:00 AM",
        duration: "30 min",
        patientName: "Emma Davis",
        type: "Regular Checkup",
        location: "Room 103",
        status: "confirmed",
      },
      {
        id: 5,
        time: "11:00 AM",
        duration: "60 min",
        patientName: "Robert Brown",
        type: "Surgery Consultation",
        location: "Room 201",
        status: "pending",
      },
    ],
    past: [
      {
        id: 6,
        time: "03:00 PM",
        duration: "30 min",
        patientName: "Lisa Anderson",
        type: "Follow-up",
        location: "Room 102",
        status: "completed",
      },
    ],
  }

  const tabs = [
    { key: "today", title: "Today" },
    { key: "upcoming", title: "Upcoming" },
    { key: "past", title: "Past" },
  ]

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Nuevo HEADER con logo y botón drawer */}
      <View style={styles.header}>
        <Image source={require("../assets/logograma.png")} style={styles.logo} />
        <Pressable onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#fff" />
        </Pressable>
      </View>
      <View style={styles.titulos}>
        <Text style={styles.title}>Appointments</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            title={tab.title}
            isActive={activeTab === tab.key}
            onPress={() => setActiveTab(tab.key)}
          />
        ))}
      </View>

      {/* Appointments List */}
      <FlatList
        data={appointments[activeTab]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <AppointmentCard appointment={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === "today" && "You don't have any appointments today"}
              {activeTab === "upcoming" && "No upcoming appointments scheduled"}
              {activeTab === "past" && "No past appointments to show"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  
  customHeader: {
    backgroundColor: "#204b5e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
 
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2563eb",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  activeTabText: {
    color: "white",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeContainer: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 70,
  },
  appointmentTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  appointmentDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  appointmentMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentLocation: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  appointmentActions: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
  contentHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  marginTop: 20,
  marginBottom: 10,
},
headerTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#1f2937",
},
addButton: {
  backgroundColor: "#2563eb",
  borderRadius: 8,
  padding: 8,
},
titulos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#204b5e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(21, 170, 191)',
    elevation: 4,
    shadowColor: 'rgb(21, 170, 191)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain'
  },
})
