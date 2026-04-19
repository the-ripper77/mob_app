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

import { FormField } from '@/components/asset/FormField';
import { useVendors } from '@/hooks/useVendors';
import { createLocation } from '@/lib/database';
import { VENDOR_TAGS, type VendorTag } from '@/data/types';

export default function AddVendorScreen() {
    const { addVendor } = useVendors();

    const [companyName, setCompanyName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedTags, setSelectedTags] = useState<VendorTag[]>([]);
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate(): boolean {
        const errs: Record<string, string> = {};

        if (!companyName.trim()) errs.companyName = 'Company Name is required.';
        if (!contactEmail.trim() || !contactEmail.includes('@')) errs.contactEmail = 'Valid email is required.';
        if (!phone.trim()) errs.phone = 'Phone number is required.';
        if (selectedTags.length === 0) errs.tags = 'Select at least one category tag.';

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function toggleTag(tag: VendorTag) {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    }

    async function handleSave() {
        if (!validate()) return;

        setSaving(true);
        try {
            // Auto-create a location from vendor address + coords
            let locationId: string | undefined;
            const locationName = address.trim() || companyName.trim();
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);

            if (locationName) {
                locationId = await createLocation({
                    name: companyName.trim(),
                    address: address.trim() || undefined,
                    latitude: !isNaN(lat) ? lat : undefined,
                    longitude: !isNaN(lng) ? lng : undefined,
                });
            }

            await addVendor({
                company_name: companyName.trim(),
                contact_email: contactEmail.trim(),
                phone: phone.trim(),
                category_tags: selectedTags,
                address: address.trim() || undefined,
                latitude: !isNaN(lat) ? lat : undefined,
                longitude: !isNaN(lng) ? lng : undefined,
                location_id: locationId,
                location_name: locationName || undefined,
            });
            Alert.alert('✅ Success', `Vendor "${companyName}" added successfully.`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add vendor.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>

                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
                        <Ionicons name="arrow-back" size={24} color="#080357" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Add Vendor</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled">



                    <View style={styles.card}>
                        <FormField label="Company Name" required error={errors.companyName}>
                            <TextInput
                                style={[styles.input, errors.companyName ? styles.inputError : null]}
                                placeholder="e.g. Acme Repair Corp"
                                placeholderTextColor="#94A3B8"
                                value={companyName}
                                onChangeText={setCompanyName}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Category Tags" required error={errors.tags}>
                            <View style={styles.tagsContainer}>
                                {VENDOR_TAGS.map(tag => {
                                    const isSelected = selectedTags.includes(tag);
                                    return (
                                        <Pressable
                                            key={tag}
                                            onPress={() => toggleTag(tag)}
                                            style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                                        >
                                            <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>{tag}</Text>
                                        </Pressable>
                                    )
                                })}
                            </View>
                        </FormField>

                        <FormField label="Contact Email" required error={errors.contactEmail}>
                            <TextInput
                                style={[styles.input, errors.contactEmail ? styles.inputError : null]}
                                placeholder="e.g. support@acme.com"
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={contactEmail}
                                onChangeText={setContactEmail}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Phone Number" required error={errors.phone}>
                            <TextInput
                                style={[styles.input, errors.phone ? styles.inputError : null]}
                                placeholder="e.g. 555-1234"
                                placeholderTextColor="#94A3B8"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Address">
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Kathmandu, Thamel Road"
                                placeholderTextColor="#94A3B8"
                                value={address}
                                onChangeText={setAddress}
                                editable={!saving}
                            />
                        </FormField>

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={{ flex: 1 }}>
                                <FormField label="Latitude">
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 27.7172"
                                        placeholderTextColor="#94A3B8"
                                        value={latitude}
                                        onChangeText={setLatitude}
                                        keyboardType="decimal-pad"
                                        editable={!saving}
                                    />
                                </FormField>
                            </View>
                            <View style={{ flex: 1 }}>
                                <FormField label="Longitude">
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 85.3240"
                                        placeholderTextColor="#94A3B8"
                                        value={longitude}
                                        onChangeText={setLongitude}
                                        keyboardType="decimal-pad"
                                        editable={!saving}
                                    />
                                </FormField>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        style={({ pressed }) => [
                            styles.saveBtn,
                            pressed && styles.saveBtnPressed,
                            saving && styles.saveBtnDisabled,
                        ]}
                        onPress={handleSave}
                        disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Vendor</Text>
                        )}
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F6FA' },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 48 },
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
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tagChipSelected: {
        backgroundColor: '#E6E6FF',
        borderColor: '#4F46E5',
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    tagTextSelected: {
        color: '#4F46E5',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080357',
        borderRadius: 14,
        paddingVertical: 16,
        marginTop: 4,
    },
    saveBtnPressed: { opacity: 0.88 },
    saveBtnDisabled: { opacity: 0.7 },
    saveBtnText: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
});
