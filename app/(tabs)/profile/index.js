import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons, } from "@expo/vector-icons";

const ProfileScreen = () => {
  const [userName, setUserName] = useState(""); // <-- Store user's name
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);

  const router = useRouter();
  const isFocused = useIsFocused(); // Re-fetch on screen focus

  // Re-fetch data whenever screen is focused
  useEffect(() => {
    if (isFocused) {
      fetchProfileData();
    }
  }, [isFocused]);

  const fetchProfileData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "No user found. Please log in again.");
        router.replace("/(authenticate)/login");
        return;
      }

      const token = await AsyncStorage.getItem("authToken");

      // 1. Fetch user info for the name
      const userResponse = await axios.get(`http://192.168.100.5:3001/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // userResponse.data.user => { _id, name, email, ... }
      setUserName(userResponse.data.user.name);

      // 2. Fetch tasks count for that user
      const todosCountResponse = await axios.get(
        `http://192.168.100.5:3001/users/${userId}/todos/count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { totalCompletedTodos, totalPendingTodos } = todosCountResponse.data;
      setCompletedTasks(totalCompletedTodos);
      setPendingTasks(totalPendingTodos);

    } catch (error) {
      console.log("Error fetching profile data:", error);
      Alert.alert("Error", "Failed to fetch profile data.");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("userId");
      Alert.alert("Logged Out", "You have been successfully logged out.");
      router.replace("/(authenticate)/login");
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Error", "An error occurred while logging out.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerRow}>
      <Image
        source={require('../../../assets/user.png')} // Adjust the path accordingly
        style={styles.logo}
      />
        <View>
          {/* Display user's name here */}
          <Text style={styles.title}>Hi {userName}!</Text>
          <Text style={styles.subtitle}>How's your plan?</Text>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </View>

      {/* Tasks Overview Section */}
      <View style={styles.overviewContainer}>
      <Image
        source={require('../../../assets/pro2.png')} // Adjust the path accordingly
        style={styles.proHeader}
      />
        <Text style={styles.overviewTitle}>Tasks Overview</Text>
        <View style={styles.taskRow}>
          <View style={styles.taskBox}>
            <Text style={styles.taskCount}>{completedTasks}</Text>
            <Text style={styles.taskLabel}>Completed Tasks</Text>
          </View>

          <View style={styles.taskBox}>
            <Text style={styles.taskCount}>{pendingTasks}</Text>
            <Text style={styles.taskLabel}>Pending Tasks</Text>
          </View>
        </View>
      </View>

      {/* Line Chart Section */}
      <LineChart
        data={{
          labels: ["Pending Tasks", "Completed Tasks"],
          datasets: [
            {
              data: [pendingTasks, completedTasks],
            },
          ],
        }}
        width={Dimensions.get("window").width - 20}
        height={220}
        yAxisInterval={2}
        chartConfig={{
          backgroundColor: "white",
          backgroundGradientFrom: "#db2859",
          backgroundGradientTo: "white",
          decimalPlaces: 0,
          color: (opacity = 1) => `black`,
          labelColor: (opacity = 1) => `black`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "black",
          },
        }}
        bezier
        style={styles.lineChart}
      />

      {/* Upcoming Tasks Section */}
      <View style={styles.upcomingTasks}>
        <Text style={styles.upcomingTasksText}>Tasks for the Next Seven Days</Text>
      </View>

      {/* Decorative Image Section */}
      <View style={styles.decorativeImageContainer}>
        <Image
          style={styles.decorativeImage}
          source={{
            uri: "https://cdn-icons-png.flaticon.com/128/9537/9537221.png",
          }}
        />
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flex: 1,
    backgroundColor: "#f1ebed",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
    marginBottom: 5
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    color: "gray",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#db2859",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 25,
    marginLeft: 91,
  },
  logoutButtonText: {
    color: "white",
    textAlign: "left",
  },
  overviewContainer: {
    marginVertical: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 7,
    marginHorizontal: 14,
    marginBottom: 5
  },
  taskBox: {
    backgroundColor: "rgba(219, 40, 89, 0.14)",
    padding: 20,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  taskCount: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: '900'
  },
  taskLabel: {
    marginTop: 9,
  },
  lineChart: {
    borderRadius: 16,
    marginHorizontal: 15,
    marginRight: 28,
    marginBottom: 5
  },
  upcomingTasks: {
    backgroundColor: "rgba(219, 40, 89, 0.14)",
    padding: 10,
    marginTop: 12,
    marginHorizontal: 16,
    marginRight: 13,
    marginBottom: 5,
    borderRadius: 8,
  },
  upcomingTasksText: {
    textAlign: "center",
    color: "black",
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
  logo: {
    width: 60,
    height: 80,
    resizeMode: 'contain', // Adjust how the image fits
    marginRight: 8,
    marginLeft: 14
  },
  proHeader: {
    width: 363,
    height: 70,
    borderRadius: 12,
    marginLeft: 13,
    marginBottom: 15
  }
});
