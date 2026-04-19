import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarcodeBridge } from '@/components/asset/BarcodeBridge';
import { CategoryChips } from '@/components/asset/CategoryChips';
import { CategoryFields } from '@/components/asset/CategoryFields';
import { FormField } from '@/components/asset/FormField';
import { LocationPicker } from '@/components/asset/LocationPicker';
import { SearchablePicker } from '@/components/asset/SearchablePicker';
import type {
    AssetCategory,
    FurnitureDetails,
    ITEquipmentDetails,
    MachineryDetails,
    VehicleDetails,
} from '@/data/types';
import { logActivity } from '@/lib/database';
import { createAssetWithBarcode } from '@/lib/database';
import { useLocations } from '@/hooks/useLocations';
import { useVendors } from '@/hooks/useVendors';
import type { Vendor } from '@/data/types';

// ─── Default states ──────────────────────────────────────────────────────────

const defaultFurniture: FurnitureDetails = {
    material: '',
    dimensions: '',
    is_assembled: false,
};

const defaultIT: ITEquipmentDetails = {
    brand_model: '',
    serial_number: '',
    specs: { cpu: '', ram: '', storage: '' },
    os_version: '',
};

const defaultMachinery: MachineryDetails = {
    power_specs: '',
    meter_reading: '',
    safety_cert_date: '',
    emergency_contact: '',
};

const defaultVehicle: VehicleDetails = {
    license_plate: '',
    vin: '',
    fuel_type: '',
    odometer: '',
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function OnboardAssetScreen() {
    const { locations } = useLocations();
    const { vendors } = useVendors();

    // Global fields
    const [name, setName] = useState('');
    const [category, setCategory] = useState<AssetCategory | null>(null);
    const [location, setLocation] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [assignedTo, setAssignedTo] = useState('');
    const [barcode, setBarcode] = useState<string | null>(null);

    // Category-specific fields
    const [furniture, setFurniture] = useState<FurnitureDetails>(defaultFurniture);
    const [itEquipment, setItEquipment] = useState<ITEquipmentDetails>(defaultIT);
    const [machinery, setMachinery] = useState<MachineryDetails>(defaultMachinery);
    const [vehicles, setVehicles] = useState<VehicleDetails>(defaultVehicle);

    // UI state
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ─── Validation ────────────────────────────────────────────────────────────

    function validate(): boolean {
        const errs: Record<string, string> = {};

        if (!name.trim()) errs.name = 'Asset name is required.';
        if (!category) errs.category = 'Please select a category.';
        if (!location.trim()) errs.location = 'Please select or create a location.';

        const price = parseFloat(purchasePrice);
        if (!purchasePrice.trim() || isNaN(price) || price <= 0) {
            errs.purchasePrice = 'Enter a valid positive purchase price.';
        }

        if (category === 'Vehicles' && vehicles.vin.length !== 17) {
            errs.vin = `VIN must be exactly 17 characters (${vehicles.vin.length} entered).`;
        }

        if (!barcode) errs.barcode = 'Scan a barcode to link this asset before saving.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    // ─── Save ──────────────────────────────────────────────────────────────────

    async function handleSave() {
        if (!validate()) {
            Alert.alert('Please fix the errors', 'Check the highlighted fields and try again.');
            return;
        }

        const code = barcode!;
        const price = parseFloat(purchasePrice);

        // Build the category details payload
        let details: FurnitureDetails | ITEquipmentDetails | MachineryDetails | VehicleDetails;
        switch (category!) {
            case 'Furniture':
                details = furniture;
                break;
            case 'IT Equipment':
                details = itEquipment;
                break;
            case 'Machinery':
                details = { ...machinery, meter_reading: machinery.meter_reading };
                break;
            case 'Vehicles':
                details = vehicles;
                break;
        }

        setSaving(true);
        try {
            await createAssetWithBarcode(code, {
                name: name.trim(),
                category: category!,
                status: 'Available',
                location: location.trim(),
                purchase_date: purchaseDate ? new Date(purchaseDate).getTime() : Date.now(),
                purchase_price: price,
                vendor_id: selectedVendor?.id ?? '',
                current_vendor_name: selectedVendor?.company_name ?? '',
                maintenance_count: 0,
                assigned_to: assignedTo.trim() || 'Unassigned',
                details,
            });
            await logActivity(`Asset "${name.trim()}" onboarded (barcode: ${code}).`, {
                type: 'INTAKE',
                asset_id: code,
                cost: price,
            });
            Alert.alert('✅ Asset Saved', `"${name}" has been linked to barcode ${code}.`, [
                { text: 'OK', onPress: () => router.replace('/(tabs)/assets') },
            ]);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save asset.');
        } finally {
            setSaving(false);
        }
    }

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.replace('/(tabs)/assets')} style={styles.backBtn} hitSlop={12}>
                        <Ionicons name="arrow-back" size={24} color="#080357" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Onboard Asset</Text>
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled">

                    {/* ── Section 1: Core Info ── */}
                    <SectionCard title="Core Information" icon="cube-outline">
                        <FormField label="Asset Name" required error={errors.name}>
                            <TextInput
                                style={[styles.input, errors.name ? styles.inputError : null]}
                                placeholder="e.g. Office Chair A3"
                                placeholderTextColor="#94A3B8"
                                value={name}
                                onChangeText={setName}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Category" required error={errors.category}>
                            <CategoryChips selected={category} onSelect={setCategory} disabled={saving} />
                        </FormField>
                    </SectionCard>

                    {/* ── Section 2: Category-specific fields ── */}
                    {category && (
                        <SectionCard title={`${category} Details`} icon="list-outline">
                            <CategoryFields
                                category={category}
                                furniture={furniture}
                                itEquipment={itEquipment}
                                machinery={machinery}
                                vehicles={vehicles}
                                onFurnitureChange={setFurniture}
                                onITChange={setItEquipment}
                                onMachineryChange={setMachinery}
                                onVehicleChange={setVehicles}
                                vinError={errors.vin}
                                disabled={saving}
                            />
                        </SectionCard>
                    )}

                    {/* ── Section 3: Logistics ── */}
                    <SectionCard title="Logistics" icon="briefcase-outline">
                        <FormField label="Vendor">
                            <SearchablePicker
                                items={vendors.map(v => ({
                                    id: v.id,
                                    label: v.company_name,
                                    sublabel: v.location_name,
                                }))}
                                value={selectedVendor?.id ?? ''}
                                onSelect={(item) => {
                                    const v = vendors.find(vend => vend.id === item.id);
                                    if (v) {
                                        setSelectedVendor(v);
                                    }
                                }}
                                placeholder="Select a vendor…"
                                icon="business-outline"
                                disabled={saving}
                            />
                        </FormField>

                        <FormField label="Vendor Location">
                            <View style={[styles.input, { backgroundColor: '#F1F5F9' }]}>
                                <Text style={{ fontSize: 16, color: selectedVendor ? '#0F172A' : '#94A3B8' }}>
                                    {selectedVendor ? (selectedVendor.location_name || selectedVendor.company_name) : 'Select a vendor first'}
                                </Text>
                            </View>
                        </FormField>

                        <FormField label="Asset Location" required error={errors.location}>
                            <LocationPicker
                                locations={locations}
                                value={location}
                                onSelect={setLocation}
                                disabled={saving}
                            />
                        </FormField>

                        <FormField label="Purchase Date (YYYY-MM-DD)">
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 2025-01-15"
                                placeholderTextColor="#94A3B8"
                                value={purchaseDate}
                                onChangeText={setPurchaseDate}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Purchase Price" required error={errors.purchasePrice}>
                            <TextInput
                                style={[styles.input, errors.purchasePrice ? styles.inputError : null]}
                                placeholder="e.g. 45000"
                                placeholderTextColor="#94A3B8"
                                value={purchasePrice}
                                onChangeText={setPurchasePrice}
                                keyboardType="numeric"
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Assigned To">
                            <TextInput
                                style={styles.input}
                                placeholder="Person or team (default: Unassigned)"
                                placeholderTextColor="#94A3B8"
                                value={assignedTo}
                                onChangeText={setAssignedTo}
                                editable={!saving}
                            />
                        </FormField>
                    </SectionCard>

                    {/* ── Section 4: Barcode Bridge ── */}
                    <SectionCard title="Barcode Link" icon="barcode-outline">
                        <Text style={styles.barcodeHint}>
                            Scan the physical barcode on the asset. This will become its unique ID in the database.
                        </Text>
                        {errors.barcode && <Text style={styles.barcodeError}>{errors.barcode}</Text>}
                        <BarcodeBridge barcode={barcode} onScanned={setBarcode} disabled={saving} />
                    </SectionCard>

                    {/* ── Save Button ── */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.saveBtn,
                            !barcode && styles.saveBtnLocked,
                            pressed && styles.saveBtnPressed,
                            saving && styles.saveBtnDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name={barcode ? 'checkmark-circle-outline' : 'lock-closed-outline'} size={20} color="#FFFFFF" />
                                <Text style={styles.saveBtnText}>
                                    {barcode ? 'Save Asset' : 'Scan Barcode First'}
                                </Text>
                            </>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Section Card helper ──────────────────────────────────────────────────────

function SectionCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    children: React.ReactNode;
}) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                    <Ionicons name={icon} size={18} color="#080357" />
                </View>
                <Text style={styles.cardTitle}>{title}</Text>
            </View>
            {children}
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F6FA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F7',
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#080357' },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 48 },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EEF2F7',
        marginBottom: 16,
        shadowColor: '#0B1220',
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cardIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#EEF2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputError: { borderColor: '#DC2626' },
    barcodeHint: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 20,
        marginBottom: 16,
    },
    barcodeError: {
        fontSize: 13,
        color: '#DC2626',
        fontWeight: '600',
        marginBottom: 12,
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#080357',
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 4,
        marginBottom: 8,
    },
    saveBtnLocked: { backgroundColor: '#94A3B8' },
    saveBtnPressed: { opacity: 0.88 },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
});
