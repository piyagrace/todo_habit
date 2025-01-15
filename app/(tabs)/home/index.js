import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toggle from './toggle';
import Todo from './todo/todo';
import Habbitscreen from './habbit/habbitscreen';

const index = () => {
    const [activeScreen, setActiveScreen] = useState('todo');

    return (
        <View style={styles.container}>
            <Toggle onTabChange={(tab) => setActiveScreen(tab)} />
            {activeScreen === 'todo' ? <Todo /> : <Habbitscreen />}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1ebed', // Set the background color here
    }
});

export default index;
