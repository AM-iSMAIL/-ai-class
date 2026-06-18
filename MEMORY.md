# Global Project Context (MEMORY.md)

## Project Overview & Mission
**ClassAI** is an interactive, real-time educational platform designed to elevate classroom engagement. Educators can set up 6-topic course paths and deliver live lectures. As they speak, the AI acts as a teaching assistant, dynamically populating a shared whiteboard with outlines, visual descriptors, and YouTube references. Students join live, track the whiteboard updates (which are vocalized using Text-to-Speech), and complete dynamic quizzes per topic. The experience is gamified with strike tracking (absent notice on 3 strikes) and final performance reports.

---

## Tech Stack & Versions
* **Core**: React v19.2.6 (Vite SPA)
* **Styling**: TailwindCSS v4.3.1 (with `@tailwindcss/vite` plugin)
* **Iconography**: Lucide React v1.18.0 (vector-based)
* **Database & Authentication**: Firebase v12.14.0 (Auth & Firestore)
* **AI Model**: Gemini API (`gemini-2.0-flash`) for real-time whiteboard extraction and quiz generation
* **Narration**: Browser SpeechSynthesisUtterance + ElevenLabs API support

---

## Architecture & Core Decisions
1. **Offline Local Sandbox Mode**: Hardcoded to `isMock = true` in [firebase.js](file:///c:/Users/mdism/Downloads/futuristic%20study%20path/src/firebase.js) to enable zero-configuration local runs.
2. **State Sharing & Sync**:
   * *Online mode*: Real-time updates push and pull from Firestore (`sessions` collection).
   * *Offline mode*: Synchronization between teacher and student tabs is managed via browser `BroadcastChannel` (channel name `classai_local_sync`).
3. **AI Teacher (Zoom Mode)**: The AI Teacher dynamically generates structured lecture segments via the Gemini API. It uses Text-to-Speech to explain concepts, naturally switching between Unsplash diagrams and a custom proxy-based video player. The player fetches the video stream server-side via `/api/youtube-proxy` (utilizing `@distube/ytdl-core` in a custom Vite server middleware) to bypass iframe embed restrictions completely.
4. **AI Student Doubt Chat**: A persistent doubt chat panel is rendered in the right-hand sidebar below the participant tiles, designed in a clean, minimal WhatsApp style. It supports instant student doubts (blue bubbles on the right), which pause the active lecture and media stream, trigger Gemini to generate helpful explanations, read them aloud, and automatically resume the lecture and video from where it stopped.
5. **Camera & Audio Preview**: Pre-join configuration allows users to toggle and preview their webcam/mic locally before joining the room.

---

## Progress & Roadmap

### Completed Features
* [x] Shared landing/role portal selector.
* [x] Interactive classroom setup for educators.
* [x] Student join / re-join validation with security tokens.
* [x] Synchronized waiting room with a test voice option.
* [x] Zoom-style virtual classroom with main media area, persistent sidebar, and bottom toolbar.
* [x] Server-side YouTube video stream proxy route at `/api/youtube-proxy` to bypass iframe embed blocks.
* [x] Persistent WhatsApp-style doubt chat panel on the right sidebar with lecture pause/resume triggers.
* [x] Camera/mic previews and name settings on the Pre-Join screen.
* [x] Dynamic multiple-choice quiz builder with auto-grading.
* [x] Score scoreboard, strike limiters, and CSV exports.
* [x] Autonomous AI Teacher executing structured lectures, switching between images and videos automatically.
* [x] Interactive in-meeting chat drawer and participant list panel.

### Completed Refinements
* [x] Refined codebase to enforce memory structures, replace raw emojis with vector icons, and optimize React bundle size.
