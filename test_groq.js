const { Groq } = require("groq-sdk");
require("dotenv").config({ path: ".env.local" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
CRITICAL INSTRUCTION: You MUST output ONLY a valid JSON object. No other text. Do not include trailing commas or comments.
Format exactly like this:
{
  "content": "Your markdown response here.",
  "mood": "happy" 
}
The "mood" value must be strictly exactly one of: happy, surprised, annoyed, thinking, celebrating, screaming, huddled, awakened, warrior.
`;

async function test() {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "hello" }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      stream: false,
    });
    
    console.log("Raw Output:", chatCompletion.choices[0]?.message?.content);
  } catch (e) {
    console.error("Groq Error:", e);
  }
}
test();
