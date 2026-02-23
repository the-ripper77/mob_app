import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLocations } from '@/hooks/useLocations';

function parseCoord(value: string): number | undefined {
    const n = parseFloat(value.trim());
    if (value.trim() === '' || Number.isNaN(n)) return undefined;
    return n;
}

export default function AddLocationScreen() {
    const params = useLocalSearchParams<{ id?: string }>();
    const isEditMode = !!params.id;
    const { locations, addLocation, updateLocation } = useLocations();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [latStr, setLatStr] = useState('');
    const [lonStr, setLonStr] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEditMode && locations.length > 0) {
            const loc = locations.find(l => l.id === params.id);
            if (loc) {
                setName(loc.name);
                setAddress(loc.address || '');
                setLatStr(loc.latitude !== undefined ? String(loc.latitude) : '');
                setLonStr(loc.longitude !== undefined ? String(loc.longitude) : '');
            }
        }
    }, [isEditMode, locations, params.id]);

    async function handleSave() {
        if (!name.trim()) {
            Alert.alert('Required', 'Location name is required.');
            return;
        }
        const latitude = parseCoord(latStr);
        const longitude = parseCoord(lonStr);
        if ((latStr.trim() !== '' || lonStr.trim() !== '') && (latitude === undefined || longitude === undefined)) {
            Alert.alert('Invalid coordinates', 'Enter both latitude and longitude (e.g. 27.7172, 85.3240).');
            return;
        }
        if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
            Alert.alert('Invalid latitude', 'Latitude must be between -90 and 90.');
            return;
        }
        if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
            Alert.alert('Invalid longitude', 'Longitude must be between -180 and 180.');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                name: name.trim(),
                address: address.trim() || undefined,
                latitude,
                longitude,
            };
            if (isEditMode && params.id) {
                await updateLocation(params.id, payload);
            } else {
                await addLocation(payload);
            }
            router.back();
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save location.');
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
                    <Text style={styles.headerTitle}>{isEditMode ? 'Edit Location' : 'Add Location'}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>Location name *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. HQ Office, Warehouse"
                        placeholderTextColor="#94A3B8"
                        value={name}
                        onChangeText={setName}
                        editable={!saving}
                    />
                    <Text style={styles.label}>Address (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Street, city"
                        placeholderTextColor="#94A3B8"
                        value={address}
                        onChangeText={setAddress}
                        editable={!saving}
                    />
                    <Text style={styles.label}>Latitude (optional, for map pin)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 27.7172"
                        placeholderTextColor="#94A3B8"
                        value={latStr}
                        onChangeText={setLatStr}
                        keyboardType="numbers-and-punctuation"
                        editable={!saving}
                    />
                    <Text style={styles.label}>Longitude (optional, for map pin)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 85.3240"
                        placeholderTextColor="#94A3B8"
                        value={lonStr}
                        onChangeText={setLonStr}
                        keyboardType="numbers-and-punctuation"
                        editable={!saving}
                    />
                </View>
                <Pressable
                    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, saving && styles.buttonDisabled]}
                    onPress={handleSave}
                    disabled={saving}>
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.buttonText}>{isEditMode ? 'Save changes' : 'Save location'}</Text>
                    )}
                </Pressable>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F6FA' },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#EEF2F7',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 16,
    },
    label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 4 },
    input: {
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: '#0F172A',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#080357',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        marginHorizontal: 16,
    },
    buttonPressed: { opacity: 0.9 },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
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
});
