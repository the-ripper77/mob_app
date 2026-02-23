import { useEffect, useState } from 'react';

import type { Location } from '@/data/types';
import {
  createLocation as dbCreateLocation,
  deleteLocation as dbDeleteLocation,
  subscribeLocations,
  updateLocation as dbUpdateLocation,
} from '@/lib/database';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeLocations((list) => {
      setLocations(list);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function addLocation(loc: Omit<Location, 'id' | 'createdAt'>) {
    return dbCreateLocation(loc);
  }

  async function updateLocation(id: string, data: Partial<Location>) {
    await dbUpdateLocation(id, data);
  }

  async function removeLocation(id: string) {
    await dbDeleteLocation(id);
  }

  return { locations, loading, addLocation, updateLocation, removeLocation };
}
