import { Text, View, ScrollView, Image, Alert } from "react-native";
import { useState } from "react";
import { Link, useRouter } from "expo-router";

import { useSignUp } from "@clerk/clerk-expo";

import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import OAuth from "@/components/OAuth";

import { icons, images } from "@/constants";
import ReactNativeModal from "react-native-modal";
import { fetchAPI } from "@/lib/fetch";

export default function SignUp() {
    const router = useRouter();

    const { isLoaded, signUp, setActive } = useSignUp();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [verification, setVerification] = useState({
        state: "default",
        error: "",
        code: "",
    });

    const [isVerificationModalVisible, setIsVerificationModalVisible] =
        useState(false);

    const onSignUpPress = async () => {
        if (!isLoaded) {
            return;
        }

        try {
            await signUp.create({
                emailAddress: form.email,
                password: form.password,
            });

            await signUp.prepareEmailAddressVerification({
                strategy: "email_code",
            });

            setVerification({ ...verification, state: "pending" });
            setIsVerificationModalVisible(true);
        } catch (err: any) {
            Alert.alert("Error", err.errors[0].longMessage);
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) {
            return;
        }

        if (!verification.code) {
            setVerification({
                ...verification,
                state: "failure",
                error: "Verification code is required",
            });
            return;
        }

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification(
                {
                    code: verification.code,
                }
            );

            if (completeSignUp.status === "complete") {
                await fetchAPI("/(api)/user", {
                    method: "POST",
                    body: JSON.stringify({
                        name: form.name,
                        email: form.email,
                        clerkId: completeSignUp.createdUserId,
                    }),
                });

                await setActive({ session: completeSignUp.createdSessionId });
                setVerification({ ...verification, state: "success" });
                setIsVerificationModalVisible(false);
            } else {
                setVerification({
                    ...verification,
                    state: "failure",
                    error: "Verification failed",
                });
                console.error(JSON.stringify(completeSignUp, null, 2));
            }
        } catch (err: any) {
            setVerification({
                ...verification,
                state: "failure",
                error: err.errors[0].longMessage,
            });
            console.error(JSON.stringify(err, null, 2));
        }
    };

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image
                        source={images.signUpCar}
                        className="z-0 w-full h-[250px]"
                    />
                    <Text className="absolute bottom-5 left-5 text-3xl font-JakartaSemiBold text-black">
                        Create your Account
                    </Text>
                </View>

                <View className="p-5">
                    <InputField
                        label={"Name"}
                        placeholder="Enter name"
                        icon={icons.person}
                        value={form.name}
                        onChangeText={(name) => setForm({ ...form, name })}
                    />

                    <InputField
                        label={"Email"}
                        placeholder="Enter email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(email) => setForm({ ...form, email })}
                    />

                    <InputField
                        label={"Password"}
                        placeholder="Enter password"
                        icon={icons.lock}
                        value={form.password}
                        secureTextEntry={true}
                        onChangeText={(password) =>
                            setForm({ ...form, password })
                        }
                    />

                    <CustomButton
                        title="Sign Up"
                        onPress={onSignUpPress}
                        className="mt-6"
                    />

                    <OAuth />

                    <Link
                        href="/sign-in"
                        className="text-lg text-center text-general-200 mt-10"
                    >
                        <Text>Already have an account?</Text>{" "}
                        <Text className="text-primary-500">Log In</Text>
                    </Link>
                </View>

                <ReactNativeModal
                    isVisible={isVerificationModalVisible}
                    onModalHide={() => {
                        if (verification.state === "success") {
                            setVerification({
                                ...verification,
                                state: "success",
                            });
                        }
                    }}
                >
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Text className="text-center text-3xl font-JakartaBold">
                            Verify your Email
                        </Text>

                        <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                            We have sent a verification code to your email.
                        </Text>

                        <InputField
                            label={"Verification Code"}
                            placeholder="12345"
                            icon={icons.lock}
                            onChangeText={(code) =>
                                setVerification({ ...verification, code })
                            }
                            keyboardType="numeric"
                        />

                        {verification.error && (
                            <Text className="text-red-500 text-sm mt-2">
                                {verification.error}
                            </Text>
                        )}

                        <CustomButton
                            title="Verify Email"
                            onPress={onPressVerify}
                            className="mt-5 bg-success-500"
                        />
                    </View>
                </ReactNativeModal>

                <ReactNativeModal isVisible={verification.state === "success"}>
                    <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
                        <Image
                            source={images.check}
                            className="w-[110px] h-[110px] mx-auto my-5"
                        />
                        <Text className="text-center text-3xl font-JakartaBold">
                            Verified
                        </Text>
                        <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
                            You have successfully verified your account.
                        </Text>
                        <CustomButton
                            title="Browse Home"
                            onPress={() =>
                                router.replace("/(root)/(tabs)/home")
                            }
                            className="mt-5"
                        />
                    </View>
                </ReactNativeModal>
            </View>
        </ScrollView>
    );
}
