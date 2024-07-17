import { NativeAppEventEmitter, NativeEventEmitter, NativeModules, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useEffect, useState } from "react"
import BleManager from 'react-native-ble-manager'
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { FlatList } from "react-native-gesture-handler"
import RippleEffect from "./RippleEffect"
import { Colors } from "react-native/Libraries/NewAppScreen"


const ConnectDevice = () => {

    const [isScanning, setScanning] = useState(false)
    const [bleDevices, setDevices] = useState([])
    const BleManagerModule = NativeModules.BleManager
    const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
    const [currentDevice, setCurrentDevice] = useState<any>(null);

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
            }
        )
        return () => stopListener.remove()
    }, [])

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
        } catch (error) {
            console.log("Error in connecting", error)
        }
    }

    const renderItem = ({ item, index }: any) => {
        return (
            <View style={styles.bleCard}>
                <Text style={styles.bleTxt}>{item.name}</Text>
                <TouchableOpacity onPress={() => onConnect(item)} style={styles.button}>
                    <Text style={styles.btnTxt}>Connect</Text>
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
        backgroundColor: "#f29559",
        borderRadius: 5,
        alignSelf: "center",
        marginBottom: hp(2)
    }
})
export default ConnectDevice;