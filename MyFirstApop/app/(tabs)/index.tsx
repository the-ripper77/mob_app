import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { ActivityRow } from '@/components/dashboard/ActivityRow';
import { CategoryCard } from '@/components/dashboard/CategoryCard';
import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import type { AssetStatus } from '@/data/types';
import { useActivities } from '@/hooks/useActivities';
import { useAssets } from '@/hooks/useAssets';
import { useCategories } from '@/hooks/useCategories';
import { timeAgo } from '@/lib/timeAgo';
import { TopBar } from '@/components/TopBar';
import { useTranslation } from 'react-i18next';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const { assets, loading: assetsLoading } = useAssets();
  const { categories, loading: categoriesLoading } = useCategories();
  const { activities, loading: activitiesLoading } = useActivities(10);
  const { t } = useTranslation();
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'A';

  const { kpi, statusBreakdown, categoryCounts } = useMemo(() => {
    const statusCounts: Record<AssetStatus, number> = {
      Available: 0,
      Maintenance: 0,
      Assigned: 0,
      Lost: 0,
      Scrapped: 0,
    };
    for (const a of assets) {
      statusCounts[a.status]++;
    }
    const total = assets.length;
    const statusBreakdownData = (['Available', 'Maintenance', 'Assigned', 'Lost', 'Scrapped'] as const).map(
      (x) => ({ x, y: statusCounts[x] })
    );
    const categoryCountsMap: Record<string, number> = {};
    for (const a of assets) {
      categoryCountsMap[a.categoryName] = (categoryCountsMap[a.categoryName] ?? 0) + 1;
    }
    const categoryCounts = categories.map((c) => ({ ...c, count: categoryCountsMap[c.name] ?? 0 }));
    const kpi = {
      totalAssets: total,
      inUse: statusCounts.Assigned,
      inMaintenance: statusCounts.Maintenance,
      available: statusCounts.Available,
      lost: statusCounts.Lost,
      scrap: statusCounts.Scrapped,
    };
    return { kpi, statusBreakdown: statusBreakdownData, categoryCounts };
  }, [assets, categories]);

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive', onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        }
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* KPI row */}
        <View style={styles.kpiRow}>
          <KpiCard
            label={t('dashboard.kpi.totalAssets')}
            value={kpi.totalAssets}
            icon="layers-outline"
            style={styles.kpiHalf}
          />
          <KpiCard
            label={t('dashboard.kpi.inUse')}
            value={kpi.inUse}
            icon="people-outline"
            tone="info"
            style={styles.kpiHalf}
          />
        </View>

        <View style={styles.kpiRow}>
          <View style={styles.kpiColumn}>
            <KpiCard
              label={t('dashboard.kpi.inMaintenance')}
              value={kpi.inMaintenance}
              icon="build-outline"
              tone="warning"
              style={styles.kpiMaintenance}
            />
            <View style={styles.kpiMiniRow}>
              <KpiCard
                label={t('dashboard.kpi.lost')}
                value={kpi.lost}
                icon="alert-circle-outline"
                tone="danger"
                style={styles.kpiMini}
              />
              <KpiCard
                label={t('dashboard.kpi.scrap')}
                value={kpi.scrap}
                icon="trash-outline"
                tone="danger"
                style={styles.kpiMini}
              />
            </View>
          </View>

          <KpiCard
            label={t('dashboard.kpi.available')}
            value={kpi.available}
            icon="checkmark-circle-outline"
            tone="success"
            style={styles.kpiSideTall}
          />
        </View>

        {/* Asset categories */}
        <SectionHeader title={t('dashboard.assetCategories')} />
        <View style={styles.categoryGrid}>
          {categoryCounts.map((category) => (
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
        <SectionHeader title={t('dashboard.recentActivity')} />
        <View style={styles.card}>
          {activitiesLoading ? (
            <Text style={styles.muted}>Loading activity…</Text>
          ) : activities.length === 0 ? (
            <Text style={styles.muted}>{t('dashboard.noActivity')}</Text>
          ) : (
            activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                message={activity.message}
                time={timeAgo(activity.createdAt)}
              />
            ))
          )}
        </View>

        {/* Recent assets */}
        <SectionHeader title={t('dashboard.recentAssets')} />
        <View style={styles.card}>
          {assetsLoading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : assets.length === 0 ? (
            <Text style={styles.muted}>{t('dashboard.noAssets')}</Text>
          ) : (
            assets.slice(0, 5).map((asset) => (
              <Pressable
                key={asset.id}
                style={styles.assetRow}
                onPress={() => router.push(`/asset/${asset.id}` as Href)}>
                <View style={styles.assetLeft}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetMeta}>
                    {asset.id} • {asset.locationName}
                  </Text>
                </View>
                <View style={styles.assetRight}>
                  <Text
                    style={[
                      styles.assetStatus,
                      asset.status === 'Available'
                        ? styles.statusAvailable
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
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      <FloatingActionButton
        onAddAsset={() => router.push('/asset/add' as Href)}
        onAddEmployee={() => router.push('/employee/new' as Href)}
        onAddVendor={() => router.push('/vendor/new' as Href)}
        onAddLocation={() => router.push('/location/add' as Href)}
        onAssignAsset={() => router.push('/(tabs)/asset/assign' as Href)}
        onScanAsset={() => router.push('/scan?mode=lookup' as Href)}
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
  statusAvailable: {
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
  muted: {
    fontSize: 13,
    color: '#94A3B8',
    paddingVertical: 8,
  },
});

