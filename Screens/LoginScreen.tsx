import React from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const LoginScreen = ({ navigation }) => (
    <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter UserID" />
        <TextInput
            style={styles.input}
            placeholder="Enter Password"
            secureTextEntry />
        <Button
            title="Login"
            onPress={() => navigation.navigate('ConnectDevice')} />
        <Text style={styles.helpText}>Need help? Email us at help@company.com</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
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