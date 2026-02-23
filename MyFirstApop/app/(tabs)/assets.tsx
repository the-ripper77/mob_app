import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { STATUS_COLORS, type Asset, type AssetStatus } from '@/data/types';
import { TopBar } from '@/components/TopBar';
import { useAssets } from '@/hooks/useAssets';
import { useTranslation } from 'react-i18next';

const CATEGORIES = ['All', 'IT Equipment', 'Furniture', 'Machinery', 'Vehicles'] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

function AssetCard({
  asset,
  onEdit,
}: {
  asset: Asset;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const statusColor = STATUS_COLORS[asset.status] ?? '#94A3B8';
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardName}>{asset.name}</Text>
            <Text style={styles.cardBarcode}>{asset.id}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{asset.status}</Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>LOC:</Text>
            <Text style={styles.metaText}>{asset.locationName}</Text>
          </View>
          {asset.assignedTo && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>FOR:</Text>
              <Text style={styles.metaText}>{asset.assignedTo}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>CAT:</Text>
            <Text style={styles.metaText}>{asset.categoryName}</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <View style={{ flex: 1 }} />
        <Pressable style={styles.editBtn} onPress={onEdit} hitSlop={8}>
          <Ionicons name="create-outline" size={20} color="#2563EB" />
          <Text style={styles.editLabel}>{t('assets.edit')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function AssetsScreen() {
  const { assets, loading } = useAssets();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');

  const filtered = useMemo(() => {
    // Hide scrapped from the main feed
    let list = assets.filter((a) => a.status !== 'Scrapped');
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'All') {
      list = list.filter((a) => a.categoryName === categoryFilter);
    }
    return list;
  }, [assets, search, categoryFilter]);

  const activeCount = assets.filter((a) => a.status !== 'Scrapped').length;

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('assets.title')}</Text>
          <Text style={styles.sub}>Loading…</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#080357" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar />

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('assets.searchPlaceholder')}
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color="#CBD5E1" />
          </Pressable>
        )}
      </View>

      {/* Category Tabs */}
      <View style={styles.tabRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {CATEGORIES.map((cat) => {
            const active = categoryFilter === cat;
            const count = cat === 'All'
              ? assets.filter(a => a.status !== 'Scrapped').length
              : assets.filter(a => a.status !== 'Scrapped' && a.categoryName === cat).length;

            return (
              <Pressable
                key={cat}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setCategoryFilter(cat)}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {cat === 'All' ? t('assets.all') : cat}
                </Text>
                <View style={[styles.tabBadge, active && styles.tabBadgeActive]}>
                  <Text style={[styles.tabBadgeText, active && styles.tabBadgeTextActive]}>{count}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Asset Feed */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cube-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {assets.length === 0 ? t('assets.noAssets') : t('assets.noMatchingAssets')}
          </Text>
          <Text style={styles.emptySub}>
            {assets.length === 0
              ? t('assets.tapToAdd')
              : t('assets.tryDifferentSearch')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AssetCard
              asset={item}
              onEdit={() => router.push(`/(tabs)/asset/${item.id}` as Href)}
            />
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}


      {/* FAB */}
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
  root: { flex: 1, backgroundColor: '#F5F6FA' },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#080357' },
  sub: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#0F172A',
  },

  // Category Tabs
  tabRow: {
    marginBottom: 12,
  },
  tabScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#080357',
    borderColor: '#080357',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },

  // List
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 100 },
  separator: { height: 10 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    overflow: 'hidden',
  },
  cardBody: { padding: 14 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  cardBarcode: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontFamily: 'monospace' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8' },
  metaText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  editLabel: { fontSize: 13, fontWeight: '700', color: '#2563EB' },

  // Empty
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#475569', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
});

