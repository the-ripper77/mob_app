import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { AssetLog, Vendor } from '@/data/types';
import { useAssetLogs } from '@/hooks/useAssetLogs';
import { useLocations } from '@/hooks/useLocations';
import { useVendors } from '@/hooks/useVendors';
import { moveToMaintenance, returnToBase, scrapAsset, markAsLost } from '@/lib/database';
import { getFirebaseDatabase } from '@/lib/firebase';
import { onValue, off, ref } from 'firebase/database';

type AssetData = {
    id: string;
    name?: string;
    category?: string;
    categoryName?: string;
    status?: string;
    location?: string;
    locationName?: string;
    purchase_price?: number;
    purchase_date?: number;
    maintenance_count?: number;
    current_vendor_name?: string;
    assigned_to?: string;
    assignedTo?: string | null;
    [key: string]: any;
};

type Props = {
    visible: boolean;
    asset: AssetData | null;
    onClose: () => void;
};

export function AssetTerminal({ visible, asset, onClose }: Props) {
    const { logs, loading: logsLoading } = useAssetLogs(asset?.id ?? null);
    const { vendors } = useVendors();
    const { locations } = useLocations();

    // Live asset data — refreshes automatically after any lifecycle action
    const [liveAsset, setLiveAsset] = useState<AssetData | null>(asset);

    useEffect(() => {
        setLiveAsset(asset); // reset when a new asset is opened
        if (!visible || !asset?.id) return;

        const db = getFirebaseDatabase();
        const assetRef = ref(db, `assets/${asset.id}`);
        const handler = (snap: any) => {
            const val = snap.val();
            if (val) {
                setLiveAsset({
                    ...val,
                    id: asset.id,
                    categoryName: val.categoryName ?? val.category ?? '',
                    locationName: val.locationName ?? val.location ?? '',
                });
            }
        };
        onValue(assetRef, handler);
        return () => off(assetRef, 'value', handler);
    }, [visible, asset?.id]);

    const [processing, setProcessing] = useState(false);
    const [vendorPickerVisible, setVendorPickerVisible] = useState(false);
    const [returnModalVisible, setReturnModalVisible] = useState(false);
    const [scrapModalVisible, setScrapModalVisible] = useState(false);
    const [returnLocation, setReturnLocation] = useState('');
    const [maintenanceCost, setMaintenanceCost] = useState('');
    const [scrapReason, setScrapReason] = useState('');
    const [scrapPrice, setScrapPrice] = useState('');
    const [scrapVendorId, setScrapVendorId] = useState('');

    const scrapVendors = vendors.filter(v => v.category_tags?.includes('Scrap'));

    if (!liveAsset) return null;

    const barcode = liveAsset.id;
    const category = liveAsset.categoryName ?? liveAsset.category ?? '—';
    const purchasePrice = liveAsset.purchase_price ?? 0;

    const purchaseDate = liveAsset.purchase_date
        ? new Date(liveAsset.purchase_date).toISOString().split('T')[0]
        : '—';
    const currentLocation = liveAsset.locationName ?? liveAsset.location ?? '—';
    const status = liveAsset.status ?? 'Unknown';
    const maintenanceCount = liveAsset.maintenance_count ?? 0;
    const currentVendor = liveAsset.current_vendor_name;
    const assignee = liveAsset.assigned_to ?? liveAsset.assignedTo ?? null;

    // Find vendor for contact info when in maintenance
    const vendorInfo = currentVendor
        ? vendors.find((v) => v.company_name === currentVendor)
        : null;

    const repairVendors = vendors.filter(
        (v) => v.category_tags?.includes('Repair') || v.category_tags?.includes('Seller')
    );


    async function handleMaintenance(vendor: Vendor) {
        const costStr = maintenanceCost.replace(/[^0-9.]/g, '');
        const cost = parseFloat(costStr);
        if (isNaN(cost) || cost <= 0) {
            Alert.alert('Required', 'Please enter a valid repair cost before selecting a vendor.');
            return;
        }
        setVendorPickerVisible(false);
        setProcessing(true);
        try {
            await moveToMaintenance(barcode, vendor, cost);
            Alert.alert('✓ Maintenance', `Asset sent to ${vendor.company_name} (Cost: NPR ${cost})`);
            setMaintenanceCost('');
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
        } finally {
            setProcessing(false);
        }
    }

    async function handleReturn() {
        if (!returnLocation.trim()) {
            Alert.alert('Required', 'Enter the return location.');
            return;
        }
        setReturnModalVisible(false);
        setProcessing(true);
        try {
            await returnToBase(barcode, returnLocation.trim());
            Alert.alert('✓ Returned', `Asset returned to "${returnLocation.trim()}"`);
            setReturnLocation('');
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
        } finally {
            setProcessing(false);
        }
    }

    async function handleScrap() {
        if (!scrapReason.trim()) {
            Alert.alert('Required', 'Enter a scrap reason.');
            return;
        }
        const price = parseFloat(scrapPrice) || 0;
        setScrapModalVisible(false);
        setProcessing(true);
        try {
            await scrapAsset(barcode, scrapReason.trim(), price, scrapVendorId);
            Alert.alert('✓ Scrapped', 'Asset marked as Scrapped.');
            setScrapReason('');
            setScrapPrice('');
            setScrapVendorId('');
            onClose();
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
        } finally {
            setProcessing(false);
        }
    }

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
            <View style={s.root}>
                {/* Header */}
                <View style={s.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.sysLabel}>SYSTEM_ID:</Text>
                        <Text style={s.sysValue}>{barcode}</Text>
                    </View>
                    <Pressable onPress={onClose} style={s.closeBtn} hitSlop={12}>
                        <Ionicons name="close" size={26} color="#00FF88" />
                    </Pressable>
                </View>

                <ScrollView style={s.body} contentContainerStyle={s.bodyContent}>
                    {/* ── Section 1: General Info ── */}
                    <Text style={s.sectionTitle}>▸ GENERAL INFO</Text>
                    <View style={s.infoGrid}>
                        <InfoRow label="ASSET_NAME" value={liveAsset.name ?? '—'} />
                        <InfoRow label="CATEGORY" value={category} />
                        <InfoRow label="PURCHASE_PRICE" value={`NPR ${purchasePrice.toLocaleString()}`} />
                        <InfoRow label="PURCHASE_DATE" value={purchaseDate} />
                        <InfoRow label="STATUS" value={status} highlight={
                            status === 'Maintenance' ? '#F59E0B'
                                : status === 'Scrapped' ? '#DC2626'
                                    : status === 'Lost' ? '#EAB308'
                                        : status === 'Available' ? '#00FF88'
                                            : '#38BDF8'
                        } />
                        <InfoRow label="MAINTENANCE_CNT" value={String(maintenanceCount)} />
                        {assignee && <InfoRow label="ASSIGNED_TO" value={assignee as string} />}
                    </View>

                    {/* ── Section 2: Live Location ── */}
                    <Text style={s.sectionTitle}>▸ LIVE LOCATION</Text>
                    <View style={s.infoGrid}>
                        <InfoRow label="CURRENT_LOCATION" value={currentLocation} highlight="#38BDF8" />
                    </View>

                    {status === 'Maintenance' && vendorInfo && (
                        <View style={s.vendorCard}>
                            <Text style={s.vendorTitle}>⚙ VENDOR ON DUTY</Text>
                            <InfoRow label="COMPANY" value={vendorInfo.company_name} />
                            <InfoRow label="PHONE" value={vendorInfo.phone} highlight="#F59E0B" />
                            <InfoRow label="EMAIL" value={vendorInfo.contact_email} />
                        </View>
                    )}

                    {/* ── Section 3: History Log ── */}
                    <Text style={s.sectionTitle}>▸ HISTORY LOG ({logs.length})</Text>
                    <View style={s.logContainer}>
                        {logsLoading ? (
                            <Text style={s.logEmpty}>Loading logs…</Text>
                        ) : logs.length === 0 ? (
                            <Text style={s.logEmpty}>No log entries yet.</Text>
                        ) : (
                            logs.map((log) => <LogRow key={log.id} log={log} />)
                        )}
                    </View>

                    {/* ── Lifecycle Actions ── */}
                    <Text style={s.sectionTitle}>▸ ACTIONS</Text>
                    <View style={s.actionRow}>
                        {status !== 'Scrapped' && status !== 'Maintenance' && (
                            <ActionButton
                                icon="build-outline"
                                label="MAINTENANCE"
                                color="#F59E0B"
                                onPress={() => setVendorPickerVisible(true)}
                                disabled={processing}
                            />
                        )}
                        {(status === 'Maintenance' || status === 'Assigned') && (
                            <ActionButton
                                icon="return-down-back-outline"
                                label="RETURN"
                                color="#00FF88"
                                onPress={() => setReturnModalVisible(true)}
                                disabled={processing}
                            />
                        )}
                        {status !== 'Scrapped' && status !== 'Lost' && (
                            <ActionButton
                                icon="skull-outline"
                                label="SCRAP"
                                color="#DC2626"
                                onPress={() => setScrapModalVisible(true)}
                                disabled={processing}
                            />
                        )}
                        {status !== 'Scrapped' && status !== 'Lost' && (
                            <ActionButton
                                icon="help-circle-outline"
                                label="MARK LOST"
                                color="#EAB308"
                                onPress={() => {
                                    Alert.alert('Mark as Lost', 'Are you sure you want to mark this asset as lost?', [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Yes, Mark Lost', style: 'destructive', onPress: async () => {
                                                setProcessing(true);
                                                try {
                                                    await markAsLost(barcode);
                                                    Alert.alert('✓ Lost', 'Asset marked as Lost.');
                                                } catch (e) {
                                                    Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
                                                } finally {
                                                    setProcessing(false);
                                                }
                                            }
                                        }
                                    ]);
                                }}
                                disabled={processing}
                            />
                        )}
                    </View>

                    {processing && (
                        <View style={s.processingRow}>
                            <ActivityIndicator color="#00FF88" />
                            <Text style={s.processingText}>Processing…</Text>
                        </View>
                    )}
                </ScrollView>

                {/* ── Vendor Picker Modal ── */}
                <Modal visible={vendorPickerVisible} animationType="fade" transparent>
                    <View style={s.overlayBg}>
                        <View style={s.pickerCard}>
                            <Text style={s.pickerTitle}>Select Repair Vendor</Text>
                            <TextInput
                                style={s.modalInput}
                                placeholder="Repair Cost (NPR)"
                                placeholderTextColor="#64748B"
                                value={maintenanceCost}
                                onChangeText={setMaintenanceCost}
                                keyboardType="numeric"
                            />
                            {repairVendors.length === 0 ? (
                                <Text style={s.pickerEmpty}>No repair vendors found. Add one first.</Text>
                            ) : (
                                <FlatList
                                    data={repairVendors}
                                    keyExtractor={(v) => v.id}
                                    style={{ maxHeight: 250 }}
                                    keyboardShouldPersistTaps="handled"
                                    renderItem={({ item }) => (
                                        <Pressable
                                            style={({ pressed }) => [s.vendorRow, pressed && s.vendorRowPressed]}
                                            onPress={() => handleMaintenance(item)}>
                                            <Text style={s.vendorRowName}>{item.company_name}</Text>
                                            <Text style={s.vendorRowLoc}>{item.location_name ?? 'No location'}</Text>
                                        </Pressable>
                                    )}
                                />
                            )}
                            <Pressable style={s.pickerCancel} onPress={() => setVendorPickerVisible(false)}>
                                <Text style={s.pickerCancelText}>CANCEL</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {/* ── Return To Base Modal ── */}
                <Modal visible={returnModalVisible} animationType="fade" transparent>
                    <View style={s.overlayBg}>
                        <View style={s.pickerCard}>
                            <Text style={s.pickerTitle}>Return to Base</Text>
                            <Text style={s.pickerSub}>Select or type the new location:</Text>
                            <TextInput
                                style={s.modalInput}
                                placeholder="Search or enter location…"
                                placeholderTextColor="#64748B"
                                value={returnLocation}
                                onChangeText={setReturnLocation}
                                autoFocus
                            />
                            {/* Location suggestions from DB */}
                            {locations.length > 0 && (
                                <ScrollView
                                    style={{ maxHeight: 180, marginBottom: 8 }}
                                    keyboardShouldPersistTaps="handled"
                                    nestedScrollEnabled
                                >
                                    {locations
                                        .filter(l =>
                                            returnLocation.trim() === '' ||
                                            l.name.toLowerCase().includes(returnLocation.toLowerCase())
                                        )
                                        .map(l => (
                                            <Pressable
                                                key={l.id}
                                                style={({ pressed }) => [s.locationRow, pressed && s.locationRowPressed]}
                                                onPress={() => setReturnLocation(l.name)}
                                            >
                                                <Ionicons name="location-outline" size={14} color="#64748B" />
                                                <Text style={s.locationRowText}>{l.name}</Text>
                                            </Pressable>
                                        ))
                                    }
                                </ScrollView>
                            )}
                            <View style={s.modalBtnRow}>
                                <Pressable style={s.modalBtnCancel} onPress={() => setReturnModalVisible(false)}>
                                    <Text style={s.pickerCancelText}>CANCEL</Text>
                                </Pressable>
                                <Pressable style={s.modalBtnConfirm} onPress={handleReturn}>
                                    <Text style={s.modalBtnConfirmText}>CONFIRM</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* ── Scrap Modal ── */}
                <Modal visible={scrapModalVisible} animationType="fade" transparent>
                    <View style={s.overlayBg}>
                        <View style={s.pickerCard}>
                            <Text style={[s.pickerTitle, { color: '#DC2626' }]}>⚠ Scrap Asset</Text>
                            <Text style={s.pickerSub}>This action cannot be undone. The asset will remain in the database for auditing.</Text>
                            <Text style={s.modalLabel}>Reason *</Text>
                            <TextInput
                                style={s.modalInput}
                                placeholder="e.g. Broken beyond repair, Sold"
                                placeholderTextColor="#64748B"
                                value={scrapReason}
                                onChangeText={setScrapReason}
                            />
                            <Text style={s.modalLabel}>Scrap Value (NPR)</Text>
                            <TextInput
                                style={s.modalInput}
                                placeholder="e.g. 5000"
                                placeholderTextColor="#64748B"
                                value={scrapPrice}
                                onChangeText={setScrapPrice}
                                keyboardType="numeric"
                            />
                            <Text style={s.modalLabel}>Scrap Vendor (Optional)</Text>
                            {scrapVendors.length > 0 ? (
                                <ScrollView style={{ maxHeight: 150, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8 }} keyboardShouldPersistTaps="handled">
                                    {scrapVendors.map(v => (
                                        <Pressable
                                            key={v.id}
                                            style={[
                                                s.vendorRow,
                                                scrapVendorId === v.id && { backgroundColor: '#EFF6FF' }
                                            ]}
                                            onPress={() => setScrapVendorId(v.id === scrapVendorId ? '' : v.id)}
                                        >
                                            <Text style={s.vendorRowName}>{v.company_name}</Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            ) : (
                                <Text style={[s.pickerSub, { fontStyle: 'italic', marginBottom: 12 }]}>No scrap vendors available.</Text>
                            )}
                            <View style={s.modalBtnRow}>
                                <Pressable style={s.modalBtnCancel} onPress={() => setScrapModalVisible(false)}>
                                    <Text style={s.pickerCancelText}>CANCEL</Text>
                                </Pressable>
                                <Pressable style={[s.modalBtnConfirm, { backgroundColor: '#DC2626' }]} onPress={handleScrap}>
                                    <Text style={s.modalBtnConfirmText}>SCRAP</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
    return (
        <View style={s.infoRow}>
            <Text style={s.infoLabel}>{label}:</Text>
            <Text style={[s.infoValue, highlight ? { color: highlight } : null]}>{value}</Text>
        </View>
    );
}

function LogRow({ log }: { log: AssetLog }) {
    return (
        <View style={s.logRow}>
            <Text style={s.logDate}>[{log.date}]</Text>
            <Text style={s.logType}> | {log.type.padEnd(12)}</Text>
            <Text style={s.logNote}> | {log.note}</Text>
        </View>
    );
}

function ActionButton({
    icon,
    label,
    color,
    onPress,
    disabled,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    color: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            style={({ pressed }) => [s.actionBtn, { borderColor: color }, pressed && { opacity: 0.7 }]}
            onPress={onPress}
            disabled={disabled}>
            <Ionicons name={icon} size={18} color={color} />
            <Text style={[s.actionLabel, { color }]}>{label}</Text>
        </Pressable>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const MONO = 'monospace';
const BG = '#0A0E1A';
const BG2 = '#111827';
const GREEN = '#00FF88';
const DIM = '#4B5563';

const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: BG },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
        backgroundColor: BG2,
        borderBottomWidth: 1,
        borderBottomColor: '#1F2937',
    },
    sysLabel: { fontFamily: MONO, fontSize: 11, color: DIM, letterSpacing: 1 },
    sysValue: { fontFamily: MONO, fontSize: 18, fontWeight: '900', color: GREEN, marginTop: 2, letterSpacing: 0.5 },
    closeBtn: { padding: 8 },
    body: { flex: 1 },
    bodyContent: { padding: 20, paddingBottom: 60 },

    sectionTitle: {
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: '800',
        color: GREEN,
        marginTop: 20,
        marginBottom: 10,
        letterSpacing: 1,
    },

    // Info Grid
    infoGrid: {
        backgroundColor: BG2,
        borderRadius: 10,
        padding: 14,
        borderWidth: 1,
        borderColor: '#1F2937',
    },
    infoRow: {
        flexDirection: 'row',
        paddingVertical: 5,
    },
    infoLabel: {
        fontFamily: MONO,
        fontSize: 12,
        color: DIM,
        width: 150,
    },
    infoValue: {
        fontFamily: MONO,
        fontSize: 12,
        color: '#E5E7EB',
        flex: 1,
    },

    // Vendor card
    vendorCard: {
        backgroundColor: '#1C1917',
        borderRadius: 10,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#F59E0B33',
    },
    vendorTitle: {
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: '800',
        color: '#F59E0B',
        marginBottom: 8,
    },

    // Log
    logContainer: {
        backgroundColor: BG2,
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: '#1F2937',
        minHeight: 60,
    },
    logRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#1F293744',
    },
    logDate: { fontFamily: MONO, fontSize: 11, color: '#6B7280' },
    logType: { fontFamily: MONO, fontSize: 11, color: '#F59E0B', fontWeight: '700' },
    logNote: { fontFamily: MONO, fontSize: 11, color: '#9CA3AF', flex: 1 },
    logEmpty: { fontFamily: MONO, fontSize: 12, color: DIM, textAlign: 'center', paddingVertical: 16 },

    // Actions
    actionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1.5,
        backgroundColor: BG2,
    },
    actionLabel: {
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    processingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        justifyContent: 'center',
        paddingVertical: 16,
    },
    processingText: { fontFamily: MONO, fontSize: 12, color: GREEN },

    // Overlay modals
    overlayBg: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        padding: 24,
    },
    pickerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        maxHeight: '80%',
    },
    pickerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    pickerSub: { fontSize: 13, color: '#64748B', marginBottom: 16 },
    pickerEmpty: { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingVertical: 20 },
    vendorRow: {
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    vendorRowPressed: { backgroundColor: '#F8FAFC' },
    vendorRowName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    vendorRowLoc: { fontSize: 12, color: '#64748B', marginTop: 2 },
    pickerCancel: {
        alignItems: 'center',
        paddingVertical: 14,
        marginTop: 8,
    },
    pickerCancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },

    modalInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },
    modalLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 4 },
    modalBtnRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 8,
    },
    modalBtnCancel: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
    },
    modalBtnConfirm: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#080357',
    },
    modalBtnConfirmText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },

    // Location suggestions in Return modal
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    locationRowPressed: { backgroundColor: '#F8FAFC' },
    locationRowText: { fontSize: 14, fontWeight: '600', color: '#334155', flex: 1 },
});
