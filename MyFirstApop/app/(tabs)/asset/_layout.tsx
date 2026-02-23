import { Stack } from 'expo-router';

export default function AssetLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitleStyle: { fontWeight: '800', fontSize: 18, color: '#080357' },
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerShadowVisible: false,
                headerBackTitle: 'Back',
                animation: 'slide_from_right',
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="add" options={{ title: 'Onboard Asset', headerShown: false }} />
            <Stack.Screen name="assign" options={{ title: 'Assign Asset', headerShown: false }} />
            <Stack.Screen name="[id]" options={{ title: 'Asset Details' }} />
        </Stack>
    );
}
