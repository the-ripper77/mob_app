import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { STATUS_COLORS, type Asset, type Employee } from '@/data/types';
import { useAssets } from '@/hooks/useAssets';
import { useEmployees } from '@/hooks/useEmployees';
import { assignAssetToEmployee, unassignAsset } from '@/lib/database';

type Tab = 'available' | 'assigned';

export default function AssignAssetScreen() {
    const { assets, loading: assetsLoading } = useAssets();
    const { employees, loading: employeesLoading } = useEmployees();

    const [activeTab, setActiveTab] = useState<Tab>('available');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);

    // Employee picker modal
    const [pickerAsset, setPickerAsset] = useState<Asset | null>(null);
    const [empSearch, setEmpSearch] = useState('');

    // ─── Filtered assets ───────────────────────────────────────────────
    const availableAssets = useMemo(
        () => assets.filter((a) => a.status === 'Available'),
        [assets]
    );

    const assignedAssets = useMemo(
        () => assets.filter((a) => a.status === 'Assigned'),
        [assets]
    );

    const displayedAssets = useMemo(() => {
        const list = activeTab === 'available' ? availableAssets : assignedAssets;
        if (!search.trim()) return list;
        const q = search.trim().toLowerCase();
        return list.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.id.toLowerCase().includes(q) ||
                a.locationName.toLowerCase().includes(q) ||
                (a.assignedTo?.toLowerCase().includes(q) ?? false)
        );
    }, [activeTab, availableAssets, assignedAssets, search]);

    const filteredEmployees = useMemo(() => {
        if (!empSearch.trim()) return employees;
        const q = empSearch.trim().toLowerCase();
        return employees.filter(
            (e) =>
                e.full_name.toLowerCase().includes(q) ||
                e.employee_id.toLowerCase().includes(q) ||
                e.department.toLowerCase().includes(q)
        );
    }, [employees, empSearch]);

    // ─── Handlers ──────────────────────────────────────────────────────
    function handleAssetPress(asset: Asset) {
        if (activeTab === 'available') {
            // Open employee picker
            setPickerAsset(asset);
            setEmpSearch('');
        } else {
            // Return / unassign
            Alert.alert(
                'Return Asset',
                `Return "${asset.name}" from ${asset.assignedTo ?? 'assignee'}?\n\nStatus will change to Available.`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Return',
                        style: 'destructive',
                        onPress: () => handleUnassign(asset),
                    },
                ]
            );
        }
    }

    async function handleUnassign(asset: Asset) {
        setProcessing(true);
        try {
            // Try to find the employee to decrement their count
            const emp = employees.find((e) => e.full_name === asset.assignedTo);
            await unassignAsset(asset.id, emp?.id);
            Alert.alert('Done', `"${asset.name}" is now Available.`);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to return asset.');
        } finally {
            setProcessing(false);
        }
    }

    async function handleAssign(employee: Employee) {
        if (!pickerAsset) return;
        setProcessing(true);
        try {
            await assignAssetToEmployee(pickerAsset.id, employee);
            setPickerAsset(null);
            Alert.alert('Success', `"${pickerAsset.name}" assigned to ${employee.full_name}.`);
        } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Failed to assign asset.');
        } finally {
            setProcessing(false);
        }
    }

    // ─── Loading ───────────────────────────────────────────────────────
    if (assetsLoading || employeesLoading) {
        return (
            <SafeAreaView style={styles.root} edges={['top']}>
                <Header />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#080357" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            <Header />

            {/* Tab Switcher */}
            <View style={styles.tabRow}>
                <Pressable
                    style={[styles.tab, activeTab === 'available' && styles.tabActive]}
                    onPress={() => setActiveTab('available')}>
                    <Ionicons
                        name="cube-outline"
                        size={16}
                        color={activeTab === 'available' ? '#FFFFFF' : '#475569'}
                    />
                    <Text style={[styles.tabText, activeTab === 'available' && styles.tabTextActive]}>
                        Available ({availableAssets.length})
                    </Text>
                </Pressable>
                <Pressable
                    style={[styles.tab, activeTab === 'assigned' && styles.tabActive]}
                    onPress={() => setActiveTab('assigned')}>
                    <Ionicons
                        name="person-outline"
                        size={16}
                        color={activeTab === 'assigned' ? '#FFFFFF' : '#475569'}
                    />
                    <Text style={[styles.tabText, activeTab === 'assigned' && styles.tabTextActive]}>
                        Assigned ({assignedAssets.length})
                    </Text>
                </Pressable>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                    style={styles.searchInput}
                    placeholder={activeTab === 'available' ? 'Search available assets…' : 'Search assigned assets…'}
                    placeholderTextColor="#94A3B8"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <Pressable onPress={() => setSearch('')} hitSlop={8}>
                        <Ionicons name="close-circle" size={18} color="#CBD5E1" />
                    </Pressable>
                )}
            </View>

            {/* Asset List */}
            {displayedAssets.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons
                        name={activeTab === 'available' ? 'cube-outline' : 'people-outline'}
                        size={48}
                        color="#94A3B8"
                    />
                    <Text style={styles.emptyTitle}>
                        {activeTab === 'available'
                            ? 'No available assets'
                            : 'No assigned assets'}
                    </Text>
                    <Text style={styles.emptySub}>
                        {activeTab === 'available'
                            ? 'All assets are currently assigned or in other states'
                            : 'No assets have been assigned yet'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayedAssets}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AssetCard
                            asset={item}
                            isAssigned={activeTab === 'assigned'}
                            onPress={() => handleAssetPress(item)}
                            disabled={processing}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    style={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            )}

            {/* Employee Picker Modal */}
            <Modal visible={!!pickerAsset} animationType="slide" presentationStyle="formSheet">
                <SafeAreaView style={styles.modalRoot}>
                    <View style={styles.modalHeader}>
                        <View>
                            <Text style={styles.modalTitle}>Select Employee</Text>
                            {pickerAsset && (
                                <Text style={styles.modalSub}>
                                    Assigning: {pickerAsset.name}
                                </Text>
                            )}
                        </View>
                        <Pressable
                            onPress={() => setPickerAsset(null)}
                            style={styles.closeBtn}
                            hitSlop={12}>
                            <Ionicons name="close" size={24} color="#0F172A" />
                        </Pressable>
                    </View>

                    <View style={styles.empSearchWrap}>
                        <Ionicons name="search" size={18} color="#94A3B8" />
                        <TextInput
                            style={styles.empSearchInput}
                            placeholder="Search employees…"
                            placeholderTextColor="#94A3B8"
                            value={empSearch}
                            onChangeText={setEmpSearch}
                        />
                    </View>

                    {employees.length === 0 ? (
                        <View style={styles.empty}>
                            <Ionicons name="people-outline" size={48} color="#94A3B8" />
                            <Text style={styles.emptyTitle}>No employees</Text>
                            <Text style={styles.emptySub}>
                                Add employees first before assigning assets
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={filteredEmployees}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.empListContent}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.empRow,
                                        pressed && styles.empRowPressed,
                                    ]}
                                    onPress={() => handleAssign(item)}
                                    disabled={processing}>
                                    <View style={styles.empAvatar}>
                                        <Text style={styles.empInitials}>
                                            {item.full_name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.empInfo}>
                                        <Text style={styles.empName}>{item.full_name}</Text>
                                        <Text style={styles.empMeta}>
                                            {item.department} • {item.employee_id} • {item.assigned_assets_count} asset(s)
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                                </Pressable>
                            )}
                        />
                    )}

                    {processing && (
                        <View style={styles.processingOverlay}>
                            <ActivityIndicator size="large" color="#080357" />
                            <Text style={styles.processingText}>Assigning…</Text>
                        </View>
                    )}
                </SafeAreaView>
            </Modal>

            {processing && !pickerAsset && (
                <View style={styles.processingOverlay}>
                    <ActivityIndicator size="large" color="#080357" />
                    <Text style={styles.processingText}>Processing…</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Header() {
    return (
        <View style={styles.header}>
            <Pressable onPress={() => router.replace('/(tabs)/assets')} style={styles.backBtn} hitSlop={12}>
                <Ionicons name="arrow-back" size={24} color="#080357" />
            </Pressable>
            <Text style={styles.title}>Assign Asset</Text>
            <View style={{ width: 40 }} />
        </View>
    );
}

function AssetCard({
    asset,
    isAssigned,
    onPress,
    disabled,
}: {
    asset: Asset;
    isAssigned: boolean;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={onPress}
            disabled={disabled}>
            <View style={styles.cardLeft}>
                <View style={[styles.cardIcon, { backgroundColor: isAssigned ? '#DBEAFE' : '#DCFCE7' }]}>
                    <Ionicons
                        name={isAssigned ? 'person' : 'cube'}
                        size={20}
                        color={isAssigned ? '#2563EB' : '#16A34A'}
                    />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{asset.name}</Text>
                    <Text style={styles.cardMeta}>
                        {asset.id} • {asset.locationName}
                    </Text>
                    {isAssigned && asset.assignedTo && (
                        <View style={styles.assigneeRow}>
                            <Ionicons name="person-outline" size={12} color="#2563EB" />
                            <Text style={styles.assigneeText}>{asset.assignedTo}</Text>
                        </View>
                    )}
                </View>
            </View>
            <View style={styles.cardRight}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[asset.status] }]}>
                    <Text style={styles.statusText}>{asset.status}</Text>
                </View>
                <Ionicons
                    name={isAssigned ? 'return-down-back-outline' : 'arrow-forward'}
                    size={18}
                    color={isAssigned ? '#DC2626' : '#16A34A'}
                    style={{ marginTop: 6 }}
                />
            </View>
        </Pressable>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F5F6FA' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    title: { fontSize: 18, fontWeight: '800', color: '#080357' },

    // Tabs
    tabRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        backgroundColor: '#E2E8F0',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    tabActive: {
        backgroundColor: '#080357',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },

    // Search
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        fontSize: 15,
        color: '#0F172A',
    },

    // Asset List
    list: { flex: 1 },
    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    separator: { height: 8 },

    // Asset Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#EEF2F7',
    },
    cardPressed: { backgroundColor: '#F8FAFC' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    cardIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
    cardMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
    assigneeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    assigneeText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
    cardRight: { alignItems: 'flex-end', marginLeft: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
    statusText: { fontSize: 11, fontWeight: '800', color: '#FFFFFF' },

    // Empty
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    emptyTitle: { fontSize: 17, fontWeight: '800', color: '#475569', marginTop: 12 },
    emptySub: { fontSize: 13, color: '#94A3B8', marginTop: 4, textAlign: 'center' },

    // Employee Picker Modal
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
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
    modalSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
    closeBtn: { padding: 8 },
    empSearchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        margin: 16,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    empSearchInput: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        fontSize: 15,
        color: '#0F172A',
    },
    empListContent: { paddingHorizontal: 16, paddingBottom: 40 },
    empRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 14,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#EEF2F7',
    },
    empRowPressed: { backgroundColor: '#F8FAFC' },
    empAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#E5EDFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    empInitials: { fontSize: 16, fontWeight: '800', color: '#080357' },
    empInfo: { flex: 1 },
    empName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    empMeta: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },

    // Processing overlay
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    processingText: { fontSize: 14, fontWeight: '700', color: '#080357', marginTop: 12 },
});
