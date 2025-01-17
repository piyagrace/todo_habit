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
import {
  AntDesign,
  Feather,
  Entypo,
  MaterialIcons,
  FontAwesome,
  Ionicons,
} from "@expo/vector-icons";
import { BottomModal, ModalTitle, ModalContent } from "react-native-modals";
import { SlideAnimation } from "react-native-modals";
import axios from "axios";
import moment from "moment";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';
import WeekCalendar from "../weekcalendar";

const Todo = () => {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const today = moment().format("MMM Do");
  const [isModalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("All");
  const [todo, setTodo] = useState("");
  const [pendingTodos, setPendingTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [marked, setMarked] = useState(false);
  const [userId, setUserId] = useState(null);

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
        `http://192.168.100.5:3001/users/${uid}/todos`
      );
      setTodos(response.data.todos || []);

      const fetchedTodos = response.data.todos || [];
      const pending = fetchedTodos.filter((td) => td.status !== "completed");
      const completed = fetchedTodos.filter((td) => td.status === "completed");

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
      await axios.post(`http://192.168.100.5:3001/todos/${userId}`, todoData);
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
      await axios.patch(`http://192.168.100.5:3001/todos/${todoId}/complete`);
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
    <>
      {/* Week Calendar on Top */}
      <View>
        <WeekCalendar />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Filters + Add Todo */}
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
          <AntDesign
            onPress={() => setModalVisible(true)}
            name="plus"
            size={24}
            color="black"
            style={styles.addIcon}
          />
        </View>

        {/* Todos List */}
        <View style={styles.todosContainer}>
          {todos.length > 0 ? (
            <View>
              {/* Pending Todos */}
              {pendingTodos.length > 0 && (
                <Text style={styles.sectionTitle}>Ongoing Tasks!</Text>
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
                      color="#db2859"
                      onPress={() => markTodoAsCompleted(item._id)}
                    />
                    <Text style={styles.todoTitle}>{item.title}</Text>
                    <Feather name="flag" size={15} color="black" />
                  </View>
                </Pressable>
              ))}

              {/* Completed Todos */}
              {completedTodos.length > 0 && (
                <View>
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
                        <FontAwesome
                          name="circle"
                          size={18}
                          color="rgba(219, 40, 89, 0.6)"
                        />
                        <Text style={styles.completedTodoTitle}>
                          {item.title}
                        </Text>
                        <Feather name="flag" size={15} color="gray" />
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
                source={require("../../../../assets/todo.png")}
              />
              <Text style={styles.noTodosText}>
                No Tasks for today! Add a task
              </Text>
              <Pressable
                onPress={() => setModalVisible(true)}
                style={styles.addTodoButton}
              >
                <AntDesign name="pluscircle" size={30} color="#db2859" />
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
        modalAnimation={new SlideAnimation({ slideFrom: "bottom" })}
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
            <Ionicons onPress={addTodo} name="send" size={24} color="#007FFF" />
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

export default Todo;

const styles = StyleSheet.create({
  categoryContainer: {
    marginHorizontal: 25,
    backgroundColor: "#f1ebed",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 3,
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
    backgroundColor: "#db2859",
  },
  categoryText: {
    color: "black",
    textAlign: "center",
    fontSize: 14,
  },
  activeCategoryText: {
    fontWeight: "bold",
    color: "white",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f1ebed",
  },
  todosContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 9,
    marginBottom: 8,
    marginLeft: 16,
  },
  todoBox: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginVertical: 7,
    marginHorizontal: 15,
  },
  todoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  todoTitle: {
    flex: 1,
    fontSize: 15,
  },
  completedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 5,
  },
  completedTodoBox: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginVertical: 7,
    marginHorizontal: 15,
  },
  completedTodoTitle: {
    flex: 1,
    textDecorationLine: "line-through",
    color: "gray",
    fontSize: 15,
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
    width: 130,
    height: 130,
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
  addIcon: {
    marginLeft: "auto",
    marginRight: 10,
  },
});
