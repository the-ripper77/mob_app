import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AssetsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Assets</Text>
        <Text style={styles.sub}>Placeholder screen (hook up list/search later).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#080357',
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
});

