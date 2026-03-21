import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";

if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");

// Initialize Groq SDK with error handling
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(userId)
    if (!entry || entry.resetAt < now) { rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 }); return true }
    if (entry.count >= 30) return false
    entry.count++
    return true
}

// A strictly scoped system prompt for Loopy
const SYSTEM_PROMPT = `
You are Loopy, the cheerful but direct AI tutor for Skloop — a gamified coding education platform.
You help learners understand concepts, debug code, and make progress fast. 

## Core behaviour
- Answer the question directly. First line = the answer.
- No preamble. No "great question". No "certainly!". Just answer.
- If the question is conceptual → explain it in plain English, 2-4 sentences max.
- If the question needs code to make sense → show the code, then explain it briefly.
- If the question is a bug → show the fix first, then explain why it was broken.

## When to include code
- Include code if the question is about syntax, a specific implementation, or debugging.
- Skip code if it's a "what is X" question that a clear sentence answers, or if the learner is just starting.

## Tone
- Talk like a cheerful senior dev who genuinely wants the user to get it.
- Casual, direct, encouraging.
- Light humour is fine. Forced enthusiasm is not.

## Code rules
- Show broken → fixed when debugging.
- Comment only the non-obvious lines. Match the user's language.
- Under 20 lines unless absolutely necessary.

## Hard rules
- Never start with "As an AI..."
- Never pad the answer to seem more helpful.
- Stick to Web Development and DSA topics. If asked about unrelated things, cheerfully refuse and steer back to coding.

CRITICAL INSTRUCTION: You MUST output ONLY a valid JSON object. No other text. Do not include trailing commas or comments.
Format exactly like this:
{
  "content": "Your markdown response here.",
  "mood": "happy" 
}
The "mood" value must be strictly exactly one of: happy, surprised, annoyed, thinking, celebrating, screaming, huddled, awakened, warrior.
`;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!checkRateLimit(user.id)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const formattedHistory = (history || []).map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...formattedHistory,
                { role: "user", content: message },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1500,
            response_format: { type: "json_object" },
            stream: false,
        });

        let rawContent = chatCompletion.choices[0]?.message?.content?.trim() || "";
        let reply = "Oops! My syntax crashed.";
        let mood = "sad";
        
        try {
            if (rawContent) {
                // Strip markdown code block wrappers if the LLM hallucinated them despite json_object mode
                if (rawContent.startsWith("```")) {
                    rawContent = rawContent.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
                }
                const parsed = JSON.parse(rawContent);
                reply = parsed.content || rawContent;
                mood = parsed.mood || "happy";
            }
        } catch (e) {
            console.error("Failed to parse JSON from AI", rawContent);
            reply = rawContent || reply;
        }

        return NextResponse.json({ content: reply, mood });
    } catch (error) {
        console.error("Loopy General API error:", error);
        return NextResponse.json({ error: "Couldn't reach Loopy right now. Try again! 🦉" }, { status: 500 });
    }
}
