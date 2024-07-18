import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        if (userID && password) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'HomeScreen' }, { name: 'ConnectDevice' }],
            });
        } else {
            Alert.alert('Required', 'Please enter both UserID and Password to proceed.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter UserID"
                value={userID}
                onChangeText={setUserID}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button
                title="Login"
                onPress={handleLogin}
            />
            <Text style={styles.helpText}>Need help? Email us at help@mazoutelectric.com</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    helpText: {
        textAlign: 'center',
        color: 'gray',
        marginTop: 20,
        fontSize: 12,
    },
});

export default LoginScreen;
