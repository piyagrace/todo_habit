import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import {
  Ionicons,
  AntDesign,
  Feather,
  FontAwesome,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import {
  BottomModal,
  ModalTitle,
  SlideAnimation,
  ModalContent,
} from "react-native-modals";
import { useIsFocused } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import WeekCalendar from "../weekcalendar";

const Habbitscreen = () => {
  const [option, setOption] = useState("Today");
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFocused = useIsFocused();
  const currentDay = new Date()
    .toLocaleDateString("en-US", { weekday: "short" })
    .slice(0, 3);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        console.log("Retrieved userId:", storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
          fetchHabits(storedUserId);
        } else {
          console.log("User ID not found. Redirecting to login.");
          router.replace("/(authenticate)/login");
        }
      } catch (error) {
        console.log("Error initializing Habbitscreen:", error);
        Alert.alert("Error", "Failed to initialize user data.");
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (isFocused && userId) {
      console.log("Screen is focused. Fetching habits.");
      fetchHabits(userId);
    }
  }, [isFocused, userId]);

  const fetchHabits = async (userIdParam) => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://192.168.1.50:3001/habitslist", {
        params: { userId: userIdParam },
      });
      console.log("Fetched Habits:", response.data);
      setHabits(response.data);
    } catch (error) {
      console.log("Error fetching habits:", error);
      Alert.alert("Error", "Failed to fetch habits.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = (habitId) => {
    console.log("Pressed Habit ID:", habitId);
    const selected = habits.find((habit) => habit._id === habitId);
    if (selected) {
      console.log("Selected Habit:", selected);
      setSelectedHabit(selected);
      // Directly show the modal
      setModalVisible(true);
      console.log("Modal visibility set to true");
    } else {
      console.log("Habit not found for ID:", habitId);
      Alert.alert("Error", "Selected habit not found.");
    }
  };

  const handleCompletion = async () => {
    try {
      if (!selectedHabit) {
        Alert.alert("Error", "No habit selected.");
        return;
      }
      const habitId = selectedHabit._id;
      console.log("Attempting to mark completed for habit ID:", habitId);

      const updatedCompletion = {
        ...selectedHabit.completed,
        [currentDay]: true,
      };

      const response = await axios.put(
        `http://192.168.1.50:3001/habits/${habitId}/completed`,
        { completed: updatedCompletion }
      );

      if (response.status === 200) {
        console.log("Habit marked as completed:", response.data);
        await fetchHabits(userId);
        setModalVisible(false);
        Alert.alert("Success", "Habit marked as completed!");
      }
    } catch (error) {
      console.log("Error updating habit:", error);
      if (error.response) {
        Alert.alert(
          "Error",
          error.response.data.error || "Failed to update habit."
        );
      } else if (error.request) {
        Alert.alert("Error", "No response from server.");
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    }
  };

  const handleUpdate = () => {
    if (selectedHabit && selectedHabit._id) {
      // Hide the modal first
      setModalVisible(false);
      router.push({
        pathname: "/home/habbit/update",
        query: { habitId: selectedHabit._id },
      });
    } else {
      Alert.alert("Error", "No habit selected.");
    }
  };

  const deleteHabit = () => {
    if (!selectedHabit) {
      Alert.alert("Error", "No habit selected for deletion.");
      return;
    }
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete "${selectedHabit.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const habitId = selectedHabit._id;
              console.log("Attempting to delete habit with ID:", habitId);
              setIsDeleting(true);
              const response = await axios.delete(
                `http://192.168.1.50:3001/habits/${habitId}`
              );
              if (response.status === 200) {
                console.log("Habit deleted successfully:", response.data);
                await fetchHabits(userId);
                setModalVisible(false);
                Alert.alert("Success", "Habit deleted successfully!");
              }
            } catch (error) {
              console.log("Error deleting habit:", error);
              if (error.response) {
                if (error.response.status === 404) {
                  Alert.alert(
                    "Deletion Failed",
                    error.response.data.error || "Habit not found."
                  );
                } else if (error.response.status === 400) {
                  Alert.alert(
                    "Deletion Failed",
                    error.response.data.error || "Invalid habit ID."
                  );
                } else {
                  Alert.alert(
                    "Deletion Failed",
                    error.response.data.error || "Failed to delete habit."
                  );
                }
              } else if (error.request) {
                Alert.alert(
                  "Deletion Failed",
                  "No response from server. Please try again later."
                );
              } else {
                Alert.alert("Deletion Failed", "An unexpected error occurred.");
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getCompletedDays = (completedObj) => {
    if (completedObj && typeof completedObj === "object") {
      return Object.keys(completedObj).filter((day) => completedObj[day]);
    }
    return [];
  };

  const filteredHabits = habits.filter((habit) => {
    if (option === "Today") {
      return !habit.completed || !habit.completed[currentDay];
    }
    return true;
  });

  useEffect(() => {
    console.log("Modal Visibility Changed:", isModalVisible);
  }, [isModalVisible]);

  const renderHeader = () => (
    <View>
      <View>
        <WeekCalendar />
      </View>
      <View style={styles.optionContainer}>
        {["Today", "Weekly", "Overall"].map((opt) => (
          <Pressable
            key={opt}
            onPress={() => setOption(opt)}
            style={[
              styles.optionButton,
              option === opt && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                option === opt && styles.selectedOptionText,
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        ))}
        <AntDesign
          onPress={() => router.push("/home/habbit/create")}
          name="plus"
          size={24}
          color="black"
          style={styles.addIcon}
        />
      </View>
      <Text style={styles.sectionTitle}>Progress</Text>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );

  const renderEmptyToday = () => (
    <View style={styles.emptyContainer}>
      <Image
        style={styles.emptyImage}
        source={{
          uri: "https://cdn-icons-png.flaticon.com/128/10609/10609386.png",
        }}
      />
      <Text style={styles.emptyText}>No habits for today</Text>
      <Text style={styles.emptyText}>Create one?</Text>
      <Pressable
        onPress={() => router.push("/home/habbit/create")}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </Pressable>
    </View>
  );

  const renderTodayItem = ({ item }) => (
    <Pressable
      onPress={() => handlePress(item._id)}
      style={({ pressed }) => [
        styles.habitCard,
        { backgroundColor: item.color },
        pressed && styles.pressedHabitCard,
      ]}
    >
      <Text style={styles.habitTitle}>{item.title}</Text>
    </Pressable>
  );

  const renderWeeklyItem = ({ item }) => (
    <Pressable
      onPress={() => handlePress(item._id)}
      style={({ pressed }) => [
        styles.habitCard,
        { backgroundColor: item.color },
        pressed && styles.pressedHabitCard,
      ]}
    >
      <View style={styles.habitHeader}>
        <Text style={styles.habitTitle}>{item.title}</Text>
        <Text style={styles.habitRepeatMode}>{item.repeatMode}</Text>
      </View>
      <View style={styles.daysContainer}>
        {days.map((day) => {
          const isCompleted = item.completed && item.completed[day];
          return (
            <View key={day} style={styles.dayItem}>
              <Text
                style={{
                  color: day === currentDay ? "red" : "white",
                  fontWeight: "600",
                }}
              >
                {day}
              </Text>
              {isCompleted ? (
                <FontAwesome
                  name="check-circle"
                  size={20}
                  color="white"
                  style={styles.dayIcon}
                />
              ) : (
                <Feather
                  name="circle"
                  size={20}
                  color="white"
                  style={styles.dayIcon}
                />
              )}
            </View>
          );
        })}
      </View>
    </Pressable>
  );

  const renderOverallItem = ({ item }) => (
    <View>
      <Pressable
        onPress={() => handlePress(item._id)}
        style={({ pressed }) => [
          styles.habitCard,
          { backgroundColor: item.color },
          pressed && styles.pressedHabitCard,
        ]}
      >
        <View style={styles.habitHeader}>
          <Text style={styles.habitTitle}>{item.title}</Text>
          <Text style={styles.habitRepeatMode}>{item.repeatMode}</Text>
        </View>
      </Pressable>
      <View style={styles.completedContainer}>
        <Text style={styles.completedLabel}>Completed On:</Text>
        <Text style={styles.completedDays}>
          {getCompletedDays(item.completed).join(", ") || "None"}
        </Text>
      </View>
    </View>
  );

  const getRenderItem = () => {
    switch (option) {
      case "Today":
        return renderTodayItem;
      case "Weekly":
        return renderWeeklyItem;
      case "Overall":
        return renderOverallItem;
      default:
        return renderTodayItem;
    }
  };

  const getData = () => {
    if (option === "Today") {
      return filteredHabits;
    }
    return habits;
  };

  const getEmptyComponent = () => {
    if (option === "Today") {
      return renderEmptyToday();
    }
    return null;
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={getData()}
        keyExtractor={(item) => item._id}
        renderItem={getRenderItem()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={getEmptyComponent()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Conditionally render the BottomModal */}
      {isModalVisible && (
        <BottomModal
          // If you see the modal auto-dismiss, consider removing or adjusting:
          onBackdropPress={() => setModalVisible(false)}
          swipeDirection={["up", "down"]}
          swipeThreshold={200}
          modalTitle={
            <ModalTitle
              title={selectedHabit ? selectedHabit.title : "Habbit Title"}
              style={styles.modalTitleStyle}
            />
          }
          modalAnimation={
            new SlideAnimation({
              slideFrom: "bottom",
            })
          }
          visible={isModalVisible}
          onTouchOutside={() => setModalVisible(false)}
          // You could add modalStyle={{ zIndex: 9999 }} if needed
        >
          <ModalContent style={styles.modalContent}>
            {/* Completed Option */}
            <Pressable
              onPress={handleCompletion}
              style={[
                styles.modalOption,
                isDeleting && styles.disabledOption,
              ]}
              disabled={isDeleting}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={isDeleting ? "gray" : "black"}
              />
              <Text style={styles.modalOptionText}>Completed</Text>
            </Pressable>

            {/* Skip Option */}
            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 10,
              }}
            >
              <Feather name="skip-forward" size={24} color="black" />
              <Text>Skip</Text>
            </Pressable>

            {/* Edit Option */}
            <Pressable
              onPress={handleUpdate}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 12,
              }}
            >
              <Feather name="edit-2" size={24} color="black" />
              <Text>Edit</Text>
            </Pressable>

            {/* Delete Option */}
            <Pressable
              onPress={deleteHabit}
              style={[
                styles.modalOption,
                isDeleting && styles.disabledOption,
              ]}
              disabled={isDeleting}
            >
              <AntDesign
                name="delete"
                size={24}
                color={isDeleting ? "gray" : "black"}
              />
              <Text style={styles.modalOptionText}>Delete</Text>
            </Pressable>
          </ModalContent>
        </BottomModal>
      )}
    </View>
  );
};

export default Habbitscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 10,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backIcon: {
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    flexShrink: 1,
  },
  optionContainer: {
    marginHorizontal: 10,
    marginVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionButton: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: '#ff5a5f',
  },
  optionText: {
    color: "black",
    fontSize: 13
  },
  selectedOptionText: {
    color: "white"
  },
  addIcon: {
    marginLeft: "auto",
  },
  habitCard: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 24,
    justifyContent: "center",
  },
  pressedHabitCard: {
    opacity: 0.7,
  },
  habitHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
    textAlign:'left'
  },
  modalTitleStyle: {
  alignItems: "center",
  width: '100%',
  },
  habitRepeatMode: {
    fontSize: 14,
    color: "white",
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  dayItem: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  dayIcon: {
    marginTop: 5,
  },
  emptyContainer: {
    marginTop: 150,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "auto",
  },
  emptyImage: {
    width: 60,
    height: 60,
    resizeMode: "cover",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 10,
  },
  createButton: {
    backgroundColor: "#0071c5",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
  },
  completedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 5,
  },
  completedLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  completedDays: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
  },
  modalContent: {
    width: "100%",
    height: 180,
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 15,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#000",
  },
  disabledOption: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  }
});
