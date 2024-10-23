import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";
import { router } from "expo-router";
import { View, Text, Image, Modal, TouchableOpacity } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useState } from "react";
import MapView from 'react-native-maps';
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmRide() {
    const { drivers, setSelectedDriver, selectedDriver } = useDriverStore();
    const [isMapVisible, setIsMapVisible] = useState(false);

    return (
        // <SafeAreaView style={{ flex: 1 }} >
        <RideLayout title="Choose a Driver" snapPoints={["35%", "60%"]}>
            <View className="flex-5 justify-center">
                <FlatList
                    data={drivers}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <DriverCard
                            selected={selectedDriver!}
                            setSelected={() => setSelectedDriver(item.id!)}
                            item={item}
                        />
                    )}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={() => (
                        <View className="mx-5 mt-7">
                            <CustomButton
                                title="Select Ride"
                                onPress={() => router.push("/(root)/book-ride")}
                            />
                            <View style={{ marginVertical: 15 }} />
                    </View>
                    )}
                />
            </View>
            <Modal visible={isMapVisible} animationType="slide">
                <MapView style={{ flex: 10 }} />
                <TouchableOpacity onPress={() => setIsMapVisible(false)} style={{ position: "relative", top: 40, right: 20 }}>
                    <Text style={{ color: 'white', fontSize: 18 }}>Close</Text>
                </TouchableOpacity>
            </Modal>
        </RideLayout>
        // </SafeAreaView>
    );
}
