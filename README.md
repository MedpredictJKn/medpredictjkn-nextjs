# MedpredictJKn - Sistem Prediksi Risiko Penyakit Berbasis AI

> **Aplikasi kesehatan digital terintegrasi untuk prediksi dini risiko penyakit kronis menggunakan Machine Learning**

Sistem yang dirancang untuk mengidentifikasi individu dengan risiko tinggi terhadap penyakit kronis (Diabetes Melitus, Hipertensi, Penyakit Jantung Koroner) sebelum gejala parah muncul, memungkinkan intervensi preventif lebih awal melalui data JKN dan AI analysis.

## 🎯 Fitur Utama

### 1. **Prediksi Dini Risiko Penyakit (Early Risk Prediction)**

- Model AI terlatih dengan dataset JKN (riwayat diagnosa, obat, kunjungan, hasil lab)
- Kalkulasi skor risiko individual untuk penyakit kronis utama
- Identifikasi peserta berisiko tinggi sebelum gejala parah
- Integrasi dengan FastAPI untuk inferensi model ML

### 2. **Sistem Alert & Notifikasi Otomatis**

- Notifikasi real-time via WhatsApp ke peserta JKN
- Alert ke fasilitas kesehatan (Faskes) ketika skor risiko melebihi ambang batas
- Mendorong skrining preventif di Faskes terdekat
- Tracking status notifikasi

### 3. **Rekomendasi Skrining & Intervensi Spesifik**

- AI merekomendasikan jenis pemeriksaan penunjang yang relevan
- Saran modifikasi gaya hidup yang dipersonalisasi
- Konten edukasi kesehatan berbasis risiko
- Screening recommendations based on disease risk

### 4. **Chat dengan AI **

- Konsultasi kesehatan 24/7 dengan AI asisten medis
- Analisis gejala dan rekomendasi awal
- Riwayat percakapan tersimpan
- Support untuk kesehatan mental & umum

### 5. **Dashboard Monitoring Pasien (Doctor Portal)**

- Tampilan daftar pasien dengan risiko tertinggi
- Ringkasan riwayat medis JKN
- Rekomendasi AI untuk tindak lanjut
- Sistem messaging dengan pasien via WhatsApp
- Statistik monitoring pasien

### 6. **Health Data Management**

- Cek kesehatan lengkap (BMI, tekanan darah, gula darah, kolesterol)
- Automatic BMI calculation dan status kategorisasi
- Riwayat kesehatan dengan timeline visualization
- Integration dengan WhatsApp untuk notifikasi hasil

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js App)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Auth Pages   │  │  Dashboard   │  │ Health Check Pages  │ │
│  │ (Login/Reg)  │  │  (Stats/UI)  │  │ (BMI/Vitals)        │ │
│  └──────────────┘  └──────────────┘  └─────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                     ┌──────▼──────┐
                     │  Middleware  │
                     │ (Auth Guard) │
                     └──────┬──────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Next.js API)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Auth API     │  │ Health API   │  │ Chatbot API      │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤   │
│  │ register     │  │ POST health  │  │ POST message     │   │
│  │ login        │  │ GET history  │  │ GET history      │   │
│  │ logout       │  │ analyze      │  │ DELETE           │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Risk API     │  │ Doctor API   │  │ WhatsApp API     │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────────┤   │
│  │ calculate    │  │ patients     │  │ notifications    │   │
│  │ scores       │  │ messages     │  │ verify status    │   │
│  │ recommend    │  │ monitoring   │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   ┌────▼──────┐   ┌───────▼────────┐  ┌──────▼────────┐
   │ PostgreSQL │   │  Gemini AI     │  │  FastAPI ML   │
   │ Database   │   │  API (Chat)    │  │  Server       │
   │            │   │                │  │  (Risk Model) │
   └────────────┘   └────────────────┘  └───────────────┘
```

## 📁 Struktur Folder & File

```
healthkathon/
│
├── app/                                 # Next.js App Router
│   ├── api/                             # API Routes
│   │   ├── auth/
│   │   │   ├── register/route.ts        # ✅ Register user
│   │   │   ├── login/route.ts           # ✅ Login (JWT)
│   │   │   ├── logout/route.ts          # ✅ Logout
│   │   │   ├── forgot-password/         # 🔧 Password reset
│   │   │   ├── reset-password/          # 🔧 Reset handler
│   │   │   ├── verify-reset-code/       # 🔧 Verify code
│   │   │   ├── set-cookie/              # 🔒 Set auth cookie
│   │   │   └── clear-cookie/            # 🔒 Clear auth cookie
│   │   │
│   │   ├── health/
│   │   │   ├── route.ts                 # ✅ POST/GET health data
│   │   │   └── analyze/route.ts         # 🤖 AI health analysis
│   │   │
│   │   ├── chatbot/route.ts             # ✅ Gemini chat (POST/GET/DELETE)
│   │   │
│   │   ├── risk/
│   │   │   ├── route.ts                 # 🔮 Disease risk calculation
│   │   │   └── recommendations/route.ts # 💊 Risk-based recommendations
│   │   │
│   │   ├── dashboard/
│   │   │   └── stats/route.ts           # 📊 Dashboard statistics
│   │   │
│   │   ├── doctor/
│   │   │   ├── patients/route.ts        # 👨‍⚕️ GET patients list
│   │   │   ├── messages/route.ts        # 💬 Doctor messaging
│   │   │   └── messages/count/route.ts  # 📬 Message count
│   │   │
│   │   └── notify-wa/route.ts           # 📱 WhatsApp notifications
│   │
│   ├── auth/                             # Auth Pages
│   │   ├── login/page.tsx                # 🔑 Login page
│   │   ├── register/page.tsx             # ✍️ Register page
│   │   ├── forgot-password/page.tsx      # 🔄 Forgot password
│   │   └── reset-password/page.tsx       # 🔑 Reset password form
│   │
│   ├── dashboard/page.tsx                # 📊 Main dashboard (Patient/Doctor)
│   ├── cek-kesehatan/page.tsx            # 🏥 Health check form
│   ├── chat/page.tsx                     # 💬 Chatbot interface
│   ├── profil/page.tsx                   # 👤 User profile
│   │
│   ├── doctor/
│   │   └── monitoring/page.tsx           # 👨‍⚕️ Doctor patient monitoring
│   │
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Landing page
│   ├── not-found.tsx                     # 404 page
│   ├── globals.css                       # Global styles
│   └── middleware.ts                     # 🔒 Auth middleware
│
├── components/                           # Reusable UI Components
│   └── ui/
│       ├── button.tsx                    # Button component
│       ├── card.tsx                      # Card component
│       ├── input.tsx                     # Input field
│       ├── textarea.tsx                  # Textarea field
│       ├── profile-avatar.tsx            # User avatar
│       └── sidebar.tsx                   # Navigation sidebar
│
├── lib/                                  # Business Logic & Services
│   ├── auth-client.ts                    # Client-side auth helpers
│   ├── db.ts                             # Prisma client instance
│   ├── email.ts                          # Email service (Resend)
│   ├── token.ts                          # JWT token utilities
│   ├── utils.ts                          # Utility functions (BMI, validation, etc)
│   │
│   ├── hooks/
│   │   └── useCounterAnimation.ts        # Animation hooks for stats
│   │
│   ├── prisma/
│   │   └── client.ts                     # Prisma client wrapper
│   │
│   ├── validators/
│   │   └── auth.ts                       # Auth input validators
│   │
│   └── services/
│       ├── aiAnalyzer.ts                 # 🤖 AI health analysis service
│       ├── chatbot.ts                    # 💬 Chatbot service (Gemini + FastAPI)
│       ├── health.ts                     # 🏥 Health data service
│       ├── riskCalculation.ts            # 🔮 Risk scoring service
│       ├── screening.ts                  # 📋 Screening recommendations
│       └── wa.ts                         # 📱 WhatsApp notification service
│
├── prisma/                               # Database Schema
│   ├── schema.prisma                     # Data models
│   ├── seed.ts                           # Database seeding
│   └── migrations/                       # Migration history
│       ├── 20251120050844_init/
│       ├── 20251122012433_add_role_to_user/
│       ├── 20251122022634_add_email_verification_tokens/
│       ├── 20251122023635_add_reset_code_field/
│       └── 20251122070231_add_session_id_to_chat_history/
│
├── types/
│   └── index.ts                          # TypeScript interfaces & types
│
├── public/                               # Static assets
│   ├── images/
│   │   └── medpredictjkn.png
│   ├── icons/
│   └── *.svg                             # SVG assets
│
├── scripts/                              # Utility scripts
├── middleware.ts                         # 🔒 Next.js middleware (auth guard)
├── next.config.ts                        # Next.js config
├── tsconfig.json                         # TypeScript config
├── package.json                          # Dependencies
├── postcss.config.mjs                    # Tailwind CSS config
├── .env.local                            # Environment variables
├── .env.example                          # Env template
├── README.md                             # This file
├── SECURITY.md                           # Security guide
└── vercel.json                           # Vercel deployment config
```

## 🛠️ Tech Stack

### Frontend

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **React Hooks** - State management

### Backend

- **Next.js API Routes** - Serverless functions
- **Node.js Runtime** - Server-side execution
- **Prisma ORM** - Database management
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### AI & External Services

- **Gemini 2.0 Flash API** - Chat AI & analysis
- **FastAPI** - ML model inference server
- **WhAPI.cloud** - WhatsApp messaging
- **Resend** - Email service

### Database

- **PostgreSQL** - Relational database (Aiven Cloud)
- **Prisma Migrations** - Schema management

## 📊 Database Schema

### Core Models

```prisma
model User {
  id String @id @default(cuid())
  email String @unique
  password String (hashed with bcryptjs)
  name String
  phone String?
  age Int?
  gender String? // 'male' | 'female'
  role String @default("patient") // 'patient' | 'doctor'

  // Auth verification
  isEmailVerified Boolean
  verificationToken String?
  verificationTokenExpiry DateTime?

  // Password reset
  resetToken String?
  resetTokenExpiry DateTime?
  resetCode String?
  resetCodeExpiry DateTime?

  // Profile
  profilePhoto String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  healthData HealthData[]
  chatHistory ChatHistory[]
  medicalRecords MedicalRecord[]
  riskScores DiseaseRiskScore?
  screeningRecommendations ScreeningRecommendation[]
  sentMessages DoctorMessage[]
}

model HealthData {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  height Float
  weight Float
  bmi Float
  status String // 'underweight' | 'normal' | 'overweight' | 'obese'
  bloodPressure String? // "120/80" format
  bloodSugar Float?
  cholesterol Float?
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ChatHistory {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  message String
  response String
  source String // 'gemini' | 'fastapi'
  sessionId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model DiseaseRiskScore {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  diabetesScore Float
  hypertensionScore Float
  heartDiseaseScore Float
  strokeScore Float

  highRiskDiseases String[] // Array of disease names
  lastCalculated DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ScreeningRecommendation {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  recommendationType String // 'blood_glucose', 'ecg', 'lipid_profile', etc
  priority String // 'Urgent' | 'High' | 'Medium' | 'Low'
  rationale String

  completed Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ChatHistory {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  message String
  response String
  source String
  sessionId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint                      | Deskripsi          | Body                              | Auth |
| ------ | ----------------------------- | ------------------ | --------------------------------- | ---- |
| POST   | `/api/auth/register`          | Register user baru | `{name, email, password, phone?}` | ❌   |
| POST   | `/api/auth/login`             | Login user         | `{email, password}`               | ❌   |
| POST   | `/api/auth/logout`            | Logout user        | -                                 | ✅   |
| POST   | `/api/auth/forgot-password`   | Request reset code | `{email}`                         | ❌   |
| POST   | `/api/auth/verify-reset-code` | Verify reset code  | `{email, code}`                   | ❌   |
| POST   | `/api/auth/reset-password`    | Reset password     | `{email, code, password}`         | ❌   |

### Health Data

| Method | Endpoint              | Deskripsi               | Body                                                                  | Auth |
| ------ | --------------------- | ----------------------- | --------------------------------------------------------------------- | ---- |
| POST   | `/api/health`         | Simpan data kesehatan   | `{height, weight, bloodPressure?, bloodSugar?, cholesterol?, notes?}` | ✅   |
| GET    | `/api/health`         | Ambil riwayat kesehatan | -                                                                     | ✅   |
| POST   | `/api/health/analyze` | AI health analysis      | `{healthData, bmi}`                                                   | ✅   |

### Chatbot

| Method | Endpoint       | Deskripsi          | Body                                                 | Auth |
| ------ | -------------- | ------------------ | ---------------------------------------------------- | ---- |
| POST   | `/api/chatbot` | Kirim pesan ke AI  | `{message, source: 'gemini'\|'fastapi', sessionId?}` | ✅   |
| GET    | `/api/chatbot` | Ambil riwayat chat | -                                                    | ✅   |
| DELETE | `/api/chatbot` | Hapus chat         | `?id=chatId`                                         | ✅   |

### Risk Prediction

| Method | Endpoint                    | Deskripsi                 | Body                       | Auth |
| ------ | --------------------------- | ------------------------- | -------------------------- | ---- |
| POST   | `/api/risk`                 | Kalkulasi risiko penyakit | `{healthData}`             | ✅   |
| GET    | `/api/risk`                 | Ambil skor risiko         | -                          | ✅   |
| POST   | `/api/risk/recommendations` | Dapatkan rekomendasi      | `{healthData, riskScores}` | ✅   |

### Doctor Portal

| Method | Endpoint                     | Deskripsi             | Body                   | Auth |
| ------ | ---------------------------- | --------------------- | ---------------------- | ---- |
| GET    | `/api/doctor/patients`       | Daftar pasien         | -                      | ✅   |
| POST   | `/api/doctor/messages`       | Kirim pesan ke pasien | `{patientId, message}` | ✅   |
| GET    | `/api/doctor/messages`       | Ambil pesan pasien    | -                      | ✅   |
| GET    | `/api/doctor/messages/count` | Hitung pesan baru     | -                      | ✅   |

### Dashboard

| Method | Endpoint               | Deskripsi           | Body | Auth |
| ------ | ---------------------- | ------------------- | ---- | ---- |
| GET    | `/api/dashboard/stats` | Statistik dashboard | -    | ✅   |

### Notifications

| Method | Endpoint         | Deskripsi           | Body                           | Auth |
| ------ | ---------------- | ------------------- | ------------------------------ | ---- |
| POST   | `/api/notify-wa` | Kirim notifikasi WA | `{phoneNumber, message, type}` | ❌   |
| GET    | `/api/notify-wa` | Cek status API      | -                              | ❌   |

## 🔒 Authentication & Security

### JWT Token Structure

```json
{
  "userId": "user-id-cuid",
  "email": "user@example.com",
  "iat": 1700000000,
  "exp": 1710000000
}
```

### Protected Routes (Middleware)

```typescript
const protectedRoutes = [
  "/dashboard",
  "/cek-kesehatan",
  "/chat",
  "/profil",
  "/doctor/monitoring",
];

const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];
```

### Password Security

- Hashed dengan **bcryptjs** (salt rounds: 10)
- Minimum 8 karakter
- Tidak disimpan dalam token

### Cookie Management

- HTTP-only cookies (tidak accessible via JavaScript)
- Secure flag (HTTPS only)
- SameSite policy (Strict/Lax)

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- npm/pnpm/yarn
- PostgreSQL 12+ (atau managed service seperti Aiven)

### Step 1: Clone & Install

```bash
git clone <repo-url>
cd healthkathon
npm install
```

### Step 2: Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/dbname"

# JWT
JWT_SECRET="your-secure-jwt-secret-key"
JWT_EXPIRY="30d"

# Gemini AI
FAST_API_KEY="your-gemini-api-key"
FAST_API_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

# FastAPI (ML Server)
FASTAPI_ML_URL="http://localhost:8000"

# WhatsApp API
WHAT_API_URL="https://gate.whapi.cloud"
WHAT_API_TOKEN="your-whapi-token"
WHAT_PHONE_NUMBER="your-whatsapp-number"

# Email Service
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# App Config
NEXT_PUBLIC_API_URL="http://localhost:3000"
NODE_ENV="development"
```

### Step 3: Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# (Optional) Open Prisma Studio
npx prisma studio
```

### Step 4: Seed Database

```bash
npm run seed
```

Ini akan membuat:

- Doctor account: `dokter@medpredict.com` / `dokter123`

### Step 5: Run Development Server

```bash
npm run dev
```

Akses di: http://localhost:3000

## 📚 API Usage Examples

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phone": "6281234567890"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": "cuid123",
      "email": "john@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Save Health Data

```bash
curl -X POST http://localhost:3000/api/health \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "height": 170,
    "weight": 65,
    "bloodPressure": "120/80",
    "bloodSugar": 100,
    "cholesterol": 200,
    "notes": "Merasa sehat"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Data kesehatan berhasil disimpan",
  "data": {
    "id": "health-cuid",
    "height": 170,
    "weight": 65,
    "bmi": 22.49,
    "status": "normal",
    "bloodPressure": "120/80",
    "bloodSugar": 100,
    "cholesterol": 200,
    "createdAt": "2025-11-22T..."
  }
}
```

### 3. Chat with AI

```bash
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Apa itu kolesterol tinggi?",
    "source": "gemini"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Pesan berhasil diproses",
  "data": {
    "id": "chat-cuid",
    "message": "Apa itu kolesterol tinggi?",
    "response": "Kolesterol tinggi (hiperkolesterolemia) adalah kondisi...",
    "source": "gemini",
    "createdAt": "2025-11-22T..."
  }
}
```

### 4. Calculate Risk Scores

```bash
curl -X POST http://localhost:3000/api/risk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "healthData": {
      "height": 170,
      "weight": 85,
      "bloodPressure": "140/90",
      "bloodSugar": 150,
      "cholesterol": 250,
      "age": 45,
      "gender": "male"
    }
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "diabetesScore": 75,
    "hypertensionScore": 68,
    "heartDiseaseScore": 65,
    "strokeScore": 62,
    "highRiskDiseases": ["Diabetes", "Hipertensi"],
    "alertSent": true
  }
}
```

### 5. Get Chat History

```bash
curl -X GET http://localhost:3000/api/chatbot \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**

```json
{
  "success": true,
  "message": "Riwayat chat diambil",
  "data": [
    {
      "id": "chat-1",
      "message": "Apa itu diabetes?",
      "response": "Diabetes adalah...",
      "source": "gemini",
      "createdAt": "2025-11-22T..."
    }
  ]
}
```

## 🔧 FastAPI ML Server Setup

FastAPI server digunakan untuk inference model ML prediksi risiko penyakit.

### Setup FastAPI

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pandas scikit-learn xgboost

# Create main.py
cat > main.py << 'EOF'
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np

app = FastAPI(title="MedPredict ML API")

# Load trained model
model = joblib.load("models/risk_model.pkl")
scaler = joblib.load("models/scaler.pkl")

class HealthData(BaseModel):
    age: int
    gender: str  # "male" or "female"
    height: float
    weight: float
    bloodPressure: str  # "120/80" format
    bloodSugar: float
    cholesterol: float

@app.post("/predict-risk")
async def predict_risk(data: HealthData):
    """
    Predict disease risk based on health data
    """
    # Parse blood pressure
    sys, dias = map(int, data.bloodPressure.split('/'))

    # Prepare features
    features = np.array([[
        data.age,
        1 if data.gender == "male" else 0,
        data.height,
        data.weight,
        sys,
        dias,
        data.bloodSugar,
        data.cholesterol
    ]])

    # Scale features
    features_scaled = scaler.transform(features)

    # Predict risk scores (0-100)
    risks = model.predict_proba(features_scaled)[0] * 100

    return {
        "diabetesScore": float(risks[0]),
        "hypertensionScore": float(risks[1]),
        "heartDiseaseScore": float(risks[2]),
        "strokeScore": float(risks[3])
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Run server
python main.py
```

Server akan berjalan di: http://localhost:8000

## 📱 WhatsApp Notification Setup

### WhAPI.cloud Setup

1. Daftar di https://www.whapi.cloud/
2. Dapatkan API token
3. Hubungkan nomor WhatsApp
4. Set di `.env.local`:

```env
WHAT_API_TOKEN="your-token"
WHAT_PHONE_NUMBER="6282269283309"
```

### Sending Notification

```typescript
import { sendHealthNotification } from "@/lib/services/wa";

await sendHealthNotification("6281234567890", "John Doe", {
  bmi: 22.5,
  status: "normal",
  height: 170,
  weight: 65,
});
```

## 🎨 UI Components

### Available Components

```typescript
// Button
<Button variant="primary" size="lg">
  Click Me
</Button>

// Card
<Card className="p-4">
  <Card.Header>Title</Card.Header>
  <Card.Content>Content here</Card.Content>
</Card>

// Input
<Input
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Textarea
<Textarea
  placeholder="Enter message"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

// ProfileAvatar
<ProfileAvatar
  src={user.profilePhoto}
  alt={user.name}
  name={user.name}
  size="lg"
/>

// Sidebar
<Sidebar onLogout={handleLogout} />
```

## 🚀 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
```

### Deploy to Railway/Render

1. Push ke GitHub
2. Connect repo ke Railway/Render
3. Set environment variables
4. Deploy otomatis on push

### Environment Variables untuk Production

```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/medpredict"
JWT_SECRET="very-long-random-secret-key"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
NODE_ENV="production"
FAST_API_KEY="gemini-prod-key"
WHAT_API_TOKEN="whapi-prod-token"
```

## 🧪 Testing

### Run Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:coverage
```

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📝 License

MIT License - lihat [LICENSE](LICENSE) untuk detail

## 👥 Team

- **Healthkathon Team** - 2025
- Built with ❤️ for JKN health innovation

## 📞 Support & Feedback

- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Email: support@medpredictjkn.com

## 🔄 Version History

- **v1.0.0** (Nov 22, 2025) - Initial release
  - Auth system
  - Health data management
  - Gemini AI chatbot
  - Risk prediction (basic)
  - Doctor portal
  - WhatsApp notifications

## 🛣️ Roadmap

- [ ] Advanced ML model integration
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Video consultation feature
- [ ] Integration dengan sistem JKN resmi
- [ ] Blockchain for medical records

## ⚠️ Disclaimer

Aplikasi ini adalah untuk tujuan edukasi dan demonstrasi. Untuk penggunaan medis nyata:

- Konsultasi dengan profesional kesehatan berlisensi
- Jangan mengandalkan sepenuhnya pada AI predictions
- Selalu lakukan verifikasi medis profesional
- Comply dengan regulasi kesehatan setempat

---

**Made with ❤️ by Healthkathon Team**
