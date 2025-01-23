import {
    StyleSheet,
    Text,
    Image,
    View,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { Ionicons } from "@expo/vector-icons";
  import axios from "axios";
  import { useRouter, useSearchParams } from "expo-router";
  import { Alert } from "react-native";
  
  const ViewTodo = () => {
    const router = useRouter();
    const { todoId } = useSearchParams(); // Get the todoId passed from the home screen
  
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState(""); // Start blank or default to "Work"
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderDate, setReminderDate] = useState(new Date());
  
    useEffect(() => {
      const fetchTodoData = async () => {
        try {
          // Fetch the Todo data based on the todoId
          const response = await axios.get(`http://192.168.1.50:3001/todos/${todoId}`);
          const todo = response.data;
  
          // Set the fetched data into state
          setTitle(todo.title);
          setNotes(todo.notes || "");
          setCategory(todo.category || "");
          setReminderEnabled(todo.dueDate ? true : false);
          if (todo.dueDate) {
            setReminderDate(new Date(todo.dueDate));
          }
        } catch (error) {
          console.log("Error fetching Todo", error);
          Alert.alert("Error", "There was an issue fetching the Todo data.");
        }
      };
  
      fetchTodoData();
    }, [todoId]);
  
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Ionicons
              name="arrow-back"
              onPress={() => router.push("/home")}
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.header}>View Task</Text>
          </View>
  
          {/* Display Title */}
          <View style={styles.emptyContainer}>
            <Image
              style={styles.emptyImage}
              source={require("../../../../assets/emoji.png")}
            />
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
  
          {/* Display Category */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionContent}>
              <Ionicons name="repeat-outline" size={20} color="#db2859" />
              {"  "}Category: {category || "N/A"}
            </Text>
          </View>
  
          {/* Display Notes */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionContent}>
              <Ionicons name="list-outline" size={20} color="#db2859" />
              {"  "}Notes: {notes || "No notes added"}
            </Text>
          </View>
  
          {/* Display Due Date */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionContent}>
              <Ionicons name="calendar-outline" size={20} color="#db2859" />
              {"  "}Due Date: {reminderEnabled ? reminderDate.toLocaleDateString() : "No due date set"}
            </Text>
          </View>
  
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };
  
  export default ViewTodo;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f1ebed",
    },
    scrollContainer: {
      padding: 10,
      paddingBottom: 30,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 10,
    },
    backIcon: {
      marginLeft: 10,
      marginRight: 15,
    },
    header: {
      fontSize: 20,
      fontWeight: "bold",
      flexShrink: 1,
      color: "black",
    },
    displayText: {
      fontSize: 16,
      color: "#000",
      marginTop: 10,
    },
    emptyContainer: {
      marginTop: 10,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
    },
    emptyImage: {
      width: 80,
      height: 80,
      resizeMode: "cover",
    },
    emptyContainer: {
        marginTop: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
      },
      emptyImage: {
        width: 80,
        height: 80,
        resizeMode: "cover",
        marginBottom: 20,
      },
      sectionHeader: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 20,
      },
      sectionContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        marginBottom: 18,
        marginHorizontal: 18,
      },
      sectionContent: {
        fontSize: 15,
        color: "#000",
        marginHorizontal: 8,
        flexDirection: "row",
        alignItems: "center",
      },
  });
  