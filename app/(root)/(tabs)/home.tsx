import {
    Text,
    View,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import { useUser, useAuth } from "@clerk/clerk-expo";

import RideCard from "@/components/RideCard";
import Map from "@/components/Map";
import GoogleTextInput from "@/components/GoogleTextInput";

import { icons, images } from "@/constants";
import { useLocationStore } from "@/store";
import { router } from "expo-router";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

export default function Page() {
    const { setUserLocation, setDestinationLocation } = useLocationStore();
    const { user } = useUser();
    const { signOut } = useAuth();

    const {
        data: recentRides,
        loading,
        error,
    } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

    const [hasPermissions, setHasPermissions] = useState(false);

    useEffect(() => {
        async function getLocation() {
            let { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                setHasPermissions(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const address = await Location.reverseGeocodeAsync({
                latitude: location.coords?.latitude!,
                longitude: location.coords?.longitude!,
            });

            setUserLocation({
                latitude: location.coords?.latitude,
                longitude: location.coords?.longitude,
                address: `${address[0].name}, ${address[0].region}`,
            });
        }

        getLocation();
    }, [setUserLocation]);

    useEffect(() => {
        // Cleanup destination from previous ride
        setDestinationLocation({
            latitude: null,
            longitude: null,
            address: null,
        });
    }, [setDestinationLocation]);

    const handleSignout = () => {
        signOut();

        router.replace("/(auth)/sign-in");
    };

    const handleDestinationPress = (location: {
        latitude: number;
        longitude: number;
        address: string;
    }) => {
        setDestinationLocation(location);

        router.push("/(root)/find-ride");
    };

    return (
        <SafeAreaView className="bg-general-500 h-full">
            <FlatList
                data={recentRides}
                renderItem={({ item }) => <RideCard ride={item} />}
                className="px-5"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={() => (
                    <View className="flex flex-col items-center justify-center">
                        {loading ? (
                            <View className="items-center">
                                <ActivityIndicator
                                    size="large"
                                    color="#0286FF"
                                />
                            </View>
                        ) : (
                            <View className="items-center">
                                <Image
                                    source={images.noResult}
                                    className="w-40 h-40"
                                    alt="No recent package deliveries found"
                                    resizeMode="contain"
                                />
                                <Text className="text-sm">
                                    Whoops! No recent package deliveries found
                                </Text>
                            </View>
                        )}
                    </View>
                )}
                ListHeaderComponent={() => (
                    <>
                        <View className="flex flex-row items-center justify-between my-5">
                            <Text className="text-xl font-JakartaBold text- mt-5 capitalize">
                                Welcome{" "}
                                {user?.firstName ||
                                    user?.emailAddresses[0].emailAddress.split(
                                        "@"
                                    )[0]}{" "}
                                👋
                            </Text>
                            <TouchableOpacity
                                onPress={handleSignout}
                                className="justify-center items-center w-10 h-10 rounded-full bg-white"
                            >
                                <Image source={icons.out} className="w-4 h-4" />
                            </TouchableOpacity>
                        </View>

                        <GoogleTextInput
                            icon={icons.search}
                            containerStyle="bg-white shadow-md shadow-netrual-300"
                            handlePress={handleDestinationPress}
                        />

                        <>
                            <Text className="text-xl font-JakartaBold mt-5 mb-3">
                                Your current location
                            </Text>
                            <View className="flex flex-row items-center bg-transparent h-[300px]">
                                <Map />
                            </View>
                        </>

                        <Text className="text-xl font-JakartaBold mt-5 mb-3">
                            Recent package deliveries
                        </Text>
                    </>
                )}
            />
        </SafeAreaView>
    );
}
