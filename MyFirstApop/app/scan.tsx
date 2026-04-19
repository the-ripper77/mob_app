import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useEmployees } from '@/hooks/useEmployees';
import { assignAssetToEmployee } from '@/lib/database';
import { getFirebaseDatabase } from '@/lib/firebase';
import { get, ref } from 'firebase/database';
import { AssetTerminal } from '@/components/asset/AssetTerminal';
import type { Asset, Employee } from '@/data/types';

export default function ScanScreen() {
    const { mode } = useLocalSearchParams<{ mode: 'lookup' | 'assign' }>();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Assignment and Lookup states
    const { employees } = useEmployees();
    const [assetToAssign, setAssetToAssign] = useState<Asset | null>(null);
    const [terminalAsset, setTerminalAsset] = useState<Asset | null>(null);
    const [assetBarcode, setAssetBarcode] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [permission]);

    async function handleBarcodeScanned({ data }: { data: string }) {
        if (scanned || processing) return;
        setScanned(true);
        setProcessing(true);

        try {
            const db = getFirebaseDatabase();
            const assetRef = ref(db, `assets/${data}`);
            const snap = await get(assetRef);
            const assetData = snap.val() as Asset | null;

            if (!assetData) {
                Alert.alert('Asset Not Found', `Barcode ${data} is not registered.\nOpen 'Add Asset' form?`, [
                    { text: 'Cancel', style: 'cancel', onPress: () => setScanned(false) },
                    { text: 'Yes, Add Asset', onPress: () => router.replace('/asset/add') }
                ]);
                setProcessing(false);
                return;
            }

            // Inject the scanned barcode as `id` — snap.val() does not include the DB key
            const assetWithId = {
                ...assetData,
                id: data,
                // Also normalize legacy field names so Terminal always shows correct data
                categoryName: (assetData as any).categoryName ?? (assetData as any).category ?? '',
                locationName: (assetData as any).locationName ?? (assetData as any).location ?? '',
            } as Asset;

            if (mode === 'lookup') {
                setTerminalAsset(assetWithId);
            } else if (mode === 'assign') {
                if (assetData.status === 'Lost' || assetData.status === 'Scrapped') {
                    Alert.alert(
                        'Cannot Assign',
                        `Asset is currently marked as ${assetData.status}. Please change status to Available first.`,
                        [{ text: 'OK', onPress: () => router.replace(`/asset/${data}`) }]
                    );
                } else {
                    setAssetToAssign(assetWithId);
                    setAssetBarcode(data);
                }
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to fetch asset details.');
            setScanned(false);
        } finally {
            setProcessing(false);
        }
    }

    async function handleAssign(employee: Employee) {
        if (!assetToAssign || !assetBarcode) return;
        setProcessing(true);
        try {
            await assignAssetToEmployee(assetBarcode, employee);
            Alert.alert('Success', `Asset assigned to ${employee.full_name}`, [
                { text: 'OK', onPress: () => router.replace('/') }
            ]);
        } catch (e) {
            Alert.alert('Error', 'Failed to assign asset.');
        } finally {
            setProcessing(false);
            setAssetToAssign(null);
        }
    }

    const filteredEmployees = employees.filter(e =>
        e.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;

    if (!permission.granted) {
        return (
            <View style={styles.center}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Pressable style={styles.btn} onPress={requestPermission}>
                    <Text style={styles.btnText}>Grant Permission</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.root}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.closeBtn}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.title}>
                    {mode === 'assign' ? 'Scan to Assign' : 'Scan to Lookup'}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                barcodeScannerSettings={{
                    barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            />

            <View style={styles.overlay}>
                <View style={styles.viewfinder}>
                    {processing && <ActivityIndicator color="#FFFFFF" size="large" />}
                </View>
                <Text style={styles.hint}>Center barcode within the frame</Text>
            </View>

            {/* Employee List Modal for Assignment */}
            <Modal visible={!!assetToAssign} animationType="slide">
                <SafeAreaView style={styles.modalRoot}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Employee</Text>
                        <Pressable onPress={() => { setAssetToAssign(null); setScanned(false); }} style={styles.closeBtnDark}>
                            <Ionicons name="close" size={24} color="#0F172A" />
                        </Pressable>
                    </View>

                    <View style={styles.searchWrap}>
                        <Ionicons name="search" size={20} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={filteredEmployees}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <Pressable
                                style={({ pressed }) => [styles.employeeRow, pressed && styles.employeeRowPressed]}
                                onPress={() => handleAssign(item)}
                            >
                                <View style={styles.employeeAvatar}>
                                    <Text style={styles.employeeInitials}>{item.full_name.charAt(0).toUpperCase()}</Text>
                                </View>
                                <View style={styles.employeeInfo}>
                                    <Text style={styles.employeeName}>{item.full_name}</Text>
                                    <Text style={styles.employeeDept}>{item.department} • {item.employee_id}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                            </Pressable>
                        )}
                    />
                </SafeAreaView>
            </Modal>

            {/* Terminal Overlay for Lookup */}
            <AssetTerminal
                visible={!!terminalAsset}
                asset={terminalAsset}
                onClose={() => {
                    setTerminalAsset(null);
                    setScanned(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#000000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    message: { color: '#333', marginBottom: 20 },
    btn: { backgroundColor: '#080357', padding: 12, borderRadius: 8 },
    btnText: { color: '#FFF', fontWeight: 'bold' },
    header: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    title: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    closeBtn: { padding: 8 },
    closeBtnDark: { padding: 8 },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewfinder: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hint: { color: '#FFFFFF', marginTop: 30, fontSize: 16, fontWeight: '600' },

    // Modal styles
    modalRoot: { flex: 1, backgroundColor: '#F5F6FA' },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F7',
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontSize: 16, color: '#0F172A' },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    employeeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEF2F7',
    },
    employeeRowPressed: { backgroundColor: '#F8FAFC' },
    employeeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5EDFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    employeeInitials: { fontSize: 16, fontWeight: '800', color: '#080357' },
    employeeInfo: { flex: 1 },
    employeeName: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
    employeeDept: { fontSize: 13, color: '#64748B', marginTop: 2, fontWeight: '600' },
});
