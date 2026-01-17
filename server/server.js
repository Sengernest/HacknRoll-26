import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// POST http://localhost:3000/cursed-text
app.post("/cursed-text", async (req, res) => {
  try {
    const themes = [
      "tarot runes",
      "glitch terminal",
      "alien HUD",
      "corrupted OS prophecy",
      "machine cult",
      "ancient circuit scripture",
    ];

    const theme = themes[Math.floor(Math.random() * themes.length)];
    const nonce = `${Date.now()}-${Math.random()}`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
        process.env.AIzaSyD2pGx-oWCoFphP8vqPpWcyvVKGMAeKXx8
      }`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text:
                    `Theme: ${theme}\nNonce: ${nonce}\n` +
                    "Generate 10–14 lines of cursed UI gibberish.\n" +
                    "Use symbols like ▓░█ ⟟ ⌁ ⌖ ⧖.\n" +
                    "Avoid real words longer than 6 letters.\n" +
                    "Plain text only.",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 1.2,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!r.ok) {
      const err = await r.text();
      console.error("Gemini error:", err);
      return res.json({ text: "▓░█ ⟟ ⌁ ⌖ ⧖" });
    }

    const data = await r.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "▓░█ ⟟ ⌁ ⌖ ⧖";

    res.json({ text });
  } catch (e) {
    console.error("Server error:", e);
    res.json({ text: "▓░█ ⟟ ⌁ ⌖ ⧖" });
  }
});

app.listen(3000, () =>
  console.log("Gemini server running on http://localhost:3000")
);
