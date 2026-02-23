import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AssetStatus } from '@/data/types';
import { STATUS_COLORS } from '@/data/types';

type Datum = { x: AssetStatus; y: number };

type Props = {
  data: Datum[];
  totalLabel?: string;
};

/**
 * Mock donut chart container that avoids Skia / victory-native,
 * but still presents a donut-style visualization + legend.
 */
export function DonutStatusChart({ data, totalLabel = 'Total' }: Props) {
  const total = data.reduce((sum, d) => sum + d.y, 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.donutShell}>
        <View style={styles.donutInner}>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {data.map((item) => (
          <View key={item.x} style={styles.legendRow}>
            <View
              style={[styles.swatch, { backgroundColor: STATUS_COLORS[item.x] }]}
            />
            <Text style={styles.legendLabel}>{item.x}</Text>
            <Text style={styles.legendValue}>{item.y}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  donutShell: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
  },
  legend: {
    width: '100%',
    marginTop: 18,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
});

