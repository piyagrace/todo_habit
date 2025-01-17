import { Stack } from "expo-router";
import {
    ModalPortal
  } from "react-native-modals";
  

export default function Layout(){
    return(
        <>
        <Stack>
            <Stack.Screen name="habbitscreen" options={{headerShown:false}}/>
            <Stack.Screen name="create" options={{headerShown:false}}/>
            <Stack.Screen name="update" options={{headerShown:false}}/>
            <Stack.Screen name="view" options={{headerShown:false}}/>
        </Stack>
        <ModalPortal/>
        </>
    )
}