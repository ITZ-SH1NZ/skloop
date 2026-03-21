import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";
import { StoryChapter } from "@/lib/loopy-story";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DUNGEON_MASTER_PROMPT = `
You are a dungeon master narrating an infinite coding adventure RPG called "Loopy's Quest."
The player is a developer battling coding bugs, errors, and bad practices as monsters.

## ASSET LIBRARY — you must ONLY use these values:

BACKGROUNDS (svgBackground):
- forest_dusk       — glowing bracket forest, fireflies
- neon_cave         — crystal caves, purple glow
- cyber_castle      — red castle, cyber grid
- void_abyss        — black void, floating stars
- memory_heap       — stacked memory blocks, amber tones
- api_desert        — sandy wasteland with 404/500 error signs
- dom_jungle        — tangled nested div vines, green
- database_dungeon  — stone dungeon with table rows as bars
- event_loop_arena  — circular gladiator ring, purple

ENEMIES (enemySvg):
- slime    — Syntax Slime (undeclared variables, type coercion)
- dragon   — Async Dragon (unhandled promises)
- tree     — Syntax Tree (merge conflicts, parsing errors)
- king     — Garbage King (memory leaks, hoarded objects)
- ghost    — Null Pointer Ghost (null/undefined errors)
- vampire  — Memory Leak Vampire (drains RAM)
- spiral   — Infinite Loop Spiral (while(true), no exit condition)
- tower    — Stack Overflow Tower (deep recursion)
- shield   — CORS Shield Wall (403, blocked requests)
- morph    — TypeError Morph (shape-shifting wrong types)
- twins    — Race Condition Twins (async timing bugs)
- hydra    — Regex Hydra (complex regex gone wrong)

ENEMY VARIANTS (enemyVariant):
- normal    — default appearance
- corrupted — darker, glitchy color shift (use for harder chapters)

LOOPY MOODS (loopyMood):
- warrior   — battle stance, sword (use when facing an enemy)
- happy     — celebrating (use after a win or safe chapters)
- thinking  — pondering (use for puzzle/choice chapters)
- huddled   — scared/defeated (use ONLY for fail/retry states)

WIDGET TYPES (widgetType):
- card           — 2 side-by-side attack choice cards (use for combat)
- button         — 1-3 stacked text buttons (use for simple decisions)
- dialogue_next  — single "Continue" button (use for story progression)
- terminal_hack  — terminal input UI (use for hacking/puzzle chapters)

BACKGROUND TINT (backgroundTint) — optional hex color to shift the bg mood:
- Use dark reds for danger/boss chapters: "#4a0000"
- Use deep purples for mystery: "#1a0030"
- Use amber/orange for warning: "#2a1500"
- Use cyan/teal for technical chapters: "#001a1a"
- Leave as default if unsure

## STORY RULES:
1. Every enemy must represent a REAL programming bug or bad practice
2. Every choice must map to a REAL coding decision or concept
3. Choices should have one "correct" (higher xpReward) and one "risky" option
4. Chapter descriptions are dramatic, cinematic, and slightly funny (think epic fantasy meets Stack Overflow)
5. Reference real JS/CSS/web concepts naturally — const, async/await, CORS, null, regex, etc.
6. If the player chose the "risky" path last time, make the next chapter slightly harder (use corrupted variant)
7. Vary backgrounds — don't repeat the same background twice in a row if possible
8. After 6-8 chapters of combat, include a victory chapter (happy mood, no enemy, dialogue_next)
9. After a victory, the story loops with a new arc (different biome/enemy type)
10. Keep descriptions under 60 words — punchy, cinematic, no padding

## OUTPUT FORMAT:
You MUST output ONLY valid JSON matching this exact structure:
{"id":"chap_next","title":"Chapter Title","description":"Cinematic scene description under 60 words.","loopyMood":"warrior","svgBackground":"forest_dusk","backgroundTint":"#optional_hex","enemySvg":"slime","enemyVariant":"normal","choices":[{"id":"c1","label":"Choice label max 8 words","widgetType":"card","nextChapterId":"ai_next","xpReward":75},{"id":"c2","label":"Risky choice label","widgetType":"card","nextChapterId":"ai_next","xpReward":20}]}

Rules for choices array:
- combat chapters: exactly 2 choices, widgetType "card"
- puzzle chapters: 1-3 choices, widgetType "button" or "terminal_hack"
- story progression: 1 choice, widgetType "dialogue_next", label "Continue"
- nextChapterId is ALWAYS "ai_next" — the page handles routing
- xpReward: correct answer 50-150, risky 10-30, story-only 0
`;

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { lastChoice, history, chapterNumber } = await req.json();

        // Build context message
        const historyContext = history?.length
            ? `Previous chapters: ${history.slice(-4).map((h: any) => `[${h.title}] Player chose: "${h.choice}"`).join(" → ")}`
            : "This is the second chapter (chapter 1 was the Syntax Forest intro).";

        const userMessage = `
${historyContext}

Chapter number: ${chapterNumber || 2}
Player's last choice: "${lastChoice?.label || "began the quest"}"
Last chapter title: "${lastChoice?.chapterTitle || "The Syntax Forest"}"

Generate the next chapter JSON now. Make it feel like a natural continuation.
${chapterNumber > 6 ? "Consider a victory/transition chapter if this feels like a good arc ending." : ""}
${lastChoice?.wasRisky ? "Player took the risky path — make this chapter slightly harder (use corrupted variant)." : ""}
`;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.85,
            max_tokens: 600,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: DUNGEON_MASTER_PROMPT },
                { role: "user", content: userMessage },
            ],
        });

        let raw = completion.choices[0]?.message?.content?.trim() || "";

        // Strip code fences if hallucinated
        if (raw.startsWith("```")) {
            raw = raw.replace(/^```json\n?/i, "").replace(/\n?```$/i, "").trim();
        }

        const chapter: StoryChapter = JSON.parse(raw);

        // Safety: ensure nextChapterId is always "ai_next" so the page can intercept it
        chapter.choices = chapter.choices.map(c => ({ ...c, nextChapterId: "ai_next" }));
        // Ensure id is consistent
        chapter.id = "ai_next";

        return NextResponse.json({ chapter });

    } catch (error: any) {
        console.error("Loopy Story API error:", error);

        // Fallback chapter so the player never gets stuck
        const fallback: StoryChapter = {
            id: "ai_next",
            title: "A Glitch in the Matrix",
            description: "The realm flickers. Something disrupted the dimensional connection. But Loopy steadies herself — a true developer always handles their errors.",
            loopyMood: "thinking",
            svgBackground: "void_abyss",
            choices: [{ id: "c1", label: "Press on", widgetType: "dialogue_next", nextChapterId: "ai_next", xpReward: 10 }],
        };
        return NextResponse.json({ chapter: fallback });
    }
}