import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label: string;
  value: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
  style?: StyleProp<ViewStyle>;
};

const TONE = {
  primary: { bg: '#EEF2FF', fg: '#080357' },
  success: { bg: '#ECFDF5', fg: '#16A34A' },
  warning: { bg: '#FFFBEB', fg: '#F59E0B' },
  info: { bg: '#EFF6FF', fg: '#2563EB' },
  danger: { bg: '#FEF2F2', fg: '#DC2626' },
} as const;

export function KpiCard({ label, value, icon, tone = 'primary', style }: Props) {
  const colors = TONE[tone];
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.bg }]}>
        <Ionicons name={icon} size={18} color={colors.fg} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  value: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.2,
  },
});

