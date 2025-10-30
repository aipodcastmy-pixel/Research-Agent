import { GoogleGenAI } from "@google/genai";
import type { Settings, Source } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getPlanningPrompt = (settings: Settings): string => {
  const languageDirective = {
    'auto': "Your plan must be written in the same language as the user's query.",
    'en': "Your plan must be written in English.",
    'zh': "Your plan must be written in Mandarin Chinese (简体中文).",
    'ms': "Your plan must be written in Malay (Bahasa Melayu)."
  }[settings.language];

  return `You are a world-class AI research analyst. Your mission is to create a research plan to produce a professional, data-driven research report based on the user's query.

**Your operational process is as follows:**

1.  **Deconstruct the Query:** Analyze the user's request to understand the core intent and key topics.
2.  **Formulate a Plan:** Create a step-by-step plan for your research. This includes generating a diverse set of search terms.
3.  **Generate Structured Output:** Produce a structured JSON object containing your thought process and the search queries you decided on.

**Key Directives:**
-   **Language:** ${languageDirective}
-   **Multi-Lingual Search Strategy:** Regardless of the plan's language, you MUST generate search queries in the most effective language(s) for the topic. For region-specific topics (e.g., about Malaysia), generate search queries in relevant local languages (like Malay) and English to ensure comprehensive results.
-   **JSON Output:** Your entire output MUST be a single JSON code block. Do not include any text before or after the code block. The JSON object MUST have the following structure: { "plan": "...", "searchQueries": ["...", "..."] }. Example:
\`\`\`json
{
  "plan": "The user wants to know about AI in healthcare. I will start by researching the latest diagnostic tools, then look into drug discovery and ethical considerations. I will formulate search queries in English and Malay to get a broad perspective.",
  "searchQueries": ["latest AI diagnostic tools", "AI drug discovery startups", "AI ethics in medicine", "aplikasi AI dalam hospital Malaysia"]
}
\`\`\``;
};

const getReportingPrompt = (summaries: string, settings: Settings): string => {
  const languageDirective = {
    'auto': "The final report must be in the same language as the research summaries.",
    'en': "The final report must be written in English.",
    'zh': "The final report must be written in Mandarin Chinese (简体中文).",
    'ms': "The final report must be written in Malay (Bahasa Melayu)."
  }[settings.language];

  return `You are a world-class AI research analyst. Your mission is to write a professional, data-driven report based *only* on the provided research summaries.

**Your operational process is as follows:**

1.  **Synthesize:** Critically analyze the collected research summaries below and synthesize them into a cohesive understanding. Do not use any outside knowledge.
<hr>
${summaries}
<hr>
2.  **Generate Report:** Write a professional research report in Markdown format. The report should include:
    -   An "Executive Summary".
    -   "Key Findings" presented as bullet points.
    -   A "Conclusion".

**Key Directives:**
-   **Output Language:** ${languageDirective}
-   **Evidence-Based:** Strictly base all information on the summaries provided.
-   **Markdown Format:** The entire output must be a single, well-formatted Markdown document. Do not wrap it in a code block.
`;
};

const SUMMARIZER_PROMPT = "You are a research assistant. Based on the provided search results, provide a concise, factual summary. Focus on the key information relevant to the user's query. Do not add any conversational text or introductions.";

export type ResearchStreamEvent = 
  | { type: 'search_step'; query: string }
  | { type: 'report_chunk'; text: string }
  | { type: 'sources'; sources: Source[] }
  | { type: 'status_update'; status: 'writing' };

export async function generatePlan(query: string, settings: Settings): Promise<{ plan: string; searchQueries: string[] }> {
    const response = await ai.models.generateContent({
        model: settings.model,
        contents: [{ role: "user", parts: [{ text: query }] }],
        config: {
            systemInstruction: getPlanningPrompt(settings),
        },
    });

    const responseText = response.text;
    try {
        let jsonString = responseText;
        const match = responseText.trim().match(/```json\n([\s\S]+)\n```/);
        if (match && match[1]) {
            jsonString = match[1];
        }
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse plan JSON:", e, "\nRaw response:", responseText);
        throw new Error("Failed to generate a valid research plan.");
    }
}


export async function* streamResearchProcess(query: string, searchQueries: string[], settings: Settings): AsyncGenerator<ResearchStreamEvent> {
    const summaries: string[] = [];
    let allSources: Source[] = [];

    // Step 1: Execute searches one by one and gather summaries
    for (const searchQuery of searchQueries) {
        yield { type: 'search_step', query: searchQuery };
        
        const response = await ai.models.generateContent({
            model: settings.model,
            contents: [{ role: "user", parts: [{ text: `User's main goal: ${query}. Current search query: ${searchQuery}` }] }],
            config: {
                systemInstruction: SUMMARIZER_PROMPT,
                tools: [{ googleSearch: {} }],
            }
        });

        summaries.push(`Summary for query "${searchQuery}":\n${response.text}`);
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            const newSources = groundingChunks
                .map((c: any) => c.web)
                .filter((web: any) => web && web.uri && web.title)
                .map((web: any) => ({ uri: web.uri, title: web.title }));
            allSources.push(...newSources);
        }
        // Small delay to make the UI update feel more natural
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Step 2: Yield the final status update before writing
    yield { type: 'status_update', status: 'writing' };

    // Step 3: Generate and stream the final report
    if (summaries.length > 0) {
        const reportingPrompt = getReportingPrompt(summaries.join('\n\n'), settings);
        const responseStream = await ai.models.generateContentStream({
            model: settings.model,
            contents: [{ role: "user", parts: [{ text: query }] }],
            config: {
                systemInstruction: reportingPrompt,
            },
        });

        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
                yield { type: 'report_chunk', text };
            }
        }
    }
    
    // Step 4: Yield all unique sources at the end
    if (allSources.length > 0) {
        const uniqueSources = Array.from(new Map(allSources.map(item => [item.uri, item])).values());
        yield { type: 'sources', sources: uniqueSources };
    }
}
