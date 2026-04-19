import React from 'react';
import {
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import type {
    AssetCategory,
    FurnitureDetails,
    ITEquipmentDetails,
    MachineryDetails,
    VehicleDetails,
} from '@/data/types';
import { FUEL_TYPE_OPTIONS, MATERIAL_OPTIONS } from '@/data/types';
import { FormField } from './FormField';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function Input({
    value,
    onChangeText,
    placeholder,
    keyboardType,
    maxLength,
    disabled,
}: {
    value: string;
    onChangeText: (t: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'numbers-and-punctuation';
    maxLength?: number;
    disabled?: boolean;
}) {
    return (
        <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#94A3B8"
            keyboardType={keyboardType ?? 'default'}
            maxLength={maxLength}
            editable={!disabled}
        />
    );
}

function DropdownChips<T extends string>({
    options,
    value,
    onSelect,
    disabled,
}: {
    options: readonly T[];
    value: T | '';
    onSelect: (v: T) => void;
    disabled?: boolean;
}) {
    return (
        <View style={styles.chipRow}>
            {options.map((opt) => (
                <Pressable
                    key={opt}
                    style={[styles.chip, value === opt && styles.chipActive]}
                    onPress={() => onSelect(opt)}
                    disabled={disabled}>
                    <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
                </Pressable>
            ))}
        </View>
    );
}

// ─── Furniture ───────────────────────────────────────────────────────────────

function FurnitureForm({
    data,
    onChange,
    disabled,
}: {
    data: FurnitureDetails;
    onChange: (d: FurnitureDetails) => void;
    disabled?: boolean;
}) {
    return (
        <>
            <FormField label="Material" required>
                <DropdownChips
                    options={MATERIAL_OPTIONS}
                    value={data.material}
                    onSelect={(v) => onChange({ ...data, material: v })}
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Dimensions (L × W × H)" required>
                <Input
                    value={data.dimensions}
                    onChangeText={(v) => onChange({ ...data, dimensions: v })}
                    placeholder="e.g. 120x60x75"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Is Assembled?">
                <View style={styles.switchRow}>
                    <Switch
                        value={data.is_assembled}
                        onValueChange={(v) => onChange({ ...data, is_assembled: v })}
                        trackColor={{ true: '#080357', false: '#E2E8F0' }}
                        thumbColor="#FFFFFF"
                        disabled={disabled}
                    />
                    <Text style={styles.switchLabel}>{data.is_assembled ? 'Yes' : 'No'}</Text>
                </View>
            </FormField>
        </>
    );
}

// ─── IT Equipment ─────────────────────────────────────────────────────────────

function ITEquipmentForm({
    data,
    onChange,
    disabled,
}: {
    data: ITEquipmentDetails;
    onChange: (d: ITEquipmentDetails) => void;
    disabled?: boolean;
}) {
    return (
        <>
            <FormField label="Brand / Model" required>
                <Input
                    value={data.brand_model}
                    onChangeText={(v) => onChange({ ...data, brand_model: v })}
                    placeholder="e.g. Dell XPS 15"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Serial Number" required>
                <Input
                    value={data.serial_number}
                    onChangeText={(v) => onChange({ ...data, serial_number: v })}
                    placeholder="Manufacturer serial"
                    disabled={disabled}
                />
            </FormField>

            <Text style={styles.subHeading}>Specs</Text>

            <FormField label="CPU" required>
                <Input
                    value={data.specs.cpu}
                    onChangeText={(v) => onChange({ ...data, specs: { ...data.specs, cpu: v } })}
                    placeholder="e.g. Intel Core i7-13700H"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="RAM" required>
                <Input
                    value={data.specs.ram}
                    onChangeText={(v) => onChange({ ...data, specs: { ...data.specs, ram: v } })}
                    placeholder="e.g. 16 GB DDR5"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Storage" required>
                <Input
                    value={data.specs.storage}
                    onChangeText={(v) => onChange({ ...data, specs: { ...data.specs, storage: v } })}
                    placeholder="e.g. 512 GB NVMe SSD"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="OS Version">
                <Input
                    value={data.os_version}
                    onChangeText={(v) => onChange({ ...data, os_version: v })}
                    placeholder="e.g. Windows 11 Pro"
                    disabled={disabled}
                />
            </FormField>
        </>
    );
}

// ─── Machinery ───────────────────────────────────────────────────────────────

function MachineryForm({
    data,
    onChange,
    disabled,
}: {
    data: MachineryDetails;
    onChange: (d: MachineryDetails) => void;
    disabled?: boolean;
}) {
    return (
        <>
            <FormField label="Power Specifications" required>
                <Input
                    value={data.power_specs}
                    onChangeText={(v) => onChange({ ...data, power_specs: v })}
                    placeholder="e.g. 440V / 3-Phase"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Meter Reading (hours)">
                <Input
                    value={data.meter_reading}
                    onChangeText={(v) => onChange({ ...data, meter_reading: v })}
                    placeholder="e.g. 1240"
                    keyboardType="numeric"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Safety Certificate Date (YYYY-MM-DD)">
                <Input
                    value={data.safety_cert_date}
                    onChangeText={(v) => onChange({ ...data, safety_cert_date: v })}
                    placeholder="e.g. 2025-06-30"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Emergency Contact" required>
                <Input
                    value={data.emergency_contact}
                    onChangeText={(v) => onChange({ ...data, emergency_contact: v })}
                    placeholder="Name or phone"
                    disabled={disabled}
                />
            </FormField>
        </>
    );
}

// ─── Vehicles ────────────────────────────────────────────────────────────────

function VehiclesForm({
    data,
    onChange,
    disabled,
    vinError,
}: {
    data: VehicleDetails;
    onChange: (d: VehicleDetails) => void;
    disabled?: boolean;
    vinError?: string;
}) {
    return (
        <>
            <FormField label="License Plate" required>
                <Input
                    value={data.license_plate}
                    onChangeText={(v) => onChange({ ...data, license_plate: v })}
                    placeholder="e.g. BA 1 CHA 1234"
                    disabled={disabled}
                />
            </FormField>

            <FormField label="VIN (17 characters)" required error={vinError}>
                <TextInput
                    style={[styles.input, vinError ? styles.inputError : null]}
                    value={data.vin}
                    onChangeText={(v) => onChange({ ...data, vin: v.toUpperCase() })}
                    placeholder="17-char VIN"
                    placeholderTextColor="#94A3B8"
                    maxLength={17}
                    autoCapitalize="characters"
                    editable={!disabled}
                />
                <Text style={styles.charCount}>{data.vin.length}/17</Text>
            </FormField>

            <FormField label="Fuel Type" required>
                <DropdownChips
                    options={FUEL_TYPE_OPTIONS}
                    value={data.fuel_type}
                    onSelect={(v) => onChange({ ...data, fuel_type: v })}
                    disabled={disabled}
                />
            </FormField>

            <FormField label="Odometer (km)">
                <Input
                    value={data.odometer}
                    onChangeText={(v) => onChange({ ...data, odometer: v })}
                    placeholder="e.g. 15000"
                    keyboardType="numeric"
                    disabled={disabled}
                />
            </FormField>
        </>
    );
}

// ─── Main export ─────────────────────────────────────────────────────────────

type CategoryFieldsProps = {
    category: AssetCategory;
    furniture: FurnitureDetails;
    itEquipment: ITEquipmentDetails;
    machinery: MachineryDetails;
    vehicles: VehicleDetails;
    onFurnitureChange: (d: FurnitureDetails) => void;
    onITChange: (d: ITEquipmentDetails) => void;
    onMachineryChange: (d: MachineryDetails) => void;
    onVehicleChange: (d: VehicleDetails) => void;
    vinError?: string;
    disabled?: boolean;
};

export function CategoryFields({
    category,
    furniture,
    itEquipment,
    machinery,
    vehicles,
    onFurnitureChange,
    onITChange,
    onMachineryChange,
    onVehicleChange,
    vinError,
    disabled,
}: CategoryFieldsProps) {
    switch (category) {
        case 'Furniture':
            return <FurnitureForm data={furniture} onChange={onFurnitureChange} disabled={disabled} />;
        case 'IT Equipment':
            return <ITEquipmentForm data={itEquipment} onChange={onITChange} disabled={disabled} />;
        case 'Machinery':
            return <MachineryForm data={machinery} onChange={onMachineryChange} disabled={disabled} />;
        case 'Vehicles':
            return (
                <VehiclesForm
                    data={vehicles}
                    onChange={onVehicleChange}
                    disabled={disabled}
                    vinError={vinError}
                />
            );
    }
}

const styles = StyleSheet.create({
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
    charCount: { fontSize: 11, color: '#94A3B8', textAlign: 'right', marginTop: 4 },
    subHeading: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 4,
    },
    switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    switchLabel: { fontSize: 15, fontWeight: '600', color: '#334155' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#E2E8F0',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    chipActive: { backgroundColor: '#EEF2FF', borderColor: '#080357' },
    chipText: { fontSize: 13, fontWeight: '700', color: '#475569' },
    chipTextActive: { color: '#080357' },
});
