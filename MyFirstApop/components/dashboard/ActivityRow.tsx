import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  message: string;
  time: string;
};

export function ActivityRow({ message, time }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.dot} />
      <View style={styles.textCol}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
      <Text style={styles.time}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#94A3B8',
    marginTop: 6,
    marginRight: 10,
  },
  textCol: {
    flex: 1,
    paddingRight: 10,
  },
  message: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  time: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});

