import React, { useState } from "react";
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
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

// Get the screen dimensions
const { width, height } = Dimensions.get("window");

// Basic email format regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    // Check for empty fields
    if (!name || !email || !password) {
      Alert.alert("Validation Error", "All fields are required.");
      return;
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    const user = {
      name: name.trim(),
      email: email.trim(),
      password: password,
    };

    axios
      .post("http://10.0.2.2:3001/register", user)
      .then((response) => {
        console.log(response);
        Alert.alert(
          "Registration successful",
          "You have been registered successfully"
        );
        setEmail("");
        setPassword("");
        setName("");
        router.replace("/(authenticate)/login");
      })
      .catch((error) => {
        Alert.alert(
          "Registration failed",
          "An error occurred during registration"
        );
        console.log("error", error);
      });
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
          <Text style={styles.subtitle}>Register your account</Text>

          {/* White Container for Name, Email, Password, and Register Button */}
          <View style={styles.whiteContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={width * 0.06}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                value={name}
                onChangeText={(text) => setName(text)}
                style={styles.input}
                placeholder="Username"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={width * 0.06}
                color="gray"
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
                size={width * 0.06}
                color="gray"
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

            {/* Register Button */}
            <Pressable onPress={handleRegister} style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </Pressable>
          </View>

          {/* Navigate to Login */}
          <Pressable
            onPress={() => router.replace("/login")}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              Already have an account? Log In
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eb84a0",
    alignItems: "center",
  },
  header: {
    marginTop: height * 0.08,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "600",
    color: "white",
  },
  formContainer: {
    alignItems: "center",
    marginTop: height * 0.001,
  },
  subtitle: {
    fontSize: width * 0.06,
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
    width: width * 0.9, // 90% of screen width
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
    marginBottom: height * 0.01,
  },
  icon: {
    marginRight: width * 0.03,
  },
  input: {
    color: "black",
    flex: 1,
    fontSize: width * 0.04,
  },
  registerButton: {
    width: width * 0.4,
    backgroundColor: "#e66388",
    padding: height * 0.02,
    borderRadius: width * 0.06,
    marginTop: height * 0.03,
    alignSelf: "center",
  },
  registerButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
  registerLink: {
    marginTop: height * 0.07,
  },
  registerText: {
    textAlign: "center",
    fontSize: width * 0.045,
    color: "white",
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
});
