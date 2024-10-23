import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="find-ride" options={{ headerShown: false }} />
            <Stack.Screen
                name="confirm-ride"
                options={{ headerShown: false }}
            />
            <Stack.Screen name="book-ride" options={{ headerShown: false }} />
            <Stack.Screen name="get_driver_loc" options={{ headerShown: false }} />
        </Stack>
    );
}