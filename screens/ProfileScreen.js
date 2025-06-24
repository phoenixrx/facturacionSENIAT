import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { useSession } from '../context/SessionContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { tokenData, session } = useSession();
  const id_medico = tokenData?.id_especialista || '';

  const [perfil, setPerfil] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    cedula_profesional: '',
    titulo: '',
    telefono: '',
    especialidades: [],
  });
const [tempValues, setTempValues] = useState({});

  const [originalPerfil, setOriginalPerfil] = useState({});
  const [loadingFields, setLoadingFields] = useState({});
  const [successFields, setSuccessFields] = useState({});
  const [tooltipVisible, setTooltipVisible] = useState(false);

  // Cargar perfil al iniciar
  useEffect(() => {
    fetch(`https://pruebas.siac.historiaclinica.org/api/mobile/perfil-medico?id_medico=${id_medico}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.perfil.length > 0) {
          const data = json.perfil[0];
          const perfilData = {
            nombres: data.nombres || '',
            apellidos: data.apellidos || '',
            cedula: data.cedula || '',
            cedula_profesional: data.cedula_profesional || '',
            titulo: data.titulo || '',
            telefono: data.telefono || '',
            especialidades: data.especialidades
              ? data.especialidades.split(';').filter(e => e)
              : [],
          };
          setPerfil(perfilData);
          setOriginalPerfil(perfilData);
        }
      })
      .catch(err => {
        Alert.alert('Error', 'No se pudo cargar el perfil.');
        console.error(err);
      });
  }, []);

  const handleUpdateField = (campo, valor) => {
    const originalValor = originalPerfil[campo];
    if (valor === originalValor) return;

    setLoadingFields(prev => ({ ...prev, [campo]: true }));

    const { token } = session;

    fetch(
      `https://pruebas.siac.historiaclinica.org/api/mobile/perfil-medico?id_medico=${id_medico}&campo=${campo}&data=${encodeURIComponent(valor)}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setOriginalPerfil(prev => ({ ...prev, [campo]: valor }));
          setSuccessFields(prev => ({ ...prev, [campo]: true }));
          setTimeout(() => {
            setSuccessFields(prev => ({ ...prev, [campo]: false }));
          }, 2500);
        } else {
          Alert.alert('Error', 'No se pudo actualizar el campo.');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'Hubo un problema al actualizar.');
      })
      .finally(() => {
        setLoadingFields(prev => ({ ...prev, [campo]: false }));
      });
  };

const renderField = (label, fieldKey, keyboardType = 'default') => (
  <>
    <Text>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TextInput
        style={styles.input}
        value={perfil[fieldKey]}
        keyboardType={keyboardType}
        editable={!loadingFields[fieldKey]}
        onChangeText={(text) => {
          setPerfil(prev => ({ ...prev, [fieldKey]: text }));
          setTempValues(prev => ({ ...prev, [fieldKey]: text }));
        }}
        onEndEditing={() =>
          handleUpdateField(fieldKey, tempValues[fieldKey])
        }
      />
      {loadingFields[fieldKey] ? (
        <ActivityIndicator size="small" color="#204b5e" style={{ marginLeft: 8 }} />
      ) : successFields[fieldKey] ? (
        <MaterialIcons name="check-circle" size={20} color="green" style={{ marginLeft: 8 }} />
      ) : null}
    </View>
  </>
);



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Image source={require('../assets/logograma.png')} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {renderField('Nombres', 'nombres')}
        {renderField('Apellidos', 'apellidos')}
        {renderField('Cédula', 'cedula', 'numeric')}
        {renderField('Cédula Profesional', 'cedula_profesional')}
        {renderField('Título', 'titulo')}
        {renderField('Teléfono', 'telefono', 'phone-pad')}

        <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Especialidades registradas</Text>

        {perfil.especialidades.map((esp, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.especialidadBtn}
            onPress={() => setTooltipVisible(true)}
          >
            <Text style={{ color: '#204b5e' }}>{esp}</Text>
          </TouchableOpacity>
        ))}

        <Snackbar
          visible={tooltipVisible}
          onDismiss={() => setTooltipVisible(false)}
          duration={3000}
          style={{ backgroundColor: '#204b5e' }}
        >
          Esta acción solo está disponible desde la versión de escritorio.
        </Snackbar>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    flex: 1,
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
  },
  logo: {
    width: 80,
    height: 40,
    resizeMode: 'contain',
  },
  especialidadBtn: {
    backgroundColor: '#e3f3f6',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
};

export default ProfileScreen;
