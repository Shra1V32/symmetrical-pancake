import { View, Text, Image, Alert } from "react-native";
import { useCallback } from "react";

import CustomButton from "./CustomButton";

import { icons } from "@/constants";
import { useOAuth } from "@clerk/clerk-expo";
import { create } from "zustand";
import { googleOAuth } from "@/lib/auth";
import { router } from "expo-router";

export default function OAuth() {
    const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

    const handleGoogleSignIn = useCallback(async () => {
        try {
            const result = await googleOAuth(startOAuthFlow);

            // console.log("OAuth result code: ", result.code);

            if (result.code === "session_exists") {
                Alert.alert(
                    "Success",
                    "A session already exists, redirecting to home page."
                );

                router.push("/(root)/(tabs)/home");
            } else if (result.code === "success") {
                Alert.alert("Success", "OAuth flow completed successfully");
                router.push("/(root)/(tabs)/home");
            }

            Alert.alert(result.success ? "Success" : "Error", result.message);
        } catch (error) {
            console.log("OAuth Error: ", error);
        }
    }, []);

    return (
        <View>
            <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
                <View className="flex-1 h-[1px] bg-general-100" />
                <Text className="text-lg ">Or</Text>
                <View className="flex-1 h-[1px] bg-general-100" />
            </View>
            <CustomButton
                title="Log In with Google"
                className="mt-5 w-full shadow-none"
                IconLeft={() => (
                    <Image
                        source={icons.google}
                        resizeMode="contain"
                        className="w-5 h-5 mx-2"
                    />
                )}
                bgVariant="outline"
                textVariant="primary"
                onPress={handleGoogleSignIn}
            />
        </View>
    );
}
