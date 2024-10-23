import * as SecureStore from "expo-secure-store";
import * as Linking from "expo-linking";
import { fetchAPI } from "./fetch";

export interface TokenCache {
    getToken: (key: string) => Promise<string | undefined | null>;
    saveToken: (key: string, token: string) => Promise<void>;
    clearToken?: (key: string) => void;
}

export const tokenCache = {
    async getToken(key: string) {
        try {
            const item = await SecureStore.getItemAsync(key);
            if (item) {
                console.log(`${key} was used 🔐 \n`);
            } else {
                console.log("No values stored under key: " + key);
            }
            return item;
        } catch (error) {
            console.error("SecureStore get item error: ", error);
            await SecureStore.deleteItemAsync(key);
            return null;
        }
    },
    async saveToken(key: string, value: string) {
        try {
            return SecureStore.setItemAsync(key, value);
        } catch (err) {
            return;
        }
    },
};

export const googleOAuth = async (startOAuthFlow: any) => {
    try {
        const { createdSessionId, signIn, signUp, setActive } =
            await startOAuthFlow({
                redirectUrl: Linking.createURL("/(root)/(tabs)/home", {
                    scheme: "uber",
                }),
            });

        if (createdSessionId) {
            if (setActive) {
                await setActive!({ session: createdSessionId });

                if (signUp.createdUserId) {
                    // We create a new user in our database
                    await fetchAPI("/(api)/user", {
                        method: "POST",
                        body: JSON.stringify({
                            name: `${signUp.firstName} ${signUp.lastName}`,
                            email: signUp.emailAddress,
                            clerkId: signUp.createdUserId,
                        }),
                    });
                }

                return {
                    success: true,
                    code: "success",
                    message: "OAuth flow completed successfully",
                };
            }
        }

        return {
            success: false,
            code: "error",
            message: "OAuth flow failed",
        };
    } catch (error: any) {
        console.log("OAuth Error: ", error);
        return {
            success: false,
            code: error.code,
            message: error?.errors[0]?.longMessage,
        };
    }
};
