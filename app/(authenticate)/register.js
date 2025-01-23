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
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";

const register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
    };

    axios
      .post("http://192.168.1.50:3001/register", user)
      .then((response) => {
        console.log(response);
        Alert.alert("Registration successful", "You have been registered successfully");
        setEmail("");
        setPassword("");
        setName("");
        router.replace("/(authenticate)/login");
      })
      .catch((error) => {
        Alert.alert("Registration failed", "An error occurred during registration");
        console.log("error", error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TODO-HABIT TRACKER</Text>
      </View>
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Register your account</Text>

          {/* White Container for Name, Email, Password Inputs, and Register Button */}
          <View style={styles.whiteContainer}>
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={24} color="gray" style={styles.icon} />
              <TextInput
                value={name}
                onChangeText={(text) => setName(text)}
                style={styles.input}
                placeholder="Username"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={24} color="gray" style={styles.icon} />
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
              <Ionicons name="lock-closed-outline" size={24} color="gray" style={styles.icon} />
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
          <Pressable onPress={() => router.replace("/login")} style={styles.registerLink}>
            <Text style={styles.registerText}>Already have an account? Log In </Text>
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
    alignItems: "center",
    backgroundColor: "#eb84a0",
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
    color: "white",
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
  registerButton: {
    width: 130,
    backgroundColor: "#e66388",
    padding: 14,
    borderRadius: 24,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 30,
    marginBottom: 10,
  },
  registerButtonText: {
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  registerLink: {
    marginTop: 160,
  },
  registerText: {
    textAlign: "center",
    fontSize: 15,
    color: "white",
  },
});
