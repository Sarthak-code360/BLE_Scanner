import { NativeAppEventEmitter, NativeEventEmitter, NativeModules, PermissionsAndroid, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import React, { useEffect, useState } from "react"
import BleManager from 'react-native-ble-manager'
import { FlatList } from "react-native-gesture-handler"
import RippleEffect from "./RippleEffect"
import { Colors } from "react-native/Libraries/NewAppScreen"


const ConnectDevice = () => {

    const [isScanning, setScanning] = useState(false)
    const [bleDevices, setDevices] = useState([])
    const BleManagerModule = NativeModules.BleManager
    const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

    useEffect(() => {
        BleManager.start({ showAlert: false })
            .then(() => {
                // Success code
                console.log('Module initialized')
            })
    })

    useEffect(() => {
        BleManager.enableBluetooth()
            .then(() => {
                //Success code
                console.log("The bluetooth is already enabled or the user confirmed");
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
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ])

        if (granted) {
            startScanning()
        }
    }

    const startScanning = () => {
        // [UUID], time for scan, if duplicate devices allowed
        if (!isScanning) {
            BleManager.scan([], 10, false)
                .then(() => {
                    // Success code
                    console.log('Scan started')
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

    const renderItem = ({ item, index }: any) => {
        return (
            <View style={styles.bleCard}>
                <Text style={styles.bleTxt}>{item.name}</Text>
                <TouchableOpacity style={styles.button}>
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
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
        backgroundColor: Colors.secondary,
        elevation: 5,
        borderRadius: 5,
        flexDirection: "row",
        justifyContent: "space-between"
    },
    bleTxt: {
        // fontFamily: fonts.bold,
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text
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
        backgroundColor: Colors.primary
    }
})
export default ConnectDevice;