import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Modal,
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
import axios from "axios";
import moment from "moment";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import WeekCalendar from "../weekcalendar";

const Todo = () => {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [pendingTodos, setPendingTodos] = useState([]);
  const [completedTodos, setCompletedTodos] = useState([]);
  const [category, setCategory] = useState("All"); // Default to "All"
  const [userId, setUserId] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [marked, setMarked] = useState(false);

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
  }, []);

  // Fetch todos whenever the screen focuses
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        getUserTodos(userId);
      }
    }, [userId])
  );

  const getUserTodos = async (uid) => {
    try {
      const response = await axios.get(
        `http://localhost:3001/users/${uid}/todos`
      );
      const fetchedTodos = response.data.todos || [];
      setTodos(fetchedTodos);

      const pending = fetchedTodos.filter((td) => td.status !== "completed");
      const completed = fetchedTodos.filter((td) => td.status === "completed");

      setPendingTodos(pending);
      setCompletedTodos(completed);
    } catch (error) {
      console.log("Error fetching user todos:", error);
      Alert.alert("Error", "Failed to fetch your todos.");
    }
  };

  const filterTodosByCategory = (category) => {
    if (category === "All") {
      // If "All" is selected, show all pending todos
      return pendingTodos;
    } else {
      // Filter pending todos by the selected category
      return pendingTodos.filter((todo) => todo.category === category);
    }
  };

  const addTodo = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      router.replace("/authenticate/login");
      return;
    }

    const todoData = { title: "New Todo", category: category }; // Sample data for demo
    await axios.post(`http://localhost:3001/todos/${userId}`, todoData);
    await getUserTodos(userId);
    setModalVisible(false);
    Alert.alert("Success", "Todo added successfully!");
  };

  const handlePress = (todoId) => {
    const selected = todos.find((t) => t._id === todoId);
    if (selected) {
      setSelectedTodo(selected);
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setSelectedTodo(null);
    setModalVisible(false); // Close the modal
  };

  const handleUpdate = () => {
    if (!selectedTodo || !selectedTodo._id) {
      Alert.alert("Error", "No todo selected.");
      return;
    }
    closeModal();
    setTimeout(() => {
      router.push({
        pathname: "/home/todo/update",
        params: { todoId: selectedTodo._id },
      });
    }, 200);
  };

  const handleView = () => {
    if (!selectedTodo || !selectedTodo._id) {
      Alert.alert("Error", "No todo selected.");
      return;
    }
    closeModal();
    setTimeout(() => {
      router.push({
        pathname: "/home/todo/view",
        params: { todoId: selectedTodo._id },
      });
    }, 200);
  };

  const deleteTodo = () => {
    if (!selectedTodo) {
      Alert.alert("Error", "No todo selected for deletion.");
      return;
    }
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete "${selectedTodo.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const todoId = selectedTodo._id;
              const response = await axios.delete(
                `http://localhost:3001/todos/${todoId}`,
                { data: { userId } }
              );
              if (response.status === 200) {
                Alert.alert("Success", "Todo deleted successfully!");
                // After deletion, fetch the updated todos
                await getUserTodos(userId);
                closeModal();
                // Optionally navigate to the same screen to ensure it's refreshed
                // router.push(router.asPath); // Unnecessary unless you want to force a full page reload
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete todo.");
            }
          },
        },
      ]
    );
  };  

  const markTodoAsCompleted = async (todoId) => {
    try {
      setMarked(true); // Set marked state to true (optional, for any loading state or effect)
      
      // Make the API call to mark the todo as completed
      const response = await axios.patch(
        `http://localhost:3001/todos/${todoId}/complete`
      );
      
      console.log(response.data);
      
      // Fetch the updated todos after marking the task as completed
      if (response.status === 200) {
        // Re-fetch the todos from the server
        await getUserTodos(userId);
        Alert.alert("Success", "Todo marked as completed!");
      }
    } catch (error) {
      console.log("error", error);
      Alert.alert("Error", "Failed to mark todo as completed.");
    }
  };
  

  return (
    <>
      {/* Week Calendar on Top */}
      <View>
        <WeekCalendar />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Filters */}
        <View style={styles.categoryContainer}>
          {["All", "Work", "Personal", "WishList"].map((cat) => (
            <Pressable
              key={cat}
              style={[styles.categoryButton, category === cat && styles.activeCategoryButton]}
              onPress={() => setCategory(cat)} // Change category when clicked
            >
              <Text style={[styles.categoryText, category === cat && styles.activeCategoryText]}>
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

        {/* Ongoing Todos List */}
        <View style={styles.todosContainer}>
          {filterTodosByCategory(category).length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>Ongoing Tasks</Text>
              {filterTodosByCategory(category).map((item) => (
                <Pressable
                  key={item._id}
                  style={styles.todoBox}
                  onPress={() => handlePress(item._id)}
                >
                  <View style={styles.todoRow}>
                    <Entypo
                      onPress={() => markTodoAsCompleted(item._id)} // Use item._id to mark the specific todo as completed
                      name="circle"
                      size={18}
                      color={item.status === 'completed' ? "rgba(219, 40, 89, 0.6)" : "#db2859"} // Adjust the color if completed
                    />
                    <Text style={styles.todoTitle}>{item.title}</Text>
                    <Feather name="flag" size={15} color="black" />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.noTodosContainer}>
              <Text style={styles.noTodosText}>No tasks for the selected category!</Text>
            </View>
          )}
        </View>

        {/* Completed Todos List */}
        {completedTodos.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Completed Tasks</Text>
            {completedTodos.map((item) => (
              <Pressable
                  key={item._id}
                  style={styles.completedTodoBox}
                  onPress={() => handlePress(item._id)}
                >
                <View style={styles.todoRow}>
                  <FontAwesome name="circle" size={18} color="rgba(219, 40, 89, 0.6)" />
                  <Text style={styles.completedTodoTitle}>{item.title}</Text>
                  <Feather name="flag" size={15} color="gray" />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal when a todo is selected */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selectedTodo?.title}</Text>
            <View style={styles.divider} />
            <View style={styles.modalOptionsContainer}>
              <Pressable onPress={handleView} style={styles.modalOption}>
                <Ionicons name="eye-outline" size={24} color="#db2859" />
                <Text style={styles.modalOptionText}>View</Text>
              </Pressable>
              <Pressable onPress={handleUpdate} style={styles.modalOption}>
                <Ionicons name="create-outline" size={24} color="#db2859" />
                <Text style={styles.modalOptionText}>Edit</Text>
              </Pressable>
              <Pressable onPress={deleteTodo} style={styles.modalOption}>
                <Ionicons name="trash-outline" size={24} color="#db2859" />
                <Text style={styles.modalOptionText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
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
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  noTodosText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  addTodoButton: {
    marginTop: 15,
  },
  addIcon: {
    marginLeft: "auto",
    marginRight: 10,
  },

  // MODAL
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(213, 220, 230, 0.46)",
    marginVertical: 5,
  },
  // Container to stack options vertically
  modalOptionsContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  modalOptionText: {
    fontSize: 14,
    color: "#000",
  },
});
