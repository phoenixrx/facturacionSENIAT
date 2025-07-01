import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('🛑 Error capturado por ErrorBoundary:', error, info);
    // Aquí puedes enviar el error a tu backend o a una herramienta como Sentry
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ha ocurrido un error</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: 'red',
  },
  message: {
    fontSize: 16, textAlign: 'center',
  },
});

export default ErrorBoundary;
