import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useSession } from "../context/SessionContext"; // ajusta a tu estructura


const SplashScreen = ({ onFinish }) => {
  const screenOpacity = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const { tokenData } = useSession(); 

  useEffect(() => {
    // Inicia animación pulsante del texto
    textOpacity.value = withRepeat(
      withTiming(0.2, {
        duration: 800,
        easing: Easing.inOut(Easing.ease)
      }),
      -1, // infinito
      true // reversa
    );

    const now = Math.floor(Date.now() / 1000);
       const isExpired = !tokenData?.exp || now >= tokenData.exp;
    
    setTimeout(() => {
      screenOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onFinish)(isExpired ? "LoginScreen" : "HomeScreen");
        }
      });
    }, 1500);
  }, []);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      <Image source={require('../assets/logograma.png')} style={styles.logo} />
      <Animated.Text style={[styles.title, animatedTextStyle]}>
        Cargando...
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain'
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#555'
  }
});

export default SplashScreen;
