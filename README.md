# MachineXchange

> A specialized B2B marketplace for buying and selling pre-owned hallmarking and jewellery-testing equipment — built for the Indian jewellery industry.

---

## What is MachineXchange?

MachineXchange is a full-stack mobile marketplace application designed specifically for businesses in the Indian jewellery industry — including hallmarking centres, jewellers, refiners, and assayers. It gives them a trusted, dedicated platform to buy and sell expensive pre-owned equipment like XRF machines, micro balances, laser marking machines, and fire assay equipment.

Before MachineXchange, there was no dedicated platform for this niche. Buyers and sellers had to rely on word of mouth, generic classifieds, or expensive OEM channels. MachineXchange changes that by bringing the entire community onto a single, admin-moderated platform with real-time chat, smart filtering, multilingual support, and a clean mobile-first experience.

---

## Project Structure

This is a monorepo — all three parts of the application live together in one repository.

```
MachineXchange/
├── mobile-app/          # React Native (Expo) Android app
├── backend-server/      # Node.js + Express + MySQL REST API + Socket.io
└── admin-panel/         # React (Vite) web dashboard for admins
```

---

## Tech Stack

### Mobile App
| Technology | Purpose |
|---|---|
| React Native (Expo) | Cross-platform mobile framework |
| NativeWind (Tailwind CSS) | Styling |
| Firebase Auth | User authentication (login/register) |
| Firebase Firestore | Real-time notifications and categories |
| Socket.io Client | Real-time live chat |
| Cloudinary | Image hosting for listing photos |
| Expo Router / React Navigation | Screen navigation |
| Zustand | Global state management |
| i18next | Multilingual support (EN / HI / GU) |
| EAS Build | Cloud-based Android APK/AAB generation |

### Backend Server
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety |
| MySQL + Sequelize ORM | Relational database |
| Socket.io | Real-time bidirectional chat |
| JWT (JSON Web Tokens) | API authentication middleware |
| Multer | Handling image file uploads |
| dotenv | Environment variable management |

### Admin Panel
| Technology | Purpose |
|---|---|
| React + Vite | Fast web dashboard |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Firebase Firestore | Reading live app data |
| Recharts | Analytics charts and graphs |

---

## Features

### For Users (Mobile App)

**Authentication**
- Register with full name, company name, city, state, and user type (Hallmarking Centre, Jeweller, Refiner, Assayer)
- Secure login with email and password
- Password visibility toggle (eye icon) on login and register screens
- Forgot password flow via Firebase email reset
- New accounts are held in a "Pending Approval" state and only activated after admin review

**Home Feed**
- Browse all active, admin-approved equipment listings
- Filter listings by **Category** using a clean dropdown (XRF Machines, Micro Balances, Laser Marking, Fire Assay Equipment)
- Filter listings by **City** using a dynamic dropdown — cities are automatically added as new listings come in, no manual updates needed
- Full-text **Search** across title, brand, model, description, category, city, state, and country
- All three filters work simultaneously

**Listing Details**
- Full equipment details: brand, model, year of purchase, years used, condition, warranty, pricing type (Fixed Price or Make an Offer), and location
- Multiple listing photos
- Direct "Chat with Seller" button to open a real-time conversation
- Make an offer directly from the listing

**Create a Listing**
- Select category from a clean dropdown
- Enter brand, model, year, years used, condition, warranty, price
- Choose between Fixed Price and Make an Offer pricing
- Upload up to 5 photos from the device gallery
- Listings go into a pending queue for admin approval before going live

**Real-Time Chat**
- 1-to-1 messaging between buyer and seller
- Powered by Socket.io for instant message delivery
- Chat list shows all active conversations
- Search through conversations
- No duplicate conversations — opening a chat with the same seller always resumes the existing conversation

**My Listings**
- View all your posted listings in one place
- Edit listing details
- Mark a listing as Sold (and optionally tag which buyer purchased it)
- Delete a listing permanently

**Notifications**
- Real-time push notifications for new messages, listing approvals, and offers
- Unread badge count on the notification bell icon

**Multilingual Support**
- Supports English, Hindi (हिंदी), and Gujarati (ગુજરાતી)
- Language can be switched at any time from the home screen
- Category names translate correctly in all three languages

**Profile**
- View and edit your profile (name, company, city, state)
- View your purchase history
- Delete your account
- Read terms and conditions

---

### For Admins (Admin Panel)

The admin panel is a web dashboard accessed via a browser. It gives the team full control over the marketplace.

**Dashboard**
- At-a-glance statistics: total users, active listings, pending approvals, total chats

**User Management**
- View all registered users
- Approve pending accounts (required before a user can log in)
- Suspend or remove users

**Listings Management**
- View all listings (pending, active, sold, rejected)
- Approve or reject listings submitted by users
- View full listing details and photos

**Categories**
- Add, edit, or delete equipment categories
- Categories added here instantly appear in the mobile app dropdown in real-time (no app update needed)
- Support for Hindi and Gujarati translated category names

**Chat Monitoring**
- View all conversations happening on the platform

**Reports**
- Review any listings or users that have been reported by the community

**Analytics**
- Visual charts showing listing trends, user growth, and activity over time

**Notifications**
- Send broadcast notifications to all users or specific users

---

## Architecture Overview

```
┌─────────────────────┐       REST API + Socket.io      ┌──────────────────────┐
│   Mobile App        │ ──────────────────────────────► │   Backend Server     │
│  (React Native)     │                                  │  (Node.js + MySQL)   │
└─────────────────────┘                                  └──────────────────────┘
          │                                                        │
          │  Firebase Auth + Firestore                             │ MySQL Database
          ▼                                                        ▼
┌─────────────────────┐                              ┌────────────────────────┐
│     Firebase        │                              │     MySQL Database     │
│  (Auth + Firestore) │                              │  Users, Listings,      │
│  Categories,        │                              │  Chats, Reports        │
│  Notifications      │                              └────────────────────────┘
└─────────────────────┘
          ▲
          │ Firebase Firestore
┌─────────────────────┐
│    Admin Panel      │
│  (React + Vite)     │
└─────────────────────┘
```

**Why two databases?**

The app uses both Firebase Firestore and MySQL intentionally:
- **Firestore** handles things that need to be real-time and push-based — categories (so adding a new category in the admin panel immediately appears in the app), notifications, and auth.
- **MySQL** handles structured relational data — user records, listings, chat messages, and reports. This gives us proper relational queries and full admin control over data.

---

## Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [MySQL](https://www.mysql.com/) (v8 or later)
- [Expo CLI](https://docs.expo.dev/) (`npm install -g expo-cli`)
- [EAS CLI](https://docs.expo.dev/eas/) (`npm install -g eas-cli`)

You will also need accounts on:
- [Firebase](https://firebase.google.com/) — for authentication and Firestore
- [Cloudinary](https://cloudinary.com/) — for image uploads

---

### 1. Clone the Repository

```bash
git clone https://github.com/P2898/Hallmarking_App.git
cd Hallmarking_App
```

---

### 2. Backend Server Setup

```bash
cd backend-server
npm install
```

Create a `.env` file in the `backend-server/` directory:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=machinexchange_db

# Server
PORT=5001

# Authentication
JWT_SECRET=your_jwt_secret_key_here
```

> ⚠️ **Never commit the `.env` file.** It is already listed in `.gitignore`.

Start the backend server:

```bash
npm run dev        # Development mode with hot reload
# or
npm run build      # Compile TypeScript to JavaScript
npm start          # Run the compiled version
```

The server will start at `http://localhost:5001` and automatically create all database tables on first run.

---

### 3. Admin Panel Setup

```bash
cd admin-panel
npm install
```

Create a `.env` file in the `admin-panel/` directory:

```env
VITE_API_URL=http://localhost:5001
```

For production, replace `localhost` with your server's IP address.

```bash
npm run dev        # Start local development server
npm run build      # Build for production (output goes to /dist)
```

---

### 4. Mobile App Setup

```bash
cd mobile-app
npm install
```

The mobile app reads all its configuration from the `eas.json` file for EAS builds, or from a local `.env` file for development. The environment variables you need are:

```env
EXPO_PUBLIC_API_URL=http://your-server-ip:5001
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

Run locally with Expo Go:

```bash
npx expo start
```

Build an APK for testing:

```bash
eas build -p android --profile preview
```

Build an App Bundle for Google Play Store:

```bash
eas build -p android --profile production
```

---

## Deploying to a Production Server

The backend and admin panel are designed to be deployed on a Windows Server with IIS, but can also run on any Linux server.

### Backend
1. Copy the entire `backend-server/` folder to your server
2. Create the `.env` file on the server with your production MySQL credentials
3. Run `npm install` and `npm run build`
4. Start the server: `node dist/index.js` (or use PM2 for process management)

### Admin Panel
1. Run `npm run build` on your laptop — this generates a `dist/` folder
2. Copy the contents of `dist/` to your server's web root directory (e.g., `C:\MachineXchange\admin` on Windows with IIS)
3. Configure IIS to serve the `dist/` folder and point the API URL to your backend

---

## Folder Structure (Deep Dive)

### Mobile App (`mobile-app/`)
```
mobile-app/
├── assets/                    # App icons, splash screen, logo
├── src/
│   ├── components/            # Reusable UI components (Button, Input, ListingCard, etc.)
│   ├── navigation/            # Stack navigators (Auth flow, Main app flow)
│   ├── screens/
│   │   ├── auth/              # Login, Register, ForgotPassword, PendingApproval
│   │   └── main/              # HomeFeed, ListingDetail, Chat, Profile, etc.
│   ├── store/                 # Zustand global state (auth, listings, chat, etc.)
│   ├── types/                 # TypeScript type definitions
│   └── i18n/                  # Translation files for EN, HI, GU
├── firebase.config.ts         # Firebase initialization (reads from env vars)
├── google-services.json       # Android Firebase configuration
├── app.json                   # Expo app configuration
├── eas.json                   # EAS Build profiles (preview, development, production)
└── .easignore                 # Files excluded from EAS cloud builds
```

### Backend Server (`backend-server/`)
```
backend-server/
├── src/
│   ├── models/                # Sequelize database models (User, Listing, Chat, etc.)
│   ├── routes/                # Express route handlers
│   │   ├── authRoutes.ts      # Register, login, JWT validation
│   │   ├── listingRoutes.ts   # CRUD for listings + approval flow
│   │   ├── chatRoutes.ts      # Chat threads and messages
│   │   ├── userRoutes.ts      # User profiles and management
│   │   ├── categoryRoutes.ts  # Equipment categories
│   │   ├── reportRoutes.ts    # User/listing reports
│   │   ├── analyticsRoutes.ts # Dashboard statistics
│   │   └── uploadRoutes.ts    # Image upload handling with Multer
│   ├── middleware/
│   │   └── authMiddleware.ts  # JWT verification for protected routes
│   ├── db.ts                  # Sequelize MySQL connection
│   └── index.ts               # Express app entry point + Socket.io setup
└── public/
    └── uploads/               # Uploaded listing images (not tracked in git)
```

### Admin Panel (`admin-panel/`)
```
admin-panel/
├── src/
│   ├── pages/                 # Dashboard, Users, Listings, Chats, Categories, etc.
│   ├── store/                 # Zustand stores for each admin section
│   └── main.tsx               # App entry point
└── dist/                      # Production build output (not tracked in git)
```

---

## Key Design Decisions

**Why not use Firebase for everything?**
Firebase Firestore is excellent for real-time data and simple document structures. However, for a marketplace with complex relationships between users, listings, chats, and reports, a relational database (MySQL) gives much better query flexibility, data integrity, and admin control. We use both strategically.

**Why Expo + EAS Build instead of bare React Native?**
Expo dramatically reduces build complexity. EAS Build handles Android keystores, signing, and APK/AAB generation entirely in the cloud. This means no local Android SDK setup is needed, and builds can be triggered from any machine with just a terminal command.

**Why the admin panel is separate?**
Keeping the admin panel as a standalone web app (instead of inside the mobile app) gives several advantages: it can be opened on any computer browser, it doesn't add weight to the mobile app, and admin features can be developed and deployed independently.

**How does the approval workflow work?**
Every new user registration and every new listing submission goes into a "pending" state. The admin panel shows these pending items, and an admin must explicitly approve them before they become visible. This moderation layer keeps the marketplace trustworthy and prevents spam.

---

## Environment Variables Reference

### Backend Server (`.env`)
| Variable | Description |
|---|---|
| `DB_HOST` | MySQL server host (usually `localhost`) |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `PORT` | Port the server listens on |
| `JWT_SECRET` | Secret key for signing JWT tokens |

### Mobile App / Admin Panel
| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Full URL of the backend server |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |
| `VITE_API_URL` | Backend URL for the admin panel |

---

## Security Notes

- All `.env` files are excluded from version control via `.gitignore`
- Passwords and API keys are never hardcoded in source files — they are always read from environment variables at runtime
- The `dist/` folder (compiled backend code) and `public/uploads/` (user-uploaded images) are also excluded from git — they are generated on the server directly
- JWT tokens are used to protect all sensitive API endpoints
- Firebase Security Rules should be configured to restrict read/write access to authenticated users only

---

## Contributing

This project was built as an internal product for NCH. If you are a developer onboarding onto this project:

1. Never commit `.env` files
2. Always test changes on the preview APK before submitting a production build
3. Any backend changes require redeploying the compiled `dist/` folder to the production server
4. Admin panel changes require running `npm run build` and copying the new `dist/` output to the server
5. Mobile app changes require a new EAS build — the existing APK on devices will not auto-update

---

## License

This project is proprietary software developed for NCH (National Centre for Hallmarking). All rights reserved.
