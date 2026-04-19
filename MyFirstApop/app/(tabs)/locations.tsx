import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/components/dashboard/FloatingActionButton';
import { TopBar } from '@/components/TopBar';
import { useTranslation } from 'react-i18next';
import { LocationMapView } from '@/components/LocationMapView';
import type { Location } from '@/data/types';
import { useLocations } from '@/hooks/useLocations';

const DEFAULT_REGION = {
  latitude: 27.7172,
  longitude: 85.324,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

function LocationRow({
  location,
  isSelected,
  onPress,
  onEdit,
  onDelete,
}: {
  location: Location;
  isSelected: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.row, isSelected && styles.rowSelected]}>
        <View style={styles.rowLeft}>
          <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
            <Ionicons name="location" size={22} color={isSelected ? '#FFFFFF' : '#080357'} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationName}>{location.name}</Text>
            {location.address ? (
              <Text style={styles.address}>{location.address}</Text>
            ) : null}
            {location.latitude != null && location.longitude != null ? (
              <Text style={styles.coords}>
                {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.rowActions}>
          <Pressable style={styles.actionBtn} onPress={onEdit} hitSlop={12}>
            <Ionicons name="pencil-outline" size={20} color="#2563EB" />
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={onDelete} hitSlop={12}>
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function LocationsScreen() {
  const { locations, loading, removeLocation } = useLocations();
  const { t } = useTranslation();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const locationsWithCoords = useMemo(
    () =>
      locations.filter(
        (loc): loc is Location & { latitude: number; longitude: number } =>
          typeof loc.latitude === 'number' && typeof loc.longitude === 'number'
      ),
    [locations]
  );

  const mapRegion = useMemo(() => {
    if (locationsWithCoords.length === 0) return DEFAULT_REGION;
    if (locationsWithCoords.length === 1) {
      return {
        latitude: locationsWithCoords[0].latitude,
        longitude: locationsWithCoords[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    const lats = locationsWithCoords.map((l) => l.latitude);
    const lons = locationsWithCoords.map((l) => l.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.max(0.02, (maxLat - minLat) * 1.5),
      longitudeDelta: Math.max(0.02, (maxLon - minLon) * 1.5),
    };
  }, [locationsWithCoords]);

  function handleDelete(loc: Location) {
    Alert.alert(
      'Delete location',
      `Remove "${loc.name}"? Assets using this location will keep the name but the location will no longer be in the list.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeLocation(loc.id),
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('locations.title')}</Text>
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

      <LocationMapView
        locationsWithCoords={locationsWithCoords}
        mapRegion={mapRegion}
        hasLocations={locations.length > 0}
        selectedLocationId={selectedLocationId}
      />

      {locations.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="location-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>{t('locations.noLocations')}</Text>
          <Text style={styles.emptySub}>{t('locations.noLocationsSub')}</Text>
          <Pressable style={styles.addFirstBtn} onPress={() => router.push('/(tabs)/location/add')}>
            <Text style={styles.addFirstBtnText}>{t('locations.addLocation')}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={locations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <LocationRow
              location={item}
              isSelected={selectedLocationId === item.id}
              onPress={() => setSelectedLocationId(
                selectedLocationId === item.id ? null : item.id
              )}
              onEdit={() => router.push(`/(tabs)/location/add?id=${item.id}`)}
              onDelete={() => handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

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
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 90 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  rowSelected: {
    borderColor: '#080357',
    borderLeftWidth: 4,
    backgroundColor: '#F0F0FF',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5EDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleSelected: {
    backgroundColor: '#080357',
  },
  locationName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  address: { fontSize: 12, color: '#64748B', marginTop: 2 },
  coords: { fontSize: 11, color: '#94A3B8', marginTop: 1, fontFamily: 'monospace' },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtn: { padding: 8 },
  separator: { height: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: '#475569', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  addFirstBtn: {
    marginTop: 16,
    backgroundColor: '#080357',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addFirstBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
