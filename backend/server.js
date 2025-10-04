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

    res.json({
      success: true,
      message: "Call initiated successfully",
      callId: data.id,
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

    res.json({
      success: true,
      data: data,
    });
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
      "You are a helpful assistant that summarizes call transcripts. Provide a clear, concise summary highlighting key points, action items, and important details.";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Please summarize the following transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
