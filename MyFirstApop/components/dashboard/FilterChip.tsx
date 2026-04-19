import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function FilterChip({ label, selected = false, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipUnselected,
        style,
      ]}>
      <Text style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#080357',
    borderColor: '#080357',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  text: {
    fontSize: 13,
    fontWeight: '800',
  },
  textSelected: {
    color: '#FFFFFF',
  },
  textUnselected: {
    color: '#334155',
  },
});

