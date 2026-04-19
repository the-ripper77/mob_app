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
import { SearchablePicker } from '@/components/asset/SearchablePicker';
import { useEmployees } from '@/hooks/useEmployees';
import { useLocations } from '@/hooks/useLocations';

export default function AddEmployeeScreen() {
    const { addEmployee, employees } = useEmployees();
    const { locations } = useLocations();

    const [employeeId, setEmployeeId] = useState('');
    const [fullName, setFullName] = useState('');
    const [department, setDepartment] = useState('');
    const [email, setEmail] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    function validate(): boolean {
        const errs: Record<string, string> = {};

        if (!employeeId.trim()) errs.employeeId = 'Employee ID is required.';
        if (!fullName.trim()) errs.fullName = 'Full Name is required.';
        if (!department.trim()) errs.department = 'Department is required.';
        if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';

        // Duplicate check
        const isDuplicate = employees.some(e => e.employee_id === employeeId.trim());
        if (isDuplicate) {
            errs.employeeId = 'This Employee ID already exists.';
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    async function handleSave() {
        if (!validate()) return;

        setSaving(true);
        try {
            await addEmployee({
                employee_id: employeeId.trim(),
                full_name: fullName.trim(),
                department: department.trim(),
                email: email.trim(),
                location: selectedLocation || undefined,
                assigned_assets_count: 0,
            });
            Alert.alert('✅ Success', `Employee "${fullName}" added successfully.`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to add employee.');
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
                    <Text style={styles.headerTitle}>Add Employee</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled">



                    <View style={styles.card}>
                        <FormField label="Employee ID" required error={errors.employeeId}>
                            <TextInput
                                style={[styles.input, errors.employeeId ? styles.inputError : null]}
                                placeholder="e.g. EMP-1001"
                                placeholderTextColor="#94A3B8"
                                value={employeeId}
                                onChangeText={setEmployeeId}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Full Name" required error={errors.fullName}>
                            <TextInput
                                style={[styles.input, errors.fullName ? styles.inputError : null]}
                                placeholder="e.g. John Doe"
                                placeholderTextColor="#94A3B8"
                                value={fullName}
                                onChangeText={setFullName}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Department" required error={errors.department}>
                            <TextInput
                                style={[styles.input, errors.department ? styles.inputError : null]}
                                placeholder="e.g. Engineering"
                                placeholderTextColor="#94A3B8"
                                value={department}
                                onChangeText={setDepartment}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Email" required error={errors.email}>
                            <TextInput
                                style={[styles.input, errors.email ? styles.inputError : null]}
                                placeholder="e.g. john@example.com"
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                editable={!saving}
                            />
                        </FormField>

                        <FormField label="Location">
                            <SearchablePicker
                                items={locations.map(l => ({
                                    id: l.id,
                                    label: l.name,
                                    sublabel: l.address,
                                }))}
                                value={selectedLocation}
                                onSelect={(item) => setSelectedLocation(item.label)}
                                placeholder="Select a location…"
                                icon="location-outline"
                                disabled={saving}
                            />
                        </FormField>
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
                            <Text style={styles.saveBtnText}>Save Employee</Text>
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
