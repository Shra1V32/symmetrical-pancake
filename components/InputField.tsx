import {
    View,
    Text,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Image,
    TextInput,
    Platform,
    Keyboard,
} from "react-native";

import { icons } from "@/constants";
import { InputFieldProps } from "@/types/type";

export default function InputField({
    label,
    labelStyle,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    icon,
    iconStyle,
    containerStyle,
    inputStyle,
    className,
    ...props
}: InputFieldProps) {
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="my-2 w-full">
                    <Text
                        className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}
                    >
                        {label}
                    </Text>
                    <View
                        className={`flex flex-row justify-start items-center bg-neutral-100 relative rounded-full border border-neutral-100 focus:border-primary-500 ${containerStyle}`}
                    >
                        {icon && (
                            <Image
                                source={icon}
                                className={`w-6 h-6 ml-4 ${iconStyle}`}
                            />
                        )}
                        <TextInput
                            placeholder={placeholder}
                            placeholderTextColor="#C0C0C0"
                            value={value}
                            onChangeText={onChangeText}
                            secureTextEntry={secureTextEntry}
                            className={`rounded-full flex-1 p-4 text-[15px] font-JakartaSemiBold ${inputStyle} text-left`}
                            {...props}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
