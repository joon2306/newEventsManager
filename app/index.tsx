import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
    return (
        <View>
            <Text>This is the Home Page</Text>
            <Pressable onPress={() => router.push("/create/add")}><Text>Go to Create</Text></Pressable>
        </View>
    )
}