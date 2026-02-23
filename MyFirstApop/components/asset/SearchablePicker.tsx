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

type Item = {
    id: string;
    label: string;
    sublabel?: string;
    [key: string]: any;
};

type Props = {
    items: Item[];
    value: string; // The ID or label of the selected item
    onSelect: (item: Item) => void;
    placeholder?: string;
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    disabled?: boolean;
    error?: string;
};

export function SearchablePicker({
    items,
    value,
    onSelect,
    placeholder = 'Select an item...',
    icon = 'search-outline',
    disabled,
    error,
}: Props) {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedItem = items.find(i => i.id === value || i.label === value);

    const filteredItems = items.filter(i =>
        (i.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.sublabel && i.sublabel.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    function handleSelect(item: Item) {
        onSelect(item);
        setOpen(false);
        setSearchQuery('');
    }

    return (
        <View style={styles.container}>
            <Pressable
                style={[
                    styles.trigger,
                    error ? styles.triggerError : null,
                    disabled && styles.triggerDisabled
                ]}
                onPress={() => !disabled && setOpen(!open)}>
                <Ionicons name={icon} size={18} color="#94A3B8" style={styles.triggerIcon} />
                <Text style={[styles.triggerText, !selectedItem && styles.placeholderText]}>
                    {selectedItem ? selectedItem.label : placeholder}
                </Text>
                <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#94A3B8"
                />
            </Pressable>

            {open && (
                <View style={styles.dropdown}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={16} color="#94A3B8" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Type to search..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>
                    <ScrollView
                        style={styles.list}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled
                    >
                        {filteredItems.length === 0 ? (
                            <Text style={styles.emptyText}>No results found.</Text>
                        ) : (
                            filteredItems.map(item => (
                                <Pressable
                                    key={item.id}
                                    style={({ pressed }) => [
                                        styles.item,
                                        pressed && styles.itemPressed,
                                        item.id === selectedItem?.id && styles.itemSelected
                                    ]}
                                    onPress={() => handleSelect(item)}>
                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemLabel}>{item.label}</Text>
                                        {item.sublabel && <Text style={styles.itemSublabel}>{item.sublabel}</Text>}
                                    </View>
                                    {item.id === selectedItem?.id && (
                                        <Ionicons name="checkmark" size={18} color="#080357" />
                                    )}
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { zIndex: 100 },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    triggerError: { borderColor: '#DC2626' },
    triggerDisabled: { opacity: 0.6 },
    triggerIcon: { marginRight: 10 },
    triggerText: { flex: 1, fontSize: 16, color: '#0F172A', fontWeight: '500' },
    placeholderText: { color: '#94A3B8' },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginTop: 4,
        maxHeight: 250,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0B1220',
        shadowOpacity: 0.1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        overflow: 'hidden',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        backgroundColor: '#FAFBFC',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        fontSize: 15,
        color: '#0F172A',
    },
    list: { maxHeight: 200 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    itemPressed: { backgroundColor: '#F8FAFC' },
    itemSelected: { backgroundColor: '#EEF2FF' },
    itemContent: { flex: 1 },
    itemLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    itemSublabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
    emptyText: { padding: 20, textAlign: 'center', color: '#94A3B8', fontSize: 14 },
});
