// app/(authenticate)/login.js
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get device dimensions
const { width, height } = Dimensions.get("window");

// Basic email format regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userId = await AsyncStorage.getItem("userId");
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
    // Check for empty fields
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const user = {
      email: email.trim(),
      password: password,
    };

    try {
      const response = await axios.post("http://10.0.2.2:3001/login", user);
      const { token, userId } = response.data;

      if (token && userId) {
        await AsyncStorage.setItem("authToken", token);
        await AsyncStorage.setItem("userId", userId);
        router.replace("/(tabs)/home");
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
      {/* Responsive Image Container */}
      <View style={styles.emptyContainer}>
        <Image
          style={styles.emptyImage}
          source={require("../../assets/text1.png")}
        />
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
                size={width * 0.055}
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
                size={width * 0.055}
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
    backgroundColor: "#eb84a0",
    alignItems: "center",
  },
  emptyContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: height * 0.07, 
  },

  emptyImage: {
    width: width * 0.8,       
    height: undefined,        
    aspectRatio: 4.375,       
    resizeMode: "contain",   
  },
  formContainer: {
    alignItems: "center",
    marginTop: height * 0.01,
  },
  subtitle: {
    fontSize: width * 0.07,
    fontWeight: "700",
    marginTop: height * 0.07,
    color: "white",
  },
  whiteContainer: {
    backgroundColor: "white",
    padding: width * 0.06,
    borderRadius: width * 0.04,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.9,
    marginTop: height * 0.03,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3e4ea",
    borderRadius: width * 0.04,
    marginTop: height * 0.02,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.015,
  },
  icon: {
    marginRight: width * 0.03,
  },
  input: {
    color: "black",
    fontSize: width * 0.04,
    flex: 1,
  },
  loginButton: {
    width: width * 0.4,
    backgroundColor: "#e66388",
    padding: height * 0.02,
    borderRadius: width * 0.06,
    marginTop: height * 0.03,
    marginBottom: height * 0.01,
    alignSelf: "center",
  },
  loginButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  optionsContainer: {
    alignItems: "center",
    marginTop: height * 0.05,
    width: width * 0.9,
  },
  forgotPassword: {
    color: "white",
    fontWeight: "500",
    fontSize: width * 0.045,
    marginBottom: height * 0.15,
  },
  registerLink: {
    marginTop: height * 0.01,
  },
  registerText: {
    textAlign: "center",
    fontSize: width * 0.045,
    color: "white",
  },
});
