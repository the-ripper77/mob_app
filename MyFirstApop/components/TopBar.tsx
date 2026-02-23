import React from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext'; import { useTranslation } from 'react-i18next';

export function TopBar() {
    const { user, signOut } = useAuth();
    const { t } = useTranslation();
    const initial = user?.email?.charAt(0).toUpperCase() ?? 'A';

    function handleSignOut() {
        Alert.alert('Sign out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign out', style: 'destructive', onPress: async () => {
                    await signOut();
                    router.replace('/(auth)/login');
                }
            },
        ]);
    }

    return (
        <View style={styles.topBarContainer}>
            <View style={styles.topBar}>
                <View style={styles.topBarLeft}>
                    <Text style={styles.appName}>{t('topBar.appName')}</Text>
                </View>
                <View style={styles.topBarRight}>
                    <Pressable style={[styles.iconCircle, styles.avatarCircle]} onPress={handleSignOut}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topBarContainer: {
        backgroundColor: '#FFFFFF',
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        shadowColor: '#0B1220',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    topBarLeft: {
        flexDirection: 'column',
    },
    appName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#080357',
    },
    topBarRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#E5EDFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarCircle: {
        backgroundColor: '#080357',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
