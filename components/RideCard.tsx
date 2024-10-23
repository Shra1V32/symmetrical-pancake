import { View, Text, Image } from "react-native";
import React from "react";

import { formatDate, formatTime } from "@/lib/utils";

import { Ride } from "@/types/type";
import { icons } from "@/constants";

const geoapify_key = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

export default function RideCard({
    ride: {
        destination_longitude,
        destination_latitude,
        origin_address,
        destination_address,
        created_at,
        ride_time,
        driver,
        package_status,
    },
}: {
    ride: Ride;
}) {
    return (
        <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
            <View className="flex flex-col items-center justify-center p-3">
                <View className="flex flex-row items-center justify-between">
                    <Image
                        source={{
                            uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat:${destination_longitude},${destination_latitude}&zoom=14&apiKey=${geoapify_key}`,
                        }}
                        className="w-[80px] h-[90px] rounded-lg"
                    />

                    <View className="flex flex-col mx-5 gap-y-5 flex-1">
                        <View className="flex flex-row items-center gap-x-2">
                            <Image source={icons.to} className="w-5 h-5" />
                            <Text
                                className="text-md font-JakartaMedium"
                                numberOfLines={1}
                            >
                                {origin_address}
                            </Text>
                        </View>

                        <View className="flex flex-row items-center gap-x-2">
                            <Image source={icons.point} className="w-5 h-5" />
                            <Text
                                className="text-md font-JakartaMedium"
                                numberOfLines={1}
                            >
                                {destination_address}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
                    <View className="flex flex-row items-center w-full justify-between mb-5">
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            Date & Time
                        </Text>
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            {formatDate(created_at)}, {formatTime(ride_time)}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center w-full justify-between mb-5">
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            Driver
                        </Text>
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            {driver.first_name} {driver.last_name}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center w-full justify-between mb-5">
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            Vehicle Size
                        </Text>
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            {driver.vehicle_size}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center w-full justify-between mb-5">
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            Estimated time
                        </Text>
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            {Math.floor(ride_time / 60)} hr {ride_time % 60} mins
                        </Text>
                    </View>

                    <View className="flex flex-row items-center w-full justify-between mb-5">
                        <Text className="text-md font-JakartaMedium text-gray-500">
                            Package Status
                        </Text>
                        <Text
                            className={`text-md font-JakartaMedium text-gray-500 ${
                                package_status === "placed"
                                    ? "text-green-500"
                                    : package_status === "in_transit"
                                    ? "text-yellow-500"
                                    : package_status === "package_pickup"
                                    ? "text-blue-500"
                                    : package_status === "on_delivery"
                                    ? "text-green-500"
                                    : "text-red-500"
                            }`}
                        >
                            {package_status === "placed"
                                ? "confirmed"
                                : package_status === "in_transit"
                                ? "In Transit"
                                : package_status === "package_pickup"
                                ? "Package Pickup"
                                : package_status === "on_delivery"
                                ? "On Delivery"
                                : "Pending"}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
