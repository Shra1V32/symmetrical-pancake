import { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Text,
    View,
    Modal,
    Image,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { fetchAPI, useFetch } from "@/lib/fetch";
import * as Location from "expo-location";
import RideLayout from "@/components/RideLayout";
import { formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

type DriverLiveLocation = {
    latitude: number;
    longitude: number;
    driver_id: string;
    updated_at: string;
};

const DriverLocationScreen = () => {
    const route = useRoute();
    const driver_id = route.params as { rideId: string } | undefined;

    const [driverLocation, setDriverLocation] = useState<DriverLiveLocation | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [driverDetails, setDriverDetails] = useState<any>(null); // For storing driver details
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [hasPermissions, setHasPermissions] = useState(false);
    const { data: recentRides, loading: ride_loading, error: ride_error, refetch } = useFetch<Ride[]>(`/(api)/ride/${driver_id?.rideId}`);
    console.log(recentRides);

    // Fetch user location
    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
            setHasPermissions(false);
            setError("Location permission not granted");
            return;
        }

        setHasPermissions(true);
        const location = await Location.getCurrentPositionAsync();
        setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        });
    };

    // Fetch driver location
    const fetchDriverLocation = async () => {
        try {
            const response = await fetchAPI(`/driver_location/${driver_id?.rideId}`);
            const data = response.data;
            setDriverLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                driver_id: driver_id?.rideId!,
                updated_at: data.updated_at,
            });
        } catch (err) {
            setError("Failed to load driver location");
        }
    };

    // Fetch driver details
    const fetchDriverDetails = async () => {
        try {
            const response = await fetchAPI(`/driver/${driver_id?.rideId}`);
            const driverDetails = response.data[0];
            setDriverDetails(driverDetails); // Set driver details in state
        } catch (err) {
            setError("Failed to load driver details");
        }
    };

    // Fetch user location and driver details once the component mounts
    useEffect(() => {
        if (!driver_id || !driver_id.rideId) {
            setError("Invalid driver ID");
            setLoading(false);
            return;
        }

        getLocation();
        fetchDriverLocation();
        fetchDriverDetails(); // Fetch driver details

        setLoading(false);
    }, [driver_id]);

    // Poll driver location every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDriverLocation();
        }, 5000);

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, []);

    if (loading) {
        return (
            <View className="flex justify-between items-center w-full">
                <ActivityIndicator size="small" color="black" />
            </View>
        );
    }

    if (error || !driverLocation || !userLocation || !driverDetails) {
        return <Text className="text-red-500">{error}</Text>;
    }

    console.log(recentRides);

    return (
        <RideLayout title="Driver Location" snapPoints={["35%", "60%"]} showMap={false}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: driverLocation.latitude,
                        longitude: driverLocation.longitude,
                    }}
                    title="Driver Location"
                    image={require("@/assets/icons/xxhdpi_truck.png")} // Use the custom icon
                />
                <Marker
                    coordinate={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }}
                    title="Your Location"
                    image={require("@/assets/icons/user_loc.png")} // Use the custom icon
                />
                <MapViewDirections
                    origin={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }}
                    destination={{
                        latitude: driverLocation.latitude,
                        longitude: driverLocation.longitude,
                    }}
                    apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY!}
                    strokeWidth={3}
                    strokeColor="black"
                />
            </MapView>

            <Modal visible={isMapVisible}>
                <View
                    style={[
                        styles.modalContainer,
                        { width: "100%", height: "100%" },
                    ]}
                    className="my-3"
                >
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsMapVisible(false)}
                    >
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <>
                <Text className="text-xl font-JakartaSemiBold mb-3">
                    Ride Information
                </Text>

                <View className="flex flex-col w-full items-center justify-center mt-10">
                    <Image
                        source={{ uri: driverDetails?.profile_image_url }}
                        className="w-26 h-26 rounded-full"
                        resizeMode="cover"
                        style={{ width: 100, height: 100, borderRadius: 50 }} 
                    />

                    <View className="flex flex-row items-center justify-center mt-5 space-x-2">
                        <Text className="text-lg font-JakartaSemiBold">
                            {driverDetails?.title}
                        </Text>

                        <View className="flex flex-row items-center space-x-0.5">
                            <Image
                                source={require("@/assets/icons/star.png")}
                                className="w-5 h-5"
                                resizeMode="contain"
                            />
                            <Text className="text-lg font-JakartaRegular">
                                {driverDetails?.rating}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
                    <View className="flex flex-row items-center justify-between w-full py-3">
                        <Text className="text-lg font-JakartaRegular">Driver</Text>
                        <Text className="text-lg font-JakartaRegular">
                            {driverDetails?.first_name} {driverDetails?.last_name}
                        </Text>
                    </View>

                    <View className="flex flex-row items-center justify-between w-full py-3">
                        <Text className="text-lg font-JakartaRegular">Vehicle Size</Text>
                        <Text className="text-lg font-JakartaRegular">
                            {driverDetails?.vehicle_size}
                        </Text>
                    </View>
                </View>
            </>
        </RideLayout>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    closeButton: {
        position: "absolute",
        top: 40,
        right: 20,
        backgroundColor: "black",
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "white",
        fontSize: 20,
    },
});

export default DriverLocationScreen;
