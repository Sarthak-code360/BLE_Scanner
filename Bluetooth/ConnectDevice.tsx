import { NativeAppEventEmitter, NativeEventEmitter, NativeModules, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useEffect, useState } from "react"
import { useNavigation } from '@react-navigation/native';
import BleManager from 'react-native-ble-manager'
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { FlatList } from "react-native-gesture-handler"
import RippleEffect from "./RippleEffect"
import { Colors } from "react-native/Libraries/NewAppScreen"
import { AUTH_SERVICE_UUID, BROD_CHAR_UUID, CHAL_CHAR_UUID, SIG_CHAR_UUID } from "./BleConstants";


const ConnectDevice = () => {

    // const [bluetoothDevices, setBluetoothDevices] = useState([]);
    const [isScanning, setScanning] = useState(false)
    const [bleDevices, setDevices] = useState([])
    const BleManagerModule = NativeModules.BleManager
    const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
    const [currentDevice, setCurrentDevice] = useState<any>(null);
    // const [auth_key, setAuthentication] = useState<string | null>(null);
    // const [bcast_key, setBroadcast] = useState<string | null>(null);


    useEffect(() => {
        BleManager.start({ showAlert: false })
            .then(() => {
                // Success code
                console.log('Module initialized')
            });
    }, []);

    useEffect(() => {
        BleManager.enableBluetooth()
            .then(() => {
                //Success code
                console.log("Bluetooth is turned on!");
                requestPermission()
            })
            .catch((error) => {
                //Failure code
                console.log("The user refused to enable bluetooth");
            });
    }, [])

    useEffect(() => {
        let stopListener = BleManagerEmitter.addListener('BleManagerStopScan',
            () => {
                setScanning(false)
                handleGetConnectedDevices()
                console.log('Scan stopped')
            },
        );
        let disconnected = BleManagerEmitter.addListener(
            'BleManagerDisconnectPeripheral',
            peripheral => {
                console.log('Disconnected Device', peripheral);
            },
        );
        // let characteristicValueUpdate = BleManagerEmitter.addListener(
        //     'BleManagerDidUpdateValueForCharacteristic',
        //     data => {
        //         // Handle received data
        //         // bleServices.onCharacteristicChanged(data);

        //         readCharacteristicFromEvent(data)
        //     },
        // );
        // let BleManagerDidUpdateState = BleManagerEmitter.addListener(
        //     'BleManagerDidUpdateState',
        //     data => {
        //         // Handle received data
        //         console.log('BleManagerDidUpdateState Event!', data);
        //     },
        // );


        return () => {
            stopListener.remove();
            disconnected.remove();
            // characteristicValueUpdate.remove();
            // BleManagerDidUpdateState.remove();
        };
    }, []);

    // const handleGetConnectedDevices = () => {
    //     BleManager.getDiscoveredPeripherals().then((results: any) => {
    //         if (results.length == 0) {
    //             console.log('No connected bluetooth devices');
    //             startScanning();
    //         } else {
    //             const allDevices = results.filter((item: any) => item.name !== null)
    //             setBluetoothDevices(allDevices)
    //         }
    //     });
    // };

    // const readCharacteristicFromEvent = (data: any) => {
    //     const { service, characteristic, value } = data

    //     if (characteristic === AUTH_SERVICE_UUID) {
    //         const auth_key = byteToString(value) // retrieve the authentication data
    //         setAuthentication(auth_key)
    //         console.log("Authentication Key", auth_key)
    //     }
    //     if (characteristic === BROD_CHAR_UUID) {
    //         const bcast_key = byteToString(value) // retrieve the Broadcast data
    //         setBroadcast(bcast_key)
    //         console.log("Broadcast Key", bcast_key)
    //     }
    // }

    // // This will convert bytes received to string and print it above auth_key
    // const byteToString = (bytes: any) => {
    //     return String.fromCharCode(...bytes)
    // }

    const requestPermission = async () => {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        // startScanning()
    };

    const startScanning = () => {
        // [UUID], time for scan, if duplicate devices allowed
        if (!isScanning) {
            BleManager.scan([], 10, false)
                .then(() => {
                    // Success code
                    console.log('Scan started...')
                    setScanning(true)
                })
                .catch((error) => {
                    // Failure code
                    console.log('Scan failed to start')
                })
        }
    }

    const handleGetConnectedDevices = () => {
        BleManager.getDiscoveredPeripherals()
            .then((result: any) => {
                if (result.length === 0) {
                    console.log("No Device Found")
                    startScanning()
                } else {
                    // console.log("RESULTS", JSON.stringify(result))
                    const allDevices = result.filter((item: any) => item.name !== null)
                    setDevices(allDevices)
                }
                //Success code
                console.log("Discovered peripherals: " + result);
            })
    }

    const onConnect = async (item: any) => {
        try {
            await BleManager.connect(item.id);
            setCurrentDevice(item)

            const result = await BleManager.retrieveServices(item.id);
            console.log('Result', result);
            console.log('Device Connected')
            onServiceDiscovered(result, item)
        } catch (error) {
            console.log("Error in connecting", error)
        }
    }
    // Services of R PI
    const onServiceDiscovered = (result: any, item: any) => {

        const services = result.services
        const characteristics = result.characteristics

        services.forEach((service: any) => {
            const serviceUUID = service.uuid
            onChangeCharacteristics(serviceUUID, characteristics, item)
        })
    }

    const onChangeCharacteristics = (serviceUUID: any, result: any, item: any) => {
        result.forEach((characteristic: any) => {
            const characteristicUUID = characteristic.characteristic
            // 11.00
            // console.log('Notification Section')
            if (characteristicUUID === AUTH_SERVICE_UUID || characteristicUUID === BROD_CHAR_UUID || characteristicUUID === SIG_CHAR_UUID || characteristicUUID === CHAL_CHAR_UUID) {
                BleManager.startNotification(item.id, serviceUUID, characteristicUUID)
                    .then(() => {
                        console.log('Started notification on ' + item.id)
                    }).catch((error) => {
                        console.log("Error in starting notification", error)
                    })
            }
        })
    }

    const onDisconnect = () => {
        BleManager.disconnect(currentDevice?.id)
            .then(() => {
                setCurrentDevice(null)
                console.log('Disconnected')
            })
            .catch((error) => {
                console.log("Error in disconnecting", error)
            })
    }

    const renderItem = ({ item, index }: any) => {
        return (
            <View style={styles.bleCard}>
                <Text style={styles.bleTxt}>{item.name}</Text>
                <TouchableOpacity onPress={() => { { currentDevice?.id === item?.id ? onDisconnect(item) : onConnect(item) } }} style={styles.button}>
                    <Text style={styles.btnTxt}>{currentDevice?.id === item?.id ? "Disconnect" : "Connect"}</Text>
                </TouchableOpacity>
            </View>
        )
    }

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
    )
}

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
})
export default ConnectDevice;