import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Toggle = ({ onTabChange }) => {
    const [activeTab, setActiveTab] = useState('todo'); // Assuming 'todo' is the default

    const handlePress = (tab) => {
        setActiveTab(tab);
        onTabChange(tab);  // Call the passed in function with the new tab
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
                onPress={() => handlePress('todo')}
            >
                <Text style={[styles.tabText, activeTab === 'todo' && styles.activeTabText]}>To-Do</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.tab, activeTab === 'habits' && styles.activeTab]}
                onPress={() => handlePress('habits')}
            >
                <Text style={[styles.tabText, activeTab === 'habits' && styles.activeTabText]}>Habits</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Toggle;

// StyleSheet
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 25,
        padding: 2, // Reduced overall padding for a slimmer look
        width: 'auto', // Set a specific width to make the tabs wider
        alignSelf: 'center',
        marginBottom: 5,
        marginTop: 10,
        shadowColor: '#000', // Optional: Add shadow for a subtle depth effect
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tab: {
        flexgrow: 1,
        borderRadius: 30,
        paddingVertical: 5, // Reduced height of the tabs
        paddingHorizontal: 25, // Adjust horizontal padding as needed
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
        marginVertical: 1 // Ensure there's a slight space between the tabs
    },
    activeTab: {
        backgroundColor: '#ff5a5f',
    },
    tabText: {
        fontWeight: 'bold',
        color: 'black',
    },
    activeTabText: {
        color: 'white',
    },
    content: {
        padding: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
    }
});
