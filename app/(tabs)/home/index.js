import React, { useState } from 'react';
import { View } from 'react-native';
import Toggle from './toggle';
import Todo from './todo/todo';
import Habbitscreen from './habbit/habbitscreen';

const index = () => {
    const [activeScreen, setActiveScreen] = useState('todo');

    return (
        <View style={{ flex: 1 }}>
            <Toggle onTabChange={(tab) => setActiveScreen(tab)} />
            {activeScreen === 'todo' ? <Todo /> : <Habbitscreen />}
        </View>
    );
};

export default index;
