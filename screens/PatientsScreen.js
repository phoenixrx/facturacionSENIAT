import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '../context/SessionContext';

const PatientsScreen = () => {
  const navigation = useNavigation();
  const { tokenData, session } = useSession();
  const id_medico = tokenData?.id_especialista || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchNombre, setSearchNombre] = useState('');
  const [searchCedula, setSearchCedula] = useState('');
  const [buttonGroupStart, setButtonGroupStart] = useState(1);
const MAX_BUTTONS = 5;

const getPageGroup = () => {
  const half = Math.floor(MAX_BUTTONS / 2);
  let start = Math.max(currentPage - half, 1);
  let end = start + MAX_BUTTONS - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(end - MAX_BUTTONS + 1, 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

  
  const perPage = 5;

  const fetchPacientes = async (pageToLoad = 1, reset = false) => {
  if (loading) return;
  setLoading(true);

  const url = new URL('https://pruebas.siac.historiaclinica.org/api/mobile/pacientes-medico');
  url.searchParams.append('id_medico', id_medico);
  url.searchParams.append('page', pageToLoad);
  url.searchParams.append('perPage', perPage);
  if (searchNombre) url.searchParams.append('paciente', searchNombre);
  if (searchCedula) url.searchParams.append('cedula', searchCedula);

  try {
    const res = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          });
    const json = await res.json();
    
    if (json.success) {
      const nuevos = json.pacientes || [];
      setPacientes(reset ? nuevos : [...pacientes, ...nuevos]);
      setCurrentPage(pageToLoad);

      setTotalPages(Number(json.pagination?.totalPages || 1));

    } else {
      Alert.alert('Error', 'No se pudo obtener la lista de pacientes');
    }
  } catch (err) {
    console.error(err, json);
    Alert.alert('Error', 'Hubo un problema de conexión');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchPacientes(1, true);
  }, []);

const handleSearch = () => {
    Keyboard.dismiss(); 
  setCurrentPage(1);
  fetchPacientes(1, true); // Página 1, reset de resultados
};

  const renderPaciente = ({ item }) => (
    <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('PatientDetail', { paciente: item })}
  >
      <Text style={styles.name}>{item.paciente}</Text>
      <Text>Cédula: {item.cedula}</Text>
      <Text>Edad: {item.edad}</Text>
      <Text>Estudios: {item.estudios}</Text>
      <Text>Fecha admisión: {new Date(item.fecha_admision).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  const renderPagination = () => {
  const pageGroupSize = 5;
  const pageNumbers = [];

  const groupEnd = Math.min(buttonGroupStart + pageGroupSize - 1, totalPages);

  for (let i = buttonGroupStart; i <= groupEnd; i++) {
    pageNumbers.push(i);
  }

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    fetchPacientes(pageNum, true);
  };

  const handlePrevGroup = () => {
    const newStart = Math.max(buttonGroupStart - pageGroupSize, 1);
    setButtonGroupStart(newStart);
    handlePageChange(newStart);
  };

  const handleNextGroup = () => {
    const newStart = buttonGroupStart + pageGroupSize;
    if (newStart <= totalPages) {
      setButtonGroupStart(newStart);
      handlePageChange(newStart);
    }
  };

  return (
    <View style={styles.paginationContainer}>
      {buttonGroupStart > 1 && (
        <TouchableOpacity style={styles.pageButton} onPress={handlePrevGroup}>
          <Text style={{ color: '#204b5e' }}>◀</Text>
        </TouchableOpacity>
      )}
      {pageNumbers.map((pageNum) => (
        <TouchableOpacity
          key={pageNum}
          style={[
            styles.pageButton,
            currentPage === pageNum && styles.pageButtonActive,
          ]}
          onPress={() => handlePageChange(pageNum)}
        >
          <Text style={{ color: currentPage === pageNum ? '#fff' : '#204b5e' }}>{pageNum}</Text>
        </TouchableOpacity>
      ))}
      {groupEnd < totalPages && (
        <TouchableOpacity style={styles.pageButton} onPress={handleNextGroup}>
          <Text style={{ color: '#204b5e' }}>▶</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};


return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
    <View style={styles.header}>
      <Image source={require('../assets/logograma.png')} style={styles.logo} />
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>
    </View>

    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
      {/* Buscar */}
      <TextInput
        placeholder="Buscar por nombre"
        style={styles.input}
        value={searchNombre}
        onChangeText={setSearchNombre}
         onFocus={() => setSearchCedula('')} 
        onSubmitEditing={handleSearch}
      />

      <TextInput
        placeholder="Buscar por cédula"
        style={styles.input}
        value={searchCedula}
        onChangeText={setSearchCedula}
        onFocus={() => setSearchNombre('')}
        keyboardType="numeric"
        onSubmitEditing={handleSearch}
      />

      <TouchableOpacity
  style={[styles.searchBtn, loading && { opacity: 0.6 }]}
  onPress={handleSearch}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buscar</Text>
  )}
</TouchableOpacity>


      {/* Listado */}
      {loading ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
    <ActivityIndicator size="large" color="#204b5e" />
    <Text style={{ marginTop: 10, color: '#204b5e' }}>Buscando pacientes...</Text>
  </View>
) : (
  <FlatList
    data={pacientes}
    keyExtractor={(item, index) => `${item.id_paciente}_${index}`}
    renderItem={renderPaciente}
    contentContainerStyle={{ paddingBottom: 80 }}
    ListEmptyComponent={
      !loading && (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No hay pacientes
        </Text>
      )
    }
  />
)}

 
    </View>

    {/* Paginación */}
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={styles.pageButton}
        disabled={currentPage === 1}
        onPress={() => {
          const prevPage = Math.max(currentPage - MAX_BUTTONS, 1);
          setCurrentPage(prevPage);
          fetchPacientes(prevPage, true);
        }}
      >
        <Text style={styles.pageArrow}>{'◀'}</Text>
      </TouchableOpacity>

      {getPageGroup().map((pageNum) => (
        <TouchableOpacity
          key={pageNum}
          style={[
            styles.pageButton,
            currentPage === pageNum && styles.pageButtonActive,
          ]}
          onPress={() => {
            setCurrentPage(pageNum);
            fetchPacientes(pageNum, true);
          }}
        >
          <Text
            style={{
              color: currentPage === pageNum ? '#fff' : '#204b5e',
              fontWeight: 'bold',
            }}
          >
            {pageNum}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.pageButton}
        disabled={currentPage + MAX_BUTTONS > totalPages}
        onPress={() => {
          const nextPage = Math.min(currentPage + MAX_BUTTONS, totalPages);
          setCurrentPage(nextPage);
          fetchPacientes(nextPage, true);
        }}
      >
        <Text style={styles.pageArrow}>{'▶'}</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);



};

const styles = {
  header: {
    backgroundColor: '#204b5e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: 'rgb(21, 170, 191)',
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  searchBtn: {
    backgroundColor: '#204b5e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#f2f9fc',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#204b5e',
  },
  loadMoreBtn: {
    alignSelf: 'center',
    padding: 10,
    marginVertical: 12,
  },
  container: {
  flex: 1,
  paddingHorizontal: 16,
  paddingTop: 16,
},
paginationContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingBottom: 24,
  borderTopWidth: 1,
  borderTopColor: '#ddd',
  backgroundColor: '#fff',
},
pageButton: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderWidth: 1,
  borderColor: '#204b5e',
  borderRadius: 6,
  marginHorizontal: 4,
},
pageButtonActive: {
  backgroundColor: '#204b5e',
},

};

export default PatientsScreen;
