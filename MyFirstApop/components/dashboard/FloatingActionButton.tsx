import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onAddAsset?: () => void;
  onAddEmployee?: () => void;
  onAddVendor?: () => void;
  onAddLocation?: () => void;
  onAssignAsset?: () => void;
  onScanAsset?: () => void;
};

const MENU_ITEMS = [
  { key: 'asset' as const, label: 'ADD ASSET', icon: 'cart-outline' as const, prop: 'onAddAsset' as const },
  { key: 'employee' as const, label: 'ADD EMPLOYEE', icon: 'person-add-outline' as const, prop: 'onAddEmployee' as const },
  { key: 'vendor' as const, label: 'ADD VENDOR', icon: 'business-outline' as const, prop: 'onAddVendor' as const },
  { key: 'location' as const, label: 'ADD LOCATION', icon: 'location-outline' as const, prop: 'onAddLocation' as const },
  { key: 'assign' as const, label: 'ASSIGN ASSET', icon: 'person-outline' as const, prop: 'onAssignAsset' as const },
  { key: 'scan' as const, label: 'SCAN ASSET', icon: 'qr-code-outline' as const, prop: 'onScanAsset' as const },
] as const;

export function FloatingActionButton({
  onAddAsset,
  onAddEmployee,
  onAddVendor,
  onAddLocation,
  onAssignAsset,
  onScanAsset,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  function handleMenuPress(
    prop: 'onAddAsset' | 'onAddEmployee' | 'onAddVendor' | 'onAddLocation' | 'onAssignAsset' | 'onScanAsset'
  ) {
    setExpanded(false);
    const fn = { onAddAsset, onAddEmployee, onAddVendor, onAddLocation, onAssignAsset, onScanAsset }[prop];
    fn?.();
  }

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {expanded && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setExpanded(false)}
        />
      )}
      {expanded && (
        <View style={styles.menuWrapper} pointerEvents="box-none">
          <View style={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && styles.menuRowPressed,
                ]}
                onPress={() => handleMenuPress(item.prop)}>
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={20} color="#080357" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.arrow} />
        </View>
      )}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setExpanded((e) => !e)}>
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 20,
    paddingBottom: 28,
  },
  menuWrapper: {
    position: 'absolute',
    bottom: 86,
    right: 20,
    alignItems: 'flex-end',
  },
  menu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 180,
    shadowColor: '#0B1220',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuRowPressed: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  arrow: {
    width: 0,
    height: 0,
    marginRight: 14,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#080357',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0B1220',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.9,
  },
});
