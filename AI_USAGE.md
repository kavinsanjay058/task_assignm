# AI Usage Disclosure

## AI Tool Used
- **Tool**: Google AI Studio
- **Role**: AI-assisted software development and engineering copilot

---

## What AI Was Used For

In accordance with the Graduate Support Engineer Trainee assessment guidelines, Google AI Studio was utilized strictly as an engineering acceleration tool to assist with:

1. **Project Scaffolding**: Structuring the Vite + React + TypeScript project architecture, configuring Tailwind utility classes, and declaring typed module boundaries.
2. **React Components**: Developing functional, decoupled React 19 components (`LoginPage`, `Navbar`, `Dashboard`, `TaskForm`, `TaskList`) adhering to modern React paradigms.
3. **Firebase Integration**: Setting up the Firebase modular SDK v11, handling initialization, and configuring Firebase Authentication with `GoogleAuthProvider`.
4. **Authentication Flow**: Implementing popup-based Google Sign-In, listening to authentication state changes (`onAuthStateChanged`), handling user session lifecycle, and providing user profile access.
5. **Firestore Operations**: Implementing real-time task subscriptions (`onSnapshot`), document insertions (`addDoc`), and atomic status updates (`updateDoc`) with server timestamps.
6. **UI & Accessibility Implementation**: Styling clean, responsive UI layouts with Tailwind CSS, establishing accessible form labels, touch target sizes, status badges, and loading/error states.
7. **Security Rules & Validation**: Drafting attribute-based access control (ABAC) in `firestore.rules` and establishing intermediate schema definitions in `firebase-blueprint.json`.
8. **Debugging & Error Handling**: Creating robust client-side error handling (`handleFirestoreError`) to gracefully report configuration, network, and permission issues.
9. **Documentation**: Structuring the comprehensive `README.md` containing local setup steps, architecture assumptions, and manual Firebase configuration instructions.

---

## Engineering Review & Verification Statement

> **Candidate Verification**:  
> All code generated with the assistance of Google AI Studio was thoroughly reviewed, verified for architectural compliance, tested against the assessment specifications, and manually refined where necessary.
>
> Specifically:
> - Verified that no Gemini API or AI models are loaded or invoked within the runtime code.
> - Confirmed strict data isolation so that one user cannot read or update another user's task records.
> - Tested form input validation to ensure empty task titles are rejected with immediate user feedback.
> - Validated that new tasks start with status "Planned" and can be updated across all three specified states ("Planned", "In Progress", "Complete").
