import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

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
   - Keep responses brief (2-4 sentences).
`;

export async function POST(req: Request) {
    try {
        const { message, mode, history } = await req.json();

        // Validate input
        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
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
