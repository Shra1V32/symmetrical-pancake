import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";
const TELEGRAM_API = "https://api.telegram.org/bot" + process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN;

const Payment = ({
    fullName,
    email,
    amount,
    driverId,
    rideTime,
}: PaymentProps) => {
    const { userId } = useAuth();
    const [success, setSuccess] = useState(false);

    const {
        userAddress,
        userLatitude,
        userLongitude,
        destinationAddress,
        destinationLatitude,
        destinationLongitude,
    } = useLocationStore();

    // Function to send a message the drivers channel
    // the message should contain the ride details
    // so that it becomes easier for the drivers to accept the ride
    async function sendMessageToDriversChannel(ride: any) {
        const message = `🚖 **New Ride Request** 🚖\n\n` +
            `**From:** ${ride.origin_address}\n` +
            `**To:** ${ride.destination_address}\n` +
            `**Time:** ${new Date(ride.ride_time).toLocaleString()}\n\n` +
            `Please respond promptly!`;
    
        try {
            const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    chat_id: 658048451,
                    text: message,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "✅ Accept",
                                    callback_data: `accept_ride_${ride.ride_id}`,
                                },
                                {
                                    text: "❌ Decline",
                                    callback_data: `decline_ride_${ride.ride_id}`,
                                },
                            ],
                        ],
                    },
                }),
            });
    
            if (!response.ok) {
                throw new Error(`Failed to send message. Status: ${response.status}` + response.statusText + response.body + JSON.stringify(response));
                // log every possible detail
                console.error('Failed to send message:', response);
            }
    
            const data = await response.json();
            console.log('Message sent successfully:', data);
    
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally, handle retries or further logging
        }
    }

    const handleCashPayment = async () => {
        try {
            await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    origin_address: userAddress,
                    destination_address: destinationAddress,
                    origin_latitude: userLatitude,
                    origin_longitude: userLongitude,
                    destination_latitude: destinationLatitude,
                    destination_longitude: destinationLongitude,
                    ride_time: rideTime.toFixed(0),
                    fare_price: parseInt(amount) * 100,
                    package_status: "confirmed",
                    driver_id: driverId,
                    user_id: userId,
                }),
            });

            // Send a message to the drivers channel
            // with the ride details
            // so that it becomes easier for the drivers to accept the ride
            await sendMessageToDriversChannel({
                origin_address: userAddress,
                destination_address: destinationAddress,
                ride_time: rideTime,
                ride_id: driverId,
            });

            setSuccess(true);

        } catch (error) {
            Alert.alert("Payment Error", "An error occurred while processing the payment");
            console.log("Payment Error: " + error);
        }
    };

    return (
        <>
            <CustomButton
                title="Confirm Ride"
                className="my-10"
                onPress={handleCashPayment}
            />

            <ReactNativeModal
                isVisible={success}
                onBackdropPress={() => setSuccess(false)}
            >
                <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
                    <Image source={images.check} className="w-28 h-28 mt-5" />

                    <Text className="text-2xl text-center font-JakartaBold mt-5">
                        Booking placed successfully
                    </Text>

                    <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
                        Thank you for your booking. Your reservation has been
                        successfully placed. Please proceed with your trip.
                    </Text>

                    <CustomButton
                        title="Back Home"
                        onPress={() => {
                            setSuccess(false);
                            router.push("/(root)/(tabs)/home");
                        }}
                        className="mt-5"
                    />
                </View>
            </ReactNativeModal>
        </>
    );
};

export default Payment;
