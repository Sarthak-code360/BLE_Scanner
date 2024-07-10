import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
    {
        key: '1',
        title: 'Welcome to the App',
        text: 'Here is how you can use the app.',
    },
    {
        key: '2',
        title: 'Step 1',
        text: 'Follow this instruction.',
    },
    {
        key: '3',
        title: 'Step 2',
        text: 'Follow this instruction.',
    },
    {
        key: '4',
        title: 'Get Started',
        text: 'Press the button to get started.',
    },
];

const WelcomeScreen = ({ navigation }) => {
    const [showRealApp, setShowRealApp] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowRealApp(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const renderSlides = ({ item }) => (
        <View style={styles.slide}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
            {item.key === '4' && (
                <Button title="Get Started" onPress={() => navigation.navigate('LoginScreen')} />
            )}
        </View>
    );

    if (!showRealApp) {
        return (
            <View style={styles.splashContainer}>
                <Text style={styles.splashText}>App Name</Text>
            </View>
        );
    }

    return <AppIntroSlider renderItem={renderSlides} data={slides} />;
};

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
    },
});

export default WelcomeScreen;
