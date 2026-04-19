import { useEffect, useState } from 'react';

import type { Category } from '@/data/types';
import { ensureDefaultCategories, subscribeCategories } from '@/lib/database';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    ensureDefaultCategories().then(() => {
      unsubscribe = subscribeCategories((list) => {
        setCategories(list);
        setLoading(false);
      });
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  return { categories, loading };
}
