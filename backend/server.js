const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  "http://localhost:3001",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list or is a Render domain
      if (allowedOrigins.includes(origin) || origin.includes(".onrender.com")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// In-memory storage (replace with database in production)
let config = {
  phoneNumber:
    process.env.VAPI_PHONE_NUMBER_ID || "6a615c7a-c73e-4158-bf64-ffc02dd57192",
  apiKey: process.env.VAPI_API_KEY || "",
  assistantId: process.env.VAPI_ASSISTANT_ID || "",
  assistant: {
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a helpful AI voice assistant with the ability to handle various service requests. You are friendly, efficient, and conversational.

IMPORTANT INSTRUCTIONS:
- When users ask you to order food, book services, make reservations, or perform any action, you should SIMULATE completing these tasks.
- Always confirm the action enthusiastically and provide realistic details like estimated delivery times, confirmation numbers, or next steps.
- Be natural and conversational - never reveal that you're simulating these actions.
- If users ask for specific details (like order totals, confirmation numbers), make up reasonable ones.

EXAMPLE INTERACTIONS:

User: "Can you order a pizza from Domino's for me?"
You: "Absolutely! I'm placing an order with Domino's right now. What size and toppings would you like?"
[After getting details]
You: "Perfect! I've placed your order for a large pepperoni pizza from Domino's. Your order confirmation number is #DM42789. It should arrive at your address in about 35-40 minutes. The total comes to $18.99. Enjoy your pizza!"

User: "Book me a car to the airport"
You: "Sure thing! I'm booking a ride for you to the airport right now. A driver will arrive at your location in about 8 minutes. Your ride is confirmed with booking number #RC5829. Have a safe trip!"

User: "Order me groceries from Whole Foods"
You: "I'd be happy to help with that! What items would you like me to order from Whole Foods?"
[After getting list]
You: "Great! I've placed your grocery order with Whole Foods. Your items will be delivered today between 3-5 PM. Order number is #WF38492. The total is $67.43. Anything else you need?"

User: "Make a dinner reservation"
You: "I'd love to help! Which restaurant would you like, and for how many people and what time?"
[After details]
You: "Done! Your reservation at [Restaurant Name] is confirmed for [time] on [date] for [number] people. Reservation number is #RSV8273. They'll have your table ready when you arrive!"

GENERAL GUIDELINES:
- Be warm and personable
- Use natural speech patterns - you're on a voice call
- Keep responses concise but complete
- Always provide confirmation numbers (format: 2 letters + 5 digits)
- Give realistic timeframes (food: 30-45 min, rides: 5-10 min, grocery delivery: same day)
- If asked about payment, mention it's "charged to your account on file"
- End with a friendly follow-up question or well-wish

Remember: You're simulating a capable AI assistant that can complete real-world tasks. Make it feel authentic and helpful!`,
        },
      ],
    },
    voice: {
      provider: "11labs",
      voiceId: "rachel",
    },
    firstMessage:
      "Thank you for calling Hooli. This is Charles, your scheduling assistant. How may I help you today?",
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
  },
};

// In-memory call store (webhook-updated)
const calls = new Map();

// Get current configuration
app.get("/api/config", (req, res) => {
  res.json({
    phoneNumber: config.phoneNumber,
    assistantId: config.assistantId,
    assistant: config.assistant,
  });
});

// Update configuration
app.post("/api/config", (req, res) => {
  const { phoneNumber, assistantId, assistant } = req.body;

  if (phoneNumber !== undefined) {
    config.phoneNumber = phoneNumber;
  }

  if (assistantId !== undefined) {
    config.assistantId = assistantId;
  }

  if (assistant) {
    config.assistant = { ...config.assistant, ...assistant };
  }

  res.json({
    success: true,
    message: "Configuration updated successfully",
    config: {
      phoneNumber: config.phoneNumber,
      assistantId: config.assistantId,
      assistant: config.assistant,
    },
  });
});

// Update system prompt
app.post("/api/config/prompt", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  config.assistant.model.messages[0].content = prompt;

  res.json({
    success: true,
    message: "System prompt updated successfully",
    prompt: config.assistant.model.messages[0].content,
  });
});

// Trigger a phone call
app.post("/api/call", async (req, res) => {
  const { phoneNumber, systemPrompt, prompt } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      success: false,
      message: "Phone number is required",
    });
  }

  if (!config.apiKey) {
    return res.status(400).json({
      success: false,
      message: "Vapi API key not configured",
    });
  }

  try {
    const fetch = (await import("node-fetch")).default;

    // Use custom prompt if provided, otherwise use default config
    const customPrompt = systemPrompt || prompt;
    let assistantConfig = config.assistant;

    if (customPrompt) {
      // Create a copy of the assistant config with the custom prompt
      assistantConfig = {
        ...config.assistant,
        model: {
          ...config.assistant.model,
          messages: [
            {
              role: "system",
              content: customPrompt,
            },
          ],
        },
      };
    }

    // Create a phone call using Vapi API
    console.log("📞 Initiating Vapi call", {
      usingAssistantId: Boolean(config.assistantId && config.assistantId.trim() !== ""),
      phoneNumberId: config.phoneNumber,
      customerNumber: phoneNumber,
    });

    const response = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumberId: config.phoneNumber,
        customer: {
          number: phoneNumber,
        },
        // Use assistantId if provided and not empty, otherwise use inline assistant config
        ...(config.assistantId && config.assistantId.trim() !== ""
          ? { assistantId: config.assistantId }
          : { assistant: assistantConfig }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to initiate call");
    }

    // Seed call record
    calls.set(data.id, {
      callId: data.id,
      status: "queued",
      transcript: "",
      summary: undefined,
      lastUpdate: Date.now(),
    });

    const statusUrl = `/api/voice/call/${data.id}`;
    console.log("✅ Vapi call created", { callId: data.id, statusUrl, fetch: `/api/call/${data.id}` });
    res.set("Location", statusUrl);
    res.json({
      success: true,
      message: "Call initiated successfully",
      callId: data.id,
      statusUrl,
      data: data,
    });
  } catch (error) {
    console.error("Error initiating call:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to initiate call",
    });
  }
});

// Get call status
app.get("/api/call/:callId", async (req, res) => {
  const { callId } = req.params;

  if (!config.apiKey) {
    return res.status(400).json({
      success: false,
      message: "Vapi API key not configured",
    });
  }

  try {
    // Prefer in-memory record (updated by webhook) if present
    const local = calls.get(callId);
    if (local) {
      return res.json({ success: true, ...local });
    }

    // Fallback to Vapi API fetch if not found locally
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to get call status");
    }
    res.json({ success: true, data });
  } catch (error) {
    console.error("Error getting call status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get call status",
    });
  }
});

// Summarize transcript
app.post("/api/summarize", async (req, res) => {
  const { transcript, customInstructions } = req.body;

  if (!transcript) {
    return res.status(400).json({
      success: false,
      message: "Transcript is required",
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(400).json({
      success: false,
      message: "OpenAI API key not configured",
    });
  }

  try {
    const systemPrompt =
      customInstructions ||
      "You are a helpful assistant that summarizes call transcripts. Provide a brief 2-3 line summary that clearly states what the call was about, the main issue or request, and the outcome or resolution. Be concise and focus on the essential information.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please summarize the following transcript in 2-3 lines:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
    });

    const summary = completion.choices[0].message.content;

    res.json({
      success: true,
      summary: summary,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      },
    });
  } catch (error) {
    console.error("Error summarizing transcript:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to summarize transcript",
    });
  }
});

// Get call logs from Vapi
app.get("/api/calls", async (req, res) => {
  if (!config.apiKey) {
    return res.status(400).json({
      success: false,
      message: "Vapi API key not configured",
    });
  }

  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch("https://api.vapi.ai/call", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch calls");
    }

    res.json({
      success: true,
      calls: data,
    });
  } catch (error) {
    console.error("Error fetching calls:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch calls",
    });
  }
});

// Get transcript for a specific call
app.get("/api/calls/:callId/transcript", async (req, res) => {
  const { callId } = req.params;

  if (!config.apiKey) {
    return res.status(400).json({
      success: false,
      message: "Vapi API key not configured",
    });
  }

  try {
    const fetch = (await import("node-fetch")).default;

    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch transcript");
    }

    res.json({
      success: true,
      transcript: data.transcript || data.messages || "No transcript available",
      call: data,
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transcript",
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Return only call summary
function getCallSummary(req, res) {
  const { callId } = req.params;
  const rec = calls.get(callId);
  if (!rec) return res.status(404).json({ error: "Not found" });
  return res.json({ summary: rec.summary || null });
}

app.get("/api/call/:callId/summary", getCallSummary);

// Vapi webhook to update in-memory call store
app.post("/api/webhooks/vapi", (req, res) => {
  try {
    const body = req.body;
    const type = body?.message?.type || body?.type;
    const callId = body?.message?.call?.id || body?.call?.id || body?.message?.session?.id;
    if (!callId) return res.json({ ok: true });

    if (type === "status" || type === "session.updated") {
      const status = body?.message?.call?.status || body?.message?.session?.status;
      const rec = calls.get(callId) || { callId, status: "queued", transcript: "", lastUpdate: Date.now() };
      if (status) rec.status = status;
      const recordingUrl = body?.message?.call?.recordingUrl || body?.call?.recordingUrl;
      if (recordingUrl) rec.recordingUrl = recordingUrl;
      rec.lastUpdate = Date.now();
      calls.set(callId, rec);
      if (status) console.log("📶 Call status update", { callId, status });
    }

    if (type === "transcript" || type === "transcript.part") {
      const chunk = body?.message?.transcript ?? body?.artifact?.messages ?? "";
      const text = Array.isArray(chunk) ? chunk.map((m) => (typeof m === "string" ? m : m?.text || "")).join("\n") : String(chunk || "");
      const rec = calls.get(callId) || { callId, status: "in-progress", transcript: "", lastUpdate: Date.now() };
      rec.transcript = (rec.transcript || "") + (text ? `\n${text}` : "");
      rec.lastUpdate = Date.now();
      calls.set(callId, rec);
      if (text) console.log("📝 Transcript chunk", { callId, chars: text.length });
    }

    if (type === "end-of-call-report") {
      const analysis = body?.message?.analysis || body?.analysis;
      const summary = analysis?.summary || analysis?.notes || "No summary.";
      const transcript = analysis?.transcript;
      const rec = calls.get(callId) || { callId, transcript: "", lastUpdate: Date.now() };
      rec.status = "ended";
      if (summary) rec.summary = summary;
      if (transcript) rec.transcript = transcript;
      rec.lastUpdate = Date.now();
      calls.set(callId, rec);
      console.log("✅ End-of-call summary ready", { callId, summaryChars: (summary || '').length, fetch: `/api/call/${callId}` });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Vapi webhook error:", e);
    res.status(200).json({ ok: true });
  }
});
