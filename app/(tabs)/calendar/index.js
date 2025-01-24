import { Pressable, StyleSheet, Text, View, FlatList } from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();
  const today = moment().format("YYYY-MM-DD");

  const [selectedDate, setSelectedDate] = useState(today);
  const [todos, setTodos] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          router.replace("/authenticate/login");
        } else {
          setUserId(storedUserId);
          await fetchCompletedTodos(storedUserId, selectedDate);
        }
      } catch (error) {
        console.log("Error initializing calendar:", error);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCompletedTodos(userId, selectedDate);
    }
  }, [selectedDate, userId]);

  const fetchCompletedTodos = async (uid, date) => {
    try {
      const response = await axios.get(
        `http://10.0.2.2:3001/users/${uid}/todos/completed/${date}`
      );
      const completedTodos = response.data.completedTodos || [];
      setTodos(completedTodos);
    } catch (error) {
      console.log("Error fetching completed todos:", error);
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f1ebed" }}>
      {/* Calendar Component with margin */}
      <Calendar
        style={styles.calendarStyle} // <-- Apply calendarStyle
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate]: {
            selected: true,
            selectedColor: "#db2859",
          },
        }}
        theme={{
          backgroundColor: "white",
          calendarBackground: "white",
          selectedDayBackgroundColor: "#db2859",
          selectedDayTextColor: "white",
          todayTextColor: "#db2859",
          arrowColor: "#db2859",
          monthTextColor: "black",
          textSectionTitleColor: "#b6c1cd",
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
      <View
        style={{
          height: 1,
          backgroundColor: "#e0e0e0",
          marginHorizontal: 10,
        }}
      />

      {/* Scrollable List of Completed Todos */}
      <FlatList
        data={todos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Pressable style={styles.todoItem}>
            <View style={styles.todoRow}>
              <FontAwesome name="circle" size={18} color="gray" />
              <Text style={styles.todoText}>{item?.title}</Text>
              <Feather name="flag" size={15} color="gray" />
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

export default Index;

const styles = StyleSheet.create({
  calendarStyle: {
    marginHorizontal: 28,
    borderRadius: 10,
    marginTop: 35,
    backgroundColor: "white",
    marginBottom: 20,
    height: 325
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginVertical: 6,
    marginHorizontal: 25,
  },
  todoItem: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginVertical: 7,
    marginHorizontal: 25,
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
    paddingBottom: 20,
  },
  emptyList: {
    marginTop: 20,
  },
});
