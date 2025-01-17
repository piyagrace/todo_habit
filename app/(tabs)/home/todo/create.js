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
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [amPm, setAmPm] = useState("AM");
    const [isHourModalVisible, setIsHourModalVisible] = useState(false);
    const [isMinuteModalVisible, setIsMinuteModalVisible] = useState(false);
    const [isAmPmModalVisible, setIsAmPmModalVisible] = useState(false);
  
    // Hours, minutes, AM/PM
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i < 10 ? `0${i}` : `${i}`
    );
    const amPmOptions = ["AM", "PM"];
  
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
  
    const addHabit = async () => {
      try {
        // Basic Validation
        if (!title.trim()) {
          Alert.alert("Validation Error", "Please enter a title for the habit.");
          return;
        }
        if (!selectedColor) {
          Alert.alert("Validation Error", "Please select a color for the habit.");
          return;
        }
        // If repeat is ON but user selected "weekly" and no days
        if (repeatEnabled && repeatMode === "weekly" && selectedDays.length === 0) {
          Alert.alert("Validation Error", "Please select at least one day for weekly repeat.");
          return;
        }
  
        // If reminder is ON but time isn't valid
        if (reminderEnabled && (!hour || !minute || !amPm)) {
          Alert.alert("Validation Error", "Please select a valid reminder time.");
          return;
        }
  
        // Build the reminder time string if enabled
        const reminderTime = reminderEnabled ? `${hour}:${minute} ${amPm}` : null;
  
        // Get user ID from AsyncStorage
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Authentication Error", "User ID not found. Please log in again.");
          router.replace("/(authenticate)/login");
          return;
        }
  
        // If repeat is OFF => 'none'
        const finalRepeatMode = repeatEnabled ? repeatMode : "none";
  
        // Build request
        const habitDetails = {
          title: title.trim(),
          color: selectedColor,
          repeatMode: finalRepeatMode,
          days: finalRepeatMode === "weekly" ? selectedDays : [],
          reminder: reminderEnabled
            ? {
                enabled: true,
                time: reminderTime,
              }
            : { enabled: false, time: null },
          userId,
        };
  
        const response = await axios.post(
          "http://192.168.100.5:3001/habits",
          habitDetails
        );
  
        if (response.status === 201) {
          // Reset
          setTitle("");
          setSelectedColor("");
          setRepeatEnabled(false);
          setRepeatMode("none");
          setSelectedDays([]);
          setReminderEnabled(false);
          setHour("12");
          setMinute("00");
          setAmPm("AM");
          Alert.alert("Success", "Habit added successfully!");
          router.push("/home");
        }
      } catch (error) {
        console.log("Error adding habit", error);
        if (error.response && error.response.data && error.response.data.error) {
          Alert.alert("Error", error.response.data.error);
        } else if (error.request) {
          Alert.alert(
            "Network Error",
            "Unable to reach the server. Please try again later."
          );
        } else {
          Alert.alert("Error", "There was a problem adding your habit.");
        }
      }
    };
  
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
              {/* (Optional) placeholder item */}
              <Picker.Item 
                label="Select a category..." 
                value="" 
                // color="#999"  // You can set a lighter color for placeholder if you like
              />
                <Picker.Item label="WishList" value="WishList" color="black" />
              <Picker.Item label="Personal" value="Personal" />
              <Picker.Item label="WishList" value="WishList" />
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
  
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Reminder</Text>
            <Switch
              value={reminderEnabled}
              onValueChange={(value) => setReminderEnabled(value)}
              trackColor={{ false: "#767577", true: "#db2859" }}
              thumbColor={reminderEnabled ? "#fff" : "#f4f3f4"}
            />
            {reminderEnabled && (
              <View style={styles.timePickerContainer}>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setIsHourModalVisible(true)}
                  accessibilityLabel="Select Hour"
                  accessible={true}
                >
                  <Text style={styles.timeSelectorText}>{hour}</Text>
                </TouchableOpacity>
  
                <Text style={styles.colon}>:</Text>
  
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setIsMinuteModalVisible(true)}
                  accessibilityLabel="Select Minute"
                  accessible={true}
                >
                  <Text style={styles.timeSelectorText}>{minute}</Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  style={styles.timeSelectorAmPm}
                  onPress={() => setIsAmPmModalVisible(true)}
                  accessibilityLabel="Select AM or PM"
                  accessible={true}
                >
                  <Text style={styles.timeSelectorText}>{amPm}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
  
          <Pressable onPress={addHabit} style={[styles.saveButton, styles.saveButtonRow]}>
            <Ionicons name="add-outline" size={20} color="#fff" style={styles.addIcon} />
            <Text style={styles.saveButtonText}>Add task</Text>
          </Pressable>
  
          {/* Modals for hour, minute, and AM/PM selectors would go here */}
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
    // Picker styles
    pickerStyle: {
      color: "#000", // Ensure the text is visible
    },
    pickerItemStyle: {
      color: "#000", // Ensure item text is visible (mainly for iOS)
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
      width: "25%",
      alignItems: "center",
    },
    timeSelectorAmPm: {
      padding: 10,
      backgroundColor: "#E0E0E0",
      borderRadius: 10,
      width: "15%",
      alignItems: "center",
    },
    timeSelectorText: {
      fontSize: 16,
      color: "#000",
    },
    colon: {
      fontSize: 20,
      fontWeight: "bold",
      marginHorizontal: 5,
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
  