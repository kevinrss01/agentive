# Agentive

**Agentive** is an AI-powered lifestyle assistant that plans travel, discovers restaurants, and
finds shopping deals through a natural, conversational interface.

## Overview

Tired of juggling multiple apps for travel, dining, and shopping? Agentive simplifies your life by
consolidating these tasks into a single chat conversation. Ask for anything in plain language—from
planning a trip to finding a dinner spot—and our AI-powered agent performs real-time web research to
deliver personalized, up-to-date recommendations.

## Key Features

- ✈️ **AI Travel Agent:** Get complete trip itineraries with real-time flight and hotel options.
- 🍔 **Restaurant Discovery:** Find the perfect dining spot based on your tastes, budget, and
  location.
- 🛍️ **Smart Shopping Assistant:** Discover the best deals and product comparisons.
- 🗣️ **Voice-Powered Interaction:** Talk to Agentive naturally using your microphone.
- 🧠 **Personalized & Learns:** Remembers your preferences to provide better recommendations over
  time.
- 🌐 **Real-Time Web Research:** Fetches live data from the web, so information is always current.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **AI & ML:** OpenAI GPT-4, Llama-2 (via Groq)
- **Database:** Supabase (PostgreSQL)
- **Real-time:** Socket.io
- **Tooling:** pnpm, ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (`npm install -g pnpm`)

### 1. Clone the Repository

```bash
git clone https://github.com/kevinrss01/agentive.git
cd agentive
```

### 2. Setup Backend

```bash
cd backend
pnpm install
cp .env.example .env
```

Now, edit `.env` and add your API keys.

### 3. Setup Frontend

In a new terminal:

```bash
cd frontend
pnpm install
```

Create a `.env.local` file with the backend URL:

```bash
echo "NEXT_PUBLIC_BASE_URL_BACKEND=http://localhost:4000" > .env.local
```

### 4. Run the App

1.  **Start the backend:** In the `/backend` directory, run:
    ```bash
    pnpm dev
    ```
2.  **Start the frontend:** In the `/frontend` directory, run:
    ```bash
    pnpm dev
    ```

The app will be available at `http://localhost:3000`.

## How to Use

Once the app is running, open `http://localhost:3000/app`. You can type your request into the
chatbox or use the microphone icon for voice commands. Try asking for things like:

- _"Plan a 3-day trip to Lisbon."_
- _"Find a cheap Italian restaurant near me."_
- _"What are the best headphones under $200?"_

Agentive will process your request, perform live research, and provide a detailed answer in the
chat.

## Project Context

Agentive was built as a prototype for the **Lablab.ai AI Agents Hackathon**. It's a demonstration of
what's possible with modern AI agentic workflows, built in a very short timeframe.
