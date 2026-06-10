# MachineXchange

A full-stack mobile marketplace application for buying and selling hallmarking and assaying machinery. Built with React Native (Expo) for the mobile app, React + Vite for the admin panel, and Firebase as the serverless backend.

---

## 📁 Project Structure

```
MachineXchange/
├── mobile-app/          # React Native (Expo) mobile application
│   ├── src/
│   │   ├── components/  # Reusable UI components (Button, Input, ListingCard)
│   │   ├── screens/     # App screens (Auth & Main flows)
│   │   ├── navigation/  # React Navigation setup (Stack, Tab navigators)
│   │   ├── store/       # Zustand state management stores
│   │   ├── i18n/        # Internationalization (English, Hindi, Gujarati)
│   │   └── types/       # TypeScript type definitions
│   ├── assets/          # App icons, logos, splash screens
│   └── firebase.config.ts
│
├── admin-panel/         # React + Vite admin dashboard
│   ├── src/
│   │   ├── pages/       # Dashboard, Listings, Users, Analytics, etc.
│   │   ├── components/  # Sidebar, Header
│   │   ├── store/       # Zustand stores for admin state
│   │   └── utils/       # Firebase configuration
│   └── public/          # Static assets (logo, favicon)
│
├── backend/             # Express.js backend (routes & migrations)
│   ├── routes/          # API route handlers
│   ├── migrations/      # Database migration scripts
│   └── server.ts        # Server entry point
│
└── README.md
```

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Mobile App     | React Native, Expo, NativeWind      |
| Admin Panel    | React, Vite, Tailwind CSS           |
| State Mgmt     | Zustand                             |
| Database       | Firebase Firestore (Real-time)      |
| Authentication | Firebase Auth                       |
| Image Hosting  | Cloudinary                          |
| Language       | TypeScript                          |

---

## ✨ Features

### Mobile App
- User registration & login with Firebase Auth
- Browse, search, and filter machinery listings
- Create, edit, and delete listings with photo uploads
- Real-time chat between buyers and sellers
- Make offer / fixed price negotiation
- Multi-language support (English, Hindi, Gujarati)
- Dynamic categories synced from admin panel

### Admin Panel
- Dashboard with analytics and activity overview
- Manage all listings (approve, reject, feature, delete)
- User management (view, block/unblock users)
- Category management (add, rename, delete — synced live to the app)
- Reports management (view reported listings, block users)
- Real-time notifications for new listings and reports
- Chat monitoring

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- Expo CLI (`npm install -g expo-cli`)
- Firebase project with Firestore & Auth enabled
- Cloudinary account for image uploads

### Mobile App Setup
```bash
cd mobile-app
npm install
npx expo start
```

### Admin Panel Setup
```bash
cd admin-panel
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Environment Variables
Create `.env` files in the respective directories with your Firebase and Cloudinary credentials.

---

## 📄 License

This project is licensed under the MIT License.
