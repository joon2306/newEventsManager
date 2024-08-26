import { Stack } from "expo-router"

const RootLayout = () => {
    return (
        <Stack>
            <Stack.Screen name="index" options={{
                headerTitle: "Calendar"
            }}/>
            <Stack.Screen name = "create/add" options={{headerTitle: "Event"}} />
        </Stack>
    )
}

export default RootLayout;