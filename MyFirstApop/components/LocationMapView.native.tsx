import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Location } from '@/data/types';

type LocationWithCoords = Location & { latitude: number; longitude: number };

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type Props = {
  locationsWithCoords: LocationWithCoords[];
  mapRegion: Region;
  hasLocations: boolean;
  /** When set, the map animates to this location and highlights its marker */
  selectedLocationId?: string | null;
};

export function LocationMapView({
  locationsWithCoords,
  mapRegion,
  hasLocations,
  selectedLocationId,
}: Props) {
  const mapRef = useRef<MapView>(null);

  // Animate to the selected location whenever it changes
  useEffect(() => {
    if (!selectedLocationId || !mapRef.current) return;
    const loc = locationsWithCoords.find((l) => l.id === selectedLocationId);
    if (!loc) return;
    mapRef.current.animateToRegion(
      {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      },
      600 // animation duration in ms
    );
  }, [selectedLocationId, locationsWithCoords]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton={false}>
        {locationsWithCoords.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={loc.address ?? undefined}
            pinColor={loc.id === selectedLocationId ? '#DC2626' : '#080357'}
          />
        ))}
      </MapView>
      {hasLocations && locationsWithCoords.length === 0 && (
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>
            Add latitude & longitude when creating a location to see pins here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 320,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: { width: '100%', height: '100%' },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    padding: 16,
  },
  mapOverlayText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
});
