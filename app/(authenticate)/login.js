// app/(authenticate)/login.js
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId"); // Retrieve userId
        if (token && userId) {
          router.replace("/(tabs)/home"); // Redirect to Home if already logged in
        }
      } catch (error) {
        console.log("Error checking login status:", error);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    const user = {
      email: email.trim(),
      password: password,
    };

    try {
      const response = await axios.post("http://192.168.1.50:3001/login", user);
      const { token, userId } = response.data;

      if (token && userId) {
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userId", userId); // Store userId
        router.replace("/(tabs)/home"); // Redirect to Home after login
      } else {
        Alert.alert("Login Failed", "Invalid response from server.");
      }
    } catch (error) {
      console.log("Login error:", error);
      if (error.response && error.response.data && error.response.data.message) {
        Alert.alert("Login Failed", error.response.data.message);
      } else {
        Alert.alert("Login Failed", "An unexpected error occurred.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TODO-HABIT TRACKER</Text>
      </View>
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Log In Your Account</Text>

          {/* White Container for Email, Password Inputs, and Login Button */}
          <View style={styles.whiteContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={22}
                color="#70515d"
                style={styles.icon}
              />
              <TextInput
                value={email}
                onChangeText={(text) => setEmail(text)}
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color="#70515d"
                style={styles.icon}
              />
              <TextInput
                value={password}
                secureTextEntry={true}
                onChangeText={(text) => setPassword(text)}
                style={styles.input}
                placeholder="Password"
              />
            </View>

            {/* Login Button */}
            <Pressable onPress={handleLogin} style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          </View>

          {/* Additional Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </View>

          {/* Navigate to Register */}
          <Pressable
            onPress={() => router.replace("/register")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Don't have an account? Sign up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#eb84a0"
  },
  header: {
    marginTop: 80,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  formContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 70,
    color: "white"
  },
  whiteContainer: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 23,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: 320,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: "#f3e4ea",
    paddingVertical: 2,
    borderRadius: 20,
    marginTop: 20,
  },
  icon: {
    marginLeft: 19,
  },
  input: {
    color: "black",
    marginVertical: 10,
    width: 250,
    fontSize: 15,
  },
  optionsContainer: {
    alignItems: "center",
    marginTop: 50,
    justifyContent: "space-between",
    width: 300,
  },
  forgotPassword: {
    color: "white",
    fontWeight: "500",
    fontSize: 15,
    marginBottom: 150
  },
  loginButton: {
    width: 130,
    backgroundColor: "#e66388",
    padding: 14,
    borderRadius: 24,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
    marginBottom: 10
  },
  loginButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerLink: {
    marginTop: 15,
  },
  registerText: {
    textAlign: "center",
    fontSize: 15,
    color: "white",
  },
});
