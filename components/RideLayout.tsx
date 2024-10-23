import { icons } from "@/constants";
import { router } from "expo-router";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Map from "./Map";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import React  from "react";
import MapView from "react-native-maps";
import { convertToObject } from "typescript";

export default function RideLayout({
    title,
    snapPoints,
    children,
    showMap,
}: {
    title: string;
    snapPoints?: string[];
    children: React.ReactNode;
    showMap?: boolean;
}) {
    const bottomSheetRef = useRef<BottomSheet>(null);
    // set showMap to true if not specified
    const isMapVisible = showMap ?? true;
    const childrenArray = React.Children.toArray(children);
  
    // Filter out the MapView component
    const mapView = childrenArray.find(child => {
        // You can check if the child is a React element and its type matches MapView
        return React.isValidElement(child) && child.type === MapView;
    });

    // remove the MapView from the children array
    let filteredChildren = childrenArray;
    if (mapView) {
        filteredChildren = childrenArray.filter(child => child !== mapView);
    }

    return (
        <GestureHandlerRootView>
            <View className="flex-1 bg-white">
                <View className="flex-1 flex-col h-screen bg-blue-500">
                    <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
                        <TouchableOpacity onPress={() => router.back()}>
                            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                                <Image
                                    source={icons.backArrow}
                                    resizeMode="contain"
                                    className="w-6 h-6"
                                />
                            </View>
                        </TouchableOpacity>
                        <Text className="text-xl font-JakartaSemiBold ml-5">
                            {title || "Go back"}
                        </Text>
                    </View>
                    { isMapVisible && <Map /> || mapView}
                </View>
                <BottomSheet
                    keyboardBehavior="extend"
                    ref={bottomSheetRef}
                    snapPoints={snapPoints || ["40%", "85%"]}
                    index={0}
                >
                    <BottomSheetView style={{ flex: 1, padding: 20 }}>
                        {filteredChildren || children}
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </GestureHandlerRootView>
    );
}
