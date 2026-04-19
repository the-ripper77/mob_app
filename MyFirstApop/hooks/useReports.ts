import { useMemo } from 'react';
import { useAssets } from './useAssets';
import { useEmployees } from './useEmployees';
import { useVendors } from './useVendors';
import { subscribeActivities } from '@/lib/database';
import { useEffect, useState } from 'react';
import type { Activity } from '@/data/types';

export function useReports() {
    const { assets, loading: assetsLoading } = useAssets();
    const { employees, loading: employeesLoading } = useEmployees();
    const { vendors, loading: vendorsLoading } = useVendors();

    const [activities, setActivities] = useState<Activity[]>([]);
    const [activitiesLoading, setActivitiesLoading] = useState(true);

    // Subscribe to a larger pool of activities for historical reports.
    useEffect(() => {
        const unsubscribe = subscribeActivities((list) => {
            setActivities(list);
            setActivitiesLoading(false);
        }, 1000); // Fetch up to 1000 logs for reporting
        return unsubscribe;
    }, []);

    const loading = assetsLoading || employeesLoading || vendorsLoading || activitiesLoading;

    const reportData = useMemo(() => {
        if (loading) return null;

        // ─── 1. Core Metrics ──────────────────────────────────────────────────
        let totalAssets = 0;
        let totalValue = 0;
        let totalScrapValue = 0;
        let inRepairCount = 0;
        let lostCount = 0;
        let totalRepairValue = 0;
        let totalLostValue = 0;

        // Rule 1 Guardrail: Cloud Function simulation
        const CAN_CALCULATE_VALUE = assets.length <= 100;

        const activeInventory = assets.filter(a => a.status !== 'Scrapped'); // Rule 3

        for (const asset of activeInventory) {
            totalAssets++;
            if (CAN_CALCULATE_VALUE) {
                // Emulate average 500 value if not specifically tracked in Asset locally, or use actual
                totalValue += (asset.purchase_price || 500);
            }
            if (asset.status === 'Maintenance') {
                inRepairCount++;
            }
            if (asset.status === 'Lost') {
                lostCount++;
                if (CAN_CALCULATE_VALUE) {
                    totalLostValue += (asset.purchase_price || 500);
                }
            }
        }

        const scrappedInventory = assets.filter(a => a.status === 'Scrapped');
        for (const asset of scrappedInventory) {
            if (CAN_CALCULATE_VALUE) {
                totalScrapValue += (asset.scrap_price || 0);
            }
        }

        // ─── 2. Asset Reliability (Lemon Report) ──────────────────────────────
        // In real schema, maintenance_count would be checked. Here we aggregate 'MAINTENANCE' activities per asset.
        const maintenanceLogs = activities.filter(a => a.type === 'MAINTENANCE');
        const maintenanceCounts: Record<string, number> = {};
        maintenanceLogs.forEach(log => {
            totalRepairValue += (log.cost || 0);
            if (log.asset_id) {
                maintenanceCounts[log.asset_id] = (maintenanceCounts[log.asset_id] || 0) + 1;
            }
        });

        const reliabilityReport = assets
            .filter(a => (maintenanceCounts[a.id] || 0) >= 3)
            .map(a => {
                const count = maintenanceCounts[a.id] || 0;
                const daysOwned = Math.max(1, Math.floor((Date.now() - a.createdAt) / (1000 * 60 * 60 * 24)));
                return {
                    ...a,
                    maintenanceCount: count,
                    reliabilityScore: daysOwned / count, // Lower is worse
                };
            })
            .sort((a, b) => a.reliabilityScore - b.reliabilityScore);

        // ─── 3. Custody & Liability ──────────────────────────────────────────
        const custodyReport = employees.map(emp => {
            const heldAssets = assets.filter(a => a.assignedTo === emp.full_name);
            return {
                employee: emp,
                assetsHeld: heldAssets.length,
                estimatedValue: heldAssets.length * 500, // Simulated total
            };
        });

        // ─── 4. Vendor Performance ───────────────────────────────────────────
        const vendorReport = vendors.map(v => {
            const vLogs = maintenanceLogs.filter(log => log.target_id === v.id || log.metadata?.vendor === v.company_name);
            const totalSpend = vLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
            return {
                vendor: v,
                repairCount: vLogs.length,
                totalSpend,
            };
        });

        // ─── 5. Financial Depreciation ───────────────────────────────────────
        const depreciationRate = 0.15; // 15% per yr
        const depreciationReport = activeInventory.map(a => {
            const years = Math.floor((Date.now() - a.createdAt) / (1000 * 60 * 60 * 24 * 365));
            const initialValue = 500; // Simulated
            const currentValue = initialValue * Math.pow((1 - depreciationRate), years);
            return {
                ...a,
                initialValue,
                currentValue: Math.max(0, currentValue),
                scrappable: currentValue < 50,
            };
        });

        return {
            metrics: {
                totalAssets,
                totalValue: CAN_CALCULATE_VALUE ? totalValue : null, // null implies delegate to Cloud Function
                totalScrapValue: CAN_CALCULATE_VALUE ? totalScrapValue : null,
                totalRepairValue: CAN_CALCULATE_VALUE ? totalRepairValue : null,
                totalLostValue: CAN_CALCULATE_VALUE ? totalLostValue : null,
                inRepairCount,
                lostCount,
                isValueTruncated: !CAN_CALCULATE_VALUE,
            },
            reliabilityReport,
            custodyReport,
            vendorReport,
            depreciationReport,
            rawActivities: activities,
            rawAssets: activeInventory,
            allAssets: assets, // Includes Scrapped
        };
    }, [assets, employees, vendors, activities, loading]);

    return { reportData, loading };
}
