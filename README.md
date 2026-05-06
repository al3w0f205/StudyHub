# StudyHub - Advanced Educational Platform

StudyHub is a high-performance educational platform designed to streamline pre-university and university-level preparation. Built on a modern tech stack, the platform provides an algorithmic assessment engine, secure administration workflows, and a strictly optimized dark-mode interface designed to minimize cognitive load.

> **Notice regarding proprietary data:** The core question banks, categorizations, and specific quiz data are proprietary. They have been explicitly excluded from this public repository via `.gitignore`. This source code is shared strictly as an architectural portfolio piece.

## System Architecture

### Assessment Engine
*   **Algorithmic Randomization:** Dynamic server-side shuffling of questions and multiple-choice options prevents pattern memorization and enforces conceptual understanding.
*   **Performance Tracking:** Automated post-quiz calculations generate persistent analytics, tracking student mastery across designated subjects (e.g., Calculus, Anatomy, Physics).
*   **Mathematical Rendering:** Real-time parsing of LaTeX syntax via KaTeX for complex equations and justifications.

### Administration & RBAC
*   **Role-Based Access Control:** Strict permission segregation allowing administrators to grant, revoke, and monitor user access to specific academic domains.
*   **Subscription Management:** An integrated workflow for manual verification of payment receipts and subscription extensions.
*   **Automated Content Seeding:** A bulk synchronization mechanism that parses local JSON structures and maps them into the PostgreSQL database.

### Security Infrastructure
*   **Edge Middleware & Rate Limiting:** In-memory request throttling implemented at the Edge level to mitigate brute-force attacks on authentication and API endpoints.
*   **Real-Time Authorization:** Database-level permission validation per request, bypassing the traditional limitations of stale JWT claims.
*   **Anti-Scraping Measures:** Protected payload structures and terms-of-service enforcements to mitigate content piracy.

## Technology Stack

*   **Framework:** Next.js 15 (App Router, Server Actions)
*   **Database Engine:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** Auth.js v5 (OAuth 2.0 & Credentials)
*   **File Storage:** UploadThing
*   **Animations:** Framer Motion
*   **Styling:** Modern Vanilla CSS + Tailwind CSS integration
*   **Testing Infrastructure:** Playwright (Cross-device E2E), Jest (Unit Testing), React Testing Library (Component Audits)
*   **CI/CD:** Husky Pre-commit hooks, Lint-staged

## Local Development

### Prerequisites
*   Node.js 20+
*   PostgreSQL instance

### Initialization

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd StudyHub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory.
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/studyhub"
   AUTH_SECRET="your_openssl_generated_secret"
   AUTH_GOOGLE_ID="your_google_oauth_client_id"
   AUTH_GOOGLE_SECRET="your_google_oauth_client_secret"
   UPLOADTHING_TOKEN="your_uploadthing_token"
   ```

4. **Database Synchronization:**
   ```bash
   npx prisma db push
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Testing & Quality Assurance

The repository is protected by Husky pre-commit hooks that enforce code quality standards before any code is pushed.

*   **Unit & Component Testing:**
    ```bash
    npm run test
    ```
*   **End-to-End Testing (Chromium, Mobile Safari, Mobile Chrome):**
    ```bash
    npx playwright test
    ```

---
*StudyHub Source Code Portfolio.*
