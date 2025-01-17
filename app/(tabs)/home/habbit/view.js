// views.js
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { Ionicons } from "@expo/vector-icons";
  import axios from "axios";
  import { useRouter, useSearchParams } from "expo-router";
  import AsyncStorage from "@react-native-async-storage/async-storage";
  
  const Views = () => {
    const router = useRouter();
    const { habitId } = useSearchParams();
  
    // UI State
    const [title, setTitle] = useState("");
    const [repeatMode, setRepeatMode] = useState("daily");
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [hour, setHour] = useState("12");
    const [minute, setMinute] = useState("00");
    const [amPm, setAmPm] = useState("AM");
  
    // Build a display string for reminder
    const reminderString = reminderEnabled
      ? `${hour}:${minute} ${amPm}`
      : "None";
  
    // Fetch data on mount (when habitId changes)
    useEffect(() => {
      if (!habitId) {
        console.log("No habitId provided, skipping fetchHabitData");
        return;
      }
      fetchHabitData(habitId);
    }, [habitId]);
  
    // GET habit data from server
    const fetchHabitData = async (id) => {
      try {
        const response = await axios.get(`http://192.168.100.5:3001/habits/${id}`);
        const habit = response.data;
        console.log("Fetched habit:", habit);
  
        // Set the fetched info into local state
        setTitle(habit.title);
        setRepeatMode(habit.repeatMode || "daily");
  
        // For reminder
        if (habit.reminder?.enabled && habit.reminder.time) {
          setReminderEnabled(true);
          const [hhmm, ampm] = habit.reminder.time.split(" ");
          const [hh, mm] = hhmm.split(":");
          setHour(hh);
          setMinute(mm);
          setAmPm(ampm);
        } else {
          setReminderEnabled(false);
        }
      } catch (error) {
        console.log("Error fetching habit:", error);
        Alert.alert("Error", "Failed to fetch habit data.");
        router.replace("/home");
      }
    };
  
    // Cancel => go home
    const cancelEdit = () => {
        router.push({
          pathname: '/home',
          params: { screen: 'habbit' },
        });
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
          {/* Header */}
          <View style={styles.headerContainer}>
            <Ionicons
              name="arrow-back"
              onPress={cancelEdit}
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.header}>View Habit</Text>
          </View>
  
          {/* Display Habit Title */}
          <View style={styles.emptyContainer}>
            <Image
              style={styles.emptyImage}
              source={require("../../../../assets/emoji.png")}
            />
            <Text style={styles.sectionHeader}>Title: {title}</Text>
          </View>
  
          {/* Display Repeat Mode */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionContent}>
              <Ionicons name="repeat-outline" size={20} color="#db2859" />
              {"  "}Repeat: {repeatMode}
            </Text>
          </View>
  
          {/* Display Reminder Info */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionContent}>
              <Ionicons name="alarm-outline" size={16} color="#db2859" />
              {"  "}Reminder: {reminderString}
            </Text>
          </View>
  
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };
  
  export default Views;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f1ebed",
    },
    scrollContainer: {
      padding: 10,
      paddingBottom: 30,
    },
  
    /* ----------------- HEADER ----------------- */
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      marginTop: 10,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    backIcon: {
      marginRight: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        flexShrink: 1,
        color: "black",
      },
  
    /* ----------------- EMPTY / TITLE ----------------- */
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
  
    /* ----------------- SECTIONS ----------------- */
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
  
    /* ----------------- ICON ROW (NEW) ----------------- */
    iconRow: {
      flexDirection: "row",
      justifyContent: "center", // center horizontally
      alignItems: "center",
      marginTop: 30,
      marginBottom: 20,
    },
    iconSpacer: {
      marginHorizontal: 10, // space between icons
    },
  });
  