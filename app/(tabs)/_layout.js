import React, { useState } from 'react';
import { Modal, Pressable, View, Text, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';  // <-- import useRouter here
import { Feather, Ionicons } from '@expo/vector-icons';

export default function Layout() {
  // State for controlling the visibility of the "Add" modal
  const [modalVisible, setModalVisible] = useState(false);

  // Access the Expo Router
  const router = useRouter();

  return (
    <>
      {/* The Tabs Navigator */}
      <Tabs
        screenOptions={{
          tabBarStyle: {
            height: 67,  // Increase the height of the tab bar
            paddingTop: 11,
            paddingBottom: 11,
            backgroundColor: '#ffffff'
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
              <Feather
                name="home"
                size={25}
                color={focused ? "#db2859" : "#a0a0a0"}
              />
            ),
          })}
        />

        {/* --- The "Add" Tab with a custom Button that toggles modal --- */}
        <Tabs.Screen
          name="add"
          options={({ navigation }) => ({
            tabBarLabel: "Add",
            tabBarLabelStyle: {
              color: navigation.isFocused() ? "#db2859" : "#a0a0a0"
            },
            headerShown: false,
            // We override the default tabBarButton to handle onPress ourselves:
            tabBarButton: (props) => (
              <Pressable
                {...props}
                style={styles.tabButton}
                onPress={() => setModalVisible(true)} // Show the modal
              >
                <Feather
                  name="plus-circle"
                  size={25}
                  color={navigation.isFocused() ? "#db2859" : "#a0a0a0"}
                />
                <Text
                  style={{
                    color: navigation.isFocused() ? "#db2859" : "#a0a0a0",
                    fontSize: 12
                  }}
                >
                  Add
                </Text>
              </Pressable>
            ),
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
              <Feather
                name="calendar"
                size={25}
                color={focused ? "#db2859" : "#a0a0a0"}
              />
            ),
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
              <Feather
                name="user"
                size={25}
                color={focused ? "#db2859" : "#a0a0a0"}
              />
            ),
          })}
        />
      </Tabs>

      {/* --- The Modal that appears when "Add" is pressed --- */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Press anywhere in the backdrop to close the modal */}
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)}>
          {/* Stop propagation so taps inside the box don't close the modal */}
          <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>

            {/* First row: basketball outline + "Add a Habit" + chevron forward */}
            <Pressable
              style={styles.row}
              onPress={() => {
                setModalVisible(false);
                router.push('/home/habbit/create');
              }}
            >
              <Ionicons name="basketball-outline" size={24} color="#000" />
              <Text style={styles.textItem}>Add a Habit</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="#db2859"
                style={styles.chevronIcon}
              />
            </Pressable>

            {/* Divider Line */}
            <View style={styles.divider} />

            {/* Second row: checkmark circle + "Add a Task" + chevron forward */}
            <Pressable
              style={styles.row}
              onPress={() => {
                setModalVisible(false);
                router.push('/home/todo/create');
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#000" />
              <Text style={styles.textItem}>Add a Task</Text>
              <Ionicons
                name="chevron-forward-outline"
                size={24}
                color="#db2859"
                style={styles.chevronIcon}
              />
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // dark semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  // The inner modal container
  modalContainer: {
    width: '80%',
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  // Row style to position icon, text, and the chevron
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: 6,
    marginVertical: 10,
  },
  textItem: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
  // Pushing the chevron icon to the right edge
  chevronIcon: {
    marginLeft: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(213, 220, 230, 0.46)',
    marginVertical: 5,
  },
});
