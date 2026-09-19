# ThinkValley Store Mobile App

React Native mobile application for ThinkValley Store e-commerce platform.

## Features

- **Authentication**: Login, Register, Google Sign-In, Password Reset
- **Smart account check**: login probes the API first — new users are offered sign-up automatically
- **Product Catalog**: Browse products by category, search, filter
- **Shopping Cart**: Add to cart, update quantities, remove items
- **Checkout**: Same 3-step flow as the web app (Contact → Shipping → Payment)
- **Cash on Delivery** with ID card photo upload for verification (matches web)
- **Paynow mobile money**: EcoCash, OneMoney and InnBucks with live status polling
- **Order Tracking**: View order history and track deliveries
- **User Profile**: Manage account settings and preferences

## Tech Stack

- React Native with Expo
- React Navigation
- Axios for API calls
- Async Storage for local data persistence
- Vector Icons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
npm run android  # For Android
npm run ios      # For iOS
npm run web      # For web
```

## Configuration

Update API base URL in `src/config/api.js`:

```javascript
const API_BASE_URL = 'YOUR_BACKEND_API_URL';
```

## Design System

The app follows the ThinkValley Store brand guidelines:
- Primary Color: #F47A20 (Orange)
- Secondary Color: #D2620F (Dark Orange)
- Font: Inter
- Border Radius: 10px
- Spacing: 4px grid system
