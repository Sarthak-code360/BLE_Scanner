import { NativeEventEmitter, NativeModules, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from "react";
import BleManager from 'react-native-ble-manager';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { FlatList } from "react-native-gesture-handler";
import RippleEffect from "./RippleEffect";
import { AUTH_SERVICE_UUID, BROD_SG_CHAR_UUID, BROD_SN_CHAR_UUID, DISP_UUID, CHAL_CHAR_UUID, SIG_CHAR_UUID } from "./BleConstants";

const ConnectDevice = () => {

    const [isScanning, setScanning] = useState(false);
    const [bleDevices, setDevices] = useState([]);
    const [currentDevice, setCurrentDevice] = useState<any>(null);

    const BleManagerModule = NativeModules.BleManager;
    const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

    // const PUBLIC_KEY_HEX = [
    //     0x9F, 0xE8, 0xB8, 0xFA, 0x1F, 0x60, 0xBC, 0x61, 0x44, 0x7A, 0x57, 0x5E, 0x6B, 0xDA, 0xDE, 0xC9, 0xE7, 0x9B, 0x0E, 0xBF,
    //     0x60, 0xE6, 0x0A, 0x27, 0xA6, 0xBA, 0x9A, 0x1C, 0xAA, 0x60, 0xBE, 0x03, 0x68, 0x13, 0xBC, 0xD3, 0x28, 0x6A, 0x2D, 0x3E,
    //     0x65, 0xC5, 0xF6, 0x61, 0x61, 0x31, 0x1C, 0x4A, 0x1E, 0x57, 0x69, 0x42, 0xF7, 0xEA, 0x8E, 0x46, 0xC2, 0xF3, 0x16, 0xAB,
    //     0xDB, 0x25, 0x0A, 0xC8
    // ];

    useEffect(() => {
        BleManager.start({ showAlert: false }).then(() => {
            console.log('Module initialized');
        });

        BleManager.enableBluetooth().then(() => {
            console.log("Bluetooth is turned on!");
            requestPermission();
        }).catch((error) => {
            console.log("The user refused to enable bluetooth", error);
        });

        const stopListener = BleManagerEmitter.addListener('BleManagerStopScan', () => {
            setScanning(false);
            handleGetConnectedDevices();
            console.log('Scan stopped');
        });

        const disconnected = BleManagerEmitter.addListener('BleManagerDisconnectPeripheral', peripheral => {
            console.log('Disconnected Device', peripheral);
            if (currentDevice?.id === peripheral.id) {
                setCurrentDevice(null);
            }
        });

        const characteristicValueUpdate = BleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', data => {
            readCharacteristicFromEvent(data);
        });

        return () => {
            stopListener.remove();
            disconnected.remove();
            characteristicValueUpdate.remove();
        };
    }, [currentDevice]);

    const requestPermission = async () => {
        try {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        } catch (error) {
            console.log('Permission request failed', error);
        }
    };

    const startScanning = () => {
        if (!isScanning) {
            BleManager.scan([], 10, false).then(() => {
                console.log('Scan started...');
                setScanning(true);
            }).catch((error) => {
                console.log('Scan failed to start', error);
            });
        }
    };

    const handleGetConnectedDevices = () => {
        BleManager.getDiscoveredPeripherals().then((result: any) => {
            if (result.length === 0) {
                console.log("No Device Found");
                startScanning();
            } else {
                const allDevices = result.filter((item: any) => item.name !== null);
                setDevices(allDevices);
            }
            console.log("Discovered peripherals: " + result);
        }).catch((error) => {
            console.log("Failed to get discovered peripherals", error);
        });
    };

    const onConnect = async (item: any) => {
        try {
            await BleManager.connect(item.id);
            setCurrentDevice(item);
            const result = await BleManager.retrieveServices(item.id);
            console.log('Device Connected', result);
            onServiceDiscovered(result, item);
        } catch (error) {
            console.log("Error in connecting", error);
        }
    };

    // Logic for Authorization
    const onServiceDiscovered = async (result: any, item: any) => {
        console.log('Service Discovered', result);

        // Extract services and characteristics
        const services = result.services;
        const characteristics = result.characteristics;

        for (const service of services) {

            const serviceUUID = service.uuid;
            for (const characteristic of characteristics) {
                const characteristicUUID = characteristic.characteristic;
                if (serviceUUID === AUTH_SERVICE_UUID) {
                    // Read characteristics for AUTH_SERVICE_UUID
                    if (characteristicUUID === BROD_SG_CHAR_UUID || characteristicUUID === BROD_SN_CHAR_UUID) {
                        try {
                            const value = await BleManager.read(item.id, serviceUUID, characteristicUUID);
                            const hexValue = byteToString(value);
                            console.log(`Read from ${characteristicUUID}:`, hexValue);
                            const description = await BleManager.readDescriptor(item.id, serviceUUID, characteristicUUID, DISP_UUID);
                            console.log(`Description: ${DISP_UUID}: `, byteToASCII(description))
                        } catch (error) {
                            console.log(`Error reading from ${characteristicUUID}`, error);
                        }
                    }
                }
                // Handle writable characteristics
                if (characteristicUUID === CHAL_CHAR_UUID) {
                    await writeChallenge(item, serviceUUID, characteristicUUID);
                }
            }
        }
    };

    const writeChallenge = async (item: any, serviceUUID: string, characteristicUUID: string) => {
        const randomChallenge = generateRandomChallenge(32);
        const chunkSize = 4;

        for (let i = 0; i < randomChallenge.length; i += chunkSize) {
            const chunk = randomChallenge.slice(i, i + chunkSize);
            try {
                await BleManager.write(item.id, serviceUUID, characteristicUUID, chunk);
                console.log(`Written to ${characteristicUUID} (chunk ${i / chunkSize + 1}):`, byteToString(chunk));
            } catch (error) {
                console.log(`Error writing to ${characteristicUUID}`, error);
            }
        }

        // Read back the data written to the characteristic
        await readBackChallenge(item, serviceUUID, characteristicUUID);
    };

    const readBackChallenge = async (item: any, serviceUUID: string, characteristicUUID: string) => {
        try {
            // Read from CHAL_CHAR_UUID
            const chalValue = await BleManager.read(item.id, serviceUUID, characteristicUUID);
            console.log(`Read back from ${characteristicUUID}:`, byteToString(chalValue));
        } catch (error) {
            console.log(`Error reading back from ${characteristicUUID}`, error);
        }

        try {
            // Read from SIG_CHAR_UUID
            const sigValue = await BleManager.read(item.id, serviceUUID, SIG_CHAR_UUID);
            console.log(`Read from SIG_CHAR_UUID:`, byteToString(sigValue));
        } catch (error) {
            console.log(`Error reading from SIG_CHAR_UUID`, error);
        }
    };

    // The rest of your existing code remains the same.
    const readCharacteristicFromEvent = (data: any) => {
        const { characteristic, value } = data;
        console.log('Characteristic Value Update:', { characteristic, value });
        if (characteristic === BROD_SG_CHAR_UUID) {
            const bcast_key = byteToString(value);
            console.log("Broadcast Signature Generated", bcast_key);
        }
        if (characteristic === BROD_SN_CHAR_UUID) {
            const bcast_key = byteToString(value);
            console.log("Broadcast Serial Number", bcast_key);
        }
        if (characteristic === CHAL_CHAR_UUID) {
            const chal_key = byteToString(value);
            console.log("Challenge Key", chal_key);
        }
        if (characteristic === SIG_CHAR_UUID) {
            const sig_key = byteToString(value);
            console.log("Signature Key", sig_key);
        }
    };

    // Helper functions
    const byteToString = (bytes: any) => {
        return bytes.map((byte: number) => byte.toString(16).padStart(2, '0')).join('');
    };

    const byteToASCII = (bytes: any) => {
        return String.fromCharCode.apply(null, new Uint8Array(bytes));
    };

    const generateRandomChallenge = (size: number = 32): number[] => {
        return Array.from({ length: size }, () => Math.floor(Math.random() * 256));
    };


    const onDisconnect = async (item: any) => {
        try {
            await BleManager.disconnect(item.id);
            console.log('Disconnected');
            if (currentDevice?.id === item.id) {
                setCurrentDevice(null);
            }
        } catch (error) {
            console.log("Error in disconnecting", error);
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <View style={styles.bleCard}>
                <Text style={styles.bleTxt}>{item.name}</Text>
                <TouchableOpacity onPress={() => { currentDevice?.id === item?.id ? onDisconnect(item) : onConnect(item) }} style={styles.button}>
                    <Text style={styles.btnTxt}>{currentDevice?.id === item?.id ? "Disconnect" : "Connect"}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {isScanning ? <View style={styles.rippleView}>
                <RippleEffect />
            </View> : <View>
                <FlatList
                    data={bleDevices}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                />
            </View>}
            <TouchableOpacity onPress={() => startScanning()} style={styles.scanBtn}>
                <Text style={styles.btnTxt}>Start Scan</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    rippleView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    bleCard: {
        width: "90%",
        padding: 10,
        alignSelf: "center",
        marginVertical: 10,
        backgroundColor: '#f2d492',
        elevation: 5,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    bleTxt: {
        fontSize: 18,
        fontWeight: 'bold',
        color: "#2c2c2c"
    },
    btnTxt: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff'
    },
    button: {
        width: 100,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        backgroundColor: "#f29559"
    },
    scanBtn: {
        width: "90%",
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#007AFF",
        borderRadius: 5,
        alignSelf: "center",
        marginBottom: hp(2),
        marginTop: 10
    }
});

export default ConnectDevice;
