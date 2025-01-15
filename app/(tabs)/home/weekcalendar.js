// components/WeekCalendar.js
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Dimensions,
} from 'react-native';
import moment from 'moment';

const TOTAL_WEEKS = 1000;
const CURRENT_WEEK_INDEX = Math.floor(TOTAL_WEEKS / 2);

const WeekCalendar = ({ selectedDate }) => {
    const flatListRef = useRef(null);

    const weekOffsets = Array.from({ length: TOTAL_WEEKS }, (_, i) => i - CURRENT_WEEK_INDEX);

    const generateWeekDates = (weekMoment) => {
        const startOfWeek = weekMoment.clone().startOf('week');
        const dates = [];
        for (let i = 0; i < 7; i++) {
            dates.push(startOfWeek.clone().add(i, 'days'));
        }
        return dates;
    };

    const handleEndReached = () => {
        console.log('End reached');
        // Add logic to fetch more data or handle the scroll end
      };
      
    const renderWeek = ({ item: weekOffset }) => {
        const weekMoment = moment().add(weekOffset, 'weeks');
        const weekDates = generateWeekDates(weekMoment);

        return (
            <View style={styles.weekContainer}>
                {weekDates.map((date) => {
                    const dateString = date.format('YYYY-MM-DD');
                    const isSelected = dateString === selectedDate;
                    const isToday = dateString === moment().format('YYYY-MM-DD');

                    return (
                        <View
                            key={dateString}
                            style={[
                                styles.dayContainer,
                                isSelected && styles.selectedDayContainer,
                                isToday && styles.todayDayContainer,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.dayText,
                                    isSelected && styles.selectedDayText,
                                    isToday && styles.todayDayText,
                                ]}
                            >
                                {date.format('ddd')}
                            </Text>
                            <Text
                                style={[
                                    styles.dateText,
                                    isSelected && styles.selectedDateText,
                                    isToday && styles.todayDateText,
                                ]}
                            >
                                {date.format('D')}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index: CURRENT_WEEK_INDEX,
                animated: false,
            });
        }
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={weekOffsets}
                renderItem={renderWeek}
                keyExtractor={(item) => item.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={CURRENT_WEEK_INDEX}
                getItemLayout={(data, index) => ({
                    length: Dimensions.get('window').width,
                    offset: Dimensions.get('window').width * index,
                    index,
                })}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                initialNumToRender={1}
                maxToRenderPerBatch={5}
                windowSize={5}
            />

        </View>
    );
};

export default WeekCalendar;

const styles = StyleSheet.create({
    container: {
        height: 85, // Adjusted for larger day containers
    },
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: Dimensions.get('window').width,
        paddingVertical: 10,
    },
    dayContainer: {
        width: 40, // Increased width
        height: 55, // Increased height
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        borderRadius: 40, // Fully rounded sides
        borderWidth: 1,
        borderColor: '#ddd', // Light grey border
        elevation: 2, // Subtle shadow for depth
    },
    selectedDayContainer: {
        backgroundColor: '#007FFF',
    },
    todayDayContainer: {
        borderWidth: 2,
        borderColor: '#ff5a5f', // Highlight today with a blue border
    },
    dayText: {
        fontSize: 12, // Larger font size for better visibility
        color: '#555',
    },
    selectedDayText: {
        color: 'white',
        fontWeight: 'bold',
    },
    todayDayText: {
        color: '#ff5a5f',
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 13, // Larger date text
        color: '#555',
    },
    selectedDateText: {
        color: 'white',
        fontWeight: 'bold',
    },
    todayDateText: {
        color: '#ff5a5f',
        fontWeight: 'bold',
    },
});
