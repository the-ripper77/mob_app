import { useEffect, useState } from 'react';

import type { Vendor } from '@/data/types';
import {
    createVendor as dbCreateVendor,
    subscribeVendors,
    updateVendor as dbUpdateVendor,
} from '@/lib/database';

export function useVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeVendors((list) => {
            setVendors(list);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    async function addVendor(vendor: Omit<Vendor, 'id' | 'createdAt'>) {
        return dbCreateVendor(vendor);
    }

    async function updateVendor(id: string, data: Partial<Vendor>) {
        await dbUpdateVendor(id, data);
    }

    return { vendors, loading, addVendor, updateVendor };
}
