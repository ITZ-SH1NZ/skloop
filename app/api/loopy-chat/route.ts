import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
});

const EXPLAIN_SYSTEM_PROMPT = `
You are Loopy 🦉, the AI companion embedded in Skloop's chat.
The user wants you to explain a piece of code or concept shared in their conversation.

**YOUR RULES:**
1. Be concise — no more than 5 sentences.
2. Use the Socratic method: ask a guiding question at the end.
3. Use simple formatting: bold for key terms, \`code blocks\` for code.
4. Be cheerful and encouraging. Use emojis (🦉, ✨, 🔥) sparingly.
5. ONLY discuss Web Dev, DSA, or general programming.
`;

const SUMMARIZE_SYSTEM_PROMPT = `
You are Loopy 🦉, the AI companion embedded in Skloop's chat.
The user was away and wants a quick summary of the conversation they missed.

**YOUR RULES:**
1. Provide a friendly, concise bullet-point summary (max 5 bullets).
2. Highlight any code shared, questions asked, or decisions made.
3. End with "Catch up complete! ✨" 
4. Be neutral — do NOT editorialize or give opinions.
`;

export async function POST(req: Request) {
    try {
        const { mode, messages } = await req.json();

        if (!mode || !Array.isArray(messages)) {
            return NextResponse.json({ error: "mode and messages are required" }, { status: 400 });
        }

        const systemPrompt = mode === "explain" ? EXPLAIN_SYSTEM_PROMPT : SUMMARIZE_SYSTEM_PROMPT;

        // Format chat messages as a readable transcript
        const transcript = messages
            .slice(-20) // Last 20 messages for context
            .map((m: any) => `${m.senderName || "User"}: ${m.text || "[media/attachment]"}`)
            .join("\n");

        const userPrompt = mode === "explain"
            ? `Here are the recent chat messages. Please explain the most recent code or technical concept:\n\n${transcript}`
            : `Here are the messages I missed. Please summarize:\n\n${transcript}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.6,
            max_tokens: 400,
            stream: false,
        });

        const content = chatCompletion.choices[0]?.message?.content?.trim() || "I couldn't process that right now. Try again!";

        return NextResponse.json({ content });
    } catch (error) {
        console.error("Loopy Chat API error:", error);
        return NextResponse.json({ content: "Couldn't reach Loopy right now. Try again! 🦉" }, { status: 500 });
    }
}
