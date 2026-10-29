# FeelInk 超繪聊

**An AI emotional support platform that combines drawing with empathetic AI conversation.**

Users express how they feel by drawing on a canvas and chatting with an AI partner. FeelInk reads both the artwork and the conversation to understand the user's emotions, responds with empathy, and steps in with real support resources when it detects signs of distress.

- 🏆 **3rd Place**, Information Applications Track, 30th InnoServe Awards (1,964 teams nationwide)
- 🏅 **Honorable Mention**, MOE Intelligent Innovation Contest (2025)
- 🏅 **Honorable Mention**, NTOU CSE Capstone Competition (2025)

> This repository is the **React frontend**. The Spring Boot backend lives in [feelink_backend](https://github.com/PeiJeSsu/feelink_backend).

---

## 🎬 Demo Video

[![Watch the FeelInk demo on YouTube](https://img.youtube.com/vi/wIL9Pozo4Vw/hqdefault.jpg)](https://youtu.be/wIL9Pozo4Vw)

*Click the image to watch the demo on YouTube.*

---

## 📸 Screenshots

> The app UI is in Traditional Chinese.

| AI partner reads the drawing and responds | AI generates objects onto the canvas |
|---|---|
| ![Canvas and AI chat](docs/screenshots/canvas-ai-chat.png) | ![Generate objects](docs/screenshots/generate-objects.png) |
| **Drawing relay: the AI continues the picture** | **Daily emotion report** |
| ![Drawing relay](docs/screenshots/drawing-relay.png) | ![Emotion report](docs/screenshots/emotion-report.png) |

---

## ✨ Features

### 🎨 Drawing
- Rich drawing tools built on Fabric.js: textured brushes (crayon, ink, and more), shapes, text, eraser, and paint bucket
- Adjustable color, size, and opacity; move, rotate, scale, group, undo, and redo
- Save and reopen canvases, or export them as files

### 💬 AI Partner
- Three AI partners with distinct personalities: warm, curious, and creative
- Replies stream in real time over Server-Sent Events, so there is no silent wait
- Multimodal input: the AI can analyze the canvas as well as the conversation

### 🖌️ AI-Assisted Creation
- **Analyze canvas**: the AI interprets colors, subjects, and composition to gauge the user's mood
- **Generate objects**: describe something and the AI draws it, with the background removed, ready to place on the canvas
- **Drawing relay**: the AI picks up the user's drawing and continues it

### 🛡️ Emotional Support
- **Crisis-aware replies**: recent messages are scored on a five-level risk rubric, and the level shapes the response, from ordinary conversation up to crisis hotlines
- **Real resources**: when support is needed, the AI searches the web (SerpAPI) to recommend counseling services that actually exist
- **Daily emotion report**: scores eight emotions, summarizes the day, and infers the user's psychological needs

---

## 🏗️ Architecture

```mermaid
flowchart LR
    U([User]) --> FE["React SPA<br/>Fabric.js · MUI"]
    FE -- Sign-in --> FA[Firebase Auth]
    FE -- "REST / SSE" --> BE["Spring Boot API"]
    BE --> DB[(MongoDB Atlas)]
    BE --> G["Gemini<br/>(Google Gen AI)"]
    BE --> NL["Google Cloud<br/>Natural Language"]
    BE --> S[SerpAPI]
    BE --> R[remove.bg]
```

| Layer | Technology |
|---|---|
| Frontend | React 19, Material UI, Fabric.js, Recharts, React Router |
| Backend | Spring Boot 3, Java 17 |
| Database | MongoDB Atlas |
| Auth | Firebase Authentication (email/password and Google sign-in) |
| AI & APIs | Gemini, Google Cloud Natural Language, SerpAPI, remove.bg |
| Deployment | Vercel (frontend), Google Cloud Run (backend) |
| Testing & Quality | Jest, JUnit, SonarQube Cloud, GitHub Actions |

---

## ✅ Testing & CI/CD

- **1,300+ automated tests**: about 900 Jest tests in this repo and 440 JUnit tests in the backend
- Every push to `main` and every pull request runs the full test suite with coverage, followed by SonarQube analysis, through GitHub Actions
- Workflows are in [`.github/workflows`](.github/workflows)

---

## 🚀 Getting Started

**Prerequisites:** Node.js 18+, a Firebase project, and a running [backend](https://github.com/PeiJeSsu/feelink_backend).

```bash
git clone https://github.com/PeiJeSsu/feelink_frontend.git
cd feelink_frontend
npm install
```

Create a `.env` file in the project root:

```env
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

Then run:

```bash
npm start              # Start the dev server at http://localhost:3000
npm run test:coverage  # Run tests with a coverage report
```

---

## 👥 Team

Capstone project by a 4-person team at the Department of Computer Science and Engineering, National Taiwan Ocean University, advised by Prof. Shang-Pin Ma.

**My role (Team Lead):** led system architecture design, designed the crisis-aware response flow, built real-time streaming chat over SSE, integrated the frontend and backend, and set up the CI/CD pipeline.
