import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  name: string;
  count: number;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

export function CategoryCard({ name, count, icon }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color="#475569" />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {name}
      </Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 0,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  count: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '900',
    color: '#080357',
  },
});

