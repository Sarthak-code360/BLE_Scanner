import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [authStep, setAuthStep] = useState(0); // 0: initial, 1: authenticating, 2: finished
    const [stepMessage, setStepMessage] = useState('');
    const [serialNumber, setSerialNumber] = useState('AA32-B71Z');

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ConnectDevice')}>
                    <MaterialIcons name="bluetooth" size={24} color="white" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleAuthenticate = () => {
        setAuthStep(1);
        setStepMessage('Generating signature...');

        setTimeout(() => {
            setStepMessage('Signature generated ✔️');

            setTimeout(() => {
                setStepMessage('Uploading signature and serial number...');

                setTimeout(() => {
                    setStepMessage('Verifying firmware version using public key...');

                    setTimeout(() => {
                        setAuthStep(2);
                    }, 20000);
                }, 10000);
            }, 3000);
        }, 5000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <Text style={styles.companyName}>Mazout X1</Text>
                <Text style={styles.serialNumber}>Serial Number: {serialNumber}</Text>
            </View>
            {authStep === 0 ? (
                <TouchableOpacity style={styles.authenticateButton} onPress={handleAuthenticate}>
                    <Text style={styles.buttonText}>Authenticate</Text>
                </TouchableOpacity>
            ) : authStep === 1 ? (
                <View style={styles.progressContainer}>
                    <Text style={styles.stepText}>{stepMessage}</Text>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            ) : (
                <View style={styles.progressContainer}>
                    <Text style={styles.finalMessage}>Device authenticated successfully ✔️</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
    },
    topContainer: {
        alignItems: 'center',
    },
    companyName: {
        fontSize: 38,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    serialNumber: {
        fontSize: 18,
        color: '#000',
        textAlign: 'center',
    },
    headerButton: {
        marginRight: 20,
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 20,
    },
    authenticateButton: {
        width: '80%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 10,
        alignSelf: 'center',
        marginBottom: 40,
    },
    buttonText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    stepText: {
        fontSize: 24,
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
    finalMessage: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
        textAlign: 'center',
    },
});

export default HomeScreen;
