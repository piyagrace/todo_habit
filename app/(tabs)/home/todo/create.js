import {
  StyleSheet,
  Text,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  Switch,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from '@react-native-community/datetimepicker';

const create = () => {
  const router = useRouter();

  const [selectedColor, setSelectedColor] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState(""); // Start blank or default to "Work"

  // REPEAT states
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("none");
  const [selectedDays, setSelectedDays] = useState([]);

  // REMINDER states
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date()); // Use Date object to store reminder date
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false); // State to toggle date picker visibility

  const colors = [
    "rgba(245, 112, 112, 255)", // Red
    "rgba(245, 224, 105, 255)", // Gold
    "rgba(93, 118, 169, 255)",
    "rgba(96, 159, 242, 255)",
    "rgba(106, 236, 106, 255)",
    "#ccccff",
    "rgba(237, 171, 113, 255)",
  ];

  const days = ["Su", "M", "T", "W", "Th", "F", "Sa"];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addTodo = async () => {
    try {
      // Basic Validation
      if (!title.trim()) {
        Alert.alert("Validation Error", "Please enter a title for the Todo.");
        return;
      }

      // Get user ID from AsyncStorage
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Authentication Error", "User ID not found. Please log in again.");
        router.replace("/(authenticate)/login");
        return;
      }

      // Build request
      const todoData = {
        title: title.trim(),
        category,
        notes,
        dueDate: reminderEnabled ? reminderDate.toISOString() : null,
        userId,
      };

      const response = await axios.post(`http://192.168.1.50:3001/todos/${userId}`, todoData);

      if (response.status === 200) {
        // Reset
        setTitle("");
        setCategory("");
        setNotes("");
        setReminderEnabled(false);
        setReminderDate(new Date()); // Reset reminder date
        Alert.alert("Success", "Todo added successfully!");
        router.push("/home");
      }
    } catch (error) {
      console.log("Error adding todo", error);
      if (error.response && error.response.data && error.response.data.error) {
        Alert.alert("Error", error.response.data.error);
      } else if (error.request) {
        Alert.alert(
          "Network Error",
          "Unable to reach the server. Please try again later."
        );
      } else {
        Alert.alert("Error", "There was a problem adding your Todo");
      }
    }
  };

  // Handle date change for date picker
  const handleDateChange = (event, selectedDate) => {
    // Check if selectedDate is null, which could happen when the user cancels the date picker
    const currentDate = selectedDate || reminderDate;
    setReminderDate(currentDate);

    // If on iOS, keep the picker open after date is selected
    setIsDatePickerVisible(Platform.OS === 'ios' ? true : false);
  };

  // Date Picker Modal
  {
    isDatePickerVisible && (
      <DateTimePicker
        value={reminderDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    )
  }

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
          <Text style={styles.header}>New Task</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Image
            style={styles.emptyImage}
            source={require('../../../../assets/emoji.png')}
          />
        </View>

        <TextInput
          value={title}
          onChangeText={(text) => setTitle(text)}
          style={styles.titleInput}
          placeholder="Enter Task"
          placeholderTextColor="#666"
          multiline={true}
        />

        {/* CATEGORY PICKER */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Category:</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
          >
            <Picker.Item label="Select a category..." value="" />
            <Picker.Item label="Work" value="Work" />
            <Picker.Item label="Personal" value="Personal" />
            <Picker.Item label="Wish list" value="WishList" />
          </Picker>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Notes:</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={styles.notesInput}
            placeholder="Add your notes here"
            multiline={true}
          />
        </View>

        {/* Reminder Toggle and Date Picker */}
        <View style={styles.sectionContainer}>
          <View style={styles.dueDateContainer}>
            <Text style={styles.sectionHeader}>Due Date: </Text>
            <Switch
              value={reminderEnabled}
              onValueChange={(value) => setReminderEnabled(value)}
              trackColor={{ false: "#767577", true: "#db2859" }}
              thumbColor={reminderEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>
          {reminderEnabled && (
            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setIsDatePickerVisible(true)}
              >
                <Text style={styles.timeSelectorText}>
                  {reminderDate ? reminderDate.toLocaleDateString() : "Select Date"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Pressable onPress={addTodo} style={[styles.saveButton, styles.saveButtonRow]}>
          <Ionicons name="add-outline" size={20} color="#fff" style={styles.addIcon} />
          <Text style={styles.saveButtonText}>Add task</Text>
        </Pressable>

        {/* Date Picker Modal */}
        {isDatePickerVisible && (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default create;

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
  titleInput: {
    borderBottomWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.4)",
    textAlign: "center",
    minHeight: 40,
    fontSize: 16,
    color: "#000",
    marginBottom: 25,
    marginTop: 15,
    alignSelf: "center",
    width: "60%",
  },
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    marginHorizontal: 18,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 6,
    marginBottom: 6,
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.2)",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    color: "#000",
  },
  dueDateContainer: {
    flexDirection: "row", // Aligns text and switch in a row
    justifyContent: "space-between", // Align items with space between them
    alignItems: "center", // Vertically aligns the text and switch
  },
  pickerStyle: {
    color: "#000",
  },
  pickerItemStyle: {
    color: "#000",
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 10,
  },
  timeSelector: {
    padding: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  timeSelectorText: {
    fontSize: 16,
    color: "#000",
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "#db2859",
    paddingVertical: 15,
    borderRadius: 24,
    alignItems: "center",
    marginHorizontal: 18,
  },
  saveButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  addIcon: {
    marginRight: 8,
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
});
