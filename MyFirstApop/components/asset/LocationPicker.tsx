import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import type { Location } from '@/data/types';

type Props = {
    locations: Location[];
    value: string; // the location name displayed
    onSelect: (name: string) => void;
    disabled?: boolean;
};

export function LocationPicker({ locations, value, onSelect, disabled }: Props) {
    const [query, setQuery] = useState(value);
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const filtered = query.trim()
        ? locations.filter((l) => l.name.toLowerCase().includes(query.toLowerCase()))
        : locations;

    const exactMatch = locations.some(
        (l) => l.name.toLowerCase() === query.trim().toLowerCase()
    );

    function handleSelectItem(name: string) {
        onSelect(name);
        setQuery(name);
        setOpen(false);
    }

    return (
        <View style={styles.root}>
            <View style={styles.inputRow}>
                <Ionicons name="location-outline" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search or enter location…"
                    placeholderTextColor="#94A3B8"
                    value={query}
                    onChangeText={(t) => {
                        setQuery(t);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    editable={!disabled}
                />
                {query.length > 0 && (
                    <Pressable
                        onPress={() => {
                            setQuery('');
                            onSelect('');
                            setOpen(false);
                        }}
                        style={styles.clearBtn}>
                        <Ionicons name="close-circle" size={18} color="#94A3B8" />
                    </Pressable>
                )}
            </View>

            {open && (
                <View style={styles.dropdown}>
                    {filtered.length > 0 && (
                        <ScrollView
                            style={{ maxHeight: 200 }}
                            keyboardShouldPersistTaps="handled"
                            nestedScrollEnabled
                        >
                            {filtered.map(item => (
                                <Pressable key={item.id} style={styles.option} onPress={() => handleSelectItem(item.name)}>
                                    <Ionicons name="location-outline" size={16} color="#64748B" />
                                    <Text style={styles.optionText}>{item.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                    {filtered.length === 0 && query.trim().length > 0 && (
                        <Text style={styles.noResults}>No matching location found.</Text>
                    )}
                    {filtered.length === 0 && query.trim().length === 0 && (
                        <Text style={styles.noResults}>No locations available.</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { zIndex: 10 },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
    },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#0F172A' },
    clearBtn: { padding: 4 },
    dropdown: {
        marginTop: 4,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#0B1220',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    optionText: { fontSize: 15, color: '#0F172A', fontWeight: '600' },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#EEF2FF',
    },
    createText: { fontSize: 14, fontWeight: '700', color: '#080357' },
    noResults: {
        padding: 16,
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
    },
});
