import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";

if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(userId);
    if (!entry || entry.resetAt < now) { rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 }); return true; }
    if (entry.count >= 20) return false;
    entry.count++;
    return true;
}

function buildSystemPrompt(algorithmTitle: string, category: string, timeComplexity: string, description: string) {
    return `You are Loopy 🦉 — a friendly, precise DSA tutor embedded in Skloop's algorithm visualizer.

The user is currently studying: **${algorithmTitle}** (Category: ${category}, Time Complexity: ${timeComplexity}).

Context about this algorithm:
${description}

**YOUR STRICT RULES:**
1. You ONLY discuss **${algorithmTitle}** and directly related concepts (its time/space complexity, variants, code, edge cases, comparisons to similar algorithms).
2. If the user asks about ANYTHING else — other algorithms not directly related, non-DSA topics, life advice, etc. — you MUST politely say: "I'm your ${algorithmTitle} tutor! Ask me anything specific to this algorithm 🦉" and redirect them back.
3. Keep replies concise: 2-4 sentences max unless they ask for code or a step-by-step breakdown.
4. Use plain text. You may use \`code blocks\` for inline code and triple backticks for larger blocks.
5. Be encouraging — beginners should feel supported, experts should feel challenged.
6. Never make up facts. If unsure, say so.`;
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!checkRateLimit(user.id)) return NextResponse.json({ error: "Rate limit exceeded. Try again in a minute." }, { status: 429 });

        const { algorithmTitle, category, timeComplexity, description, messages } = await req.json();

        if (!algorithmTitle || !Array.isArray(messages)) {
            return NextResponse.json({ error: "algorithmTitle and messages are required" }, { status: 400 });
        }

        const systemPrompt = buildSystemPrompt(algorithmTitle, category, timeComplexity, description);

        // Only keep last 10 turns (20 messages) for context
        const contextMessages = messages.slice(-20).map((m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
        }));

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...contextMessages,
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 400,
            stream: false,
        });

        const reply = completion.choices[0]?.message?.content?.trim() || "Hmm, I couldn't think of a response. Try again! 🦉";
        return NextResponse.json({ reply });
    } catch (error) {
        console.error("DSA Loopy API error:", error);
        return NextResponse.json({ reply: "Couldn't reach Loopy right now. Try again! 🦉" }, { status: 500 });
    }
}
