import { useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";

import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

const Rides = () => {
    const { user } = useUser();
    const navigation = useNavigation();

    const { data: recentRides, loading, error, refetch } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

    useEffect(() => {
        const interval = setInterval(() => {
            refetch();
        }, 8000);

        return () => clearInterval(interval);
    }, [refetch]);

    const handlePress = (ride: Ride) => {
        if (ride.driver) {
            router.push(`/get_driver_loc?rideId=${ride.driver.driver_id}`);
            // console.log(ride);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <FlatList
                data={recentRides}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => handlePress(item)}>
                        <RideCard ride={item} />
                    </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                className="px-5"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                    paddingBottom: 100,
                }}
                ListEmptyComponent={() => (
                    <View className="flex flex-col items-center justify-center">
                        {!loading ? (
                            <>
                                <Image
                                    source={images.noResult}
                                    className="w-40 h-40"
                                    alt="No recent packages deliveries found"
                                    resizeMode="contain"
                                />
                                <Text className="text-sm">
                                    No recent packages deliveries found
                                </Text>
                            </>
                        ) : (
                            <ActivityIndicator size="small" color="#000" />
                        )}
                    </View>
                )}
                ListHeaderComponent={
                    <>
                        <Text className="text-2xl font-JakartaBold my-5">
                            All Packages in the past
                        </Text>
                    </>
                }
            />
        </SafeAreaView>
    );
};

export default Rides;
