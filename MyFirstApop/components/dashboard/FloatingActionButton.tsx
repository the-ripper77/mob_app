import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onAdd?: () => void;
  onScan?: () => void;
};

export function FloatingActionButton({ onAdd, onScan }: Props) {
  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Pressable
        onPress={() => {
          Alert.alert('Asset actions', 'Choose an action', [
            { text: 'Add Asset', onPress: onAdd },
            { text: 'Scan Asset', onPress: onScan },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}
        style={styles.button}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
  },
  button: {
    width: 66,
    height: 66,
    borderRadius: 999,
    backgroundColor: '#080357',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1220',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
});

