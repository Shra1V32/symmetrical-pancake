import { useDriverStore, useLocationStore } from "@/store";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import {
    calculateDriverTimes,
    calculateRegion,
    generateMarkersFromData,
} from "@/lib/map";
import { useEffect, useState } from "react";
import { Driver, MarkerData } from "@/types/type";
import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import MapViewDirections from "react-native-maps-directions";

export default function Map() {
    const {
        data: drivers,
        loading,
        error,
    } = useFetch<Driver[]>("/(api)/driver");

    const {
        userLongitude,
        userLatitude,
        destinationLongitude,
        destinationLatitude,
    } = useLocationStore();

    const region = calculateRegion({
        userLongitude,
        userLatitude,
        destinationLongitude,
        destinationLatitude,
    });

    const { selectedDriver, setDrivers } = useDriverStore((state) => state);
    const [markers, setMarkers] = useState<MarkerData[]>([]);

    useEffect(() => {
        if (Array.isArray(drivers)) {
            if (!userLatitude || !userLongitude) return;

            const newMarkers = generateMarkersFromData({
                data: drivers,
                userLatitude,
                userLongitude,
            });

            setMarkers(newMarkers);
        }
    }, [drivers, userLatitude, userLongitude]);

    useEffect(() => {
        if (markers.length > 0 && destinationLatitude && destinationLongitude) {
            calculateDriverTimes({
                markers,
                userLongitude,
                userLatitude,
                destinationLongitude,
                destinationLatitude,
            }).then((drivers) => {
                setDrivers(drivers as MarkerData[]);
            });
        }
    }, [
        destinationLatitude,
        destinationLongitude,
        markers,
        userLatitude,
        userLongitude,
        setDrivers,
    ]);

    if (loading || !userLatitude || !userLongitude) {
        return (
            <View className="flex justify-between items-center w-full">
                <ActivityIndicator size="small" color="black" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex justify-between items-center w-full">
                <Text>Error fetching data</Text>
            </View>
        );
    }

    return (
        <MapView
            provider={PROVIDER_DEFAULT}
            className="w-full h-full rounded-2xl"
            tintColor="black"
            mapType="mutedStandard"
            showsPointsOfInterest={false}
            initialRegion={region}
            showsUserLocation={true}
            userInterfaceStyle="light"
        >
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={{
                        latitude: marker.latitude,
                        longitude: marker.longitude,
                    }}
                    title={marker.title}
                    image={
                        selectedDriver === marker.id
                            ? icons.selectedMarker
                            : icons.marker
                    }
                ></Marker>
            ))}

            {destinationLatitude && destinationLongitude && (
                <Marker
                    key="destination"
                    coordinate={{
                        latitude: destinationLatitude,
                        longitude: destinationLongitude,
                    }}
                    title="Destination"
                    image={icons.pin}
                ></Marker>
            )}

            {userLatitude &&
                userLongitude &&
                destinationLatitude &&
                destinationLongitude && (
                    <MapViewDirections
                        origin={{
                            latitude: userLatitude,
                            longitude: userLongitude,
                        }}
                        destination={{
                            latitude: destinationLatitude,
                            longitude: destinationLongitude,
                        }}
                        apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY!}
                        strokeColor="#0286ff"
                        strokeWidth={3}
                    />
                )}
        </MapView>
    );
}
