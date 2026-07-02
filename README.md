# 🗺️ NCH GPS Tracker App

A robust, serverless React Native mobile application built for field teams. This app tracks employee travel routes in the background, automatically calculates exact distances using GPS coordinates, and calculates financial reimbursements in real-time. 

Instead of relying on expensive backend infrastructure like AWS or Firebase, this project creatively uses **Google Apps Script** and **Google Sheets** as a 100% free, scalable backend database.

---

## ✨ Why this exists

Managing field staff travel logs is notoriously difficult. Paper logs are inaccurate, and commercial GPS tracking software is often expensive and overly complex. 

This app was built to solve that problem with a focus on **simplicity and zero running costs**. It gives employees a dead-simple interface to "Start Trip" and "End Trip", while giving administrators a powerful live-tracking dashboard to monitor exactly who is on the road, where they are, and exactly how much they need to be reimbursed based on dynamic per-kilometer rates.

---

## 📱 Key Features

### 👨‍💼 For Employees (Field Staff)
- **One-Tap Tracking:** Start and stop trips with a single tap.
- **Background GPS:** Uses `expo-location` and `expo-task-manager` to accurately track coordinates even when the phone is locked or the app is minimized.
- **Live Earnings Calculation:** Dynamically calculates the distance traveled (using the Haversine formula) and multiplies it by the company's current Per-KM rate to show exact earnings in real-time.
- **Offline Resilience:** If a trip ends in a dead zone (like an underground parking garage), the trip payload is queued in `AsyncStorage` and automatically synced to the cloud the next time the app opens with a network connection.

### 🛡️ For Administrators
- **Hidden Admin Portal:** Secure login portal to access company-wide data.
- **Live Tracking Dashboard:** View exactly who is riding right now, updated automatically every 30 seconds.
- **Trip History & Analytics:** View all historical trips across the entire company, with total payout and distance summaries.
- **Dynamic Rate Control:** Change the global reimbursement rate (e.g., from ₹4.00/km to ₹10.00/km) from the app. The new rate is instantly applied to all employee devices globally.

---

## 🛠️ Tech Stack & Architecture

This project is built to be lightweight, maintainable, and cost-effective.

*   **Frontend Framework:** React Native (Expo)
*   **Navigation:** React Navigation (Stack & Bottom Tabs)
*   **State Management:** React Hooks & Context API
*   **Local Storage:** `@react-native-async-storage/async-storage`
*   **Data Visualization:** `react-native-chart-kit`
*   **Backend Backend:** Google Apps Script (Serverless REST API)
*   **Database:** Google Sheets

### 🧠 The "Google Sheets as a Database" Magic
By deploying a custom Google Apps Script (`doPost` and `doGet`), the Google Sheet is transformed into a RESTful API. 
1. The app sends a JSON payload to the Apps Script URL.
2. The script parses the action (e.g., `save_trip`, `update_location`, `update_settings`).
3. The script sanitizes the data and injects it into specific tabs (*Active Locations*, *Trips*, *Employees*, *Settings*) within the Google Spreadsheet. 

This means **HR and Accounting teams can view the raw database just by opening a Google Sheet**, without needing a custom web dashboard!

---

## 🚀 Getting Started

If you want to run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/your-username/nch-gps-tracker.git
cd nch-gps-tracker
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
```

### 3. Setup your Google Sheet Backend
1. Create a new Google Sheet.
2. Create four tabs: `Trips`, `Active Locations`, `Employees`, `Settings`.
3. Go to **Extensions > Apps Script** and paste the code found in `GoogleAppsScript.js` (located in the root of this repo).
4. In `GoogleAppsScript.js`, change `YOUR_SECRET_KEY_HERE` to a random secure string.
5. Click **Deploy > New Deployment**, select "Web App", set access to "Anyone", and copy the generated Web App URL.

### 4. Configure the App Environment
Create a `.env` file in the root of the app directory and add your credentials:
```env
EXPO_PUBLIC_ADMIN_USERNAME=admin
EXPO_PUBLIC_ADMIN_PASSWORD=your_secure_password
EXPO_PUBLIC_GOOGLE_SHEETS_URL=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
EXPO_PUBLIC_SECRET_KEY=YOUR_SECRET_KEY_HERE
```

### 5. Run the App
```bash
npx expo start
```
Scan the QR code with the Expo Go app on your physical device (Note: Background GPS tracking works best on physical devices, not emulators).

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License
This project is open source and available under the [MIT License](LICENSE).