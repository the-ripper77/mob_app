import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type ActiveEngine = 'Lemon' | 'Custody' | 'Vendor' | null;

type Props = {
    activeEngine: ActiveEngine;
    setActiveEngine: (engine: ActiveEngine) => void;
};

export function ReportFilters({ activeEngine, setActiveEngine }: Props) {
    return (
        <View style={styles.container}>
            {/* Advanced Engines */}
            <Text style={styles.sectionLabel}>Advanced Engines</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.engineScroll}>
                <EngineChip
                    label="Liability"
                    active={activeEngine === 'Custody'}
                    onPress={() => setActiveEngine(activeEngine === 'Custody' ? null : 'Custody')}
                />
                <EngineChip
                    label="Reliability (Lemons)"
                    active={activeEngine === 'Lemon'}
                    onPress={() => setActiveEngine(activeEngine === 'Lemon' ? null : 'Lemon')}
                />
                <EngineChip
                    label="Vendor Perf."
                    active={activeEngine === 'Vendor'}
                    onPress={() => setActiveEngine(activeEngine === 'Vendor' ? null : 'Vendor')}
                />
            </ScrollView>
        </View>
    );
}

function EngineChip({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) {
    return (
        <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleBtnActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    toggleTextActive: {
        color: '#0F172A',
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    engineScroll: {
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    },
    chipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    chipTextActive: {
        color: '#FFFFFF',
    }
});
