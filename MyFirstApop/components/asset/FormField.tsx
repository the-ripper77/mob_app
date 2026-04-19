import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
    label: string;
    required?: boolean;
    error?: string;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
};

export function FormField({ label, required, error, style, children }: Props) {
    return (
        <View style={[styles.wrapper, style]}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.required}> *</Text>}
            </Text>
            {children}
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
    required: { color: '#DC2626' },
    error: { fontSize: 12, color: '#DC2626', marginTop: 4 },
});
