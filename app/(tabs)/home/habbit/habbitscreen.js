import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
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

// --- IMPORT THE PROGRESS BAR COMPONENT ---
import ProgressBar from './progressbar';

const Habbitscreen = () => {
  const [option, setOption] = useState('Today');
  const router = useRouter();
  const [habits, setHabits] = useState([]);
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
        if (storedUserId) {
          setUserId(storedUserId);
          fetchHabits(storedUserId);
        } else {
          router.replace('/(authenticate)/login');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to initialize user data.');
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (isFocused && userId) {
      fetchHabits(userId);
    }
  }, [isFocused, userId]);

  const fetchHabits = async (userIdParam) => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://192.168.100.5:3001/habitslist', {
        params: { userId: userIdParam },
      });
      setHabits(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch habits.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open the modal by setting the selected habit
  const handlePress = (habitId) => {
    const habit = habits.find((h) => h._id === habitId);
    if (!habit) {
      Alert.alert('Error', 'Selected habit not found.');
      return;
    }
    setSelectedHabit(habit);
  };

  // Close the modal
  const closeModal = () => {
    setSelectedHabit(null);
  };

  // Mark habit as completed
  const handleCompletion = async () => {
    try {
      if (!selectedHabit) {
        Alert.alert('Error', 'No habit selected.');
        return;
      }
      const habitId = selectedHabit._id;
      const updatedCompletion = {
        ...selectedHabit.completed,
        [currentDay]: true,
      };
      const updatedHabitData = {
        completed: updatedCompletion,
        userId,
      };
      const response = await axios.put(
        `http://192.168.100.5:3001/habits/${habitId}`,
        updatedHabitData
      );
      if (response.status === 200) {
        Alert.alert('Success', 'Habit marked as completed!');
        await fetchHabits(userId);
        closeModal();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update habit.');
    }
  };

  // Update habit (navigate to update screen)
  const handleUpdate = () => {
    if (!selectedHabit || !selectedHabit._id) {
      Alert.alert('Error', 'No habit selected.');
      return;
    }
    closeModal();
    setTimeout(() => {
      router.push({
        pathname: '/home/habbit/update',
        params: { habitId: selectedHabit._id },
      });
    }, 200);
  };

  const handleView = () => {
    if (!selectedHabit || !selectedHabit._id) {
      Alert.alert('Error', 'No habit selected.');
      return;
    }
    closeModal();
    setTimeout(() => {
      router.push({
        pathname: '/home/habbit/view',
        params: { habitId: selectedHabit._id },
      });
    }, 200);
  };

  // Delete a habit
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
              setIsDeleting(true);
              const habitId = selectedHabit._id;
              const response = await axios.delete(
                `http://192.168.100.5:3001/habits/${habitId}`,
                { data: { userId } }
              );
              if (response.status === 200) {
                Alert.alert('Success', 'Habit deleted successfully!');
                await fetchHabits(userId);
                closeModal();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Skip a habit for today
  const handleSkip = async () => {
    try {
      if (!selectedHabit) {
        Alert.alert('Error', 'No habit selected.');
        return;
      }
      const habitId = selectedHabit._id;
      const updatedSkipped = {
        ...(selectedHabit.skipped || {}),
        [currentDay]: true,
      };
      const updatedHabitData = {
        skipped: updatedSkipped,
        userId,
      };
      const response = await axios.put(
        `http://192.168.100.5:3001/habits/${habitId}`,
        updatedHabitData
      );
      if (response.status === 200) {
        Alert.alert('Success', 'Habit skipped for today!');
        await fetchHabits(userId);
        closeModal();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to skip habit.');
    }
  };

  const getCompletedDays = (completedObj) => {
    if (completedObj && typeof completedObj === 'object') {
      return Object.keys(completedObj).filter((day) => completedObj[day]);
    }
    return [];
  };

  // Filter logic (for "Today" we exclude anything that is completed or skipped)
  const filteredHabits = habits.filter((habit) => {
    if (option === 'Today') {
      const isCompletedToday = habit.completed?.[currentDay] === true;
      const isSkippedToday = habit.skipped?.[currentDay] === true;
      return !isCompletedToday && !isSkippedToday;
    }
    return true;
  });

  // Calculate Daily Progress
  const totalHabitsForToday = habits.length;
  const doneHabitsForToday = habits.reduce((count, habit) => {
    const isCompleted = habit.completed?.[currentDay] === true;
    const isSkipped = habit.skipped?.[currentDay] === true;
    return isCompleted || isSkipped ? count + 1 : count;
  }, 0);

  // Render items
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
        <Text style={styles.completedLabel}>Completed On: </Text>
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

  const renderEmptyToday = () => (
    <View style={styles.emptyContainer}>
      <Image
        style={styles.emptyImage}
        source={require('../../../../assets/sleep.png')}
      />
      <Text style={styles.emptyText}>No habits for today</Text>
      <AntDesign name="pluscircle" size={30} color="#db2859" />
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

      {/* ONLY show the ProgressBar if user is on 'Today' */}
      {option === 'Today' && (
        <ProgressBar
          step={doneHabitsForToday}
          steps={totalHabitsForToday}
          height={6}
        />
      )}

      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStaticTop()}

      <FlatList
        data={getData()}
        keyExtractor={(item) => item._id}
        renderItem={getRenderItem()}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={getEmptyComponent()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* MODAL for Habit Options */}
      <Modal
        visible={!!selectedHabit}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={closeModal}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {selectedHabit ? selectedHabit.title : 'Habit Title'}
            </Text>
            
            <View style={styles.divider} />

            {/* Two-column container for first four actions */}
              <Pressable
                onPress={handleCompletion}
                style={[
                  styles.modalOption,
                  styles.twoColumnOption,
                  isDeleting && styles.disabledOption,
                ]}
                disabled={isDeleting}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={isDeleting ? 'gray' : '#db2859'}
                />
                <Text style={styles.modalOptionText}>Completed</Text>
              </Pressable>

              <Pressable
                onPress={handleView}
                style={[
                  styles.modalOption,
                  styles.twoColumnOption,
                  isDeleting && styles.disabledOption,
                ]}
                disabled={isDeleting}
              >
                <Ionicons
                  name="eye-outline"
                  size={24}
                  color={isDeleting ? 'gray' : '#db2859'}
                />
                <Text style={styles.modalOptionText}>View</Text>
              </Pressable>

              <Pressable
                style={[styles.modalOption, styles.twoColumnOption]}
                onPress={handleSkip}
              >
                <Ionicons
                  name="play-skip-forward-outline"
                  size={24}
                  color="#db2859"
                />
                <Text style={styles.modalOptionText}>Skip</Text>
              </Pressable>

              <Pressable
                onPress={handleUpdate}
                style={[styles.modalOption, styles.twoColumnOption]}
              >
                <Ionicons
                  name="create-outline"
                  size={24}
                  color="#db2859"
                />
                <Text style={styles.modalOptionText}>Edit</Text>
              </Pressable>

            {/* Centered single row for Delete */}
            <Pressable
              onPress={deleteHabit}
              style={[
                styles.modalOption,
                isDeleting && styles.disabledOption,
              ]}
              disabled={isDeleting}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={isDeleting ? 'gray' : '#db2859'}
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
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 10,
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
  completedContainer: {
    flexDirection: 'row',
    marginHorizontal: 25,
    marginTop: 5,
    alignItems: 'center',
    marginBottom: 10
  },
  completedLabel: {
    fontWeight: '600',
  },
  completedDays: {
    marginTop: 2,
    fontStyle: 'italic',
  },

  // MODAL
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    minHeight: 200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 15,
    marginVertical: 4,
  },
  modalOptionText: {
    fontSize: 14,
    color: '#000',
  },
  disabledOption: {
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(213, 220, 230, 0.46)',
    marginVertical: 5,
  },

  // NEW/UPDATED STYLES FOR TWO-COLUMN LAYOUT
  modalOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',           // Allow wrapping to the next line
    justifyContent: 'space-between',
    marginLeft: 15
  },
  twoColumnOption: {
    width: '40%',               // Adjust as needed (48% or 49%)
  },
  deleteRow: {
    alignSelf: 'center',        // Center horizontally
    marginTop: 20,
  },
});
