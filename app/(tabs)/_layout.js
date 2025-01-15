import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function Layout() {
  return (
    <Tabs
    screenOptions={{
      tabBarStyle: {
        height: 67,  // Increase the height of the tab bar
        paddingTop: 11, // Optionally add padding to center icons and labels vertically
        paddingBottom: 11, // Adjust according to your design needs
        backgroundColor: '#ffffff' // Set background color if needed
      }
    }}
    >
      <Tabs.Screen
        name="home"
        options={({ navigation }) => ({
          tabBarLabel: "Home",
          tabBarLabelStyle: {
            color: navigation.isFocused() ? "#db2859" : "#a0a0a0"
          },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather name="home" size={25} color={focused ? "#db2859" : "#a0a0a0"} />
          )
        })}
      />
      <Tabs.Screen
        name="add"
        options={({ navigation }) => ({
          tabBarLabel: "Add",
          tabBarLabelStyle: {
            color: navigation.isFocused() ? "#db2859" : "#a0a0a0"
          },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather name="plus-circle" size={25} color={focused ? "#db2859" : "#a0a0a0"} />
          )
        })}
      />
      <Tabs.Screen
        name="calendar"
        options={({ navigation }) => ({
          tabBarLabel: "Calendar",
          tabBarLabelStyle: {
            color: navigation.isFocused() ? "#db2859" : "#a0a0a0"
          },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather name="calendar" size={25} color={focused ? "#db2859" : "#a0a0a0"} />
          )
        })}
      />
      <Tabs.Screen
        name="profile"
        options={({ navigation }) => ({
          tabBarLabel: "Profile",
          tabBarLabelStyle: {
            color: navigation.isFocused() ? "#db2859" : "#a0a0a0"
          },
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <Feather name="user" size={25} color={focused ? "#db2859" : "#a0a0a0"} />
          )
        })}
      />
    </Tabs>
  );
}
