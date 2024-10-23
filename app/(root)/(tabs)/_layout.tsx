import { View, Image, ImageSourcePropType } from "react-native";
import { Tabs } from "expo-router";

import { icons } from "@/constants";

const TabIcon = ({
    source,
    focused,
}: {
    source: ImageSourcePropType;
    focused: boolean;
}) => (
    <View
        className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-general-300" : ""}`}
    >
        <View
            className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-general-400" : ""}`}
        >
            <Image
                source={source}
                tintColor="white"
                resizeMode="contain"
                className="w-7 h-7"
            />
        </View>
    </View>
);

export default function Layout() {
    return (
        <Tabs
            initialRouteName="index"
            screenOptions={{
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "white",
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: "#333333",
                    borderRadius: 45,
                    paddingBottom: 0,
                    overflow: "hidden",
                    marginHorizontal: 20,
                    marginBottom: 20,
                    height: 70,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    position: "absolute",
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.home} />
                    ),
                }}
            />

            <Tabs.Screen
                name="packages"
                options={{
                    title: "Packages",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.list} />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon focused={focused} source={icons.profile} />
                    ),
                }}
            />
        </Tabs>
    );
}
