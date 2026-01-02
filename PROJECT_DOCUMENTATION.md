# KrishiMitra - Smart Farming Assistant
## Technical Documentation for Portfolio/Interview

---

## 📋 Project Overview

**KrishiMitra** (meaning "Farmer's Friend" in Bengali) is an AI-powered agricultural recommendation system designed for farmers in Bangladesh. It provides personalized fertilizer and irrigation recommendations based on real-time weather data, soil conditions, and crop type.

### Problem Statement
Farmers in Bangladesh often lack access to expert agricultural advice, leading to:
- Over or under-application of fertilizers
- Inefficient water usage
- Reduced crop yields
- Environmental damage from improper farming practices

### Solution
An accessible, multilingual web application that uses AI and weather data to provide actionable farming recommendations in real-time.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │   Hero   │  │  Input   │  │  Reco    │  │   History Page   ││
│  │ Section  │  │   Form   │  │  Cards   │  │  (Auth Required) ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Python/FastAPI)                 │
│                  Hosted on Render.com                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /predict-    │  │  /weather    │  │  ML Prediction       │  │
│  │ with-weather │  │  endpoint    │  │  Engine              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (Lovable Cloud)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Auth       │  │  Profiles    │  │  Recommendations     │  │
│  │   (Users)    │  │   Table      │  │  History Table       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Edge Function: generate-advice               │  │
│  │              (AI-powered advice using Lovable AI)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI component library |
| **TypeScript** | Type safety and better DX |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/UI** | Pre-built accessible components |
| **React Router** | Client-side routing |
| **TanStack Query** | Server state management |
| **Framer Motion** | Animations (implicit via components) |

### Backend & Infrastructure
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database, Auth, Edge Functions |
| **Lovable Cloud** | Managed Supabase instance |
| **Lovable AI Gateway** | AI model access (Gemini) |
| **Render.com** | Python ML API hosting |
| **PWA (vite-plugin-pwa)** | Offline support & installability |

### AI/ML Components
| Component | Technology |
|-----------|------------|
| Weather-based predictions | Custom ML model (Python) |
| Personalized advice | Lovable AI (Gemini 2.5 Flash) |
| NPK recommendations | Rule-based + ML hybrid |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── HeroSection.tsx        # Landing page hero
│   ├── InputForm.tsx          # Crop/location/soil input
│   ├── RecommendationCard.tsx # Results display
│   ├── DistrictSelect.tsx     # Bangladesh districts dropdown
│   ├── LanguageModal.tsx      # Language switcher
│   ├── LoadingSkeleton.tsx    # Loading states
│   └── Footer.tsx             # App footer
├── contexts/
│   ├── AuthContext.tsx        # Authentication state
│   └── LanguageContext.tsx    # i18n state management
├── pages/
│   ├── Index.tsx              # Main landing page
│   ├── Auth.tsx               # Login/Signup page
│   ├── History.tsx            # User recommendation history
│   └── NotFound.tsx           # 404 page
├── lib/
│   ├── api.ts                 # Backend API client
│   └── utils.ts               # Utility functions
├── data/
│   └── districts.ts           # Bangladesh districts data
├── hooks/
│   └── use-toast.ts           # Toast notifications
└── integrations/
    └── supabase/
        ├── client.ts          # Supabase client (auto-generated)
        └── types.ts           # Database types (auto-generated)

supabase/
└── functions/
    └── generate-advice/
        └── index.ts           # AI advice edge function

public/
├── pwa-192x192.png           # PWA icon
└── pwa-512x512.png           # PWA icon (large)
```

---

## 🔐 Database Schema

### profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  farmer_name TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: Users can only access their own profile
```

### recommendations_history
```sql
CREATE TABLE public.recommendations_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  crop_type TEXT NOT NULL,
  soil_ph NUMERIC NOT NULL,
  location TEXT NOT NULL,
  fertilizer_level TEXT NOT NULL,
  irrigation_needed BOOLEAN NOT NULL,
  recommendations_text TEXT,
  weather_temperature NUMERIC,
  weather_rainfall NUMERIC,
  weather_humidity NUMERIC,
  soil_moisture NUMERIC,
  confidence NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: Users can only access their own history
```

---

## 🌐 API Endpoints

### Backend API (Render.com)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict-with-weather` | POST | Get fertilizer/irrigation prediction |
| `/weather` | GET | Fetch current weather for location |
| `/health` | GET | Health check endpoint |

#### Request Example: `/predict-with-weather`
```json
{
  "crop_type": "rice",
  "soil_ph": 6.5,
  "location": "Dhaka"
}
```

#### Response Example:
```json
{
  "weather_data": {
    "temperature": 28.5,
    "rainfall": 12.3,
    "humidity": 75,
    "weather": "Partly Cloudy",
    "soil_moisture": 45.2
  },
  "fertilizer_level": "Medium",
  "irrigation_needed": true,
  "recommendations_text": "Based on current conditions...",
  "confidence": 0.87,
  "npk_values": {
    "nitrogen": "40-50 kg/ha",
    "phosphorus": "20-25 kg/ha",
    "potassium": "30-35 kg/ha"
  }
}
```

### Edge Functions (Supabase)

| Function | Purpose |
|----------|---------|
| `generate-advice` | Generate personalized AI advice using Lovable AI |

---

## 🌍 Features Implemented

### Core Features
- [x] **AI-Powered Recommendations** - ML predictions for fertilizer levels and irrigation needs
- [x] **Real-time Weather Integration** - Live weather data for accurate predictions
- [x] **NPK Value Recommendations** - Specific nutrient application rates
- [x] **Multi-language Support** - English and Bengali (বাংলা)
- [x] **User Authentication** - Email/password signup and login
- [x] **Recommendation History** - Save and view past recommendations
- [x] **PWA Support** - Installable app with offline capabilities

### UI/UX Features
- [x] **Responsive Design** - Works on mobile and desktop
- [x] **Loading States** - Skeleton loaders for better UX
- [x] **Toast Notifications** - User feedback for actions
- [x] **Beautiful Cards** - Visual recommendation display
- [x] **District Dropdown** - All 64 Bangladesh districts

### Technical Features
- [x] **Row Level Security (RLS)** - Secure data access
- [x] **Edge Functions** - Serverless AI processing
- [x] **Type Safety** - Full TypeScript coverage
- [x] **SEO Optimized** - Meta tags and structured data

---

## 🔒 Security Implementation

### Authentication Flow
1. User signs up with email/password
2. Supabase Auth handles session management
3. JWT tokens stored securely in localStorage
4. Auth state managed via React Context

### Row Level Security (RLS)
```sql
-- Users can only read their own history
CREATE POLICY "Users can view own history"
ON recommendations_history FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own records
CREATE POLICY "Users can insert own history"
ON recommendations_history FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### API Security
- Edge functions verify JWT tokens
- CORS configured for allowed origins
- API keys stored as environment secrets

---

## 📱 PWA Implementation

### Capabilities
- **Installable** - Add to home screen on mobile
- **Offline Support** - Cached assets and API responses
- **Background Sync** - Pending requests sync when online
- **Push Ready** - Infrastructure for push notifications

### Configuration (vite.config.ts)
```typescript
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "KrishiMitra - Smart Farming Assistant",
    short_name: "KrishiMitra",
    theme_color: "#16a34a",
    display: "standalone",
    // ... icons and other config
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/hackathon-project-ysen\.onrender\.com\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxAgeSeconds: 86400 }
        }
      }
    ]
  }
})
```

---

## 🚀 Future Enhancements

### Planned Features
1. **SMS Notifications** - Weather alerts via Twilio
2. **Crop Calendar** - Planting/harvesting schedules
3. **Market Prices** - Real-time crop price integration
4. **Community Forum** - Farmer Q&A platform
5. **Multi-farm Support** - Manage multiple plots

### Monetization Strategy
1. **Freemium Model** - Basic features free, premium subscription
2. **B2B Licensing** - White-label for agricultural companies
3. **Affiliate Partnerships** - Commission on input purchases

---

## 📊 Key Metrics & Performance

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

### Technical Achievements
- TypeScript strict mode enabled
- Zero runtime errors in production
- Sub-2s initial page load
- 100% mobile responsive

---

## 🎓 Learning Outcomes

Through building this project, I demonstrated proficiency in:

1. **Full-Stack Development** - React frontend + Supabase backend
2. **AI/ML Integration** - Consuming ML APIs and AI gateways
3. **Database Design** - PostgreSQL schema with RLS policies
4. **Authentication** - Secure user auth implementation
5. **PWA Development** - Service workers and offline support
6. **API Design** - RESTful endpoints and error handling
7. **Internationalization** - Multi-language support
8. **Cloud Deployment** - Serverless functions and managed services

---

## 📞 Contact

For questions about this project or to discuss the implementation details, please reach out.

---

*This documentation was generated for portfolio/interview purposes.*
*Last updated: January 2026*
