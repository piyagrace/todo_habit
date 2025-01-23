# Welcome to To-Do Habit app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Open Directory and Install Dependencies.

   ```bash
   npm install
   ```

2. On the /App folder, ctrl f to search 'localhost' in each .js file and change it with your ip address. 

   ex. 'http://localhost:3001/users/${uid}/todos' > 'http://192.100.3.90:3001/users/${uid}/todos'

   * Check your ip address by opening cmd and look for IPV4 Address.

   ```bash
    ipconfig
   ```

3. Run the Server.

   ```bash
    cd api
   ```

   ```bash
    npm start
   ```

2. To run the app, make sure you have currently running android device in your device.

   ```bash
    cd app
   ```

   ```bash
    npm run
   ```

   ```bash
    a
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

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
