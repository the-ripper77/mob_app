import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { TopBar } from '@/components/TopBar';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'User';
  const email = user?.email ?? 'example@email.com';

  const [langModalVisible, setLangModalVisible] = useState(false);
  const { t, i18n } = useTranslation();

  async function handleLogOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  function changeLanguage(lang: string) {
    i18n.changeLanguage(lang);
    setLangModalVisible(false);
  }

  const currentLangLabel = i18n.language === 'ne' ? t('settings.nepali') : t('settings.english');

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <TopBar />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={48} color="#94A3B8" />
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileTitle}>{t('settings.userRole')}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Text style={styles.profileLocation}>—</Text>
        </View>

        {/* Notifications */}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => router.push('/notifications')}>
          <View style={styles.rowIcon}>
            <Ionicons name="notifications-outline" size={22} color="#475569" />
          </View>
          <Text style={styles.rowLabel}>{t('settings.notifications')}</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Pressable>

        {/* Account section */}
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => setLangModalVisible(true)}
          >
            <View style={styles.rowIcon}>
              <Ionicons name="language-outline" size={22} color="#475569" />
            </View>
            <Text style={styles.rowLabel}>{t('settings.language')}</Text>
            <Text style={styles.rowValue}>{currentLangLabel}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={handleLogOut}>
            <View style={styles.rowIcon}>
              <Ionicons name="log-out-outline" size={22} color="#475569" />
            </View>
            <Text style={styles.rowLabelDanger}>{t('settings.logOut')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={langModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.languageSelectorTitle')}</Text>

            <Pressable
              style={[styles.modalOption, i18n.language === 'en' && styles.modalOptionSelected]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[styles.modalOptionText, i18n.language === 'en' && styles.modalOptionTextSelected]}>
                {t('settings.english')}
              </Text>
              {i18n.language === 'en' && <Ionicons name="checkmark" size={20} color="#080357" />}
            </Pressable>

            <View style={styles.modalDivider} />

            <Pressable
              style={[styles.modalOption, i18n.language === 'ne' && styles.modalOptionSelected]}
              onPress={() => changeLanguage('ne')}
            >
              <Text style={[styles.modalOptionText, i18n.language === 'ne' && styles.modalOptionTextSelected]}>
                {t('settings.nepali')}
              </Text>
              {i18n.language === 'ne' && <Ionicons name="checkmark" size={20} color="#080357" />}
            </Pressable>

            <Pressable
              style={styles.modalCancelBtn}
              onPress={() => setLangModalVisible(false)}
            >
              <Text style={styles.modalCancelBtnText}>{t('settings.cancel')}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F6FA' },
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
  title: { fontSize: 20, fontWeight: '900', color: '#080357' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5EDFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  profileTitle: { fontSize: 14, fontWeight: '600', color: '#64748B', marginTop: 4 },
  profileEmail: { fontSize: 14, fontWeight: '600', color: '#475569', marginTop: 4 },
  profileLocation: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  rowPressed: { backgroundColor: '#F8FAFC' },
  rowIcon: { marginRight: 12 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#0F172A' },
  rowLabelDanger: { flex: 1, fontSize: 15, fontWeight: '700', color: '#DC2626' },
  rowValue: { fontSize: 14, color: '#64748B', marginRight: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginLeft: 34,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalOptionSelected: {
    backgroundColor: '#F0F0FF',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  modalOptionTextSelected: {
    color: '#080357',
    fontWeight: '800',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginVertical: 4,
  },
  modalCancelBtn: {
    marginTop: 24,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  modalCancelBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
});
