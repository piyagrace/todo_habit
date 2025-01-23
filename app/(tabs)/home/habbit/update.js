// update.js

import {
    StyleSheet,
    Text,
    View,
    Image,
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
import { Ionicons, AntDesign, FontAwesome } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter, useSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Update = () => {
    const router = useRouter();
    const { habitId } = useSearchParams(); // Retrieve habitId from query parameters

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
        'rgba(245, 112, 112, 255)',
        'rgba(245, 224, 105, 255)',
        'rgba(93, 118, 169, 255)',
        'rgba(96, 159, 242, 255)',
        'rgba(106, 236, 106, 255)',
        '#ccccff',
        'rgba(237, 171, 113, 255)',
    ];

    const daysOptions = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

    // Refs for FlatList scrolling
    const hourListRef = useRef(null);
    const minuteListRef = useRef(null);
    const amPmListRef = useRef(null);

    // FETCH HABIT DATA
    useEffect(() => {
        // If no habitId is present, do nothing (the user might have just navigated here or canceled)
        if (!habitId) {
            console.log('No habitId provided, skipping fetchHabitData');
            return;
        }
        fetchHabitData(habitId);
    }, [habitId]);

    const fetchHabitData = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3001/habits/${id}`);
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
            router.replace('/home'); // or just navigate back
        }
    };

    // Toggle days for weekly
    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter((d) => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    // UPDATE HABIT
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
                userId,
            };

            const response = await axios.put(
                `http://localhost:3001/habits/${habitId}`,
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
                amPmListRef.current.scrollToIndex({
                    index: amPmIndex,
                    animated: false,
                });
            }
        }
    }, [isAmPmModalVisible]);

    // CANCEL EDIT => Just go back to home
    const cancelEdit = () => {
        router.push({
          pathname: '/home',
          params: { screen: 'habbit' },
        });
      };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    {/* CLICKING THIS WILL CANCEL EDIT AND GO HOME */}
                    <Ionicons
                        name="arrow-back"
                        onPress={cancelEdit}
                        size={24}
                        color="black"
                        style={styles.backIcon}
                    />
                    <Text style={styles.header}>Edit Habit</Text>
                </View>

                <View style={styles.emptyContainer}>
                    <Image
                        style={styles.emptyImage}
                        source={require('../../../../assets/emoji.png')}
                    />
                </View>

                {/* Title Input: Single underline + center alignment */}
                <TextInput
                    value={title}
                    onChangeText={(text) => setTitle(text)}
                    style={styles.titleInput}
                    placeholder="Edit Habit Title"
                    placeholderTextColor="#666"
                    multiline={true}
                />

                {/* COLOR SELECTION */}
                <View style={styles.sectionContainer}>
                    <View style={styles.colorsContainer}>
                        {colors.map((item, index) => (
                            <TouchableOpacity
                                onPress={() => setSelectedColor(item)}
                                key={index}
                                activeOpacity={0.8}
                            >
                                {selectedColor === item ? (
                                    <AntDesign name="checkcircle" size={30} color={item} />
                                ) : (
                                    <FontAwesome name="circle" size={30} color={item} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* REPEAT MODE */}
                <View style={styles.sectionContainer}>
                    <View style={styles.row}>
                        <Text style={styles.sectionHeader}>Repeat</Text>
                    </View>
                    <View style={styles.repeatContainer}>
                        <Pressable
                            onPress={() => setRepeatMode('daily')}
                            style={[
                                styles.repeatOption,
                                repeatMode === 'daily' && styles.selectedOption,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.repeatText,
                                    repeatMode === 'daily' && styles.repeatTextSelected,
                                ]}
                            >
                                Daily
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={() => setRepeatMode('weekly')}
                            style={[
                                styles.repeatOption,
                                repeatMode === 'weekly' && styles.selectedOption,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.repeatText,
                                    repeatMode === 'weekly' && styles.repeatTextSelected,
                                ]}
                            >
                                Weekly
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* DAYS (only if weekly) */}
                {repeatMode === 'weekly' && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionSubHeader}>On these days</Text>
                        <View style={styles.daysContainer}>
                            {daysOptions.map((day, index) => {
                                const isSelected = selectedDays.includes(day);
                                return (
                                    <Pressable
                                        key={index}
                                        onPress={() => toggleDay(day)}
                                        style={[styles.dayBox, isSelected && styles.selectedDay]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                isSelected && styles.selectedDayText,
                                            ]}
                                        >
                                            {day}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* REMINDER */}
                <View style={styles.sectionContainer}>
                    <View style={styles.row}>
                        <Text style={styles.sectionHeader}>Reminder</Text>
                        <Switch
                            value={reminderEnabled}
                            onValueChange={(value) => setReminderEnabled(value)}
                            trackColor={{ false: '#767577', true: '#db2859' }}
                            thumbColor={reminderEnabled ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    {reminderEnabled && (
                        <View style={styles.timePickerContainer}>
                            {/* Hour Selector */}
                            <TouchableOpacity
                                style={styles.timeSelector}
                                onPress={() => setIsHourModalVisible(true)}
                            >
                                <Text style={styles.timeSelectorText}>{hour}</Text>
                            </TouchableOpacity>

                            <Text style={styles.colon}>:</Text>

                            {/* Minute Selector */}
                            <TouchableOpacity
                                style={styles.timeSelector}
                                onPress={() => setIsMinuteModalVisible(true)}
                            >
                                <Text style={styles.timeSelectorText}>{minute}</Text>
                            </TouchableOpacity>

                            {/* AM/PM Selector */}
                            <TouchableOpacity
                                style={styles.timeSelectorAmPm}
                                onPress={() => setIsAmPmModalVisible(true)}
                            >
                                <Text style={styles.timeSelectorText}>{amPm}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* SAVE CHANGES BUTTON */}
                <Pressable
                    onPress={updateHabit}
                    style={[styles.saveButton, styles.saveButtonRow]}
                >
                    <Ionicons
                        name="create-outline"
                        size={20}
                        color="#fff"
                        style={styles.addIcon}
                    />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </Pressable>

                {/* HOUR MODAL */}
                <Modal
                    visible={isHourModalVisible}
                    transparent
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

                {/* MINUTE MODAL */}
                <Modal
                    visible={isMinuteModalVisible}
                    transparent
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

                {/* AM/PM MODAL */}
                <Modal
                    visible={isAmPmModalVisible}
                    transparent
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

// You can keep your merged styles from previous step:
const styles = StyleSheet.create({
    // ... same styles from your "create" design ...
    container: {
        flex: 1,
        backgroundColor: "#f1ebed",
    },
    scrollContainer: {
        padding: 10,
        paddingBottom: 30,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10
    },
    backIcon: {
        marginLeft: 10,
        marginRight: 15,
    },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        flexShrink: 1,
        color: "black",
    },
    titleInput: {
        borderBottomWidth: 2,
        borderColor: "rgba(0, 0, 0, 0.4)",
        textAlign: "center",
        minHeight: 40,
        fontSize: 16,
        color: "#000",
        marginBottom: 25,
        marginTop: 25,
        alignSelf: "center",
        width: "60%",
    },
    sectionContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        marginBottom: 18,
        marginHorizontal: 18,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginHorizontal: 6,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    sectionSubHeader: {
        fontSize: 14,
        fontWeight: "500",
        marginBottom: 14,
        color: "#000",
        marginHorizontal: 6,
    },
    colorsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        flexWrap: "wrap",
        gap: 4,
    },
    repeatContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 20,
        gap: 10,
    },
    repeatOption: {
        backgroundColor: "#E0E0E0",
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 24,
        flex: 1,
        alignItems: "center",
    },
    selectedOption: {
        backgroundColor: "#db2859",
    },
    repeatText: {
        textAlign: "center",
        color: "#000",
        fontSize: 16,
    },
    repeatTextSelected: {
        color: "#fff",
    },
    daysContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
    },
    dayBox: {
        width: 35,
        height: 35,
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderRadius: 5,
        backgroundColor: "#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
    },
    selectedDay: {
        backgroundColor: "#db2859",
    },
    dayText: {
        color: "#000",
        fontSize: 14,
    },
    selectedDayText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 14,
    },
    reminderContainer: {
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        marginBottom: 18,
        marginHorizontal: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timePickerContainer: {
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
    },
    timeSelector: {
        padding: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        width: "25%",
        alignItems: "center",
    },
    timeSelectorAmPm: {
        padding: 10,
        backgroundColor: "#E0E0E0",
        borderRadius: 10,
        width: "15%",
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
        color: "#000",
    },
    saveButton: {
        marginTop: 10,
        backgroundColor: "#db2859",
        paddingVertical: 15,
        borderRadius: 24,
        alignItems: "center",
        marginHorizontal: 18,
    },
    saveButtonRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    addIcon: {
        marginRight: 8,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        width: "80%",
        maxHeight: "60%",
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
        textAlign: "center",
        color: "#000",
    },
    modalItem: {
        padding: 15,
        alignItems: "center",
    },
    modalItemText: {
        fontSize: 18,
        color: "#000",
    },
    closeButton: {
        backgroundColor: "#db2859",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: "center",
        marginTop: 10,
    },
    closeButtonText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 16,
    },
    emptyImage: {
        width: 80,
        height: 80,
        resizeMode: 'cover',
    },
    emptyContainer: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10',
    },
});
