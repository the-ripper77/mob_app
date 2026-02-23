import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

type LocationWithCoords = { id: string; name: string; latitude: number; longitude: number };
type Region = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };

type Props = {
  locationsWithCoords: LocationWithCoords[];
  mapRegion: Region;
  hasLocations: boolean;
  selectedLocationId?: string | null;
};

export function LocationMapView({ locationsWithCoords, hasLocations }: Props) {
  return (
    <View style={styles.mapContainer}>
      <View style={styles.placeholder}>
        <Ionicons name="map-outline" size={40} color="#94A3B8" />
        <Text style={styles.placeholderText}>
          Map view is available on iOS and Android.
        </Text>
        {hasLocations && locationsWithCoords.length > 0 && (
          <Text style={styles.placeholderSub}>
            {locationsWithCoords.length} location(s) with coordinates.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 220,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  placeholderSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});
