// ProgressBar.js
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const ProgressBar = ({ step = 0, steps = 1, height = 10 }) => {
  // Handle division by zero
  const safeSteps = steps === 0 ? 1 : steps;

  // Calculate the current % (0 - 100)
  const rawPercent = (step / safeSteps) * 100;
  const clampedPercent = Math.min(rawPercent, 100);
  const displayPercent = Math.round(clampedPercent);

  const [width, setWidth] = useState(0);
  const animatedValue = useRef(new Animated.Value(-1000)).current;
  const reactive = useRef(new Animated.Value(-1000)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: reactive,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [animatedValue, reactive]);

  useEffect(() => {
    const progressWidth = (width * step) / safeSteps;
    reactive.setValue(-width + progressWidth);
  }, [step, width, reactive, safeSteps]);

  return (
    <View>
      {/* Row container for "Progress" on left & percent on right */}
      <View style={styles.labelContainer}>
        <Text style={styles.leftText}>Progress</Text>
        <Text style={styles.rightText}>{displayPercent}%</Text>
      </View>

      <View
        style={[styles.progressBackground, { height }]}
        onLayout={(e) => {
          const newWidth = e.nativeEvent.layout.width;
          setWidth(newWidth);
        }}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              height,
              transform: [{ translateX: animatedValue }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',  // pushes text to opposite sides
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 8,
    marginTop: 10
  },
  leftText: {
    fontSize: 17,
    color: '#333',
    fontWeight: '600',
  },
  rightText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  progressBackground: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  progressBar: {
    width: '100%',
    backgroundColor: '#db2859', // or your preferred color
    position: 'absolute',

    left: 0,
    top: 0,
  },
});

export default ProgressBar;
