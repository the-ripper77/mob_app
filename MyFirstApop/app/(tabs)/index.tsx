import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { activities, assets, categories, KPI, statusBreakdown } from '@/data/mockData';
import { ActivityRow } from '@/components/dashboard/ActivityRow';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { DonutStatusChart } from '@/components/dashboard/DonutStatusChart';
import { FilterChip } from '@/components/dashboard/FilterChip';
import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';

type FilterType = 'My Assets' | 'Unassigned' | 'Due for Maintenance' | 'By Location';

const FILTERS: FilterType[] = [
  'My Assets',
  'Unassigned',
  'Due for Maintenance',
  'By Location',
];

export default function DashboardScreen() {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('My Assets');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      {/* Fixed top app bar */}
      <View style={styles.topBarContainer}>
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={styles.appName}>Zoro Assets</Text>
            <Text style={styles.appSubtitle}>Dashboard</Text>
          </View>
          <View style={styles.topBarRight}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications-outline" size={18} color="#0F172A" />
            </View>
            <View style={[styles.iconCircle, styles.avatarCircle]}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* KPI row */}
        <View style={styles.kpiRow}>
          <KpiCard
            label="Total Assets"
            value={KPI.totalAssets}
            icon="layers-outline"
            style={styles.kpiHalf}
          />
          <KpiCard
            label="In Use"
            value={KPI.inUse}
            icon="people-outline"
            tone="info"
            style={styles.kpiHalf}
          />
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiColumn}>
            <KpiCard
              label="In Maintenance"
              value={KPI.inMaintenance}
              icon="build-outline"
              tone="warning"
              style={styles.kpiMaintenance}
            />
            <View style={styles.kpiMiniRow}>
              <KpiCard
                label="Lost"
                value={KPI.lost}
                icon="alert-circle-outline"
                tone="danger"
                style={styles.kpiMini}
              />
              <KpiCard
                label="Scrap"
                value={KPI.scrap}
                icon="trash-outline"
                tone="danger"
                style={styles.kpiMini}
              />
            </View>
          </View>

          <KpiCard
            label="Available"
            value={KPI.available}
            icon="checkmark-circle-outline"
            tone="success"
            style={styles.kpiSideTall}
          />
        </View>

        {/* Asset status overview */}
        <SectionHeader title="Asset Status Overview" />
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <DonutStatusChart data={statusBreakdown} totalLabel="Assets" />
          </View>
        </View>
        
        {/* Smart filters */}
        <SectionHeader title="Smart Filters" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map(function (filter) {
            return (
              <FilterChip
                key={filter}
                label={filter}
                selected={selectedFilter === filter}
                onPress={() => setSelectedFilter(filter)}
              />
            );
          })}
        </ScrollView>

        {/* Asset categories */}
        <SectionHeader title="Asset Categories" />
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              count={category.count}
              icon={
                category.name === 'IT Equipment'
                  ? 'laptop'
                  : category.name === 'Vehicles'
                  ? 'car-sports'
                  : category.name === 'Machinery'
                  ? 'factory'
                  : 'sofa-single'
              }
            />
          ))}
        </View>

        {/* Recent activity */}
        <SectionHeader title="Recent Activity" />
        <View style={styles.card}>
          {activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              message={activity.message}
              time={activity.time}
            />
          ))}
        </View>

        {/* Sample asset list */}
        <SectionHeader title="Sample Assets" />
        <View style={styles.card}>
          {assets.map((asset) => (
            <View key={asset.id} style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetMeta}>
                  {asset.id} • {asset.location}
                </Text>
              </View>
              <View style={styles.assetRight}>
                <Text
                  style={[
                    styles.assetStatus,
                    asset.status === 'Active'
                      ? styles.statusActive
                      : asset.status === 'Maintenance'
                      ? styles.statusMaintenance
                      : asset.status === 'Assigned'
                      ? styles.statusAssigned
                      : styles.statusOffline,
                  ]}>
                  {asset.status}
                </Text>
                <Text style={styles.assetAssignee}>
                  {asset.assignedTo ? asset.assignedTo : 'Unassigned'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <FloatingActionButton
        onAdd={() => {}}
        onScan={() => {}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  topBarContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#0B1220',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  topBarLeft: {
    flexDirection: 'column',
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#080357',
  },
  appSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    backgroundColor: '#080357',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#080357',
  },
  screenSub: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  kpiHalf: {
    width: '48%',
  },
  kpiColumn: {
    width: '48%',
  },
  kpiMaintenance: {
    width: '100%',
    marginBottom: 8,
  },
  kpiMiniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 8,
  },
  kpiMini: {
    width: '48%',
    paddingVertical: 8,
  },
  kpiSideTall: {
    width: '48%',
    alignSelf: 'stretch',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingVertical: 4,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginTop: 4,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  assetLeft: {
    flex: 1,
    paddingRight: 10,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  assetMeta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  assetStatus: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
    color: '#FFFFFF',
  },
  statusActive: {
    backgroundColor: '#16A34A',
  },
  statusMaintenance: {
    backgroundColor: '#F59E0B',
  },
  statusAssigned: {
    backgroundColor: '#2563EB',
  },
  statusOffline: {
    backgroundColor: '#DC2626',
  },
  assetAssignee: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
});

