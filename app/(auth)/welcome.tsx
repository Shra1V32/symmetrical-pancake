import { Text, TouchableOpacity, View, Image } from "react-native";
import { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Swiper from "react-native-swiper";

import { onboarding } from "@/constants/index";

import CustomButton from "@/components/CustomButton";

export default function Welcome() {
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const isLastSlide = activeIndex === onboarding.length - 1;

    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white">
            <TouchableOpacity
                className="flex justify-end w-full items-end p-5"
                onPress={() => {
                    router.replace("/(auth)/sign-up");
                }}
            >
                <Text className="text-black text-lg font-JakartaBold">
                    Skip
                </Text>
            </TouchableOpacity>

            <Swiper
                ref={swiperRef}
                loop={false}
                dot={
                    <View className="w-[36px] h-[5px] mx-1 bg-[#E2E8F0] rounded-full" />
                }
                activeDot={
                    <View className="w-[36px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
                }
                onIndexChanged={(index) => setActiveIndex(index)}
            >
                {onboarding.map((item) => (
                    <View
                        key={item.id}
                        className="flex items-center justify-center mt-4"
                    >
                        <Image
                            source={item.image}
                            className="w-full h-[420px]"
                            resizeMode="contain"
                        />
                        <View className="flex flex-row items-center justify-center w-full mt-5">
                            {item.id === 1 ? (
                                <Text className="text-black text-3xl font-JakartaBold mx-10 text-center">
                                    {item.title}{" "}
                                    <Text className="text-[#0286ff]">Ryde</Text>
                                </Text>
                            ) : (
                                <Text className="text-black text-3xl font-JakartaBold mx-10 text-center">
                                    {item.title}
                                </Text>
                            )}
                        </View>
                        <Text className="text-xl font-JakartaMedium text-center text-[#858585] mx-10 mt-3">
                            {item.description}
                        </Text>
                    </View>
                ))}
            </Swiper>

            <CustomButton
                title={isLastSlide ? "Get Started" : "Next"}
                onPress={() =>
                    isLastSlide
                        ? router.replace("/(auth)/sign-up")
                        : swiperRef.current?.scrollBy(1)
                }
                className="w-11/12 mt-10 mb-16"
            />
        </SafeAreaView>
    );
}
