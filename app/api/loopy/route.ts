import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";

if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Simple in-memory rate limiter (resets on server restart, good enough for edge cases)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(userId)
    if (!entry || entry.resetAt < now) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 })
        return true
    }
    if (entry.count >= 20) return false
    entry.count++
    return true
}

// Prompts
const HELPFUL_SYSTEM_PROMPT = `
You are Loopy, the intelligent AI companion for Skloop.
**YOUR DOMAIN:**
- Web Development (HTML, CSS, JS, React, Next.js, etc.)
- Data Structures & Algorithms (DSA)

**YOUR RULES:**
1. **STRICTLY SOCRATIC METHOD**: 
   - NEVER provide full code solutions, algorithms, or pseudocode outright.
   - Guide the user with questions, hints, and conceptual explanations.
2. **DOMAIN RESTRICTION**:
   - Refuse non-coding topics politely.
3. **TONE**:
   - Cheerful, encouraging, professional. Use emojis (🦉, ✨).
4. **RESPONSE LENGTH**:
   - CRITICAL: Keep every response under 3 sentences. Be concise. Do NOT repeat or expand the prompt.
`;

const STORY_SYSTEM_PROMPT = `
You are the **Dungeon Master** of the **Glitch Kingdom**.
**CONTEXT:**
- User is a "Source Sorcerer".
- Code Concepts are **Magic Spells**.

**YOUR TASK:**
1. Evaluate user's input. Does it solve the problem?
2. Narrate outcome in **Epic RPG Style**.
   - **Success**: Describe spell working visually. Move to next challenge.
   - **Failure**: Spell fizzles. Take HP. Give hint.
3. **GAMIFICATION**:
   - Award XP narratively.
   - Use **BOLD** and Emojis (🔥, ⚡, 🛡️).
   - CRITICAL: Keep responses brief — 2-3 sentences MAX. No repetition.
`;



export async function POST(req: Request) {
    try {
        // FIX 6: Auth check — reject unauthenticated requests
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // FIX 6: Rate limit
        if (!checkRateLimit(user.id)) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const { message, mode, history } = await req.json();

        // FIX 6: Input length validation
        if (!message || typeof message !== 'string' || message.length > 2000) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const systemPrompt = mode === "helpful" ? HELPFUL_SYSTEM_PROMPT : STORY_SYSTEM_PROMPT;

        // Construct messages
        const messages: any[] = [{ role: "system", content: systemPrompt }];

        // Add history (limit to last 10 messages to save context)
        if (Array.isArray(history)) {
            const recentHistory = history.slice(-10);
            recentHistory.forEach((msg: any) => {
                if (msg.role && msg.content) {
                    messages.push({ role: msg.role, content: msg.content });
                }
            });
        }

        // Add current user message
        messages.push({ role: "user", content: message });

        // Call Groq API
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_tokens: 500,
        });

        const responseText = chatCompletion.choices[0]?.message?.content?.trim() || "";

        // Parse for XP if in story mode
        let xp_gain = 0;
        if (mode === "story") {
            const lowerText = responseText.toLowerCase();
            if (responseText.includes("XP") && (lowerText.includes("gain") || responseText.includes("+"))) {
                xp_gain = 50;
            }
        }

        return NextResponse.json({
            content: responseText,
            xp_gain: xp_gain
        });

    } catch (error) {
        console.error("Error in Loopy API:", error);

        // Fallback Mock
        // We can replicate the fallback logic from the Python script if needed, 
        // but usually it's better to return a 500 so the frontend knows something went wrong.
        // However, the Python script had a specific fallback for "helpful" vs "story".

        // Recovering mode from request body might be tricky if JSON parse failed, 
        // but assuming it failed during API call:

        return NextResponse.json(
            { content: "Error: Failed to process request. Please try again later.", xp_gain: 0 },
            { status: 500 }
        );
    }
}
