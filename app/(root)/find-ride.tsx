import { Text, View } from "react-native";
import { useLocationStore } from "@/store";
import RideLayout from "@/components/RideLayout";
import GoogleTextInput from "@/components/GoogleTextInput";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";

export default function FindRide() {
    const {
        userAddress,
        destinationAddress,
        setUserLocation,
        setDestinationLocation,
    } = useLocationStore();

    return (
        <RideLayout title="Ride" snapPoints={["55%"]}>
            <View className="my-1">
                <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
                <GoogleTextInput
                    icon={icons.target}
                    initialLocation={userAddress!}
                    containerStyle="bg-neutral-100"
                    textInputBackgroundColor="#f5f5f5"
                    handlePress={(location) => setUserLocation(location)}
                />
            </View>

            <View className="my-1">
                <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
                <GoogleTextInput
                    icon={icons.map}
                    initialLocation={destinationAddress!}
                    containerStyle="bg-neutral-100"
                    textInputBackgroundColor="transparent"
                    handlePress={(location) => setDestinationLocation(location)}
                />
            </View>

            <CustomButton
                title="Find now"
                onPress={() => router.push("/(root)/confirm-ride")}
                className="mt-5"
            />
        </RideLayout>
    );
}
