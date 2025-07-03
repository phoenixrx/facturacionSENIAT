# Limpieza completa del proyecto React Native con Expo en Windows

Write-Host "🧹 Limpiando entorno..."

# Eliminar node_modules, cache y archivos temporales
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\.gradle -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\.cxx -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force android\app\build -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

# Limpiar caché de npm y Metro bundler
npm cache clean --force

Write-Host "📦 Reinstalando dependencias desde cero..."

# Reinstalar dependencias con versiones compatibles
npm install --save-exact `
  @expo/metro-runtime@~5.0.4 `
  @react-native-async-storage/async-storage@2.1.2 `
  @react-native-community/datetimepicker@8.4.1 `
  @react-native-masked-view/masked-view@0.3.2 `
  @react-native-picker/picker@2.11.1 `
  @react-navigation/drawer@7.4.1 `
  @react-navigation/native@7.1.10 `
  @react-navigation/native-stack@7.3.14 `
  axios@1.9.0 `
  expo@~53.0.9 `
  expo-constants@~17.1.6 `
  expo-dev-client@~5.2.2 `
  expo-device@~7.1.4 `
  expo-image-picker@~16.1.4 `
  expo-modules-core@~2.4.1 `
  expo-network@~7.1.5 `
  expo-notifications@~0.31.3 `
  expo-status-bar@~2.2.3 `
  expo-updates@~0.28.15 `
  html-entities@2.6.0 `
  react@19.0.0 `
  react-dom@19.0.0 `
  react-native@0.79.2 `
  react-native-collapsible@1.6.2 `
  react-native-elements@3.4.3 `
  react-native-gesture-handler@2.12.1 `
  react-native-modal@14.0.0-rc.1 `
  react-native-modal-datetime-picker@18.0.0 `
  react-native-paper@5.14.5 `
  react-native-reanimated@3.7.4 `
  react-native-safe-area-context@5.4.0 `
  react-native-screens@4.11.1 `
  react-native-toast-message@2.3.0 `
  react-native-vector-icons@10.2.0 `
  react-native-web@0.20.0

# Instalar devDependencies
npm install --save-dev `
  @react-native-community/cli@18.0.0 `
  @babel/core@^7.22.20

Write-Host "✅ Instalación completada. Limpieza final..."

# Limpiar y reconstruir
cd android
./gradlew clean
cd ..

Write-Host "🚀 Ejecutando Expo..."
npx expo run:android
