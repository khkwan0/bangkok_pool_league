# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Android wireless debugging (Wi-Fi)

Use this when you want to run the app on a physical Android device without a USB cable after initial pairing.

1. Connect your Android device and computer to the same Wi-Fi network.
2. Enable developer options and turn on **USB debugging** on your Android device.
3. Enable wireless debugging
4. Connect the device once with USB and verify ADB can see it:

   ```bash
   adb devices
   ```

5. Pair the device if not paired.

Push the button that allows you to pair with a PIN.
then when the pop up shows...use the ip address and port and type

```bash
adb pair <ip address>:<port>
```

6. Find your phone's local IP address (Wi-Fi details on the device), then connect:

   ```bash
   adb connect <DEVICE_IP>:5555
   ```

7. Unplug USB, confirm the device is still connected, then run Expo:

   ```bash
   adb devices
   npx expo start
   ```

To disconnect later:

```bash
adb disconnect <DEVICE_IP>:5555
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
