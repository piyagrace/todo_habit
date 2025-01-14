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

const index = () => {
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
      pathname: "/home/info",
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
    <>
      {/* Category Filters and Add Button */}
      <View style={styles.categoryContainer}>
        {["All", "Work", "Personal"].map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.activeCategoryButton,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                category === cat && styles.activeCategoryText,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setModalVisible(true)}>
          <AntDesign name="pluscircle" size={30} color="#007FFF" />
        </Pressable>
      </View>

      {/* Todos List */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.todosContainer}>
          {todos.length > 0 ? (
            <View>
              {/* Pending Todos */}
              {pendingTodos.length > 0 && (
                <Text style={styles.sectionTitle}>Tasks to Do! {today}</Text>
              )}

              {pendingTodos.map((item) => (
                <Pressable
                  key={item._id}
                  style={styles.todoBox}
                  onPress={() => navigateToTodoDetails(item)}
                >
                  <View style={styles.todoRow}>
                    <Entypo
                      name="circle"
                      size={18}
                      color="black"
                      onPress={() => markTodoAsCompleted(item._id)}
                    />
                    <Text style={styles.todoTitle}>{item.title}</Text>
                    <Feather name="flag" size={20} color="black" />
                  </View>
                </Pressable>
              ))}

              {/* Completed Todos */}
              {completedTodos.length > 0 && (
                <View>
                  <View style={styles.completedHeader}>
                    <Image
                      style={styles.completedImage}
                      source={{
                        uri: "https://cdn-icons-png.flaticon.com/128/6784/6784655.png",
                      }}
                    />
                  </View>

                  <View style={styles.completedHeader}>
                    <Text style={styles.sectionTitle}>Completed Tasks</Text>
                    <MaterialIcons
                      name="arrow-drop-down"
                      size={24}
                      color="black"
                    />
                  </View>

                  {completedTodos.map((item) => (
                    <Pressable key={item._id} style={styles.completedTodoBox}>
                      <View style={styles.todoRow}>
                        <FontAwesome name="circle" size={18} color="gray" />
                        <Text style={styles.completedTodoTitle}>
                          {item.title}
                        </Text>
                        <Feather name="flag" size={20} color="gray" />
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noTodosContainer}>
              <Image
                style={styles.noTodosImage}
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/128/2387/2387679.png",
                }}
              />
              <Text style={styles.noTodosText}>
                No Tasks for today! Add a task
              </Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                style={styles.addTodoButton}
              >
                <AntDesign name="pluscircle" size={30} color="#007FFF" />
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Todo Modal */}
      <BottomModal
        onBackdropPress={() => setModalVisible(false)}
        onHardwareBackPress={() => setModalVisible(false)}
        swipeDirection={["up", "down"]}
        swipeThreshold={200}
        modalTitle={<ModalTitle title="Add a Todo" />}
        modalAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        visible={isModalVisible}
        onTouchOutside={() => setModalVisible(false)}
      >
        <ModalContent style={styles.modalContent}>
          {/* Todo Input */}
          <View style={styles.modalInputContainer}>
            <TextInput
              value={todo}
              onChangeText={(text) => setTodo(text)}
              placeholder="Input a new task here"
              style={styles.modalTextInput}
            />
            <Ionicons
              onPress={addTodo}
              name="send"
              size={24}
              color="#007FFF"
            />
          </View>

          {/* Category Selection */}
          <Text style={styles.modalSectionTitle}>Choose Category</Text>
          <View style={styles.categorySelection}>
            {["Work", "Personal", "WishList"].map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.categoryOption,
                  category === cat && styles.activeCategoryOption,
                ]}
              >
                <Text
                  style={[
                    styles.categoryOptionText,
                    category === cat && styles.activeCategoryOptionText,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Suggestions */}
          <Text style={styles.modalSectionTitle}>Some Suggestions</Text>
          <View style={styles.suggestionsContainer}>
            {suggestions.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setTodo(item.todo)}
                style={styles.suggestionButton}
              >
                <Text style={styles.suggestionText}>{item.todo}</Text>
              </Pressable>
            ))}
          </View>
        </ModalContent>
      </BottomModal>
    </>
  );
};

export default index;

const styles = StyleSheet.create({
  categoryContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryButton: {
    backgroundColor: "#7CB9E8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCategoryButton: {
    backgroundColor: "#007FFF",
  },
  categoryText: {
    color: "white",
    textAlign: "center",
  },
  activeCategoryText: {
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "white",
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
    backgroundColor: "#E0E0E0",
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
    backgroundColor: "#E0E0E0",
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
  completedTodoBox: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 7,
    marginVertical: 10,
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
