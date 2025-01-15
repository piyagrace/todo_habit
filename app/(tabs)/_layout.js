import { Tabs } from "expo-router";
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          tabBarLabelStyle: { color: "black" },
          headerShown: false,
          tabBarIcon: ({focused}) => 
            focused ? (
              <FontAwesome name="tasks" size={24} color="#ff5a5f" />
            ) : (
              <FontAwesome name="tasks" size={24} color="black" />
            )
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          tabBarLabel: "Add",
          tabBarLabelStyle: { color: "black" },
          headerShown: false,
          tabBarIcon: ({focused}) => 
            focused ? (
              <MaterialCommunityIcons name="plus-circle" size={24} color="#ff5a5f" />
            ) : (
              <MaterialCommunityIcons name="plus-circle" size={24} color="black" />
            )
        }}
      />      
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: "Calendar",
          tabBarLabelStyle: { color: "black" },
          headerShown: false,
          tabBarIcon: ({focused}) => 
            focused ? (
              <AntDesign name="calendar" size={24} color="#ff5a5f" />
            ) : (
              <AntDesign name="calendar" size={24} color="black" />
            )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarLabelStyle: { color: "black" },
          headerShown: false,
          tabBarIcon: ({focused}) => 
            focused ? (
              <MaterialCommunityIcons name="account-details" size={24} color="#ff5a5f" />
            ) : (
              <MaterialCommunityIcons name="account-details" size={24} color="black" />
            )
        }}
      />
    </Tabs>
  );
}
