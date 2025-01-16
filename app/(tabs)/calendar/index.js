import { Pressable, StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const index = () => { // Capitalized component name for convention
  const router = useRouter();
  const today = moment().format("YYYY-MM-DD");

  // Local state
  const [selectedDate, setSelectedDate] = useState(today);
  const [todos, setTodos] = useState([]);
  const [userId, setUserId] = useState(null); // Store userId here

  /**
   * Initialize the screen:
   *  - Retrieve the userId from AsyncStorage
   *  - If userId is not found, redirect to login
   *  - Else, fetch completed todos for today's date
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          // If no userId is found, redirect to login
          router.replace("/authenticate/login");
        } else {
          setUserId(storedUserId);
          // Fetch completed todos for the current date
          await fetchCompletedTodos(storedUserId, selectedDate);
        }
      } catch (error) {
        console.log("Error initializing calendar:", error);
      }
    };

    initialize();
  }, []);

  /**
   * Whenever the selected date changes (or userId becomes available),
   * fetch the completed todos for that date.
   */
  useEffect(() => {
    if (userId) {
      fetchCompletedTodos(userId, selectedDate);
    }
  }, [selectedDate, userId]);

  /**
   * Fetch the completed todos for a given user and date.
   * Replace the endpoint below with your actual user-specific API.
   */
  const fetchCompletedTodos = async (uid, date) => {
    try {
      // Example endpoint: /users/:userId/todos/completed/:date
      const response = await axios.get(
        `http://192.168.100.5:3001/users/${uid}/todos/completed/${date}`
      );
      const completedTodos = response.data.completedTodos || [];
      setTodos(completedTodos);
    } catch (error) {
      console.log("Error fetching completed todos:", error);
    }
  };

  // Handler for selecting a new date on the calendar
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f1ebed" }}>
      {/* Calendar Component */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: "#db2859",
          },
        }}
        theme={{
          calendarBackground: '#f1ebed',
          selectedDayBackgroundColor: "#db2859",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#db2859",
          arrowColor: "#db2859",
          monthTextColor: 'black', 
          textSectionTitleColor: '#b6c1cd'
          // Additional theme customizations if needed
        }}
      />

      {/* Spacer */}
      <View style={{ height: 10 }} />

      {/* Completed Tasks Header */}
      <View style={styles.headerRow}>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Completed Tasks</Text>
        <MaterialIcons name="arrow-drop-down" size={22} color="black" />
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: "#e0e0e0", marginHorizontal: 10 }} />

      {/* Scrollable List of Completed Todos */}
      <FlatList
        data={todos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.todoItem}>
            <View style={styles.todoRow}>
              <FontAwesome name="circle" size={18} color="gray" />
              <Text style={styles.todoText}>{item?.title}</Text>
              <Feather name="flag" size={20} color="gray" />
            </View>
          </Pressable>
        )}
        contentContainerStyle={styles.todoList}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={{ color: "gray", textAlign: "center" }}>
              No completed tasks for this date.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default index; // Ensure the component name matches the file name

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginVertical: 6,
    marginHorizontal: 10,
  },
  todoItem: {
    backgroundColor: "white", // Updated color
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginVertical: 7, // Reduced margin for better spacing in the list
    marginHorizontal: 10,
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  todoText: {
    flex: 1,
    textDecorationLine: "line-through",
    color: "gray",
  },
  todoList: {
    paddingBottom: 20, // Ensures the last item is fully visible
  },
  emptyList: {
    marginTop: 20,
  },
});
