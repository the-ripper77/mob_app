import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { STATUS_COLORS, type AssetStatus } from '@/data/types';
import { logActivity, updateAsset as dbUpdateAsset } from '@/lib/database';
import { useAssets } from '@/hooks/useAssets';
import { useLocations } from '@/hooks/useLocations';
import { useEmployees } from '@/hooks/useEmployees';
import { useVendors } from '@/hooks/useVendors';
import { SearchablePicker } from '@/components/asset/SearchablePicker';
import { CategoryFields } from '@/components/asset/CategoryFields';
import { FormField } from '@/components/asset/FormField';
import type {
    AssetCategory,
    FurnitureDetails,
    ITEquipmentDetails,
    MachineryDetails,
    VehicleDetails
} from '@/data/types';

// ─── Default states (for reset) ────────────────────────────────────────────────
const defaultFurniture: FurnitureDetails = { material: '', dimensions: '', is_assembled: false };
const defaultIT: ITEquipmentDetails = { brand_model: '', serial_number: '', specs: { cpu: '', ram: '', storage: '' }, os_version: '' };
const defaultMachinery: MachineryDetails = { power_specs: '', meter_reading: '', safety_cert_date: '', emergency_contact: '' };
const defaultVehicle: VehicleDetails = { license_plate: '', vin: '', fuel_type: '', odometer: '' };

export default function AssetDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { assets } = useAssets();
    const { locations } = useLocations();
    const { vendors } = useVendors();
    const { employees } = useEmployees();

    const asset = assets.find((a) => a.id === id);
    const [saving, setSaving] = useState(false);

    // Editable fields
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [status, setStatus] = useState<AssetStatus>('Available');
    const [notes, setNotes] = useState('');

    // Logistics
    const [location, setLocation] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    // Purchase
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [selectedVendorId, setSelectedVendorId] = useState('');

    // Category-specific fields
    const [furniture, setFurniture] = useState<FurnitureDetails>(defaultFurniture);
    const [itEquipment, setItEquipment] = useState<ITEquipmentDetails>(defaultIT);
    const [machinery, setMachinery] = useState<MachineryDetails>(defaultMachinery);
    const [vehicles, setVehicles] = useState<VehicleDetails>(defaultVehicle);

    if (!id || !asset) {
        return (
            <View style={styles.centered}>
                <Text style={styles.notFound}>Asset not found.</Text>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtnText}>Go back</Text>
                </Pressable>
            </View>
        );
    }

    async function handleSave() {
        if (!asset) return;
        if (!name.trim()) {
            Alert.alert('Error', 'Asset name is required.');
            return;
        }

        const price = parseFloat(purchasePrice);
        if (purchasePrice.trim() && (isNaN(price) || price < 0)) {
            Alert.alert('Error', 'Please enter a valid purchase price.');
            return;
        }

        setSaving(true);
        try {
            // Build the category details payload based on the current category
            let details = asset.details;
            switch (asset.categoryName) {
                case 'Furniture': details = furniture; break;
                case 'IT Equipment': details = itEquipment; break;
                case 'Machinery': details = machinery; break;
                case 'Vehicles': details = vehicles; break;
            }

            const vendor = vendors.find(v => v.id === selectedVendorId);

            const updates: any = {
                name: name.trim(),
                status: status,
                notes: notes.trim() || null,
                location: location.trim() || null,
                locationName: location.trim() || null,
                assignedTo: assignedTo.trim() || 'Unassigned',
                assigned_to: assignedTo.trim() || 'Unassigned',
                purchase_date: purchaseDate ? new Date(purchaseDate).getTime() : asset.purchase_date,
                purchase_price: !isNaN(price) ? price : asset.purchase_price,
                vendor_id: selectedVendorId || null,
                current_vendor_name: vendor?.company_name ?? asset.current_vendor_name ?? null,
                details: details,
            };

            await dbUpdateAsset(asset.id, updates);

            if (status !== asset.status) {
                await logActivity(`Asset "${name}" status changed from ${asset.status} to ${status}.`, {
                    type: 'STATUS_CHANGE',
                    asset_id: asset.id,
                });
            } else {
                await logActivity(`Asset "${name}" details updated.`, {
                    type: 'STATUS_CHANGE',
                    asset_id: asset.id,
                });
            }

            setIsEditing(false);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save.');
        } finally {
            setSaving(false);
        }
    }

    function startEditing() {
        if (!asset) return;
        setName(asset.name ?? '');
        setStatus(asset.status ?? 'Available');
        setNotes(asset.notes ?? '');
        setLocation(asset.locationName ?? '');
        setAssignedTo(asset.assignedTo ?? '');
        setPurchaseDate(asset.purchase_date ? new Date(asset.purchase_date).toISOString().split('T')[0] : '');
        setPurchasePrice(asset.purchase_price?.toString() ?? '');
        setSelectedVendorId(asset.vendor_id ?? '');

        // Category Details
        if (asset.details) {
            switch (asset.categoryName) {
                case 'Furniture': setFurniture(asset.details as FurnitureDetails); break;
                case 'IT Equipment': setItEquipment(asset.details as ITEquipmentDetails); break;
                case 'Machinery': setMachinery(asset.details as MachineryDetails); break;
                case 'Vehicles': setVehicles(asset.details as VehicleDetails); break;
            }
        }

        setIsEditing(true);
    }

    const statusColor = STATUS_COLORS[asset.status] ?? '#94A3B8';

    return (
        <ScrollView style={styles.root} contentContainerStyle={styles.content}>
            <View style={styles.card}>
                <View style={styles.headerRow}>
                    {isEditing ? (
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder="Asset Name"
                            placeholderTextColor="#94A3B8"
                            autoFocus
                        />
                    ) : (
                        <Text style={styles.name}>{asset.name}</Text>
                    )}

                    {!isEditing && (
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>{asset.status}</Text>
                        </View>
                    )}
                </View>
                {!isEditing && <Text style={styles.id}>ID: {asset.id}</Text>}

                {isEditing && (
                    <View style={styles.editActions}>
                        <Pressable style={styles.cancelBtn} onPress={() => setIsEditing(false)} disabled={saving}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </Pressable>
                        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                            {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
                        </Pressable>
                    </View>
                )}

                {!isEditing && (
                    <Pressable style={styles.editToggle} onPress={startEditing}>
                        <Ionicons name="create-outline" size={18} color="#2563EB" />
                        <Text style={styles.editToggleText}>Edit Asset</Text>
                    </Pressable>
                )}

                {/* Logistics Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Logistics</Text>

                    <View style={styles.row}>
                        <Ionicons name="location-outline" size={20} color="#64748B" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Location</Text>
                            {isEditing ? (
                                <SearchablePicker
                                    items={locations.map(l => ({ id: l.id, label: l.name, sublabel: l.address }))}
                                    value={locations.find(l => l.name === location)?.id ?? ''}
                                    onSelect={(item) => setLocation(item.label)}
                                    placeholder="Select Location…"
                                    disabled={saving}
                                />
                            ) : (
                                <Text style={styles.value}>{asset.locationName}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="person-outline" size={20} color="#64748B" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Assigned To</Text>
                            {isEditing ? (
                                <SearchablePicker
                                    items={employees.map(e => ({ id: e.id, label: e.full_name, sublabel: `${e.department} - ${e.employee_id}` }))}
                                    value={employees.find(e => e.full_name === assignedTo)?.id ?? ''}
                                    onSelect={(item) => setAssignedTo(item.label)}
                                    placeholder="Assign to employee…"
                                    disabled={saving}
                                />
                            ) : (
                                <Text style={styles.value}>{asset.assignedTo || 'Unassigned'}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Ionicons name="pricetag-outline" size={20} color="#64748B" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Category</Text>
                            <Text style={[styles.value, { color: '#94A3B8' }]}>{asset.categoryName} (Non-editable)</Text>
                        </View>
                    </View>

                    {isEditing && (
                        <View style={styles.editSection}>
                            <Text style={styles.label}>Update Status</Text>
                            <View style={styles.statusPickerRow}>
                                {(['Available', 'Assigned', 'Lost'] as AssetStatus[]).map((s) => {
                                    const active = status === s;
                                    const sColor = STATUS_COLORS[s] ?? '#94A3B8';
                                    return (
                                        <Pressable
                                            key={s}
                                            style={[
                                                styles.statusOption,
                                                active && { borderColor: sColor, backgroundColor: sColor + '10' }
                                            ]}
                                            onPress={() => setStatus(s)}>
                                            <View style={[styles.statusDot, { backgroundColor: sColor }]} />
                                            <Text style={[styles.statusOptionText, active && { color: sColor, fontWeight: '800' }]}>
                                                {s}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    <View style={styles.row}>
                        <Ionicons name="business-outline" size={20} color="#64748B" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Vendor</Text>
                            {isEditing ? (
                                <SearchablePicker
                                    items={vendors.map(v => ({ id: v.id, label: v.company_name, sublabel: v.location_name }))}
                                    value={selectedVendorId}
                                    onSelect={(item) => setSelectedVendorId(item.id)}
                                    placeholder="Select Vendor…"
                                    disabled={saving}
                                />
                            ) : (
                                <Text style={styles.value}>{asset.current_vendor_name || '—'}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Purchase Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Purchase Details</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Price (NPR)</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={purchasePrice}
                                    onChangeText={setPurchasePrice}
                                    keyboardType="numeric"
                                    placeholder="e.g. 45000"
                                    placeholderTextColor="#94A3B8"
                                    editable={!saving}
                                />
                            ) : (
                                <Text style={styles.value}>
                                    {asset.purchase_price ? asset.purchase_price.toLocaleString() : '—'}
                                </Text>
                            )}
                        </View>
                        <View style={styles.gridItem}>
                            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.editInput}
                                    value={purchaseDate}
                                    onChangeText={setPurchaseDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#94A3B8"
                                    editable={!saving}
                                />
                            ) : (
                                <Text style={styles.value}>
                                    {asset.purchase_date
                                        ? new Date(asset.purchase_date).toISOString().split('T')[0]
                                        : '—'}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Category Details Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>{asset.categoryName} Details</Text>
                    {isEditing ? (
                        <CategoryFields
                            category={asset.categoryName as AssetCategory}
                            furniture={furniture}
                            itEquipment={itEquipment}
                            machinery={machinery}
                            vehicles={vehicles}
                            onFurnitureChange={setFurniture}
                            onITChange={setItEquipment}
                            onMachineryChange={setMachinery}
                            onVehicleChange={setVehicles}
                            disabled={saving}
                        />
                    ) : (
                        <View style={styles.grid}>
                            {asset.details && Object.entries(asset.details).map(([key, val]) => {
                                if (typeof val === 'object' && val !== null) {
                                    return Object.entries(val).map(([subK, subV]) => (
                                        <View key={`${key}-${subK}`} style={styles.gridItem}>
                                            <Text style={styles.label}>{subK.toUpperCase()}</Text>
                                            <Text style={styles.value}>{String(subV)}</Text>
                                        </View>
                                    ));
                                }
                                return (
                                    <View key={key} style={styles.gridItem}>
                                        <Text style={styles.label}>{key.replace('_', ' ').toUpperCase()}</Text>
                                        <Text style={styles.value}>{String(val)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </View>

            {/* Notes Card */}
            <View style={styles.card}>
                <View style={styles.notesHeader}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                </View>

                {isEditing ? (
                    <TextInput
                        style={styles.notesInput}
                        multiline
                        placeholder="Add notes about this asset…"
                        placeholderTextColor="#94A3B8"
                        value={notes}
                        onChangeText={setNotes}
                        editable={!saving}
                    />
                ) : (
                    <Text style={styles.notes}>
                        {asset.notes || 'No notes yet. Tap Edit Asset to add.'}
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F6FA' },
    content: { padding: 16, paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    notFound: { fontSize: 16, color: '#64748B', marginBottom: 16 },
    backBtn: { padding: 12 },
    backBtnText: { fontSize: 16, fontWeight: '700', color: '#080357' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EEF2F7',
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
    },
    name: { fontSize: 20, fontWeight: '800', color: '#0F172A', flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    statusText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
    id: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 12, fontFamily: 'monospace' },
    nameInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    editActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#F1F5F9'
    },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    saveBtn: {
        flex: 2,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#080357'
    },
    saveBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
    editToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 12,
        paddingVertical: 10,
        backgroundColor: '#F0F7FF',
        borderRadius: 10,
    },
    editToggleText: { fontSize: 14, fontWeight: '700', color: '#2563EB' },
    editSection: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
    statusPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusOptionText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
    editInput: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 4,
    },
    label: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 4 },
    gridItem: { minWidth: '45%' },

    // Notes
    sectionTitle: { fontSize: 13, fontWeight: '900', color: '#080357', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    editNotesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: '#EEF2FF',
    },
    editNotesBtnText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
    notes: { fontSize: 14, color: '#475569', lineHeight: 22 },
    notesInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    notesBtnRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    notesCancelBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    notesCancelText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
    notesSaveBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#080357',
    },
    notesSaveText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
