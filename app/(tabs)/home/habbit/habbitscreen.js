// Habbitscreen.js
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal, // <-- Use the built-in Modal
} from 'react-native';
import React, { useState, useEffect } from 'react';
import {
  Ionicons,
  AntDesign,
  Feather,
  FontAwesome,
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WeekCalendar from '../weekcalendar';

const Habbitscreen = () => {
  const [option, setOption] = useState('Today');
  const router = useRouter();
  const [habits, setHabits] = useState([]);
  // Control modal with selectedHabit
  const [selectedHabit, setSelectedHabit] = useState(null);

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFocused = useIsFocused();
  const currentDay = new Date()
    .toLocaleDateString('en-US', { weekday: 'short' })
    .slice(0, 3);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Retrieved userId:', storedUserId);
        if (storedUserId) {
          setUserId(storedUserId);
          fetchHabits(storedUserId);
        } else {
          console.log('User ID not found. Redirecting to login.');
          router.replace('/(authenticate)/login');
        }
      } catch (error) {
        console.log('Error initializing Habbitscreen:', error);
        Alert.alert('Error', 'Failed to initialize user data.');
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (isFocused && userId) {
      console.log('Screen is focused. Fetching habits.');
      fetchHabits(userId);
    }
  }, [isFocused, userId]);

  const fetchHabits = async (userIdParam) => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://192.168.100.5:3001/habitslist', {
        params: { userId: userIdParam },
      });
      console.log('Fetched Habits:', response.data);
      setHabits(response.data);
    } catch (error) {
      console.log('Error fetching habits:', error);
      Alert.alert('Error', 'Failed to fetch habits.');
    } finally {
      setIsLoading(false);
    }
  };

  // "Open" the modal by setting the selected habit
  const handlePress = (habitId) => {
    console.log('Pressed Habit ID:', habitId);
    const habit = habits.find((h) => h._id === habitId);

    if (!habit) {
      console.log('Habit not found for ID:', habitId);
      Alert.alert('Error', 'Selected habit not found.');
      return;
    }

    console.log('Selected Habit:', habit);
    setSelectedHabit(habit);
  };

  // "Close" the modal by clearing selectedHabit
  const closeModal = () => {
    setSelectedHabit(null);
  };

  const handleCompletion = async () => {
    try {
      if (!selectedHabit) {
        Alert.alert('Error', 'No habit selected.');
        return;
      }
      const habitId = selectedHabit._id;
      console.log('Attempting to mark completed for habit ID:', habitId);

      const updatedCompletion = {
        ...selectedHabit.completed,
        [currentDay]: true,
      };

      const updatedHabitData = {
        completed: updatedCompletion,
        userId, // Include for server-side validation
      };

      const response = await axios.put(
        `http://192.168.100.5:3001/habits/${habitId}`,
        updatedHabitData
      );

      if (response.status === 200) {
        console.log('Habit marked as completed:', response.data);
        await fetchHabits(userId);
        Alert.alert('Success', 'Habit marked as completed!');

        // Reset the modal to "empty"
        closeModal();
      }
    } catch (error) {
      console.log('Error updating habit:', error);
      if (error.response) {
        Alert.alert(
          'Error',
          error.response.data.error || 'Failed to update habit.'
        );
      } else if (error.request) {
        Alert.alert('Error', 'No response from server.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  const handleUpdate = () => {
    if (!selectedHabit || !selectedHabit._id) {
      Alert.alert('Error', 'No habit selected.');
      return;
    }

    closeModal();
    // Add a short delay if needed
    setTimeout(() => {
      router.push({
        pathname: '/home/habbit/update',
        params: { habitId: selectedHabit._id },
      });
    }, 200);
  };

  const deleteHabit = () => {
    if (!selectedHabit) {
      Alert.alert('Error', 'No habit selected for deletion.');
      return;
    }
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete "${selectedHabit.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const habitId = selectedHabit._id;
              console.log('Attempting to delete habit with ID:', habitId);
              setIsDeleting(true);

              const response = await axios.delete(
                `http://192.168.100.5:3001/habits/${habitId}`,
                { data: { userId } }
              );
              if (response.status === 200) {
                console.log('Habit deleted successfully:', response.data);
                await fetchHabits(userId);
                Alert.alert('Success', 'Habit deleted successfully!');

                closeModal();
              }
            } catch (error) {
              console.log('Error deleting habit:', error);
              if (error.response) {
                if (error.response.status === 404) {
                  Alert.alert(
                    'Deletion Failed',
                    error.response.data.error || 'Habit not found.'
                  );
                } else if (error.response.status === 400) {
                  Alert.alert(
                    'Deletion Failed',
                    error.response.data.error || 'Invalid habit ID.'
                  );
                } else {
                  Alert.alert(
                    'Deletion Failed',
                    error.response.data.error || 'Failed to delete habit.'
                  );
                }
              } else if (error.request) {
                Alert.alert(
                  'Deletion Failed',
                  'No response from server. Please try again later.'
                );
              } else {
                Alert.alert('Deletion Failed', 'An unexpected error occurred.');
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // 1) Add a new function to skip
  const handleSkip = async () => {
    try {
      if (!selectedHabit) {
        Alert.alert('Error', 'No habit selected.');
        return;
      }
      const habitId = selectedHabit._id;
      console.log('Attempting to skip habit for ID:', habitId);

      // Copy existing skip data, or default to {}
      const updatedSkipped = {
        ...(selectedHabit.skipped || {}),
        [currentDay]: true,
      };

      const updatedHabitData = {
        skipped: updatedSkipped,
        userId,
      };

      // Make a PUT call to update "skipped"
      const response = await axios.put(
        `http://192.168.100.5:3001/habits/${habitId}`,
        updatedHabitData
      );

      if (response.status === 200) {
        console.log('Habit skipped for today:', response.data);
        await fetchHabits(userId);
        Alert.alert('Success', 'Habit skipped for today!');
        closeModal();
      }
    } catch (error) {
      console.log('Error skipping habit:', error);
      if (error.response) {
        Alert.alert(
          'Error',
          error.response.data.error || 'Failed to skip habit.'
        );
      } else if (error.request) {
        Alert.alert('Error', 'No response from server.');
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  const getCompletedDays = (completedObj) => {
    if (completedObj && typeof completedObj === 'object') {
      return Object.keys(completedObj).filter((day) => completedObj[day]);
    }
    return [];
  };

  // Filtering logic
  const filteredHabits = habits.filter((habit) => {
    if (option === 'Today') {
      // EXCLUDE if completed[currentDay] = true OR skipped[currentDay] = true
      const isCompletedToday = habit.completed?.[currentDay] === true;
      const isSkippedToday = habit.skipped?.[currentDay] === true;

      return !isCompletedToday && !isSkippedToday;
    }
    return true;
  });

  // Render item logic
  const renderTodayItem = ({ item }) => (
    <Pressable
      onPress={() => handlePress(item._id)}
      style={({ pressed }) => [
        styles.habitCard,
        { backgroundColor: item.color },
        pressed && styles.pressedHabitCard,
      ]}
    >
      <Text style={styles.habitTitle}>{item.title}</Text>
    </Pressable>
  );

  const renderWeeklyItem = ({ item }) => (
    <Pressable
      onPress={() => handlePress(item._id)}
      style={({ pressed }) => [
        styles.habitCard,
        { backgroundColor: item.color },
        pressed && styles.pressedHabitCard,
      ]}
    >
      <View style={styles.habitHeader}>
        <Text style={styles.habitTitle}>{item.title}</Text>
        <Text style={styles.habitRepeatMode}>{item.repeatMode}</Text>
      </View>
      <View style={styles.daysContainer}>
        {days.map((day) => {
          const isCompleted = item.completed && item.completed[day];
          return (
            <View key={day} style={styles.dayItem}>
              <Text
                style={{
                  color: day === currentDay ? 'red' : 'white',
                  fontWeight: '600',
                }}
              >
                {day}
              </Text>
              {isCompleted ? (
                <FontAwesome
                  name="check-circle"
                  size={20}
                  color="white"
                  style={styles.dayIcon}
                />
              ) : (
                <Feather
                  name="circle"
                  size={20}
                  color="white"
                  style={styles.dayIcon}
                />
              )}
            </View>
          );
        })}
      </View>
    </Pressable>
  );

  const renderOverallItem = ({ item }) => (
    <View>
      <Pressable
        onPress={() => handlePress(item._id)}
        style={({ pressed }) => [
          styles.habitCard,
          { backgroundColor: item.color },
          pressed && styles.pressedHabitCard,
        ]}
      >
        <View style={styles.habitHeader}>
          <Text style={styles.habitTitle}>{item.title}</Text>
          <Text style={styles.habitRepeatMode}>{item.repeatMode}</Text>
        </View>
      </Pressable>
      <View style={styles.completedContainer}>
        <Text style={styles.completedLabel}>Completed On:</Text>
        <Text style={styles.completedDays}>
          {getCompletedDays(item.completed).join(', ') || 'None'}
        </Text>
      </View>
    </View>
  );

  const getRenderItem = () => {
    switch (option) {
      case 'Today':
        return renderTodayItem;
      case 'Weekly':
        return renderWeeklyItem;
      case 'Overall':
        return renderOverallItem;
      default:
        return renderTodayItem;
    }
  };

  const getData = () => {
    if (option === 'Today') {
      return filteredHabits;
    }
    return habits;
  };

  // "No habits today" fallback
  const renderEmptyToday = () => (
    <View style={styles.emptyContainer}>
      <Image
        style={styles.emptyImage}
        source={{
          uri: 'https://cdn-icons-png.flaticon.com/128/10609/10609386.png',
        }}
      />
      <Text style={styles.emptyText}>No habits for today</Text>
      <Text style={styles.emptyText}>Create one?</Text>
      <Pressable
        onPress={() => router.push('/home/habbit/create')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </Pressable>
    </View>
  );

  const getEmptyComponent = () => {
    if (option === 'Today') {
      return renderEmptyToday();
    }
    return null;
  };

  const renderStaticTop = () => {
    return (
      <View style={styles.staticTopContainer}>
        <WeekCalendar />
      </View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeaderContainer}>
      <View style={styles.optionContainer}>
        {['Today', 'Weekly', 'Overall'].map((opt) => (
          <Pressable
            key={opt}
            onPress={() => setOption(opt)}
            style={[
              styles.optionButton,
              option === opt && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                option === opt && styles.selectedOptionText,
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        ))}
        <AntDesign
          onPress={() => router.push('/home/habbit/create')}
          name="plus"
          size={24}
          color="black"
          style={styles.addIcon}
        />
      </View>
      <Text style={styles.sectionTitle}>Progress</Text>
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Top portion that remains static */}
      {renderStaticTop()}

      {/* Now the FlatList (scrollable) starts at the "Progress" title */}
      <FlatList
        data={getData()}
        keyExtractor={(item) => item._id}
        renderItem={getRenderItem()}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={getEmptyComponent()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/** 
       * Built-in React Native <Modal>. 
       * Always mounted, but only visible when selectedHabit != null.
       * We use a semi-transparent overlay and a "bottom sheet" style box.
       */}
      <Modal
        visible={!!selectedHabit}
        transparent
        animationType="slide"
        onRequestClose={closeModal}  // Android hardware back button support
      >
        {/* BACKDROP */}
        <Pressable
          style={styles.modalBackdrop}
          onPress={closeModal}
        >
          <View style={styles.modalBox}>
            {/* Tap inside the box won't close the modal, so we need a nested Pressable or ignore pointerEvents */}
            <Text style={styles.modalTitle}>
              {selectedHabit ? selectedHabit.title : 'Habit Title'}
            </Text>

            {/* Completed Option */}
            <Pressable
              onPress={handleCompletion}
              style={[styles.modalOption, isDeleting && styles.disabledOption]}
              disabled={isDeleting}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={isDeleting ? 'gray' : 'black'}
              />
              <Text style={styles.modalOptionText}>Completed</Text>
            </Pressable>

            {/* Skip Option */}
            <Pressable
              style={styles.modalOption}
              onPress={handleSkip}
            >
              <Feather name="skip-forward" size={24} color="black" />
              <Text>Skip</Text>
            </Pressable>

            {/* Edit Option */}
            <Pressable
              onPress={handleUpdate}
              style={styles.modalOption}
            >
              <Feather name="edit-2" size={24} color="black" />
              <Text>Edit</Text>
            </Pressable>

            {/* Delete Option */}
            <Pressable
              onPress={deleteHabit}
              style={[styles.modalOption, isDeleting && styles.disabledOption]}
              disabled={isDeleting}
            >
              <AntDesign
                name="delete"
                size={24}
                color={isDeleting ? 'gray' : 'black'}
              />
              <Text style={styles.modalOptionText}>Delete</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default Habbitscreen;

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1ebed',
  },
  staticTopContainer: {},
  optionContainer: {
    marginHorizontal: 9,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#db2859',
  },
  optionText: {
    color: 'black',
    fontSize: 14,
  },
  selectedOptionText: {
    color: 'white',
  },
  addIcon: {
    marginLeft: 'auto',
    marginRight: 10,
  },
  listHeaderContainer: {
    paddingHorizontal: 15,
    backgroundColor: '#f1ebed',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 5,
    marginHorizontal: 10,
  },
  habitCard: {
    marginVertical: 7,
    marginHorizontal: 23,
    padding: 11,
    borderRadius: 10,
    justifyContent: 'center',
  },
  pressedHabitCard: {
    opacity: 0.7,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
  },
  habitRepeatMode: {
    fontSize: 14,
    color: 'white',
  },
  daysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  dayItem: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dayIcon: {
    marginTop: 5,
  },
  emptyContainer: {
    marginTop: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 'auto',
  },
  emptyImage: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#0071c5',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // semi-transparent backdrop
    justifyContent: 'flex-end',         // pushes the box to the bottom
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    // optional: fixed height or min-height
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000',
  },
  disabledOption: {
    opacity: 0.5,
  },
});
