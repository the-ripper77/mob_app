import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useReports } from '@/hooks/useReports';
import { timeAgo } from '@/lib/timeAgo';
import type { Activity } from '@/data/types';

export default function NotificationsScreen() {
    const { reportData, loading } = useReports();

    if (loading || !reportData) {
        return (
            <SafeAreaView style={styles.center} edges={['top', 'left', 'right']}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading Notifications...</Text>
            </SafeAreaView>
        );
    }

    const activities = reportData.rawActivities;

    const renderItem = ({ item }: { item: Activity }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'notifications-outline';
        let iconColor = '#3B82F6'; // blue
        let bgColor = '#EFF6FF'; // light blue

        if (item.type === 'MAINTENANCE') {
            iconName = 'build-outline';
            iconColor = '#F59E0B'; // amber
            bgColor = '#FFFBEB';
        } else if (item.type === 'ASSIGNMENT') {
            iconName = 'person-outline';
            iconColor = '#10B981'; // emerald
            bgColor = '#ECFDF5';
        } else if (item.type === 'STATUS_CHANGE') {
            iconName = 'swap-horizontal-outline';
            iconColor = '#8B5CF6'; // purple
            bgColor = '#F5F3FF';
        } else if (item.type === 'SCRAP') {
            iconName = 'trash-bin-outline';
            iconColor = '#EF4444'; // red
            bgColor = '#FEF2F2';
        }

        return (
            <View style={styles.notificationCard}>
                <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
                    <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{item.type || 'EVENT'}</Text>
                    <Text style={styles.message}>{item.message}</Text>
                    <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </Pressable>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={activities}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No notifications yet</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEF2F7',
        justifyContent: 'space-between',
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
    listContent: { padding: 16, paddingBottom: 40 },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#EEF2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 4,
        elevation: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        color: '#475569',
        lineHeight: 18,
        marginBottom: 6,
    },
    time: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 15,
        color: '#94A3B8',
        fontWeight: '500',
    },
});
