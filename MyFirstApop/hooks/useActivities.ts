import { useEffect, useState } from 'react';

import type { Activity } from '@/data/types';
import { subscribeActivities } from '@/lib/database';

export function useActivities(limit = 20) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeActivities((list) => {
      setActivities(list);
      setLoading(false);
    }, limit);
    return unsubscribe;
  }, [limit]);

  return { activities, loading };
}
