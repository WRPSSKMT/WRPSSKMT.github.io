var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var getGeminiClient = (passedKey) => {
  const apiKey = passedKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined. AI course generation will fail.");
  }
  return new import_genai.GoogleGenAI({
    apiKey: apiKey || "MOCK_KEY_FOR_BUILD",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
app.post("/api/courses/generate", async (req, res) => {
  const { topic } = req.body;
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res.status(400).json({ error: "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u63A2\u7D22\u4E3B\u9898" });
  }
  const clientApiKey = req.headers["x-gemini-api-key"] || req.body.apiKey;
  const apiKey = typeof clientApiKey === "string" && clientApiKey.trim() !== "" ? clientApiKey.trim() : process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log(`No Gemini API Key provided. AI Custom route generation is locked.`);
    return res.status(401).json({
      success: false,
      error: "AI \u5B9A\u5236\u670D\u52A1\u6682\u4E0D\u5F00\u653E\u9ED8\u8BA4\u514D Key \u4F53\u9A8C\u3002\u4E3A\u4E86\u4F7F\u7528\u5B9A\u5236\u8DEF\u7EBF\u529F\u80FD\uFF0C\u8BF7\u5728\u524D\u7AEF\u8F93\u5165\u60A8\u7684 Google Gemini API \u5BC6\u94A5\u3002"
    });
  }
  try {
    const ai = getGeminiClient(apiKey);
    const prompt = `You are "Compass", a cute, gamified AI learning roadmap companion.
Design a cohesive, step-by-step learning roadmap of 5 to 7 sequential nodes for the topic: "${topic}".

Requirements:
1. Generate the content in Chinese (or match the language of the user's topic).
2. The path should flow logically from introductory basics to advanced applications.
3. Every single node in the road map MUST have:
   - A descriptive "title" and brief "description".
   - A "card" explaining the concept with a highly engaging and funny "analogy" (\u751F\u6D3B\u7C7B\u6BD4) and 3 clear "keyPoints" (\u5B66\u4E60\u91CD\u70B9).
   - A "quiz" containing exactly 3 interactive multiple-choice questions (options A, B, C) testing the concept. Each question must include an "answer" ('A', 'B', or 'C') and a friendly "explanation" (\u89E3\u6790) explaining why it is correct.
4. Keep the tone friendly, encouraging, and exciting, similar to Duolingo or a video game quest map!
5. Provide logical, alternating coordinates (x, y) for layout. For node i (0-indexed):
   - Set x alternating: 250 (for first node), then 100, then 400, then 250, then 100, then 400, etc.
   - Set y increasing by 120 per node: 100 for node 0, 220 for node 1, 340 for node 2, 460 for node 3, 580 for node 4, 700 for node 5, etc.

Return the result as a single course JSON object conforming to the requested schema.`;
    console.log(`Generating course for topic: "${topic}" using gemini-3.5-flash...`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: import_genai.Type.OBJECT,
          properties: {
            id: {
              type: import_genai.Type.STRING,
              description: "A URL-safe slug ID based on the topic, e.g. quantum-computing"
            },
            title: {
              type: import_genai.Type.STRING,
              description: "The name of the course topic, e.g. \u91CF\u5B50\u8BA1\u7B97"
            },
            icon: {
              type: import_genai.Type.STRING,
              description: "A single matching emoji icon for the course, e.g. \u{1F300}"
            },
            description: {
              type: import_genai.Type.STRING,
              description: "A fun, inspiring overview of the course"
            },
            nodes: {
              type: import_genai.Type.ARRAY,
              description: "The ordered list of learning roadmap nodes",
              items: {
                type: import_genai.Type.OBJECT,
                properties: {
                  id: { type: import_genai.Type.STRING, description: "A unique slug node ID" },
                  title: { type: import_genai.Type.STRING, description: "The node name" },
                  description: { type: import_genai.Type.STRING, description: "Brief description of this node's focus" },
                  x: { type: import_genai.Type.NUMBER, description: "X coordinate of node" },
                  y: { type: import_genai.Type.NUMBER, description: "Y coordinate of node" },
                  card: {
                    type: import_genai.Type.OBJECT,
                    properties: {
                      concept: { type: import_genai.Type.STRING, description: "Simple, precise explanation of the concept" },
                      analogy: { type: import_genai.Type.STRING, description: "An engaging, humorous real-life analogy (\u751F\u6D3B\u7C7B\u6BD4)" },
                      keyPoints: {
                        type: import_genai.Type.ARRAY,
                        items: { type: import_genai.Type.STRING },
                        description: "3 core points to learn or check off"
                      }
                    },
                    required: ["concept", "analogy", "keyPoints"]
                  },
                  quiz: {
                    type: import_genai.Type.ARRAY,
                    description: "Exactly 3 interactive quiz questions for this node",
                    items: {
                      type: import_genai.Type.OBJECT,
                      properties: {
                        question: { type: import_genai.Type.STRING },
                        options: {
                          type: import_genai.Type.ARRAY,
                          items: { type: import_genai.Type.STRING },
                          description: "Three options starting with 'A ', 'B ', 'C '"
                        },
                        answer: { type: import_genai.Type.STRING, description: "Must be 'A', 'B', or 'C' only" },
                        explanation: { type: import_genai.Type.STRING, description: "Encouraging explanation of the correct option" }
                      },
                      required: ["question", "options", "answer", "explanation"]
                    }
                  }
                },
                required: ["id", "title", "description", "x", "y", "card", "quiz"]
              }
            }
          },
          required: ["id", "title", "icon", "description", "nodes"]
        }
      }
    });
    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini API");
    }
    const courseData = JSON.parse(text);
    return res.json({ success: true, course: courseData });
  } catch (error) {
    console.error("Gemini course generation error:", error);
    return res.status(500).json({
      error: error.message || "AI \u8DEF\u7EBF\u751F\u6210\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002"
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LearnCompass server listening on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
