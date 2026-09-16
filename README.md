# TaskFlow — Task Management Web Application

> **Graduate Support Engineer Trainee Assessment Submission**  
> Built with React, Vite, TypeScript, Firebase Authentication, and Cloud Firestore.

---

## 1. Application Overview

**TaskFlow** is a streamlined, responsive task management web application designed to satisfy the core requirements of the Graduate Support Engineer Trainee assessment. It provides a secure, single-tenant user experience where authenticated team members can maintain a personal task backlog, create new items, review their active work in real time, and progress tasks across standard lifecycle stages.

The architecture emphasizes simplicity, security, and maintainability—eliminating unnecessary third-party dependencies, complex state machines, and backend server layers.

---

## 2. Features

- **Google Authentication**: Frictionless login and session management powered by Firebase Authentication with Google Sign-In popups.
- **User Dashboard & Profile**: Displays authenticated user profile metadata (avatar, display name, email) and a dedicated one-click sign-out action.
- **Task Creation**: Clean form allowing users to submit tasks with mandatory title validation and optional descriptions.
- **Lifecycle Status Workflow**: All tasks are automatically created with an initial status of `Planned`. Users can update any task to `Planned`, `In Progress`, or `Complete`.
- **Private, Real-Time Task List**: Uses Firestore real-time snapshots (`onSnapshot`) scoped strictly to the authenticated user's Firebase UID (`userId`).
- **Status Filtering**: Quick filter chips (`All`, `Planned`, `In Progress`, `Complete`) with dynamic counters for efficient task triage.
- **Clear State Handling**: Explicit visual states for loading, empty lists, empty search/filter results, and network/security errors.
- **Hardened Security**: Firestore Security Rules ensure tasks are completely private—no user can query, read, or modify another user's documents.

---

## 3. How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- A Firebase project with Google Authentication and Cloud Firestore enabled

### Steps

1. **Clone or Download the Repository**:
   ```bash
   git clone <repository-url>
   cd taskflow
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and fill in your Firebase project credentials (see [Environment Variables](#7-environment-variables) below).

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 4. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select an existing project). Name it (e.g., `taskflow-assessment`).
3. (Optional) Disable Google Analytics if not needed, then click **Create project**.
4. In your project overview, click the **Web icon (`</>`)** to register a web application.
5. Enter an app nickname (e.g., `TaskFlow Web`) and click **Register app**.
6. Copy the `firebaseConfig` object values provided into your local `.env` file.

---

## 5. Google Authentication Setup

1. In the Firebase Console left navigation, click **Build > Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Google** from the list of additional providers.
4. Toggle the **Enable** switch.
5. Enter a **Project support email** from the dropdown.
6. Click **Save**.
7. Under **Authentication > Settings > Authorized Domains**, ensure your hosting domain is added:
   - For local development: `localhost` is authorized by default.
   - For Cloud Run / Vercel / Netlify / AI Studio preview: Add your domain URL (e.g., `*.run.app` or custom domain).

---

## 6. Firestore Setup

1. In the Firebase Console left navigation, click **Build > Firestore Database**.
2. Click **Create database**.
3. Select a cloud location (e.g., `nam5 (us-central)` or `asia-southeast1`).
4. Select **Start in production mode** (our `firestore.rules` will enforce security).
5. Click **Create**.
6. Navigate to the **Rules** tab in the Firestore dashboard.
7. Paste the contents of `firestore.rules` into the editor and click **Publish**.

### Security Rules Summary
- Catch-all rule denies access by default: `match /{document=**} { allow read, write: if false; }`.
- `tasks` collection:
  - `get`: Allowed only if `request.auth.uid == resource.data.userId`.
  - `list`: Enforces `resource.data.userId == request.auth.uid`.
  - `create`: Enforces `request.auth.uid == incoming().userId`, initial `status == 'Planned'`, and valid timestamps.
  - `update`: Enforces owner UID, immutable `userId` and `createdAt`, and restricts modifiable fields to `status` and `updatedAt`.
  - `delete`: Denied (per assessment scope).

---

## 7. Environment Variables

TaskFlow uses Vite environment variables prefixed with `VITE_`. Define these in your `.env` or deployment settings:

| Variable Name | Description | Example Value |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Web API Key | `AIzaSyD...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `taskflow-app.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Google Cloud / Firebase Project ID | `taskflow-app` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Cloud Storage Bucket | `taskflow-app.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Cloud Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase Web Application ID | `1:123456789012:web:abc123` |

---

## 8. Deployment

### Static Hosting (Vercel, Netlify, Firebase Hosting, GitHub Pages)
TaskFlow is a client-side Single Page Application (SPA). To deploy:
1. Run `npm run build` to generate the production bundle in `/dist`.
2. Configure your hosting provider to serve `/dist` and route all requests to `index.html` (SPA rewrite).
3. Add the `VITE_FIREBASE_*` environment variables in your hosting provider's dashboard.
4. Add your production domain to the **Authorized Domains** list in Firebase Authentication.

### Container / Cloud Run Deployment
If running inside a container, ensure Vite preview or static file server binds to `0.0.0.0` and port `3000`.

---

## 9. Assumptions

1. **Private User Workspaces**: Tasks are strictly private to the authenticated creator. Collaboration, task delegation, and public sharing were intentionally omitted to conform strictly with assessment parameters.
2. **Sole Authentication Provider**: Google Sign-In is the only authentication mechanism provided, directly satisfying the explicit requirement.
3. **Mandatory Title, Optional Description**: Task titles must contain non-whitespace text (1–150 chars). Descriptions are optional notes (up to 1,000 chars).
4. **Lifecycle Progression**: All new tasks start with status `Planned`. Users are permitted to change the status freely between `Planned`, `In Progress`, and `Complete` at any point.
5. **No Task Deletion**: Deletion was explicitly noted as not required in the assessment brief. To prevent accidental data loss and maintain an audit trail, delete operations are restricted by security rules.
6. **Persistent Cloud Storage**: Cloud Firestore serves as the persistent, real-time database across all user sessions and devices.
7. **No Artificial AI Layers**: In strict accordance with the assessment instructions, no Gemini API or generative AI features are imported or executed at runtime.

---

## 10. Known Limitations

- **Single Sign-On Requirement**: Requires users to have an active Google Account. Offline guest accounts and password logins are not enabled.
- **Compound Query Indexing**: Sorting and filtering are performed gracefully on the client side over the user's active tasks dataset. If an organization scales to thousands of tasks per user, a Firestore composite index (`userId ASC, createdAt DESC`) should be created.
- **Network Dependency**: Live updates and mutations require active internet connectivity to communicate with Firestore endpoints.
