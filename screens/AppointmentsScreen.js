import { useState, useEffect, useRef, useCallback } from "react";
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Pressable,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSession } from "../context/SessionContext";
import AppointmentCard from "../components/AppointmentCard";

const LAST_TAB_KEY = "lastActiveTab";

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
    case "Agendado":
      return "#10b981";
    case "Atendido":
      return "#f59e0b";
    case "Confirmado":
      return "#15aabf";
    default:
      return "#6b7280";
  }
};





const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity style={[styles.tabButton, isActive && styles.activeTab]} onPress={onPress}>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
  </TouchableOpacity>
);

export default function AppointmentsScreen() {
  const { tokenData, session } = useSession();
  const [activeTab, setActiveTab] = useState("today");
  const [appointments, setAppointments] = useState({ today: [], upcoming: [], past: [] });
  const [counts, setCounts] = useState({ today: 0, upcoming: 0, past: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState("");
  const tabRef = useRef("today");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  
  const handleTabPress = (key) => {
    tabRef.current = key;
    setActiveTab(key);
  };

  const fetchAppointments = async () => {
    if (!tokenData?.id_especialista || !session?.token) return;
    try {
      if (!refreshing) setLoading(true);
      const response = await fetch(
        `https://pruebas.siac.historiaclinica.org/api/mobile/citas-medico?id_medico=${tokenData.id_especialista}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAppointments({
          today: data.today || [],
          upcoming: data.upcoming || [],
          past: data.past || [],
        });
        setCounts({
          today: data.actualCount === 50 ? "+50" : data.actualCount || 0,
          upcoming: data.futureCount === 50 ? "+50" : data.futureCount || 0,
          past: data.pastCount === 50 ? "+50" : data.pastCount || 0,
        });
        
        setLastUpdated(new Date());
        setRefreshing(false);
        
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated((prev) => (prev ? new Date(prev) : null));
    }, 60000); // 1 minuto
    return () => clearInterval(interval);
  }, []);

  // Carga inicial
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const diff = Math.floor((now - timestamp) / 60000);
    if (diff === 0) return "Última actualización hace unos segundos";
    if (diff === 1) return "Última actualización hace 1 minuto";
    return `Última actualización hace ${diff} minutos`;
  };

  useFocusEffect(
    useCallback(() => {
      setActiveTab(tabRef.current); // mantiene el tab activo
      fetchAppointments();          // carga datos al entrar
    }, [tokenData?.id_especialista, session?.token])
  );


  const tabs = [
    { key: "past", title: "Anteriores" },
    { key: "today", title: "Hoy" },
    { key: "upcoming", title: "Futuras" },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.header}>
        <Image source={require("../assets/logograma.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
       {lastUpdated && (
        <Text style={styles.updatedText}>{getRelativeTime(lastUpdated)}</Text>
      )}
      <View style={styles.titulos}>
        <Text style={styles.title}>Citas</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
  <TouchableOpacity
    style={[
      styles.statCard,
      activeTab === "past" && { backgroundColor: "#204b5e" },
    ]}
    onPress={() => handleTabPress("past")}
  >
    <Text
      style={[
        styles.statNumber,
        activeTab === "past" && { color: "#fff" },
      ]}
    >
      {counts.past}
    </Text>
    <Text
      style={[
        styles.statLabel,
        activeTab === "past" && { color: "#fff" },
      ]}
    >
      Anteriores
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.statCard,
      activeTab === "today" && { backgroundColor: "#204b5e" },
    ]}
    onPress={() => handleTabPress("today")}
  >
    <Text
      style={[
        styles.statNumber,
        activeTab === "today" && { color: "#fff" },
      ]}
    >
      {counts.today}
    </Text>
    <Text
      style={[
        styles.statLabel,
        activeTab === "today" && { color: "#fff" },
      ]}
    >
      Hoy
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.statCard,
      activeTab === "upcoming" && { backgroundColor: "#204b5e" },
    ]}
    onPress={() => handleTabPress("upcoming")}
  >
    <Text
      style={[
        styles.statNumber,
        activeTab === "upcoming" && { color: "#fff" },
      ]}
    >
      {counts.upcoming}
    </Text>
    <Text
      style={[
        styles.statLabel,
        activeTab === "upcoming" && { color: "#fff" },
      ]}
    >
      Futuras
    </Text>
  </TouchableOpacity>
</View>


      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.key}
            title={tab.title}
            isActive={activeTab === tab.key}
            onPress={() => handleTabPress(tab.key)}
          />
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={appointments[activeTab]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <AppointmentCard
            appointment={item}
            formatDate={formatDate}
            formatTime={formatTime}
            getStatusColor={getStatusColor}
          />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchAppointments();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>No se encontraron citas</Text>
              <Text style={styles.emptySubtext}>
                {activeTab === "today" && "No tienes citas agendadas hoy"}
                {activeTab === "upcoming" && "No tienes citas agendadas próximamente"}
                {activeTab === "past" && "No tienes citas anteriores a hoy"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
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
    color: "#204b5e",
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
    backgroundColor: "#204b5e",
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
    shadowColor: "##204b5e",
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
    color: "#204b5e",
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
  backgroundColor: "#204b5e",
  borderRadius: 8,
  padding: 8,
},
titulos: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  
  updateLabel: {
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  updatedText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  popover: {
  position: 'absolute',
  top: 25,
  right: 0,
  backgroundColor: 'white',
  borderRadius: 8,
  padding: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 5,
  zIndex: 1000,
}
})