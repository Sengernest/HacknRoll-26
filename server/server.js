import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a D&D Dungeon Master.

Write a SHORT narration of what happens next.

STYLE RULES:
- Second person ("you")
- Concrete physical details (rooms, roads, weather, NPCs, items)
- Immediate cause-and-effect
- No cosmic or abstract language (no fate, destiny, stars, heavens)
- No modern terms
- 2–4 sentences max

You must ALWAYS respond with VALID JSON ONLY.
No markdown.
No explanations.
No extra text.

The JSON format MUST be:

{
  "good": "...",
  "very_good": "..."
}

Tone:
- "good" = a favorable outcome, lucky
- "very_good" = rolling a perfect outcome, extremely lucky

Keep responses concise (1–2 sentences each).
`;

const memory = {
  history: [],           // past outcomes
  lastNarrations: null,  // { good, very_good }
};

const MAX_HISTORY = 20;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mockNarrations(progress, history) {
  return {
    good: `✨ Progress ${progress}: Fortune nudges you forward.`,
    very_good: `🌟 Progress ${progress}: Destiny bends completely in your favor.`,
  };
}

function extractJSON(text) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in response");
  }

  const jsonString = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString);
}


app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
    });

    res.json({
      reply: response.text ?? "No response from Gemini",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini request failed" });
  }
});

app.post("/chat-mock", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // Optional: log incoming request
    console.log("🧪 Mock Gemini request received:", userMessage);

    // ⏳ artificial delay (5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    res.json({
      reply: "✨ Fate smiles upon you. The path ahead opens without resistance.",
      mock: true,
    });
  } catch (err) {
    console.error("Mock route error:", err);
    res.status(500).json({ error: "Mock Gemini failed" });
  }
});

app.post("/fate/init", async (req, res) => {
  try {
    const { progress = 0 } = req.body;

    // Reset memory
    memory.history.length = 0;
    memory.lastNarrations = null;

    const prompt = `
      ${SYSTEM_PROMPT}
      Progress: ${progress}

      Generate TWO narrations for a start of a campaign.
      `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    console.log("INIT response:", response.text);

    const json = extractJSON(response.text);

    memory.lastNarrations = {
      good: json.good,
      very_good: json.very_good,
    };

    res.json({
      ok: true,
      narrations: memory.lastNarrations,
    });
  } catch (err) {
    console.error("INIT error:", err);
    res.status(500).json({ error: "Init failed" });
  }
});


app.post("/fate/query", async (req, res) => {
  try {
    const { outcome, progress } = req.body;

    if (!outcome || !progress) {
      return res.status(400).json({ error: "outcome and progress required" });
    }

    // Append outcome to memory
    memory.history.push({
      outcome,
      progress,
      time: Date.now(),
    });

    while (memory.history.length > MAX_HISTORY) {
      memory.history.shift();
    }

    const historyText = memory.history
      .map(h => `- ${h.outcome} at progress ${h.progress}`)
      .join("\n");

    const prompt = `
      ${SYSTEM_PROMPT}
      Current progress: ${progress} / 100

      History:
      ${historyText}

      Generate updated narrations for:
      - GOOD outcome
      - VERY_GOOD outcome
      `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    
    console.log("Gemini response:", response.text);

    const json = extractJSON(response.text);

    memory.lastNarrations = {
      good: json.good,
      very_good: json.very_good,
    };

    res.json({
      ok: true,
      narrations: memory.lastNarrations,
    });
  } catch (err) {
    console.error("QUERY error:", err);
    res.status(500).json({ error: "Query failed" });
  }
});

app.post("/mockfate/init", async (req, res) => {
  try {
    const { progress = 0 } = req.body;

    // Reset memory
    memory.history.length = 0;

    // Simulate Gemini latency
    await delay(1200);

    const narrations = mockNarrations(progress, memory.history);

    memory.lastNarrations = narrations;

    console.log("🧪 MOCK INIT");
    console.log("Memory:", memory);

    res.json({
      ok: true,
      mock: true,
      narrations,
      memory,
    });
  } catch (err) {
    console.error("Mock init error:", err);
    res.status(500).json({ error: "Mock init failed" });
  }
});

app.post("/mockfate/query", async (req, res) => {
  try {
    const { outcome, progress } = req.body;

    if (!outcome || progress == null) {
      return res.status(400).json({
        error: "outcome and progress required",
      });
    }

    // Append to memory
    memory.history.push({
      outcome,
      progress,
      time: Date.now(),
    });

    while (memory.history.length > MAX_HISTORY) {
      memory.history.shift();
    }

    // Simulate Gemini latency
    await delay(1500);

    const narrations = mockNarrations(progress, memory.history);
    memory.lastNarrations = narrations;

    console.log("🧪 MOCK QUERY");
    console.log("Memory:", memory);

    res.json({
      ok: true,
      mock: true,
      narrations,
      memory,
    });
  } catch (err) {
    console.error("Mock query error:", err);
    res.status(500).json({ error: "Mock query failed" });
  }
});



app.listen(process.env.PORT, () => {
  console.log(`Gemini backend running on port ${process.env.PORT}`);
});

