import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CourierData, Order } from '@/types/interfaces';
import { apiService } from '@/api/services';
import { updateCourierData } from '@/utils/storage';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, setupNotificationHandler } from '@/notification';
import { saveNotificationTokenData } from '@/utils/storage';
import OrderNotification from '@/components/OrderNotification';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [courier, setCourier] = useState<CourierData | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const [isOrderAccepted, setIsOrderAccepted] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
    const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    const fetchCourierData = async () => {
        try {
            const res = await apiService.getData();
            if (res.success && res.userData) {
                await updateCourierData(res.userData);
                setCourier(res.userData);
                return res.userData._id;
            }
            return null;
        } catch (error) {
            console.error('Ошибка при получении данных курьера:', error);
            Alert.alert('Ошибка', 'Не удалось получить данные курьера');
            return null;
        }
    };

    const requestPermissions = async () => {
        try {
            // Запрашиваем разрешения на геолокацию
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            setLocationPermissionGranted(locationStatus === 'granted');
            
            // Запрашиваем разрешения на уведомления
            const { status: notificationStatus } = await Notifications.getPermissionsAsync();
            if (notificationStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                setNotificationPermissionGranted(status === 'granted');
            } else {
                setNotificationPermissionGranted(true);
            }
            
            return locationStatus === 'granted';
        } catch (error) {
            console.error('Ошибка при запросе разрешений:', error);
            return false;
        }
    };

    useEffect(() => {
        const cleanup = setupNotificationHandler(async (notification: any) => {
            console.log("sdkmflskdmflsdkfm")
            try {
                if (!courier?._id) {
                    const res = await apiService.getData();
                    if (res.success && res.userData) {
                        await updateCourierData(res.userData);
                        setCourier(res.userData);
                    } else {
                        console.error('Не удалось получить данные курьера');
                        return;
                    }
                }
                
                if (notification.request.content.title === "newOrder") {
                    const orderData = notification.request.content.data.order;
                    if (orderData) {
                        setCurrentOrder(orderData);
                        setShowNotification(true);
                        setIsOrderAccepted(false);
                    }
                }

                if (notification.request.content.title === "getLocation" && courier?._id) {
                    try {
                        // Проверяем, есть ли разрешение на геолокацию
                        if (!locationPermissionGranted) {
                            const granted = await requestPermissions();
                            if (!granted) return;
                        }

                        let loc = await Location.getCurrentPositionAsync({
                            accuracy: Location.Accuracy.Balanced
                        });

                        const timestamp = new Date(loc.timestamp);
                        timestamp.setHours(timestamp.getHours() + 5);

                        await apiService.updateData(courier._id, "point", {
                            lat: loc.coords.latitude,
                            lon: loc.coords.longitude,
                            timestamp: timestamp
                        });
                    } catch (error) {
                        console.error('Ошибка при получении геолокации:', error);
                    }
                }
            } catch (error) {
                console.error('Ошибка обработки уведомления:', error);
            }
        });

        return () => cleanup();
    }, []);

    const handleAcceptOrder = () => {
        if (currentOrder) {
            setIsOrderAccepted(true);
        }
    };
    
    const handleDeclineOrder = () => {
        setShowNotification(false);
        setCurrentOrder(null);
        setIsOrderAccepted(false);
    };
    
    const handleTimeout = () => {
        setShowNotification(false);
        setCurrentOrder(null);
        setIsOrderAccepted(false);
    };

    const hideNotification = () => {
        setShowNotification(false);
    };

    const getNotificationToken = async () => {
        try {
            // Проверяем, есть ли разрешение на уведомления
            if (!notificationPermissionGranted) {
                const { status } = await Notifications.requestPermissionsAsync();
                console.log("_layout.tsx status = ", status);
                
                if (status !== 'granted') return;
            }
            
            const token = await registerForPushNotificationsAsync();
            console.log("_layout.tsx token = ", token);
            
            if (token) {
                await saveNotificationTokenData({ notificationPushToken: token });
                
                // Обновляем токен на сервере только если есть courier._id
                if (courier?._id) {
                    await apiService.updateData(courier._id, "notificationPushToken", token);
                }
            }
        } catch (error) {
            console.error('Ошибка при получении токена уведомлений:', error);
        }
    };

    useEffect(() => {
        fetchCourierData();
    }, []);

    useEffect(() => {
        if (courier?._id) {
            getNotificationToken();
        }
    }, [courier?._id]);

    return (
        <>
            <SafeAreaProvider>
                <Stack screenOptions={{ headerShown: false }} initialRouteName='start'>
                    <Stack.Screen name="start" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="otp" />
                    <Stack.Screen name="registerAccepted" />

                    <Stack.Screen name="main" />
                    <Stack.Screen name="orderStatus" />
                    <Stack.Screen name="success" />
                    <Stack.Screen name="cancelled" />
                    <Stack.Screen name="cancelledReason" />

                    <Stack.Screen name="settings" />
                    <Stack.Screen name="changeData" />
                    <Stack.Screen name="analytics" />
                    
                    <Stack.Screen name="deliveredBottles" />
                    <Stack.Screen name="history" />
                    <Stack.Screen name="orderHistoryData" />
                    <Stack.Screen name="finance" />
                </Stack>
                <StatusBar style="auto" />
                {currentOrder && (
                    <OrderNotification
                        isVisible={showNotification}
                        onAccept={handleAcceptOrder}
                        onDecline={handleDeclineOrder}
                        onTimeout={handleTimeout}
                        hideNotification={hideNotification}
                        order={currentOrder}
                    />
                )}
            </SafeAreaProvider>
        </>
    )
}
