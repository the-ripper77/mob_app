import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReports } from '@/hooks/useReports';
import { ReportFilters, type ActiveEngine } from '@/components/reports/ReportFilters';
import { ReportMetrics } from '@/components/reports/ReportMetrics';
import { timeAgo } from '@/lib/timeAgo';
import { STATUS_COLORS, type Activity } from '@/data/types';
import { TopBar } from '@/components/TopBar';
import { useTranslation } from 'react-i18next';

export default function ReportsScreen() {
  const { reportData, loading } = useReports();
  const { t } = useTranslation();
  const [engine, setEngine] = useState<ActiveEngine>('Lemon');

  if (loading || !reportData) {
    return (
      <SafeAreaView style={styles.center} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>{t('reports.crunching')}</Text>
      </SafeAreaView>
    );
  }

  const { metrics } = reportData;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <TopBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <ReportMetrics {...metrics} />

        <ReportFilters
          activeEngine={engine}
          setActiveEngine={setEngine}
        />

        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableTitle}>{t('reports.dataExportView')}</Text>
            <Text style={styles.tableExportBtn}>{t('reports.exportCsv')}</Text>
          </View>

          {engine === 'Lemon' && <LemonTable data={reportData.reliabilityReport} t={t} />}
          {engine === 'Custody' && <CustodyTable data={reportData.custodyReport} t={t} />}
          {engine === 'Vendor' && <VendorTable data={reportData.vendorReport} t={t} />}
          {!engine && <EmptyState msg={t('reports.selectEngine')} />}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-Tables for Engines ──────────────────────────────────────────────────

function LemonTable({ data, t }: { data: any[], t: any }) {
  if (!data.length) return <EmptyState msg={t('reports.noReliability')} />;
  return <View>{data.map(d => <DataRow key={d.id} title={d.name} subtitle={`Repairs: ${d.maintenanceCount}`} detail={`Score: ${d.reliabilityScore.toFixed(1)}`} />)}</View>;
}

function CustodyTable({ data, t }: { data: any[], t: any }) {
  if (!data.length) return <EmptyState msg={t('reports.noEmployees')} />;
  return <View>{data.map(d => <DataRow key={d.employee.id} title={d.employee.full_name} subtitle={`Assets Held: ${d.assetsHeld}`} detail={`Liability: NPR ${d.estimatedValue.toLocaleString()}`} />)}</View>;
}

function VendorTable({ data, t }: { data: any[], t: any }) {
  if (!data.length) return <EmptyState msg={t('reports.noVendorLogs')} />;
  return <View>{data.map(d => <DataRow key={d.vendor.id} title={d.vendor.company_name} subtitle={`Repairs: ${d.repairCount}`} detail={`Total Cost: NPR ${d.totalSpend.toLocaleString()}`} />)}</View>;
}

// ─── Reusable Row ────────────────────────────────────────────────────────────

function DataRow({
  title,
  subtitle,
  detail,
  detailColor,
  secondaryDetail,
}: {
  title: string;
  subtitle: string;
  detail: string;
  detailColor?: string;
  secondaryDetail?: string;
}) {
  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.left}>
        <View style={rowStyles.titleRow}>
          <Text style={rowStyles.title}>{title}</Text>
          {secondaryDetail && <Text style={rowStyles.secondaryDetail}>{secondaryDetail}</Text>}
        </View>
        <Text style={rowStyles.subtitle}>{subtitle}</Text>
      </View>
      <View style={rowStyles.right}>
        <Text style={[rowStyles.detail, detailColor ? { color: detailColor } : null]}>{detail}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  left: { flex: 1, paddingRight: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  title: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  subtitle: { fontSize: 13, color: '#64748B' },
  right: { alignItems: 'flex-end' },
  detail: { fontSize: 13, fontWeight: '700', color: '#334155' },
  secondaryDetail: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
});

function EmptyState({ msg }: { msg: string }) {
  return <Text style={styles.empty}>{msg}</Text>
}


// ─── Main Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '600' },
  topBar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  screenTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  tableTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  tableExportBtn: { fontSize: 13, fontWeight: '600', color: '#2563EB' },
  empty: { textAlign: 'center', color: '#94A3B8', padding: 20, fontStyle: 'italic' }
});
