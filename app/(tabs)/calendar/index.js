import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const index = () => {
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
        `http://192.168.1.50:3001/users/${uid}/todos/completed/${date}`
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {/* Calendar Component */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: "#7CB9E8",
          },
        }}
      />

      <View style={{ marginTop: 20 }} />

      {/* Completed Tasks Header */}
      <View style={styles.headerRow}>
        <Text>Completed Tasks</Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
      </View>

      {/* List of Completed Todos */}
      {todos?.map((item, index) => (
        <Pressable style={styles.todoItem} key={index}>
          <View style={styles.todoRow}>
            <FontAwesome name="circle" size={18} color="gray" />
            <Text style={styles.todoText}>{item?.title}</Text>
            <Feather name="flag" size={20} color="gray" />
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginVertical: 10,
    marginHorizontal: 10,
  },
  todoItem: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 7,
    marginVertical: 10,
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
});
