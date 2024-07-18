import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Button } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const slides = [
    {
        key: '1',
        title: 'Please follow the instructions',
    },
    {
        key: '2',
        title: 'Step 1',
        text: 'Plug-in the USB adaptor to the device.',
        image: require('../assets/Plugin.jpeg'),
    },
    {
        key: '3',
        title: 'Step 2',
        text: 'Wait for the LED to turn green.',
        image: require('../assets/Led.jpeg'),
    },
    {
        key: '4',
        title: 'Step 3',
        text: 'Allow the application to access location.',
        image: require('../assets/LocationAccess.jpeg'),
    },
    {
        key: '5',
        title: 'Step 4',
        text: 'Allow the application to access Bluetooth.',
        image: require('../assets/BluetoothAccess.jpeg'),
    },
    {
        key: '6',
        title: 'Experience a digital connect with your vehicle.',
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
            {item.text && <Text style={styles.text}>{item.text}</Text>}
            {item.image && <Image source={item.image} style={styles.image} />}
            {item.key === '6' && (
                <View style={styles.buttonContainer}>
                    <Button title="Get Started" onPress={() => navigation.navigate('LoginScreen')} />
                </View>
            )}
        </View>
    );

    if (!showRealApp) {
        return (
            <View style={styles.splashContainer}>
                <Text style={styles.splashText}>Mazout X1</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppIntroSlider
                renderItem={renderSlides}
                data={slides}
                dotStyle={styles.dotStyle}
                activeDotStyle={styles.activeDotStyle}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    splashText: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'contain',
        marginVertical: 20,
    },
    dotStyle: {
        backgroundColor: '#000',
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 3,
    },
    activeDotStyle: {
        backgroundColor: '#007AFF',
        width: 20,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 3,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 80,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default WelcomeScreen;
