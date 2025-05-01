import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Для всех уведомлений показываем как обычно
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Функция для регистрации push-уведомлений
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log("status in ios", existingStatus);
    
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log("not granted");
      alert('Не удалось получить разрешение на отправку push-уведомлений!');
      return;
    }
    
    console.log("Device.deviceName = ", Device.deviceName);
    

    try {
      console.log("Запрашиваем токен с projectId:", '2163ede9-aad0-446c-9528-95a99fdb5c5e');
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '2163ede9-aad0-446c-9528-95a99fdb5c5e'
      })).data;
      console.log("Токен получен:", token);
    } catch (error) {
      console.error("Ошибка при получении токена:", error);
    }
    console.log("Полученный токен:", token);
    if (!token) {
      console.log("Токен не был получен");
      // Проверяем статус разрешений еще раз
      const { status } = await Notifications.getPermissionsAsync();
      console.log("Текущий статус разрешений:", status);
      
      // Проверяем настройки проекта
      console.log("Project ID:", '2163ede9-aad0-446c-9528-95a99fdb5c5e');
      
      // Проверяем тип устройства
      console.log("Тип устройства:", Device.deviceName);
      console.log("Платформа:", Platform.OS);
      console.log("Версия:", Platform.Version);
    }
  } else {
    alert('Push-уведомления не работают на эмуляторе!');
    return;
  }

  return token;
}

// Функция для отправки локального уведомления
export async function sendLocalNotification(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // null означает показать немедленно
  });
}

// Функция для настройки обработчика входящих уведомлений
export function setupNotificationHandler(onNotification) {
  const notificationListener = Notifications.addNotificationReceivedListener(onNotification);
  
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log(response);
  });

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
} 