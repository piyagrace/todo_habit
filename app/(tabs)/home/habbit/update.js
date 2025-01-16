// update.js

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
    ScrollView,
    KeyboardAvoidingView,
    Platform,
  } from 'react-native';
  import React, { useState, useRef, useEffect } from 'react';
  import { Ionicons, AntDesign } from '@expo/vector-icons';
  import { FontAwesome } from '@expo/vector-icons';
  import axios from 'axios';
  import { useRouter, useSearchParams } from 'expo-router';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  const Update = () => {
    const router = useRouter();
    const { habitId } = useSearchParams(); // Retrieve habitId from query parameters
  
    console.log('Received habitId:', habitId); // Debugging line
  
    // UI State
    const [selectedColor, setSelectedColor] = useState('');
    const [title, setTitle] = useState('');
    const [repeatMode, setRepeatMode] = useState('daily');
    const [selectedDays, setSelectedDays] = useState([]);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [hour, setHour] = useState('12');
    const [minute, setMinute] = useState('00');
    const [amPm, setAmPm] = useState('AM');
  
    // Modals
    const [isHourModalVisible, setIsHourModalVisible] = useState(false);
    const [isMinuteModalVisible, setIsMinuteModalVisible] = useState(false);
    const [isAmPmModalVisible, setIsAmPmModalVisible] = useState(false);
  
    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) =>
      i < 10 ? `0${i}` : `${i}`
    );
    const amPmOptions = ['AM', 'PM'];
  
    const colors = [
      '#FF5733',
      '#FFD700',
      '#5D76A9',
      '#1877F2',
      '#32CD32',
      '#CCCCFF',
      '#4169E1',
    ];
    const daysOptions = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];
  
    // References for FlatList scrolling
    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);
    const amPmListRef = useRef(null);
  
    // Fetch habit data on mount
    useEffect(() => {
      if (!habitId) {
        Alert.alert('Error', 'No habit ID provided.');
        router.replace('/home'); // Redirect to home if habitId is missing
        return;
      }
      fetchHabitData(habitId);
    }, [habitId]);
  
    const fetchHabitData = async (id) => {
      try {
        const response = await axios.get(`http://192.168.100.5:3001/habits/${id}`);
        const habit = response.data;
        console.log('Fetched habit for update:', habit);
  
        setTitle(habit.title);
        setSelectedColor(habit.color);
        setRepeatMode(habit.repeatMode || 'daily');
  
        if (habit.days && Array.isArray(habit.days)) {
          setSelectedDays(habit.days);
        } else {
          setSelectedDays([]);
        }
  
        // Reminder
        if (habit.reminder?.enabled && habit.reminder.time) {
          setReminderEnabled(true);
          // Parse time "HH:MM AM/PM"
          const [hhmm, ampm] = habit.reminder.time.split(' ');
          const [hh, mm] = hhmm.split(':');
          setHour(hh);
          setMinute(mm);
          setAmPm(ampm);
        } else {
          setReminderEnabled(false);
        }
      } catch (error) {
        console.log('Error fetching habit:', error);
        Alert.alert('Error', 'Failed to fetch habit data.');
        router.replace('/home'); // Redirect to home on failure
      }
    };
  
    // Toggle selected days for weekly repeat mode
    const toggleDay = (day) => {
      if (selectedDays.includes(day)) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      } else {
        setSelectedDays([...selectedDays, day]);
      }
    };
  
    // Update habit data via PUT request
    const updateHabit = async () => {
      try {
        // Validation
        if (!title.trim()) {
          Alert.alert('Validation Error', 'Please enter a title.');
          return;
        }
        if (!selectedColor) {
          Alert.alert('Validation Error', 'Please select a color.');
          return;
        }
        if (repeatMode === 'weekly' && selectedDays.length === 0) {
          Alert.alert('Validation Error', 'Please select at least one day.');
          return;
        }
        if (reminderEnabled && (!hour || !minute || !amPm)) {
          Alert.alert('Validation Error', 'Please select a valid reminder time.');
          return;
        }
  
        const reminderTime = reminderEnabled ? `${hour}:${minute} ${amPm}` : null;
  
        // Retrieve userId from AsyncStorage
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Authentication Error', 'Please log in again.');
          router.replace('/(authenticate)/login');
          return;
        }
  
        const updatedHabitData = {
          title: title.trim(),
          color: selectedColor,
          repeatMode,
          days: repeatMode === 'weekly' ? selectedDays : [],
          reminder: {
            enabled: reminderEnabled,
            time: reminderTime,
          },
          userId, // Include for server-side validation
        };
  
        // Send PUT request to update habit
        const response = await axios.put(
          `http://192.168.100.5:3001/habits/${habitId}`,
          updatedHabitData
        );
  
        if (response.status === 200) {
          Alert.alert('Success', 'Habit updated successfully!');
          router.push('/home');
        } else {
          Alert.alert('Error', 'Failed to update habit. Please try again.');
        }
      } catch (error) {
        console.log('Error updating habit:', error);
        if (error.response && error.response.data?.error) {
          Alert.alert('Error', error.response.data.error);
        } else if (error.request) {
          Alert.alert('Network Error', 'Unable to reach the server.');
        } else {
          Alert.alert('Error', 'There was a problem updating your habit.');
        }
      }
    };
  
    // Time Picker Item Renderer
    const renderItem = (item, type) => (
      <TouchableOpacity
        style={styles.modalItem}
        onPress={() => {
          if (type === 'hour') {
            setHour(item);
            setIsHourModalVisible(false);
          } else if (type === 'minute') {
            setMinute(item);
            setIsMinuteModalVisible(false);
          } else if (type === 'amPm') {
            setAmPm(item);
            setIsAmPmModalVisible(false);
          }
        }}
      >
        <Text style={styles.modalItemText}>{item}</Text>
      </TouchableOpacity>
    );
  
    // Scroll to the selected item when modal opens
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
  
    // UI Rendering
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Ionicons
              name="arrow-back"
              onPress={() => router.push('/home')}
              size={24}
              color="black"
              style={styles.backIcon}
            />
            <Text style={styles.header}>Edit Habit</Text>
          </View>
  
          {/* Title Input */}
          <TextInput
            value={title}
            onChangeText={(text) => setTitle(text)}
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#666"
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
  
          {/* Repeat Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat</Text>
            <View style={styles.repeatContainer}>
              <Pressable
                onPress={() => setRepeatMode('daily')}
                style={[
                  styles.repeatOption,
                  repeatMode === 'daily' && styles.selectedOption,
                ]}
              >
                <Text style={styles.repeatText}>Daily</Text>
              </Pressable>
              <Pressable
                onPress={() => setRepeatMode('weekly')}
                style={[
                  styles.repeatOption,
                  repeatMode === 'weekly' && styles.selectedOption,
                ]}
              >
                <Text style={styles.repeatText}>Weekly</Text>
              </Pressable>
            </View>
          </View>
  
          {/* Days Selection for Weekly Repeat */}
          {repeatMode === 'weekly' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>On these days</Text>
              <View style={styles.daysContainer}>
                {daysOptions.map((day, index) => (
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
              trackColor={{ false: '#767577', true: '#2774AE' }}
              thumbColor={reminderEnabled ? '#ffffff' : '#f4f3f4'}
            />
          </View>
  
          {/* Time Picker for Reminder */}
          {reminderEnabled && (
            <View style={styles.timePickerContainer}>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setIsHourModalVisible(true)}
              >
                <Text style={styles.timeSelectorText}>{hour}</Text>
              </TouchableOpacity>
              <Text style={styles.colon}>:</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setIsMinuteModalVisible(true)}
              >
                <Text style={styles.timeSelectorText}>{minute}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeSelectorAmPm}
                onPress={() => setIsAmPmModalVisible(true)}
              >
                <Text style={styles.timeSelectorText}>{amPm}</Text>
              </TouchableOpacity>
            </View>
          )}
  
          {/* Save Changes Button */}
          <Pressable onPress={updateHabit} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>
  
          {/* Hour Modal */}
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
                  renderItem={({ item }) => renderItem(item, 'hour')}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                  showsVerticalScrollIndicator={false}
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
  
          {/* Minute Modal */}
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
                  renderItem={({ item }) => renderItem(item, 'minute')}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                  showsVerticalScrollIndicator={false}
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
  
          {/* AM/PM Modal */}
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
                  renderItem={({ item }) => renderItem(item, 'amPm')}
                  getItemLayout={(data, index) => ({
                    length: 50,
                    offset: 50 * index,
                    index,
                  })}
                  showsVerticalScrollIndicator={false}
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  };
  
  export default Update;
  
  const styles = StyleSheet.create({
    scrollContainer: {
      padding: 10,
      paddingBottom: 30,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    backIcon: {
      marginRight: 10,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      flexShrink: 1,
    },
    input: {
      width: '100%',
      padding: 15,
      borderRadius: 10,
      backgroundColor: '#E1EBEE',
      fontSize: 16,
      color: '#000',
      marginBottom: 15,
    },
    section: {
      marginVertical: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '500',
      marginBottom: 10,
    },
    colorsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },
    repeatContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    repeatOption: {
      backgroundColor: '#AFDBF5',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 6,
      flex: 0.48,
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: '#2774AE',
    },
    repeatText: {
      textAlign: 'center',
      color: '#000',
      fontSize: 16,
    },
    daysContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
    },
    dayBox: {
      width: 40,
      height: 40,
      borderRadius: 5,
      backgroundColor: '#E0E0E0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedDay: {
      backgroundColor: '#2774AE',
    },
    dayText: {
      color: '#000',
      fontSize: 16,
    },
    selectedDayText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
    reminderContainer: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
    },
    reminderText: {
      fontSize: 17,
      fontWeight: '500',
    },
    timePickerContainer: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
    },
    timeSelector: {
      padding: 10,
      backgroundColor: '#E1EBEE',
      borderRadius: 10,
      width: '30%',
      alignItems: 'center',
    },
    timeSelectorAmPm: {
      padding: 10,
      backgroundColor: '#E1EBEE',
      borderRadius: 10,
      width: '20%',
      alignItems: 'center',
    },
    timeSelectorText: {
      fontSize: 16,
      color: '#000',
    },
    colon: {
      fontSize: 20,
      fontWeight: 'bold',
      marginHorizontal: 5,
    },
    saveButton: {
      marginTop: 25,
      backgroundColor: '#00428c',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 10,
    },
    saveButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '80%',
      maxHeight: '60%',
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      textAlign: 'center',
    },
    modalItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderColor: '#ccc',
      alignItems: 'center',
    },
    modalItemText: {
      fontSize: 16,
    },
    closeButton: {
      marginTop: 10,
      backgroundColor: '#2774AE',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    closeButtonText: {
      color: '#fff',
      fontSize: 16,
    },
  });
  