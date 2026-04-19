import { useEffect, useState } from 'react';

import type { Asset } from '@/data/types';
import {
  createAsset as dbCreateAsset,
  deleteAsset as dbDeleteAsset,
  subscribeAssets,
  updateAsset as dbUpdateAsset,
} from '@/lib/database';

export function useAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAssets((list) => {
      setAssets(list);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function addAsset(asset: Omit<Asset, 'id' | 'createdAt'>) {
    return dbCreateAsset(asset);
  }

  async function updateAsset(id: string, data: Partial<Asset>) {
    await dbUpdateAsset(id, data);
  }

  async function removeAsset(id: string) {
    await dbDeleteAsset(id);
  }

  return { assets, loading, addAsset, updateAsset, removeAsset };
}
