# 🌍 Voya Travel Platform

A comprehensive African travel platform built with React, Vite, Tailwind CSS, and Supabase. Discover, book, and explore amazing destinations across Africa with a modern, responsive web application.

## ✨ Features

### 🏠 **Homepage**
- Beautiful hero section with search functionality
- Featured destinations from database
- Real-time property listings
- Responsive design with loading states

### 🔍 **Search & Discovery**
- Advanced property search with filters
- Real-time search results
- Price range and property type filtering
- Location-based search

### 🏨 **Property Management**
- Detailed property pages with images
- Amenities and pricing information
- Guest capacity and availability
- Rating and review system

### 🔐 **Authentication**
- User registration and login
- Social authentication (Google, GitHub, Apple)
- Profile management
- Secure session handling

### 📅 **Booking System**
- Complete booking flow
- Date selection and guest management
- Secure payment processing with Stripe
- Email confirmations

### 📊 **Dashboard**
- Personalized user analytics
- Booking history and statistics
- User preferences and settings
- Real-time notifications

### 💳 **Payment Processing**
- Secure Stripe integration
- PCI-compliant payment handling
- Multiple payment methods
- Transaction tracking

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful icon library
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Stripe Elements** - Payment processing

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - File storage
  - Edge Functions
  - Analytics

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voya-travel-platform.git
   cd voya-travel-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Application
   VITE_APP_NAME=Voya Travel Platform
   VITE_APP_URL=http://localhost:3001
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql`
   - Set up Row Level Security policies
   - Configure authentication providers

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3001`

## 📁 Project Structure

```
voya-travel-platform/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button/         # Button component
│   │   ├── Card/           # Card component
│   │   ├── Input/          # Input component
│   │   ├── Navigation/     # Navigation bar
│   │   ├── Auth/           # Authentication components
│   │   ├── Payment/        # Payment components
│   │   └── Notifications/  # Notification components
│   ├── pages/              # Page components
│   │   ├── HomePage.jsx
│   │   ├── SearchResultsPage.jsx
│   │   ├── PropertyDetailPage.jsx
│   │   ├── BookingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── ProfilePage.jsx
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── services/           # API services
│   │   ├── database.js
│   │   ├── realtimeService.js
│   │   ├── storageService.js
│   │   ├── analyticsService.js
│   │   └── edgeFunctionsService.js
│   ├── lib/                # Utilities
│   │   └── supabase.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── supabase/               # Supabase configuration
│   ├── schema.sql          # Database schema
│   ├── config.toml         # Supabase config
│   ├── migrations/         # Database migrations
│   └── functions/         # Edge Functions
├── public/                 # Static assets
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **Users & Profiles** - User management and profiles
- **Destinations** - Travel destinations across Africa
- **Properties** - Accommodation listings
- **Bookings** - Reservation system
- **Reviews** - User reviews and ratings
- **Notifications** - Real-time notifications
- **Analytics** - User behavior tracking

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

### Manual Deployment
1. Build the project: `npm run build`
2. Upload `dist` folder to your web server
3. Configure environment variables on your server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend platform
- [Stripe](https://stripe.com/) for secure payment processing
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide](https://lucide.dev/) for beautiful icons
- [Vite](https://vitejs.dev/) for the fast build tool

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@voya-travel.com

---

**Made with ❤️ for African travel enthusiasts**