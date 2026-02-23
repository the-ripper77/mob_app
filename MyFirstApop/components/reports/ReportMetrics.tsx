import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
    totalValue: number | null;
    totalScrapValue: number | null;
    totalRepairValue: number | null;
    totalLostValue: number | null;
    isValueTruncated: boolean;
};

export function ReportMetrics({ totalValue, totalScrapValue, totalRepairValue, totalLostValue, isValueTruncated }: Props) {
    return (
        <View style={styles.grid}>
            <View style={styles.card}>
                <View style={styles.iconBoxPrimary}>
                    <Ionicons name="cash-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.label}>Total Asset Value {isValueTruncated && '*'}</Text>
                <Text style={styles.value}>
                    {totalValue === null ? 'High Vol.' : `NPR ${totalValue.toLocaleString()}`}
                </Text>
            </View>

            <View style={styles.card}>
                <View style={styles.iconBoxDanger}>
                    <Ionicons name="trash-bin-outline" size={20} color="#DC2626" />
                </View>
                <Text style={styles.label}>Total Scrap Value {isValueTruncated && '*'}</Text>
                <Text style={styles.value}>
                    {totalScrapValue === null ? 'High Vol.' : `NPR ${totalScrapValue.toLocaleString()}`}
                </Text>
            </View>

            <View style={styles.card}>
                <View style={styles.iconBoxWarning}>
                    <Ionicons name="build-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.label}>Total Repair Value {isValueTruncated && '*'}</Text>
                <Text style={styles.value}>
                    {totalRepairValue === null ? 'High Vol.' : `NPR ${totalRepairValue.toLocaleString()}`}
                </Text>
            </View>

            <View style={styles.card}>
                <View style={styles.iconBoxDanger}>
                    <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
                </View>
                <Text style={styles.label}>Total Lost Value {isValueTruncated && '*'}</Text>
                <Text style={styles.value}>
                    {totalLostValue === null ? 'High Vol.' : `NPR ${totalLostValue.toLocaleString()}`}
                </Text>
            </View>

            {isValueTruncated && (
                <Text style={styles.note}>* Value calculation requires Cloud Function for sets {'>'} 100.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    card: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EEF2F7',
    },
    label: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
    },
    iconBoxPrimary: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#EFF6FF',
        alignItems: 'center', justifyContent: 'center'
    },
    iconBoxSuccess: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#F0FDF4',
        alignItems: 'center', justifyContent: 'center'
    },
    iconBoxWarning: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#FFFBEB',
        alignItems: 'center', justifyContent: 'center'
    },
    iconBoxDanger: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: '#FEF2F2',
        alignItems: 'center', justifyContent: 'center'
    },
    note: {
        width: '100%',
        fontSize: 11,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: -4
    }
});
