import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import axios from "axios";
import { LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

const ProfileScreen = () => {
  const [userName, setUserName] = useState("");
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState({
    labels: [],
    completedData: [],
    pendingData: [],
  });

  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchProfileData();
      fetchWeeklyStats();
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
      const userResponse = await axios.get(`http://192.168.1.50:3001/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserName(userResponse.data.user.name);

      const todosCountResponse = await axios.get(`http://192.168.1.50:3001/users/${userId}/todos/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { totalCompletedTodos, totalPendingTodos } = todosCountResponse.data;
      setCompletedTasks(totalCompletedTodos);
      setPendingTasks(totalPendingTodos);

    } catch (error) {
      console.log("Error fetching profile data:", error);
      Alert.alert("Error", "Failed to fetch profile data.");
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      const response = await axios.get(`http://192.168.1.50:3001/users/${userId}/todos/weekly-stats`);
      const { dailyStats } = response.data;
      if (!dailyStats || !Array.isArray(dailyStats) || dailyStats.length === 0) {
        setWeeklyStats({ labels: [], completedData: [], pendingData: [] });
        return;
      }
      const labels = dailyStats.map((item) => item.day);
      const completedData = dailyStats.map((item) => item.completed);
      const pendingData = dailyStats.map((item) => item.pending);
      setWeeklyStats({ labels, completedData, pendingData });
    } catch (error) {
      console.log("Error fetching weekly stats:", error);
    }
  };

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
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../../assets/user.png")}
            style={styles.logo}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Hi {userName}!</Text>
            <Text style={styles.subtitle}>How's your plan?</Text>
          </View>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </View>

      <View style={styles.overviewContainer}>
        <Image
          source={require("../../../assets/pro3.png")}
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

      {/* Weekly Multi-Line Chart */}
      {weeklyStats.labels.length > 0 ? (
        <View>
          <Text style={styles.overviewTitle}>Weekly Progress</Text>
          <LineChart
            data={{
              labels: weeklyStats.labels,
              datasets: [
                {
                  data: weeklyStats.completedData,
                  color: () => "rgba(0, 200, 0, 1)", // green line
                  strokeWidth: 2,
                },
                {
                  data: weeklyStats.pendingData,
                  color: () => "rgba(255, 0, 0, 1)", // red line
                  strokeWidth: 2,
                },
              ],
            }}
            width={Dimensions.get("window").width - 50}
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "white",
              backgroundGradientFrom: "#db2859",
              backgroundGradientTo: "white",
              decimalPlaces: 0,
              color: () => "black",
              labelColor: () => "black",
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "6",
                strokeWidth: "1",
                stroke: "black",
              },
            }}
            bezier
            style={styles.lineChart}
          />

          {/* Legend (Red = Pending, Green = Completed) */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: "red" }]} />
              <Text style={styles.legendText}>Pending Tasks</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.colorBox, { backgroundColor: "green" }]}
              />
              <Text style={styles.legendText}>Completed Tasks</Text>
            </View>
          </View>
        </View>
      ) : (
        // OPTIONAL: Show a fallback if no data
        <View style={{ marginHorizontal: 15, marginBottom: 10 }}>
          <Text style={{ textAlign: "center", color: "red", marginBottom: 5 }}>
            No weekly stats available to display.
          </Text>
        </View>
      )}

      <View style={styles.upcomingTasks}>
        <Text style={styles.upcomingTasksText}>Tasks for the Next Seven Days</Text>
      </View>

      <View style={styles.decorativeImageContainer}>
        <Image
          source={require("../../../assets/list.png")}
          style={styles.decorativeImage}
        />
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1ebed",
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 5,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginRight: 8,
    marginLeft: 14,
  },
  textContainer: {},
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
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 25,
    marginRight: 20,
  },
  logoutButtonText: {
    color: "white",
    textAlign: "center",
  },
  overviewContainer: {
    marginVertical: 20,
  },
  proHeader: {
    width: "90%",
    height: undefined,
    aspectRatio: 5,
    resizeMode: "contain",
    borderRadius: 12,
    alignSelf: "center",
    marginBottom: 20,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 15,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 7,
    marginHorizontal: 14,
    marginBottom: 5,
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
    fontWeight: "900",
  },
  taskLabel: {
    marginTop: 9,
  },
  weeklyChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
    marginBottom: 5,
  },
  lineChart: {
    borderRadius: 16,
    marginHorizontal: 15,
    marginBottom: 5,
    marginTop: 10
  },
  upcomingTasks: {
    backgroundColor: "rgba(219, 40, 89, 0.14)",
    padding: 10,
    marginTop: 12,
    marginHorizontal: 16,
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
    width: 100,
    height: 100,
  },
  // ======== Legend styles ========
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 15
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 5,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: "black",
  },
});
