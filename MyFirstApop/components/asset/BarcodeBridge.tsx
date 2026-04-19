import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Props = {
    barcode: string | null;
    onScanned: (code: string) => void;
    disabled?: boolean;
};

export function BarcodeBridge({ barcode, onScanned, disabled }: Props) {
    const [open, setOpen] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    async function handleOpen() {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert(
                    'Camera Permission Required',
                    'Please enable camera access in Settings to scan barcodes.'
                );
                return;
            }
        }
        setScanned(false);
        setOpen(true);
    }

    function handleBarcodeScanned({ data }: { data: string }) {
        if (scanned) return;
        setScanned(true);
        onScanned(data);
        setOpen(false);
    }

    if (!permission) {
        return (
            <View style={styles.scanBtn}>
                <ActivityIndicator color="#FFFFFF" />
            </View>
        );
    }

    return (
        <>
            {barcode ? (
                <View style={styles.badge}>
                    <View style={styles.badgeContent}>
                        <Ionicons name="barcode-outline" size={22} color="#080357" />
                        <View style={styles.badgeTextWrap}>
                            <Text style={styles.badgeLabel}>Barcode linked</Text>
                            <Text style={styles.badgeCode} numberOfLines={1}>{barcode}</Text>
                        </View>
                    </View>
                    <Pressable
                        style={styles.rescanBtn}
                        onPress={handleOpen}
                        disabled={disabled}>
                        <Ionicons name="refresh-outline" size={18} color="#080357" />
                        <Text style={styles.rescanText}>Re-scan</Text>
                    </Pressable>
                </View>
            ) : (
                <Pressable
                    style={({ pressed }) => [styles.scanBtn, pressed && styles.scanBtnPressed]}
                    onPress={handleOpen}
                    disabled={disabled}>
                    <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.scanText}>Scan Barcode to Link</Text>
                </Pressable>
            )}

            <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
                <SafeAreaView style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Scan Asset Barcode</Text>
                        <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#0F172A" />
                        </Pressable>
                    </View>

                    <View style={styles.cameraWrap}>
                        <CameraView
                            style={StyleSheet.absoluteFill}
                            facing="back"
                            barcodeScannerSettings={{
                                barcodeTypes: [
                                    'qr',
                                    'ean13',
                                    'ean8',
                                    'code128',
                                    'code39',
                                    'code93',
                                    'upc_a',
                                    'upc_e',
                                    'pdf417',
                                    'datamatrix',
                                    'aztec',
                                ],
                            }}
                            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                        />
                        {/* Viewfinder overlay */}
                        <View style={styles.overlay}>
                            <View style={styles.topDim} />
                            <View style={styles.middleRow}>
                                <View style={styles.sideDim} />
                                <View style={styles.viewfinder}>
                                    <View style={[styles.corner, styles.topLeft]} />
                                    <View style={[styles.corner, styles.topRight]} />
                                    <View style={[styles.corner, styles.bottomLeft]} />
                                    <View style={[styles.corner, styles.bottomRight]} />
                                </View>
                                <View style={styles.sideDim} />
                            </View>
                            <View style={styles.bottomDim}>
                                <Text style={styles.hint}>Point the camera at a barcode or QR code</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const CORNER = 24;
const CORNER_THICK = 4;

const styles = StyleSheet.create({
    scanBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#080357',
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    scanBtnPressed: { opacity: 0.85 },
    scanText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#EEF2FF',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#080357',
        padding: 14,
    },
    badgeContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    badgeTextWrap: { flex: 1 },
    badgeLabel: { fontSize: 12, fontWeight: '700', color: '#080357' },
    badgeCode: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginTop: 2 },
    rescanBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8 },
    rescanText: { fontSize: 13, fontWeight: '700', color: '#080357' },
    // Modal
    modal: { flex: 1, backgroundColor: '#000000' },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    closeBtn: { padding: 4 },
    cameraWrap: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, flexDirection: 'column' },
    topDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
    middleRow: { flexDirection: 'row' },
    sideDim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
    viewfinder: { width: 260, height: 260 },
    bottomDim: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        alignItems: 'center',
        paddingTop: 20,
    },
    hint: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
    corner: {
        position: 'absolute',
        width: CORNER,
        height: CORNER,
        borderColor: '#FFFFFF',
    },
    topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
    topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICK, borderLeftWidth: CORNER_THICK },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICK, borderRightWidth: CORNER_THICK },
});
