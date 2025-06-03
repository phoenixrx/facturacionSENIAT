// app/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


export default function DrawerLayout() {
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* Esto hará que las pantallas tengan acceso a navigation */}
    </Drawer>
  );
}

function CustomDrawerContent({ navigation }) {
  return (
    <SafeAreaView style={styles.drawerContent}>
      <TouchableOpacity onPress={() => navigation.navigate('index')}>
        <Text style={styles.drawerItem}>🏠 Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('about')}>
        <Text style={styles.drawerItem}>ℹ️ Acerca de</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('login')}>
        <Text style={styles.drawerItem}>🔐 Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.closeDrawer()}>
        <Text style={styles.drawerItem}>❌ Cerrar menú</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  drawerItem: {
    padding: 16,
    fontSize: 18,
  },
});