// app/(tabs)/profiles/home.js
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { Alert } from "react-native";
  import { AntDesign, Feather, Entypo, MaterialIcons, FontAwesome } from "@expo/vector-icons";
  import { BottomModal, ModalTitle, ModalContent } from "react-native-modals";
  import { SlideAnimation } from "react-native-modals";
  import axios from "axios";
  import moment from "moment";
  import { useRouter } from "expo-router";
  import { Ionicons } from "@expo/vector-icons";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import WeekCalendar from "../home/weekcalendar";
  
  const AddScreen = () => {
    const router = useRouter();
    const [todos, setTodos] = useState([]);
    const today = moment().format("MMM Do");
    const [isModalVisible, setModalVisible] = useState(false);
    const [category, setCategory] = useState("All");
    const [todo, setTodo] = useState("");
    const [pendingTodos, setPendingTodos] = useState([]);
    const [completedTodos, setCompletedTodos] = useState([]);
    const [marked, setMarked] = useState(false);
    const [userId, setUserId] = useState(null); // State to store userId
  
    const suggestions = [
      { id: "0", todo: "Drink Water, keep healthy" },
      { id: "1", todo: "Go Exercising" },
      { id: "2", todo: "Go to bed early" },
      { id: "3", todo: "Take pill reminder" },
      { id: "4", todo: "Go Shopping" },
      { id: "5", todo: "Finish assignments" },
    ];
  
    useEffect(() => {
      const initialize = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          if (storedUserId) {
            setUserId(storedUserId);
            await getUserTodos(storedUserId);
          } else {
            // If userId is not found, redirect to login
            router.replace("/authenticate/login");
          }
        } catch (error) {
          console.log("Error initializing Home:", error);
        }
      };
  
      initialize();
    }, [marked, isModalVisible]);
  
    const getUserTodos = async (uid) => {
      try {
        const response = await axios.get(
          `http://192.168.1.50:3001/users/${uid}/todos`
        );
  
        console.log("Fetched Todos:", response.data.todos);
        setTodos(response.data.todos);
  
        const fetchedTodos = response.data.todos || [];
        const pending = fetchedTodos.filter(
          (todo) => todo.status !== "completed"
        );
  
        const completed = fetchedTodos.filter(
          (todo) => todo.status === "completed"
        );
  
        setPendingTodos(pending);
        setCompletedTodos(completed);
      } catch (error) {
        console.log("Error fetching user todos:", error);
        Alert.alert("Error", "Failed to fetch your todos.");
      }
    };
  
    const addTodo = async () => {
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        router.replace("/authenticate/login");
        return;
      }
  
      if (!todo.trim()) {
        Alert.alert("Validation Error", "Please enter a todo title.");
        return;
      }
  
      try {
        const todoData = {
          title: todo.trim(),
          category: category,
        };
  
        const response = await axios.post(
          `http://192.168.1.50:3001/todos/${userId}`,
          todoData
        );
  
        console.log("Add Todo Response:", response.data);
        await getUserTodos(userId);
        setModalVisible(false);
        setTodo("");
        Alert.alert("Success", "Todo added successfully!");
      } catch (error) {
        console.log("Error adding todo:", error);
        Alert.alert("Error", "Failed to add todo.");
      }
    };
  
    const markTodoAsCompleted = async (todoId) => {
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        router.replace("/authenticate/login");
        return;
      }
  
      try {
        setMarked(true);
        const response = await axios.patch(
          `http://192.168.1.50:3001/todos/${todoId}/complete`
        );
        console.log("Mark Completed Response:", response.data);
        await getUserTodos(userId);
      } catch (error) {
        console.log("Error marking todo as completed:", error);
        Alert.alert("Error", "Failed to mark todo as completed.");
      }
    };
  
    const navigateToTodoDetails = (item) => {
      router.push({
        pathname: "/home/todo/info",
        params: {
          id: item._id,
          title: item.title,
          category: item.category,
          createdAt: item.createdAt,
          dueDate: item.dueDate,
        },
      });
    };
  
    return (
        <View>
            <p>Hello!</p>
        </View>
    );
  };
  
  export default AddScreen;
  
  const styles = StyleSheet.create({
    categoryContainer: {
      marginHorizontal: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    categoryButton: {
      backgroundColor: "white",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    activeCategoryButton: {
      backgroundColor: '#ff5a5f',
    },
    categoryText: {
      color: "black",
      textAlign: "center",
      fontSize: 13
    },
    activeCategoryText: {
      fontWeight: "bold",
      color: "white"
    },
    scrollView: {
      flex: 1,
      backgroundColor: "#f2f2f2",
    },
    togglebutton: {
      backgroundColor: "#f2f2f2",
    },
    todosContainer: {
      padding: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginTop: 10,
    },
    todoBox: {
      backgroundColor: "white",
      padding: 10,
      borderRadius: 7,
      marginVertical: 10,
    },
    todoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    todoTitle: {
      flex: 1,
      fontSize: 16,
    },
    completedHeader: {
      justifyContent: "center",
      alignItems: "center",
      margin: 10,
    },
    completedImage: {
      width: 100,
      height: 100,
    },
    completedTodoBox: {
      backgroundColor: "white",
      padding: 10,
      borderRadius: 7,
      marginVertical: 10,
    },
    completedTodoTitle: {
      flex: 1,
      textDecorationLine: "line-through",
      color: "gray",
      fontSize: 16,
    },
    chartStyle: {
      borderRadius: 16,
    },
    upcomingTasks: {
      backgroundColor: "#89CFF0",
      padding: 10,
      borderRadius: 6,
      marginTop: 15,
    },
    upcomingTasksText: {
      textAlign: "center",
      color: "white",
      fontSize: 16,
    },
    decorativeImageContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
    },
    decorativeImage: {
      width: 120,
      height: 120,
    },
    noTodosContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 130,
      marginLeft: "auto",
      marginRight: "auto",
    },
    noTodosImage: {
      width: 200,
      height: 200,
      resizeMode: "contain",
    },
    noTodosText: {
      fontSize: 16,
      marginTop: 15,
      fontWeight: "600",
      textAlign: "center",
    },
    addTodoButton: {
      marginTop: 15,
    },
    modalContent: {
      width: "100%",
      height: 280,
      padding: 10,
    },
    modalInputContainer: {
      marginVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    modalTextInput: {
      flex: 1,
      padding: 10,
      borderColor: "#E0E0E0",
      borderWidth: 1,
      borderRadius: 5,
    },
    modalSectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginTop: 10,
    },
    categorySelection: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginVertical: 10,
    },
    categoryOption: {
      borderColor: "#E0E0E0",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderRadius: 25,
    },
    activeCategoryOption: {
      backgroundColor: "#007FFF",
      borderColor: "#007FFF",
    },
    categoryOptionText: {
      color: "black",
    },
    activeCategoryOptionText: {
      color: "white",
      fontWeight: "bold",
    },
    suggestionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
      marginVertical: 10,
    },
    suggestionButton: {
      backgroundColor: "#F0F8FF",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 25,
    },
    suggestionText: {
      textAlign: "center",
    },
  });
  