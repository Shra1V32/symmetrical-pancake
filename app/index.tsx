import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function Home() {
    const { isSignedIn } = useAuth();

    if (isSignedIn) {
        return <Redirect href={"/(root)/(tabs)/home"} />;
    }

    return <Redirect href={"/(auth)/welcome"} />;
}
