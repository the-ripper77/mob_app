import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import type { AssetCategory } from '@/data/types';
import { ASSET_CATEGORIES } from '@/data/types';

const CATEGORY_ICONS: Record<AssetCategory, string> = {
    Furniture: '🪑',
    'IT Equipment': '💻',
    Machinery: '⚙️',
    Vehicles: '🚗',
};

type Props = {
    selected: AssetCategory | null;
    onSelect: (cat: AssetCategory) => void;
    disabled?: boolean;
};

export function CategoryChips({ selected, onSelect, disabled }: Props) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {ASSET_CATEGORIES.map((cat) => {
                const active = selected === cat;
                return (
                    <Pressable
                        key={cat}
                        style={[styles.chip, active && styles.chipActive]}
                        onPress={() => onSelect(cat)}
                        disabled={disabled}>
                        <Text style={styles.icon}>{CATEGORY_ICONS[cat]}</Text>
                        <Text style={[styles.label, active && styles.labelActive]}>{cat}</Text>
                    </Pressable>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        backgroundColor: '#EEF2F7',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    chipActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#080357',
    },
    icon: { fontSize: 16 },
    label: { fontSize: 13, fontWeight: '700', color: '#475569' },
    labelActive: { color: '#080357' },
});
