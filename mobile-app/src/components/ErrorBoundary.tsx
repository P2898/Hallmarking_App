import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠️ App Crashed</Text>
          <Text style={styles.subtitle}>Error Details:</Text>
          <ScrollView style={styles.scrollView}>
            <Text style={styles.errorName}>{this.state.error.name}</Text>
            <Text style={styles.errorMessage}>{this.state.error.message}</Text>
            <Text style={styles.errorStack}>{this.state.error.stack}</Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 15,
  },
  errorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 5,
  },
  errorMessage: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 15,
  },
  errorStack: {
    fontSize: 11,
    color: '#a0a0a0',
    fontFamily: 'monospace',
  },
});
