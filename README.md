# StudyHub 🎓 — Educational Platform Architecture

StudyHub is an advanced, high-performance educational platform designed for pre-university and university students. It features a gamified quiz system, a secure subscription management panel, and a state-of-the-art "OLED Dark" interface aimed at maximizing student retention and focus.

> **Note:** The proprietary question banks and actual quiz content are kept strictly private and are not included in this public repository. This repository serves to showcase the system architecture, technical implementations, and UI/UX design.

## 🚀 Key System Features

### 1. Dynamic Assessment Engine
*   **Algorithmic Randomization:** Questions and multiple-choice options are dynamically shuffled on the server to prevent pattern memorization and encourage true conceptual learning.
*   **Statistical Tracking:** Persistent performance analytics track student mastery across specific subjects (e.g., Physiology, Anatomy, Calculus) via automated post-quiz calculations.
*   **Study Tools Integration:**
    *   ⏱️ **Time Pressure Mode:** Strict 30-second per-question timers to simulate real exam conditions.
    *   👁️ **Zen Mode:** Distraction-free UI that hides side panels for maximum immersion.
    *   💡 **Active Recall Support:** Detailed post-response justifications, including $\LaTeX$ rendered mathematical equations via KaTeX.

### 2. Comprehensive Admin Dashboard
*   **Access Control (RBAC):** Granular control over which specific academic programs a user can access.
*   **Subscription & Payment Validation:** Admins can manually verify user-uploaded payment receipts and grant subscription extensions.
*   **Automated Content Synchronization:** A robust database seeding mechanism that allows bulk insertion of questions from structured local JSON files directly into PostgreSQL.

### 3. Security Infrastructure
*   **Real-time Validation:** Quiz access is secured by real-time database checks, bypassing the security limitations of cached JWTs.
*   **Anti-Piracy Measures:** Strict terms-of-service modal enforcement and secure layout structures to prevent content scraping.
*   **OAuth Integration:** Seamless Google Sign-In for students, coupled with secure credential-based login for administrators.

### 4. "2026 OLED" UI/UX Design
*   Premium Dark Mode aesthetic featuring cyan accents, smooth gradients, and glassmorphism.
*   Micro-animations and scroll-driven parallax effects powered by Framer Motion.
*   Fully responsive layout and PWA (Progressive Web App) support for native-like mobile experiences.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js 15 (App Router, Server Actions)
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** Auth.js v5 (NextAuth)
*   **File Storage:** UploadThing (receipt handling)
*   **Animations:** Framer Motion
*   **Styling:** Modern Vanilla CSS + Tailwind CSS integration
*   **Testing:** Playwright (E2E testing for Desktop & Mobile) & Jest (Unit testing)
*   **Deployment:** Cloud-native architecture optimized for Docker/Nixpacks (Coolify)

---

## ⚙️ Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd StudyHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (`.env`):**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/studyhub"

   # Auth.js (NextAuth)
   AUTH_SECRET="your_openssl_generated_secret"
   AUTH_GOOGLE_ID="your_google_oauth_client_id"
   AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"

   # UploadThing
   UPLOADTHING_TOKEN="your_uploadthing_token"
   ```

4. **Prepare the database:**
   Sync the Prisma schema with PostgreSQL:
   ```bash
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

The platform maintains a robust automated testing pipeline:

*   **Unit Tests:** Run core logic tests via Jest.
    ```bash
    npm run test
    ```
*   **End-to-End Tests:** Verify critical user flows and anti-piracy features across Desktop and Mobile devices using Playwright.
    ```bash
    npx playwright test
    ```

---
*© StudyHub. Built for practice, explanation, and progress.*
