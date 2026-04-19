import { useEffect, useState } from 'react';

import type { AssetLog } from '@/data/types';
import { subscribeAssetLogs } from '@/lib/database';

export function useAssetLogs(assetId: string | null, limit = 10) {
    const [logs, setLogs] = useState<AssetLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!assetId) {
            setLogs([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const unsubscribe = subscribeAssetLogs(
            assetId,
            (list) => {
                setLogs(list);
                setLoading(false);
            },
            limit
        );
        return unsubscribe;
    }, [assetId, limit]);

    return { logs, loading };
}
