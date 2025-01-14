import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
  Switch,
  Modal,
  FlatList,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";

const create = () => {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState("");
  const [title, setTitle] = useState("");
  const [repeatMode, setRepeatMode] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [amPm, setAmPm] = useState("AM");
  const [isHourModalVisible, setIsHourModalVisible] = useState(false);
  const [isMinuteModalVisible, setIsMinuteModalVisible] = useState(false);
  const [isAmPmModalVisible, setIsAmPmModalVisible] = useState(false);

  // Define the hours, minutes, and AM/PM options
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i < 10 ? `0${i}` : `${i}`
  );
  const amPmOptions = ["AM", "PM"];

  const colors = [
    "#FF5733", // Red
    "#FFD700", // Gold
    "#5D76A9",
    "#1877F2", // Medium Purple
    "#32CD32", // Lime Green
    "#CCCCFF", // Tomato
    "#4169E1", // Royal Blue
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

      if (repeatMode === "weekly" && selectedDays.length === 0) {
        Alert.alert(
          "Validation Error",
          "Please select at least one day for the habit."
        );
        return;
      }

      const reminderTime = reminderEnabled
        ? `${hour}:${minute} ${amPm}`
        : null;

      const habitDetails = {
        title: title.trim(),
        color: selectedColor,
        repeatMode: repeatMode,
        days: repeatMode === "weekly" ? selectedDays : [],
        reminder: reminderEnabled
          ? {
              time: reminderTime,
            }
          : null,
      };

      const response = await axios.post(
        "http://192.168.1.50:3001/habits",
        habitDetails
      );

      if (response.status === 200 || response.status === 201) {
        // Reset all states
        setTitle("");
        setSelectedColor("");
        setRepeatMode("daily");
        setSelectedDays([]);
        setReminderEnabled(false);
        setHour("12");
        setMinute("00");
        setAmPm("AM");
        Alert.alert("Success", "Habit added successfully!");
        router.push("/home");
      }

      console.log("Habit added", response.data);
    } catch (error) {
      console.log("Error adding habit", error);
      Alert.alert("Error", "There was a problem adding your habit.");
    }
  };

  // Render Item for FlatList in Modals
  const renderItem = (item, type) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        if (type === "hour") {
          setHour(item);
          setIsHourModalVisible(false);
        } else if (type === "minute") {
          setMinute(item);
          setIsMinuteModalVisible(false);
        } else if (type === "amPm") {
          setAmPm(item);
          setIsAmPmModalVisible(false);
        }
      }}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  // Optional: Scroll to selected item when modal opens
  const hourListRef = useRef(null);
  const minuteListRef = useRef(null);
  const amPmListRef = useRef(null);

  useEffect(() => {
    if (isHourModalVisible && hourListRef.current) {
      const hourIndex = hours.indexOf(hour);
      if (hourIndex >= 0) {
        hourListRef.current.scrollToIndex({ index: hourIndex, animated: false });
      }
    }
  }, [isHourModalVisible]);

  useEffect(() => {
    if (isMinuteModalVisible && minuteListRef.current) {
      const minuteIndex = minutes.indexOf(minute);
      if (minuteIndex >= 0) {
        minuteListRef.current.scrollToIndex({ index: minuteIndex, animated: false });
      }
    }
  }, [isMinuteModalVisible]);

  useEffect(() => {
    if (isAmPmModalVisible && amPmListRef.current) {
      const amPmIndex = amPmOptions.indexOf(amPm);
      if (amPmIndex >= 0) {
        amPmListRef.current.scrollToIndex({ index: amPmIndex, animated: false });
      }
    }
  }, [isAmPmModalVisible]);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Ionicons
        name="arrow-back"
        onPress={() => router.push("/home")}
        size={24}
        color="black"
      />

      {/* Header */}
      <Text style={styles.header}>
        New Habit</Text>

      {/* Title Input */}
      <TextInput
        value={title}
        onChangeText={(text) => setTitle(text)}
        style={styles.input}
        placeholder="Title"
      />

      {/* Color Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorsContainer}>
          {colors.map((item, index) => (
            <TouchableOpacity
              onPress={() => setSelectedColor(item)}
              key={index}
              activeOpacity={0.8}
            >
              {selectedColor === item ? (
                <AntDesign name="plussquare" size={30} color={item} />
              ) : (
                <FontAwesome name="square" size={30} color={item} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Repeat Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Repeat</Text>
        <View style={styles.repeatContainer}>
          <Pressable
            onPress={() => setRepeatMode("daily")}
            style={[
              styles.repeatOption,
              repeatMode === "daily" && styles.selectedOption,
            ]}
          >
            <Text style={styles.repeatText}>Daily</Text>
          </Pressable>
          <Pressable
            onPress={() => setRepeatMode("weekly")}
            style={[
              styles.repeatOption,
              repeatMode === "weekly" && styles.selectedOption,
            ]}
          >
            <Text style={styles.repeatText}>Weekly</Text>
          </Pressable>
        </View>
      </View>

      {/* Days Selection (for Weekly Repeat) */}
      {repeatMode === "weekly" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>On these days</Text>
          <View style={styles.daysContainer}>
            {days.map((day, index) => (
              <Pressable
                key={index}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayBox,
                  selectedDays.includes(day) && styles.selectedDay,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDays.includes(day) && styles.selectedDayText,
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Reminder Toggle */}
      <View style={styles.reminderContainer}>
        <Text style={styles.reminderText}>Reminder</Text>
        <Switch
          value={reminderEnabled}
          onValueChange={(value) => setReminderEnabled(value)}
          trackColor={{ false: "#767577", true: "#2774AE" }}
          thumbColor={reminderEnabled ? "#ffffff" : "#f4f3f4"}
        />
      </View>

      {/* Custom Time Picker */}
      {reminderEnabled && (
        <View style={styles.timePickerContainer}>
          {/* Hour Selector */}
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setIsHourModalVisible(true)}
            accessibilityLabel="Select Hour"
            accessible={true}
          >
            <Text style={styles.timeSelectorText}>{hour}</Text>
          </TouchableOpacity>

          <Text style={styles.colon}>:</Text>

          {/* Minute Selector */}
          <TouchableOpacity
            style={styles.timeSelector}
            onPress={() => setIsMinuteModalVisible(true)}
            accessibilityLabel="Select Minute"
            accessible={true}
          >
            <Text style={styles.timeSelectorText}>{minute}</Text>
          </TouchableOpacity>

          {/* AM/PM Selector */}
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

      {/* Save Button */}
      <Pressable onPress={addHabit} style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Add to routine</Text>
      </Pressable>

      {/* Hour Selection Modal */}
      <Modal
        visible={isHourModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsHourModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Hour</Text>
            <FlatList
              ref={hourListRef}
              data={hours}
              keyExtractor={(item) => item}
              renderItem={({ item }) => renderItem(item, "hour")}
              getItemLayout={(data, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsHourModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Minute Selection Modal */}
      <Modal
        visible={isMinuteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsMinuteModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Minute</Text>
            <FlatList
              ref={minuteListRef}
              data={minutes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => renderItem(item, "minute")}
              getItemLayout={(data, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsMinuteModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* AM/PM Selection Modal */}
      <Modal
        visible={isAmPmModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAmPmModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select AM/PM</Text>
            <FlatList
              ref={amPmListRef}
              data={amPmOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => renderItem(item, "amPm")}
              getItemLayout={(data, index) => ({
                length: 50,
                offset: 50 * index,
                index,
              })}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsAmPmModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default create;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1, // Ensure the container takes up the full screen height
    backgroundColor: "#fff", // Optional: set a background color
  },
  header: {
    fontSize: 20,
    marginTop: 10,
  },
  headerBold: {
    fontSize: 20,
    fontWeight: "500",
  },
  input: {
    width: "95%",
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#E1EBEE",
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  colorsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
  repeatContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
  },
  repeatOption: {
    backgroundColor: "#AFDBF5",
    padding: 10,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#2774AE", // Change color to indicate selection
  },
  repeatText: {
    textAlign: "center",
    color: "#000", // Default text color
  },
  daysContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    flexWrap: "wrap", // Allow wrapping if needed
  },
  dayBox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDay: {
    backgroundColor: "#2774AE",
  },
  dayText: {
    color: "#000",
  },
  selectedDayText: {
    color: "#fff",
    fontWeight: "bold",
  },
  reminderContainer: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reminderText: {
    fontSize: 17,
    fontWeight: "500",
  },
  timePickerContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeSelector: {
    padding: 10,
    backgroundColor: "#E1EBEE",
    borderRadius: 10,
    width: "30%", // Adjust as needed
    alignItems: "center",
  },
  timeSelectorAmPm: {
    padding: 10,
    backgroundColor: "#E1EBEE",
    borderRadius: 10,
    width: "20%", // Adjust as needed
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
  },
  saveButton: {
    marginTop: 25,
    backgroundColor: "#00428c",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "60%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
  },
  modalItemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#2774AE",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
