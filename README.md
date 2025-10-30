# Research Agent

An advanced AI-powered web browsing agent designed for conducting in-depth, transparent research. It leverages the Google Gemini API to autonomously formulate research plans, browse the web, and synthesize information into professional reports, providing a real-time, step-by-step view of its entire process.

## Key Features

-   **Autonomous Research:** Simply provide a topic, and the agent handles the entire research workflow from planning to reporting.
-   **Transparent Thinking Process:** See the agent's strategic plan and the exact search queries it will use *before* it begins its research.
-   **Real-Time Step-by-Step Execution:** Watch live as the agent executes each search query, marking them as complete one by one, providing full visibility into its work.
-   **Live Report Generation:** See the final report being written word-by-word in real-time, as if an analyst is typing it out directly for you.
-   **Multi-Lingual Intelligence:** The agent automatically formulates search queries in the most effective languages (e.g., English, Malay, Mandarin) to gather comprehensive data, while delivering the final report in the user's original language.
-   **Interactive Source Citing:** All reports include clickable sources, which can be previewed directly within the app in an iframe modal, allowing for quick verification.
-   **Configurable Settings:** (Coming Soon) Customize the agent's behavior by selecting the language, AI model, and other parameters through an easy-to-use settings panel.

## How It Works

The agent follows a transparent, multi-step process for every query:

1.  **Plan:** The agent first analyzes your query and generates a public research plan, including a list of diverse search queries it will use. This step is completed almost instantly.
2.  **Search:** It then executes each search query sequentially, using Google Search grounding via the Gemini API to gather up-to-date information. The UI shows which query is currently active and which are complete.
3.  **Synthesize & Report:** After gathering information, the agent critically analyzes all the collected data. It then writes a structured, professional report in Markdown, streaming the text to you in real-time.

## Technology Stack

-   **AI Engine:** Google Gemini API (`gemini-2.5-flash`) with Google Search grounding.
-   **Frontend:** React & TypeScript.
-   **Styling:** Tailwind CSS.
